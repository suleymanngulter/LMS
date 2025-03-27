# recommender/app.py

import streamlit as st
from recommender import build_model, get_recommendations

st.set_page_config(page_title="Kitap Öneri Sistemi", layout="centered")

st.title("📚 Kitap Öneri Sistemi")
st.write("Bir kitap ismi seç, sana benzer kitapları önerelim!")

# Verileri yükle
with st.spinner("Veriler yükleniyor..."):
    df, similarity_matrix = build_model()

# Kitap seçimi
book_name = st.selectbox("Bir kitap seçin:", df['name'].values)

# Öneri butonu
if st.button("📖 Önerileri Göster"):
    with st.spinner("Öneriler hazırlanıyor..."):
        results = get_recommendations(book_name, df, similarity_matrix)

    if results:
        st.subheader("🔎 Benzer Kitaplar:")
        for i, rec in enumerate(results, start=1):
            st.markdown(f"**{i}.** {rec}")
    else:
        st.warning("Hiçbir öneri bulunamadı.")


print(similarity_matrix[0][:10])
