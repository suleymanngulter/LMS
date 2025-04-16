import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    roll: String,
    username: String,
    password: String,
    liked_books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    ratings: { type: Object, default: {} }
  }, { collection: 'students' });
  
export const Student = mongoose.model('Student', studentSchema);
  
