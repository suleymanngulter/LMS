from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
import numpy as np
from services.db import get_books_df  # Veritabanındaki kitapları almak için

class CollaborativeRecommender:
    def __init__(self, ratings=None):
        self.df = None
        self.ratings_matrix = None
        self.ratings = ratings  # Kullanıcı puanları verisi burada gelecek

    def fit(self):
        # Kitap verilerini alıyoruz
        self.df = get_books_df()  # Kitaplar
        # Kullanıcıların puanlarını oluşturuyoruz
        self.ratings_matrix = self.create_ratings_matrix()

    def create_ratings_matrix(self):
        # Kullanıcı ve kitap puanlarıyla bir DataFrame oluşturuluyor
        ratings_data = []

        # ratings veri yapısında kitap_id ve roll bilgileri mevcut.
        for book_id, data in self.ratings.items():
            roll = data['roll']
            rating = data['rating']
            ratings_data.append([book_id, roll, rating])  # roll'i user_id olarak kullanıyoruz

        # DataFrame oluşturuluyor
        ratings_df = pd.DataFrame(ratings_data, columns=["book_id", "user_id", "rating"])

        # Kitaplara göre puan matrisini oluşturuyoruz
        ratings_matrix = ratings_df.pivot(index="book_id", columns="user_id", values="rating").fillna(0)
        return ratings_matrix

    def recommend(self, book_id, top_n=5):
        # Kitaplar arasındaki benzerlikleri hesaplıyoruz
        if book_id not in self.ratings_matrix.index:
            return []

        # Kitaplar arası benzerlik hesaplaması yapılıyor
        book_similarities = cosine_similarity(self.ratings_matrix, self.ratings_matrix)

        # Mevcut kitabın benzerliklerini alıyoruz
        similarities = book_similarities[self.ratings_matrix.index.get_loc(book_id)]

        # En benzer 5 kitabı alıyoruz
        similar_books = similarities.argsort()[-top_n-1:-1]  # Sonuçları sırala

        # Benzer kitapları döndürüyoruz
        recommendations = self.df.iloc[similar_books].to_dict(orient='records')
        return recommendations
