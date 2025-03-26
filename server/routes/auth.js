import express from 'express';
import { Admin } from '../models/Admin.js';
import { Student } from '../models/Student.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    let user = null;
    let key = '';
    let roleLabel = '';

    if (role === 'admin') {
      user = await Admin.findOne({ username });
      key = process.env.Admin_Key;
      roleLabel = 'admin';
    } else if (role === 'student') {
      user = await Student.findOne({ username });
      key = process.env.Student_Key;
      roleLabel = 'student';
    } else {
      return res.status(400).json({ message: "Geçersiz rol" });
    }

    if (!user) {
      return res.status(404).json({ message: `${roleLabel} kayıtlı değil` });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Yanlış şifre" });
    }

    const token = jwt.sign(
      { username: user.username, role: roleLabel },
      key,
      { expiresIn: '7d' }
    );

    const isProd = process.env.NODE_ENV === "production";

    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({ login: true, role: roleLabel,token });

  } catch (err) {
    return res.status(500).json({ message: "Giriş hatası", error: err.message });
  }
});

// Middleware: verifyAdmin
const verifyAdmin = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "geçersiz admin" });
  }
  jwt.verify(token, process.env.Admin_Key, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "geçersiz token" });
    }
    req.username = decoded.username;
    req.role = decoded.role;
    next();
  });
};

// Middleware: verifyUser (admin veya student)
const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "geçersiz kullanıcı" });
  }

  jwt.verify(token, process.env.Admin_Key, (err, decoded) => {
    if (!err) {
      req.username = decoded.username;
      req.role = decoded.role;
      return next();
    }

    jwt.verify(token, process.env.Student_Key, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "geçersiz token" });
      }
      req.username = decoded.username;
      req.role = decoded.role;
      next();
    });
  });
};

// Oturum doğrulama kontrolü
router.get('/verify', verifyUser, (req, res) => {
  return res.json({ login: true, role: req.role });
});

// Çıkış işlemi
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ logout: true });
});

// Dışa aktar
export { router as AuthRouter, verifyAdmin, verifyUser };
