# recommender/recommender.py

import os
import pandas as pd
from pymongo import MongoClient
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv

# .env dosyasından Mongo URI'yi al
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

# MongoDB bağlantısı
client = MongoClient(MONGO_URI)
db = client["bookstore"]
collection = db["books"]

# Kitapları MongoDB'den çek
def load_books():
    data = list(collection.find({}, {"_id": 0, "name": 1, "similarityText": 1}))
    return pd.DataFrame(data)

# TF-IDF vektörlerini hazırla ve benzerlik matrisi oluştur
def build_model():
    df = load_books()
    tfidf = TfidfVectorizer()
    tfidf_matrix = tfidf.fit_transform(df['similarityText'])
    similarity_matrix = cosine_similarity(tfidf_matrix)
    return df, similarity_matrix

# Belirli bir kitap için önerileri döndür
def get_recommendations(book_name, df, similarity_matrix):
    if book_name not in df['name'].values:
        return []

    index = df[df['name'] == book_name].index[0]
    distances = similarity_matrix[index]
    book_list = sorted(list(enumerate(distances)), reverse=True, key=lambda x: x[1])[1:6]

    return [df.iloc[i[0]]['name'] for i in book_list]
