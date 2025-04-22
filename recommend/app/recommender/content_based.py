import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from services.db import get_books_df  # 📌 Bu senin kendi projenin içindeki veritabanı erişimi

class ContentBasedRecommender:
    def __init__(self, ratings=None):
        self.df = None
        self.similarity_matrix = None
        self.vectorizer = TfidfVectorizer()
        self.ratings = ratings if ratings is not None else {}

    def fit(self):
        self.df = get_books_df()
        self.df["_id"] = self.df["_id"].astype(str)  # ObjectId'yi string yap
        tfidf_matrix = self.vectorizer.fit_transform(self.df["similarityText"])
        self.similarity_matrix = cosine_similarity(tfidf_matrix)

    def recommend(self, book_name=None, top_n=5):
        if self.df is None or self.similarity_matrix is None:
            return []

        # 🔸 Hiç kitap beğenmemiş kullanıcılar için:
        if not book_name:
            # similarityText'i en uzun olan kitabı seç
            book_name = self.df.loc[self.df['similarityText'].str.len().idxmax(), 'name']

        if book_name not in self.df['name'].values:
            return []

        index = self.df[self.df['name'] == book_name].index[0]
        distances = self.similarity_matrix[index]
        book_list = sorted(list(enumerate(distances)), reverse=True, key=lambda x: x[1])[1:top_n+1]

        recommendations = []
        for i in book_list:
            book = self.df.iloc[i[0]].to_dict()
            if book['name'] in self.ratings:
                weighted_score = distances[i[0]] * self.ratings[book['name']]
            else:
                weighted_score = distances[i[0]]
            recommendations.append((book, weighted_score))

        recommendations = sorted(recommendations, key=lambda x: x[1], reverse=True)
        return [book[0] for book in recommendations]

    def recommend_by_id(self, book_id, top_n=5):
        if self.df is None or self.similarity_matrix is None:
            return []

        try:
            index = self.df.index[self.df["_id"] == str(book_id)].tolist()[0]
        except IndexError:
            return []

        distances = self.similarity_matrix[index]
        similar_books = sorted(
            list(enumerate(distances)), key=lambda x: x[1], reverse=True
        )[1:top_n+1]

        return [self.df.iloc[i[0]].to_dict() for i in similar_books]
