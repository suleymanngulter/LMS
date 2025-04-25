import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../css/LikedBooks.css";

const LikedBooks = () => {
  const [likedBooks, setLikedBooks] = useState([]);

  useEffect(() => {
    const fetchLikedBooks = async () => {
      try {
        const response = await axios.get('http://localhost:3001/student/likes', {
          withCredentials: true,
        });

        const bookIds = response.data.liked_books;

        const bookDetailsPromises = bookIds.map(id =>
          axios.get(`http://localhost:3001/book/${id}`)
        );
        
        const booksData = await Promise.all(bookDetailsPromises);

        const books = booksData.map(res => res.data);
        setLikedBooks(books);
      } catch (error) {
        console.error("Beğenilen kitaplar alınamadı:", error);
      }
    };

    fetchLikedBooks();
  }, []);

  return (
    <div className="liked-books-page">
      <h1 className="liked-books-title">Beğendiğim Kitaplar</h1>

      {likedBooks.length === 0 ? (
        <p>Henüz beğendiğin kitap yok.</p>
      ) : (
        <div className="liked-books-list">
          {likedBooks.map((book) => (
            <div key={book._id} className="liked-book-card">
              <img src={book.imageUrl} alt={book.name} />
              <div className="liked-book-info">
                <h3>{book.name}</h3>
                <p>{book.author}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LikedBooks;