from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

DBURL = f"mongodb://{os.getenv('MDBUSER')}:{os.getenv('MDBPWD')}@{os.getenv('DBHOST')}:{os.getenv('MDBPORT')}/admin"

client = AsyncIOMotorClient(DBURL)
database = client[os.getenv("MDBNAME")]

# Dependency (like getConnection)
def getMongoConnection():
    try:
        yield database
    finally:
        pass   # Mongo client stays alive (no need to close per request)