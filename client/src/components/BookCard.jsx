import React from "react";
import { Link } from "react-router-dom";
import "../css/Book.css";

const BookCard = ({ book, role }) => {
  const { name, author, imageUrl } = book;

  return (
    <div className={`book-card-wrapper ${role === "admin" ? "admin-mode" : ""}`}>
      {/* Admin kullanıcıları için kitap detayına yönlendirme kaldırıldı */}
      {role !== "admin" ? (
        <Link to={`/bookdetail/${book._id}`} className="book-card" style={{ textDecoration: "none", color: "inherit" }}>
          <img src={imageUrl} alt={name} className="book-image" />
          <div className="book-details">
            <h3 className="book-title">{name}</h3>
            <p className="book-author"><em>{author}</em></p>
          </div>
        </Link>
      ) : (
        <div className="book-card">
          <img src={imageUrl} alt={name} className="book-image" />
          <div className="book-details">
            <h3 className="book-title">{name}</h3>
            <p className="book-author"><em>{author}</em></p>
          </div>
        </div>
      )}

      {role === "admin" && (
        <div className="book-actions">
          <button className="admin-btn">
            <Link to={`/book/${book._id}`} className="btn-link">Düzenle</Link>
          </button>
          <button className="admin-btn">
            <Link to={`/delete/${book._id}`} className="btn-link">Sil</Link>
          </button>
        </div>
      )}
    </div>
  );
};

export default BookCard;
