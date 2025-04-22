from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
from services.db import get_books_df

class CollaborativeRecommender:
    def __init__(self, ratings=None):
        self.df = None
        self.ratings_matrix = None
        self.ratings = ratings

    def fit(self):
        self.df = get_books_df()
        self.ratings_matrix = self.create_ratings_matrix()

    def create_ratings_matrix(self):
        ratings_data = []
        for book_id, data in self.ratings.items():
            roll = data['roll']
            rating = data['rating']
            ratings_data.append([book_id, roll, rating])

        ratings_df = pd.DataFrame(ratings_data, columns=["book_id", "user_id", "rating"])
        return ratings_df.pivot(index="book_id", columns="user_id", values="rating").fillna(0)

    def recommend(self, book_id, top_n=5):
        if book_id not in self.ratings_matrix.index:
            return []

        # Benzerlik matrisini hesapla
        book_similarities = cosine_similarity(self.ratings_matrix, self.ratings_matrix)
        
        # İlgili kitabın benzerlik vektörünü al
        index = self.ratings_matrix.index.get_loc(book_id)
        similarities = book_similarities[index]
        
        # En benzer kitapların indexlerini al (kendisi hariç)
        similar_indices = similarities.argsort()[::-1][1:top_n+1]
        similar_book_ids = self.ratings_matrix.index[similar_indices]

        # DF'den kitap bilgilerini çek
        recommendations = self.df[self.df["_id"].astype(str).isin(similar_book_ids)].to_dict(orient='records')
        return recommendations

