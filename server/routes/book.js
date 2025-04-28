import express from 'express';
import mongoose from 'mongoose';
import { Student } from '../models/Student.js';
import { Book } from '../models/Book.js';
import { verifyAdmin, verifyUser } from './auth.js';

const router = express.Router();

// 📌 /book/add → Kitap ekleme (sadece admin)
router.post('/add', verifyAdmin, async (req, res) => {
  try {
    const { name, author, imageUrl } = req.body;
    const newbook = new Book({ name, author, imageUrl });
    await newbook.save();
    return res.json({ added: true });
  } catch (err) {
    return res.status(500).json({ message: "kitap ekleme hatası", error: err.message });
  }
});

// 📌 /book → Tüm kitapları getir
router.get('/books', async (req, res) => {
  try {
    const books = await Book.find();
    return res.json(books);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// 📌 /book/:id → Kitap detayları
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    return res.json(book);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// 📌 /book/:id → Kitap güncelle
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.json({ updated: true, book });
  } catch (err) {
    return res.status(500).json(err);
  }
});

// 📌 /book/:id → Kitap sil
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    return res.json({ deleted: true, book });
  } catch (err) {
    return res.status(500).json(err);
  }
});

// 📌 /book/:id/borrow → Ödünç alma
router.post('/:id/borrow', verifyUser, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Kitap bulunamadı" });

    if (book.status === "borrowed") {
      return res.status(400).json({ message: "Kitap zaten ödünç alınmış" });
    }

    const roll = req.username; // token'dan gelen kullanıcı adı (öğrenci)

    const now = new Date();
    const due = new Date(now);
    due.setDate(now.getDate() + 7); // 7 gün

    book.status = "borrowed";
    book.borrowedBy = roll;
    book.borrowedAt = now;
    book.returnDue = due;

    await book.save();
    return res.json({ borrowed: true, returnDue: due });

  } catch (err) {
    return res.status(500).json({ error: "Ödünç alma işlemi başarısız", details: err.message });
  }
});

// 📌 /book/:id/return → İade etme
router.post('/:id/return', verifyUser, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Kitap bulunamadı" });

    if (book.status === "available") {
      return res.status(400).json({ message: "Kitap zaten rafta" });
    }

    const currentRoll = req.username;
    if (book.borrowedBy !== currentRoll) {
      return res.status(403).json({ message: "Bu kitabı siz ödünç almadınız" });
    }

    book.status = "available";
    book.borrowedBy = null;
    book.borrowedAt = null;
    book.returnDue = null;

    await book.save();
    return res.json({ returned: true });

  } catch (err) {
    return res.status(500).json({ error: "İade işlemi başarısız", details: err.message });
  }
});

// 📌 /book/:id/status → Kitap durumu sorgula
router.get('/:id/status', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Kitap bulunamadı" });

    if (book.status === "available") {
      return res.json({ status: "available" });
    }

    const now = new Date();
    const returnDue = new Date(book.returnDue);
    const remainingDays = Math.max(Math.ceil((returnDue - now) / (1000 * 60 * 60 * 24)), 0);

    return res.json({
      status: "borrowed",
      borrowedBy: book.borrowedBy,
      returnDue: book.returnDue,
      remainingDays
    });

  } catch (err) {
    return res.status(500).json({ error: "Durum sorgulanamadı", details: err.message });
  }
});

//kitap ortalama puan
router.get('/:id/average-rating', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Geçersiz kitap ID" });
  }

  try {
    const students = await Student.find({ [`ratings.${id}`]: { $exists: true } });

    let totalRating = 0;
    let count = 0;

    if (students && students.length > 0) {
      students.forEach(student => {
        if (student.ratings && typeof student.ratings[id] === "number") {
          totalRating += student.ratings[id];
          count++;
        }
      });
    }

    // 🔥 Burada güvenli kontrol ekliyoruz
    if (count === 0) {
      return res.json({ averageRating: 0 });
    }

    const averageRating = totalRating / count;
    return res.json({ averageRating: parseFloat(averageRating.toFixed(2)) });

  } catch (err) {
    console.error('Ortalama puan alınırken sunucu hatası:', err);
    return res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
});


export { router as bookRouter };
