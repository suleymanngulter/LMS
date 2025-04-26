import React from "react";
import { Link } from "react-router-dom";

const BookCard = ({ book, role }) => {
  const { name, author, imageUrl } = book;

  return (
    <div className="book-card-wrapper">
      {/* Kartın tamamı tıklanabilir olacak şekilde Link */}
      <Link to={`/bookdetail/${book._id}`} className="book-card" style={{ textDecoration: "none", color: "inherit" }}>
        <img src={imageUrl} alt={name} className="book-image" />
        <div className="book-details">
          <h3 className="book-title">{name}</h3>
          <p className="book-author">{author}</p>
        </div>
      </Link>

      {/* Admin yetkisi varsa butonlar ayrı dursun */}
      {role === "admin" && (
        <div className="book-actions">
          <button>
            <Link to={`/book/${book._id}`} className="btn-link">Düzenle</Link>
          </button>
          <button>
            <Link to={`/delete/${book._id}`} className="btn-link">Sil</Link>
          </button>
        </div>
      )}
    </div>
  );
};

export default BookCard;