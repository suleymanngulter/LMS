from recommender.content_based import ContentBasedRecommender
from recommender.collaborative import CollaborativeRecommender
from services.db import get_books_df

class HybridRecommender:
    def __init__(self, ratings=None):
        # Her iki modeli de başlat
        self.content_based = ContentBasedRecommender(ratings=ratings)
        self.collaborative = CollaborativeRecommender(ratings=ratings)

    def fit(self):
        # Her iki modeli de eğit
        self.content_based.fit()
        self.collaborative.fit()

    def recommend(self, book_name, top_n=5):
        # İçerik tabanlı önerileri al
        content_recs = self.content_based.recommend(book_name, top_n)
        # Collaborative önerileri al
        collaborative_recs = self.collaborative.recommend(book_name, top_n)
        
        # İçerik ve collaborative sonuçları birleştir
        combined_recs = self.merge_recommendations(content_recs, collaborative_recs)
        return combined_recs

    def merge_recommendations(self, content_recs, collaborative_recs):
        # Basit birleştirme (ağırlıklı ortalama vs. yapılabilir)
        all_recs = content_recs + collaborative_recs
        # Burada sıralama, duplicate (tekrar) kontrolü yapılabilir
        return list(set(all_recs))  # Duplicate'leri önlemek için set() kullandık
