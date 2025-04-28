import express from 'express'
import { Student } from '../models/Student.js';
import { Book } from '../models/Book.js';
import { verifyUser } from './auth.js';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const router = express.Router();


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



router.post('/like', verifyUser, async (req, res) => {
  const { bookId } = req.body;
  const roll = req.username;

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return res.status(400).json({ message: "Geçersiz kitap ID" });
  }

  try {
    const bookExists = await Book.findById(bookId);
    if (!bookExists) {
      return res.status(404).json({ message: "Kitap bulunamadı." });
    }

    const result = await Student.updateOne(
      { roll },
      { $addToSet: { liked_books: new mongoose.Types.ObjectId(bookId) } }
    );

    return res.status(200).json({ message: "Kitap beğenildi.", result });

  } catch (err) {
    return res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
});


router.get('/likes', verifyUser, async (req, res) => {
  const roll = req.username;

  try {
    const student = await Student.findOne({ roll }).populate('liked_books');
    if (!student) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    return res.json({ likedBooks: student.liked_books || [] });
  } catch (err) {
    return res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
});





router.post('/unlike', verifyUser, async (req, res) => {
  const { bookId } = req.body;
  const roll = req.username;

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return res.status(400).json({ message: "Geçersiz kitap ID" });
  }

  try {
    const bookExists = await Book.findById(bookId);
    if (!bookExists) {
      return res.status(404).json({ message: "Kitap bulunamadı." });
    }

    const result = await Student.updateOne(
      { roll },
      { $pull: { liked_books: new mongoose.Types.ObjectId(bookId) } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Beğeni bulunamadı veya kullanıcı yok." });
    }

    return res.json({ message: "Kitap beğenilerden çıkarıldı." });

  } catch (err) {
    return res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
});



router.post('/rate', verifyUser, async (req, res) => {
  const { bookId, rating } = req.body;
  const roll = req.username;

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return res.status(400).json({ message: "Geçersiz kitap ID" });
  }

  if (![1, 2, 3, 4, 5].includes(rating)) {
    return res.status(400).json({ message: "Puan 1 ile 5 arasında olmalı." });
  }

  try {
    const result = await Student.updateOne(
      { roll },
      { $set: { [`ratings.${bookId}`]: rating } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı veya puan değişmedi." });
    }

    return res.json({ message: "Puan kaydedildi." });

  } catch (err) {
    return res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
});

export { router as studentRouter };
