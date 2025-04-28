import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../css/BookDetail.css";

const BookDetails = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [liked, setLiked] = useState(false);
  const [averageRating, setAverageRating] = useState(null);
  const [hoveredStar, setHoveredStar] = useState(null); 

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
    
        const likedBooks = response.data.likedBooks; // ✅ Düzeltildi
    
        if (Array.isArray(likedBooks) && likedBooks.some(book => book._id === id)) {
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
        <img src={book.imageUrl} alt={book.name} className="book-image" />

        <div className="book-text">
          <h2 className="book-name">{book.name}</h2>
          <h3 className="book-author">{book.author}</h3>
          <p className="book-description">{book.description}</p>
          
          <p>
            <strong>Durum:</strong> 
            {book.status === "available" ? (
              <span style={{ color: "lightgreen" }}> Rafta</span>
            ) : (
              <span style={{ color: "lightcoral" }}> Ödünç Alınmış</span>
            )}
          </p>

          <p>
            <strong>İade Tarihi:</strong>
            {book.status === "borrowed" ? (
              <span style={{ color: "orange" }}>{new Date(book.returnDue).toLocaleDateString("tr-TR")}</span>
            ) : (
              <span style={{ color: "gray" }}> - </span>
            )}
          </p>

          <button className={`like-button ${liked ? "liked" : ""}`} onClick={handleLike}>
            {liked ? "Beğeniyi Geri Al" : "Beğen"}
          </button>

          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${hoveredStar >= star ? "hovered" : ""}`}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(null)}
                onClick={() => handleRating(star)}
              >
                ⭐
              </span>
            ))}
          </div>

          {averageRating !== null && (
            <p className="average-rating">
              <strong>Ortalama Puan:</strong> {averageRating.toFixed(2)} / 5
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
