import streamlit as st
from services.auth import decode_jwt
from services.students import get_user_liked_book_ids
from recommender.content_based import ContentBasedRecommender
from recommender.hybrid import HybridRecommender

st.set_page_config(page_title="📚 Kitap Öneri Sistemi", layout="centered")
st.title("📚 Kitap Öneri Sistemi")

# 🔐 JWT Token kontrolü
query_params = st.query_params
token = query_params.get("token", None)

if not token:
    st.error("🚫 Giriş yapılmamış. Ana sistemden giriş yaparak buraya yönlendirilmelisin.")
    st.stop()

user_info = decode_jwt(token)
if not user_info:
    st.error("❌ Token geçersiz veya süresi dolmuş.")
    st.stop()

username = user_info.get("username")
st.success(f"👋 Hoş geldin, **{username}**!")

# 📘 Kullanıcının beğendiği kitapları al
liked_book_ids = get_user_liked_book_ids(username)

if not liked_book_ids:
    st.info("Henüz beğendiğin kitap yok. Ana sistemden kitap beğenerek öneri alabilirsin.")
    st.stop()

# 📊 İçerik tabanlı modeli eğit
recommender = ContentBasedRecommender()
with st.spinner("📚 Model hazırlanıyor..."):
    recommender.fit()

# 📚 Hibrit öneri sistemini de entegre edebiliriz (İçerik + Puan)
hybrid_recommender = HybridRecommender(ratings={str(book_id): rating for book_id, rating in zip(liked_book_ids, [4, 5, 3, 4])})  # Ratings örnek
hybrid_recommender.fit()

# 📚 Öneri listesi oluştur
recommendations = []
seen_ids = set(str(_id) for _id in liked_book_ids)  # beğenilen kitapları tekrar göstermemek için

# Kullanıcıdan gelen liked_book_ids ile hibrit öneri sistemi kullan
for book_id in liked_book_ids:
    recs = hybrid_recommender.recommend_by_id(book_id)  # Hibrit sistemi kullanıyoruz
    for rec in recs:
        if rec["_id"] not in seen_ids:
            recommendations.append(rec)
            seen_ids.add(rec["_id"])

# 🖼️ Sonuçları göster
if recommendations:
    st.subheader("🎯 Senin için önerilen kitaplar:")

    for i, book in enumerate(recommendations, 1):
        st.markdown(f"**{i}.** {book['name']} — *{book['author']}*")

        # Kitap görseli
        if book.get("imageUrl"):
            st.image(book["imageUrl"], width=150)
        else:
            st.warning("📷 Bu kitap için görsel bulunamadı.")

        # Kitap açıklaması
        if book.get("description"):
            desc = book.get("description", "")
            st.write(desc[:300] + "...") if len(desc) > 300 else st.write(desc)
        else:
            st.write("_Açıklama bulunamadı._")

        st.markdown("---")  # Alt çizgi çiz

else:
    st.info("Yeni öneri bulunamadı. Daha fazla kitap beğenerek sistemi zenginleştirebilirsin.")
