import os
import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)
db = client["bookstore"]
collection = db["books"]

def get_books_df():
    data = list(collection.find({}, {"_id": 1, "name": 1,"author": 1, "similarityText": 1, "imageUrl": 1, "description": 1}))
    return pd.DataFrame(data)
