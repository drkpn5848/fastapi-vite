from jose import jwt
from datetime import datetime, timedelta, timezone
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv('SECRET_KEY')
ALGORITHM = os.getenv('ALGORITHM')
ENC_KEY = os.getenv('ENC_KEY')

def generateToken(emailid: str, role: str):
    expire = datetime.now(timezone.utc) + timedelta(days=1)
    payload = {
        "sid": cipher(emailid, ENC_KEY),
        "rid": role,
        "exp": expire
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def validateToken(token: str):
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"sid": cipher(decoded["sid"], ENC_KEY), "rid": decoded["rid"]}
    except:
        return None

def cipher(data: str, key: str):
    result = ""
    for i in range(len(data)):
        result += chr(ord(data[i]) ^ ord(key[i % len(key)]))
    return result