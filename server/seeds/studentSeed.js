import bcrypt from 'bcrypt';
import { Student } from '../models/Student.js';
import '../db.js';

async function createOrUpdateStudent() {
  try {
    const student = await Student.findOne({ username: 'student1' });
    const hashedPassword = await bcrypt.hash('student123', 10);

    if (!student) {
      await Student.create({
        username: 'student1',
        password: hashedPassword,
        roll: '1001'
      });
      console.log("✅ Student hesabı oluşturuldu: username=student1, password=student123");
    } else {
      await Student.updateOne(
        { username: 'student1' },
        { $set: { password: hashedPassword } }
      );
      console.log("🔁 Student şifresi güncellendi: password=student123");
    }
  } catch (err) {
    console.error("❌ Student seed hatası:", err.message);
  }
}

createOrUpdateStudent();
