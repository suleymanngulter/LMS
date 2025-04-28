import React, { useEffect, useState } from "react";
import axios from "axios";
import BookCard from "../components/BookCard";
import { Link } from "react-router-dom";
import "../css/LikedBooks.css";

const LikedBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedBooks = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3001/student/likes", {
          withCredentials: true,  // sadece Authorization token değil, cookie için de gerekiyor
        });
        
        setBooks(res.data.likedBooks || []);
      } catch (err) {
        console.error("Beğenilen kitaplar alınamadı:", err);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLikedBooks();
  }, []);

  return (
    <div className="books-page">
      <h2>Beğendiğim Kitaplar</h2>

      {loading ? (
        <p>Yükleniyor...</p>
      ) : books.length > 0 ? (
        <div className="books-container">
          {books.map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      ) : (
        <div className="no-books">
          <p>Henüz beğendiğiniz bir kitap yok.</p>
          <Link to="/books">Kitaplara göz atmak için tıklayın →</Link>
        </div>
      )}
    </div>
  );
};

export default LikedBooks;
