import express from 'express'
import { Student } from '../models/Student.js';
import { Book } from '../models/Book.js';
import { verifyUser } from './auth.js';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const router = express.Router();

// ✅ Öğrenci kayıt (zaten vardı)
router.post('/register', async (req, res) => {
  try {
    const { username, password, roll } = req.body;
    const student = await Student.findOne({ username });
    if (student) {
      return res.json({ message: "öğrenci zaten kayıtlı" });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const newstudent = new Student({
      username,
      password: hashPassword,
      roll
    });
    await newstudent.save();
    return res.json({ registered: true });
  } catch (err) {
    return res.json({ message: "kayıtlı öğrenci hatası", error: err.message });
  }
});


// ✅ Kitap beğenme
router.post('/like', verifyUser, async (req, res) => {
  const { bookId } = req.body;
  const username = req.username;

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return res.status(400).json({ message: "Geçersiz kitap ID" });
  }

  try {
    await Student.updateOne(
      { username },
      { $addToSet: { liked_books: new mongoose.Types.ObjectId(bookId) } }
    );
    return res.status(200).json({ message: "Kitap beğenildi." });
  } catch (err) {
    return res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
});


// ✅ Beğenilen kitapları getir
router.get('/likes', verifyUser, async (req, res) => {
  const username = req.username;

  try {
    const student = await Student.findOne({ username });
    if (!student) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }
    return res.json({ liked_books: student.liked_books || [] });
  } catch (err) {
    return res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
});


// ✅ Kitap beğenisini geri alma (unlike)
router.post('/unlike', verifyUser, async (req, res) => {
  const { bookId } = req.body;
  const username = req.username;

  try {
    await Student.updateOne(
      { username },
      { $pull: { liked_books: new mongoose.Types.ObjectId(bookId) } }
    );
    return res.json({ message: "Beğeni kaldırıldı." });
  } catch (err) {
    return res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
});


// ✅ Kitap puanlama
router.post('/rate', verifyUser, async (req, res) => {
  const { bookId, rating } = req.body;
  const username = req.username;

  if (![1, 2, 3, 4, 5].includes(rating)) {
    return res.status(400).json({ message: "Geçersiz puan aralığı" });
  }

  try {
    await Student.updateOne(
      { username },
      { $set: { [`ratings.${bookId}`]: rating } }
    );
    return res.json({ message: "Puan kaydedildi." });
  } catch (err) {
    return res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
});

export { router as studentRouter };