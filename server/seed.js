// import express from 'express'
// import bcrypt from 'bcrypt'
// import { Admin } from './models/Admin.js'
// import './db.js'

// async function AdminAccount() {
//   try {
//     const amdinCount = await Admin.countDocuments();
    
    
//     const hashPassword = await bcrypt.hash('admin123456', 10);
    
//     if (amdinCount === 0) {
   
//       const newAmdin = new Admin({
//         username: 'admin',
//         password: hashPassword
//       });
//       await newAmdin.save();
//       console.log("Hesap Oluşturuldu");
//     } else {
   
//       await Admin.updateOne(
//         { username: 'admin' },
//         { $set: { password: hashPassword } }
//       );
//       console.log("Admin şifresi güncellendi");
//     }
//   } catch (err) {
//     console.log("Hata:", err);
//   }
// }

// AdminAccount();
