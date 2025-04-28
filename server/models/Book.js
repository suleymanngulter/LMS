import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  name: { type: String, required: true },
  author: { type: String, required: true },
  bookType: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String , required: true},
  similarityText: { type: String, required: true },
  
  
  status: { type: String, default: "available"}, 
  borrowedBy: { type: String, default: null },    
  borrowedAt: { type: Date, default: null },
  returnDue: { type: Date, default: null }

}, { collection: "books" });

const bookModel = mongoose.model('Book', bookSchema);
export { bookModel as Book };
