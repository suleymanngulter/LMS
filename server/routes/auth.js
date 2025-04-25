import express from 'express';
import { Admin } from '../models/Admin.js';
import { Student } from '../models/Student.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET; // .env'den alınacak tek secret key

// 🔐 Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    let user = null;
    if (role === 'admin') {
      user = await Admin.findOne({ username });
    } else if (role === 'student') {
      user = await Student.findOne({ username });
    } else {
      return res.status(400).json({ message: "Geçersiz rol" });
    }

    if (!user) {
      return res.status(404).json({ message: `${role} kayıtlı değil` });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Yanlış şifre" });
    }

    // Tek key ile token oluştur
    const token = jwt.sign(
      { username: user.username, role }, // 👈 rol doğrudan payload’da
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const isProd = process.env.NODE_ENV === "production";

    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({
      login: true,
      role,
      token,
      redirectUrl: `http://localhost:8501?token=${token}`
    });

  } catch (err) {
    return res.status(500).json({ message: "Giriş hatası", error: err.message });
  }
});

// ✅ Middleware: verifyUser (admin veya student)
const verifyUser = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    console.log("🔒 Token yok (cookie gönderilmemiş).");
    return res.status(401).json({ message: "Oturum bulunamadı" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("❌ Token geçersiz:", err.message);
      return res.status(403).json({ message: "Geçersiz token" });
    }

    console.log("✅ Token doğrulandı:", decoded);
    req.username = decoded.username;
    req.role = decoded.role;
    next();
  });
};

// ✅ Middleware: verifyAdmin (rol kontrolü)
const verifyAdmin = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Oturum bulunamadı" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err || decoded.role !== 'admin') {
      return res.status(403).json({ message: "Yetkisiz erişim" });
    }
    req.username = decoded.username;
    req.role = decoded.role;
    next();
  });
};

// 🔍 Oturum kontrolü
router.get('/verify', verifyUser, (req, res) => {
  return res.json({ login: true, role: req.role });
});

// 🚪 Logout
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ logout: true });
});

// Export
export { router as AuthRouter, verifyAdmin, verifyUser };
