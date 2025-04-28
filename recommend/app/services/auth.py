import os
import jwt
from dotenv import load_dotenv

load_dotenv()
JWT_SECRET = os.getenv("JWT_SECRET")

def decode_jwt(token):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload  
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
