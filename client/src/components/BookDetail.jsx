import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../css/BookDetail.css";

const BookDetails = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [liked, setLiked] = useState(false);
  const [averageRating, setAverageRating] = useState(null);
  const [bookStatus, setBookStatus] = useState("available");

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/book/${id}`);
        setBook(response.data);
        setBookStatus(response.data.status);
      } catch (error) {
        console.error("Kitap verisi alınamadı:", error);
      }
    };

    const fetchLikedStatus = async () => {
      try {
        const response = await axios.get("http://localhost:3001/student/likes", {
          withCredentials: true,
        });

        const likedBooks = response.data.likedBooks;
        setLiked(likedBooks.some((likedBook) => likedBook._id === id));
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
        await axios.post("http://localhost:3001/student/unlike", { bookId: id }, { withCredentials: true });
        setLiked(false);
      } else {
        await axios.post("http://localhost:3001/student/like", { bookId: id }, { withCredentials: true });
        setLiked(true);
      }
    } catch (error) {
      console.error("Beğeni işlemi başarısız:", error);
    }
  };

  const handleRating = async (newRating) => {
    try {
      await axios.post("http://localhost:3001/student/rate", { bookId: id, rating: newRating }, { withCredentials: true });
      const updatedRating = await axios.get(`http://localhost:3001/book/${id}/average-rating`);
      setAverageRating(updatedRating.data.averageRating);
    } catch (error) {
      console.error("Puanlama işlemi başarısız:", error);
    }
  };

  const handleBorrow = async () => {
    try {
      await axios.post(`http://localhost:3001/book/${id}/borrow`, {}, { withCredentials: true });
      setBookStatus("borrowed");
    } catch (error) {
      console.error("Ödünç alma işlemi başarısız:", error);
    }
  };

  const handleReturn = async () => {
    try {
      await axios.post(`http://localhost:3001/book/${id}/return`, {}, { withCredentials: true });
      setBookStatus("available");
    } catch (error) {
      console.error("İade işlemi başarısız:", error);
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
            {bookStatus === "available" ? (
              <span style={{ color: "lightgreen" }}> Rafta</span>
            ) : (
              <span style={{ color: "lightcoral" }}> Ödünç Alınmış</span>
            )}
          </p>

          <p>
            <strong>İade Tarihi:</strong>
            {bookStatus === "borrowed" ? (
              <span style={{ color: "lightgreen" }}>
                {new Date(book.returnDue).toLocaleDateString("tr-TR")}
              </span>
            ) : (
              <span style={{ color: "gray" }}> - </span>
            )}
          </p>

          <button className={`like-button ${liked ? "liked" : ""}`} onClick={handleLike}>
            {liked ? "Beğeniyi Geri Al" : "Beğen"}
          </button>

          {}
          {bookStatus === "available" && (
            <button className="borrow-button" onClick={handleBorrow}>
              Ödünç Al
            </button>
          )}

          {bookStatus === "borrowed" && (
            <button className="return-button" onClick={handleReturn}>
              İade Et
            </button>
          )}

          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star`}
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
