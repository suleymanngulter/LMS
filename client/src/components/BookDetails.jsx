import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../css/BookDetails.css";

const BookDetails = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [liked, setLiked] = useState(false);
  const [rating, setRating] = useState(0);
  const [averageRating, setAverageRating] = useState(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/book/${id}`);
        setBook(response.data);
      } catch (error) {
        console.error("Kitap verisi alınamadı:", error);
      }
    };

    const fetchLikedStatus = async () => {
      try {
        const response = await axios.get('http://localhost:3001/student/likes', {
          withCredentials: true,
        });
        if (response.data.liked_books.includes(id)) {
          setLiked(true);
        }
      } catch (error) {
        console.error("Beğeni durumu alınamadı:", error);
      }
    };

    const fetchAverageRating = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/book/${id}/average-rating`);
        setAverageRating(response.data.averageRating);
      } catch (error) {
        console.error("Ortalama puan alınamadı:", error);
      }
    };

    fetchBook();
    fetchLikedStatus();
    fetchAverageRating();
  }, [id]);

  const handleLike = async () => {
    try {
      if (liked) {
        await axios.post('http://localhost:3001/student/unlike', { bookId: id }, { withCredentials: true });
        setLiked(false);
      } else {
        await axios.post('http://localhost:3001/student/like', { bookId: id }, { withCredentials: true });
        setLiked(true);
      }
    } catch (error) {
      console.error("Beğeni işlemi başarısız:", error);
    }
  };

  const handleRating = async (newRating) => {
    try {
      await axios.post('http://localhost:3001/student/rate', { bookId: id, rating: newRating }, { withCredentials: true });
      setRating(newRating);
      // Yeni ortalamayı getir
      const updatedRating = await axios.get(`http://localhost:3001/book/${id}/average-rating`);
      setAverageRating(updatedRating.data.averageRating);
    } catch (error) {
      console.error("Puanlama işlemi başarısız:", error);
    }
  };

  if (!book) {
    return <p>Kitap yükleniyor...</p>;
  }

  return (
    <div className="book-details-page">
      <h1 className="book-details-title">KİTAP DETAYLARI</h1>

      <div className="book-info">
        <img src={book.imageUrl} alt={book.name} />

        <div className="book-text">
          <p><strong>Kitap Adı:</strong> {book.name}</p>
          <p><strong>Yazar:</strong> {book.author}</p>
          <p><strong>Açıklama:</strong> {book.description}</p>
          <p>
            <strong>Durum:</strong> 
            {book.status === "available" ? (
              <span style={{ color: "green" }}> Rafta</span>
            ) : (
              <span style={{ color: "red" }}> Ödünç Alınmış</span>
            )}
          </p>
          <p>
            <strong>İade Tarihi:</strong>
            {book.status === "borrowed" ? (
              <span style={{ color: "orange" }}>
                {" "}{new Date(book.returnDue).toLocaleDateString("tr-TR")}
              </span>
            ) : (
              <span style={{ color: "gray" }}> - </span>
            )}
          </p>

          {/* Beğen Butonu */}
          <button className="like-button" onClick={handleLike}>
            {liked ? "Beğeniyi Geri Al" : "Beğen"}
          </button>

          {/* Oylama Butonları */}
          <div className="rating-buttons">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} onClick={() => handleRating(star)}>
                {star} ⭐
              </button>
            ))}
          </div>

          {/* Ortalama Puan */}
          {averageRating !== null && (
            <p><strong>Ortalama Puan:</strong> {averageRating.toFixed(2)} / 5</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetails;