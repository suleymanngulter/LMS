import React, { useEffect, useState } from "react";
import axios from "axios";
import BookCard from "../components/BookCard";
import { Link } from "react-router-dom";

const LikedBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedBooks = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3001/student/likes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
    <div
      className="books-page"
      style={{
        backgroundColor: "#0e2a51",
        minHeight: "100vh",
        padding: "40px",
        color: "white",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>Beğendiğim Kitaplar</h2>

      {loading ? (
        <p style={{ color: "#ccc" }}>Yükleniyor...</p>
      ) : books.length > 0 ? (
        <div className="books-container">
          {books.map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      ) : (
        <div style={{ marginTop: "80px", textAlign: "left" }}>
          <p
            style={{
              fontSize: "18px",
              fontWeight: "normal",
              marginBottom: "10px",
            }}
          >
            Henüz beğendiğiniz bir kitap yok.
          </p>
          <Link to="/books" style={{ fontSize: "14px", color: "#ffd700" }}>
            Kitaplara göz atmak için buraya tıklayın →
          </Link>
        </div>
      )}
    </div>
  );
};

export default LikedBooks;