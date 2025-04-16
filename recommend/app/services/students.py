from services.db import db
from bson import ObjectId

def get_user_liked_book_ids(username):
    student = db["students"].find_one({"username": username})
    if not student or "liked_books" not in student:
        return []
    return [ObjectId(book_id) for book_id in student["liked_books"]]
