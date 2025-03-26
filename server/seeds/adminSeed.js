import bcrypt from 'bcrypt';
import { Admin } from '../models/Admin.js';
import '../db.js';

async function createOrUpdateAdmin() {
  try {
    const adminCount = await Admin.countDocuments();
    const hashedPassword = await bcrypt.hash('admin123456', 10);

    if (adminCount === 0) {
      await Admin.create({ username: 'admin', password: hashedPassword });
      console.log("✅ Admin hesabı oluşturuldu: username=admin, password=admin123456");
    } else {
      await Admin.updateOne(
        { username: 'admin' },
        { $set: { password: hashedPassword } }
      );
      console.log("🔁 Admin şifresi güncellendi: password=admin123456");
    }
  } catch (err) {
    console.error("❌ Admin seed hatası:", err.message);
  }
}

createOrUpdateAdmin();
