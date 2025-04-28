import streamlit as st
from services.auth import decode_jwt
from services.students import get_user_liked_book_ids
from recommender.content_based import ContentBasedRecommender
from recommender.hybrid import HybridRecommender

st.set_page_config(page_title="📚 Kitap Öneri Sistemi", layout="centered")
st.title("📚 Kitap Öneri Sistemi")


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


liked_book_ids = get_user_liked_book_ids(username)


if not liked_book_ids:
    st.info("Henüz beğendiğin kitap yok. Aşağıdan bir kitap seçerek öneri alabilirsin.")

    fallback_model = ContentBasedRecommender()
    fallback_model.fit()
    all_books = fallback_model.df["name"].tolist()
    selected_book = st.selectbox("📖 Bir kitap seç:", all_books)
    show_button = st.button("📖 Önerileri Göster")

    if selected_book and show_button:
        st.markdown("### 🔎 **Benzer Kitaplar:**")
        recs = fallback_model.recommend(selected_book, top_n=5)

        if not recs:
            st.warning("❌ Bu kitaba benzer sonuç bulunamadı.")
        else:
            for i, item in enumerate(recs, 1):
                book_name = item['name'] if isinstance(item, dict) else item
                match = fallback_model.df[fallback_model.df['name'].str.lower() == book_name.lower()]
                if match.empty:
                        continue

                book_info = match.iloc[0].to_dict()
                st.markdown(f"**{i}. {book_info['name']}**")

                if book_info.get("imageUrl"):
                        st.image(book_info["imageUrl"], width=150)

                desc = book_info.get("description", "")
                st.write(desc[:160] + "..." if len(desc) > 160 else desc)
                st.markdown("---")

    st.stop()


ratings_input = {
    str(book_id): {"roll": username, "rating": 4} for book_id in liked_book_ids
}

hybrid_recommender = HybridRecommender(ratings=ratings_input)
with st.spinner("📚 Modeller eğitiliyor..."):
    hybrid_recommender.fit()

recommendations = []
seen_ids = set(str(_id) for _id in liked_book_ids)

for book_id in liked_book_ids:
    recs = hybrid_recommender.recommend_by_id(book_id)
    for rec in recs:
        if rec["_id"] not in seen_ids:
            recommendations.append(rec)
            seen_ids.add(rec["_id"])

if not recommendations:
    st.info("💬 Hibrit sistem öneri veremedi. İçerik tabanlı alternatifler getiriliyor...")
    content_recommender = ContentBasedRecommender()
    content_recommender.fit()
    sample_book = content_recommender.df[content_recommender.df['_id'].astype(str).isin([str(_id) for _id in liked_book_ids])].head(1)
    if not sample_book.empty:
        book_name = sample_book.iloc[0]['name']
        content_recs = content_recommender.recommend(book_name, top_n=5)
        recommendations = []
        for name in content_recs:
            match = content_recommender.df[content_recommender.df['name'] == name]
            if match.empty:
                continue
            recommendations.append(match.iloc[0].to_dict())


if recommendations:
    st.subheader("📖 Sana Önerilen Kitaplar")
    for i, rec in enumerate(recommendations, 1):
        st.markdown(f"**{i}.** {rec['name']} — *{rec['author']}*")
        if rec.get("imageUrl"):
            st.image(rec["imageUrl"], width=150)
        if rec.get("description"):
            desc = rec.get("description", "")
            st.write(desc[:160] + "..." if len(desc) > 160 else desc)
        else:
            st.write("_Açıklama bulunamadı._")
        st.markdown("---")
else:
    st.warning("⚠️ Hiçbir öneri bulunamadı. Daha fazla kitap beğenerek sistemi zenginleştirebilirsin.")
