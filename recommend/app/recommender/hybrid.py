from recommender.content_based import ContentBasedRecommender
from recommender.collaborative import CollaborativeRecommender

class HybridRecommender:
    def __init__(self, ratings=None):
        self.content_based = ContentBasedRecommender(ratings=ratings)
        self.collaborative = CollaborativeRecommender(ratings=ratings)

    def fit(self):
        self.content_based.fit()
        self.collaborative.fit()

    def recommend(self, book_name, top_n=5):
        content_recs = self.content_based.recommend(book_name, top_n)
        collaborative_recs = self.collaborative.recommend(book_name, top_n)
        return self.merge_recommendations(content_recs, collaborative_recs)

    def recommend_by_id(self, book_id, top_n=5):
    # Hem işbirlikçi hem içerik tabanlı önerileri al
        collab_recs = self.collaborative.recommend(book_id, top_n)
        content_recs = self.content_based.recommend_by_id(book_id, top_n)

        # İkisini birleştir
        all_recs = collab_recs + content_recs
        return list({rec["_id"]: rec for rec in all_recs}.values())  # duplicate'leri ayıkla


    def merge_recommendations(self, content_recs, collaborative_recs):
        all_recs = content_recs + collaborative_recs
        return list({rec["_id"]: rec for rec in all_recs}.values())
