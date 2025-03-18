import express from 'express'
import { Student } from '../models/Student.js';
import bcrypt from 'bcrypt'
const router = express.Router();


router.post('/register',  async (req, res) => {
    try {
        const { username, password, roll } = req.body;
        const student = await Student.findOne({ username })
        if (student) {
            return res.json({ message: "öğrenci kayıtlı değil" })
        }
        const hashPassword = await bcrypt.hash(password, 10)
        const newstudent = new Student({
            username,
            password: hashPassword,
            roll
        })
        await newstudent.save()
        return res.json({ registered: true })
    } catch (err) {
        return res.json({ message: "kayıtlı öğrenci hatası" })
    }
})

export { router as studentRouter }
