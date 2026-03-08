from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

#Read from .env
load_dotenv()

DBURL = f"mysql+pymysql://{os.getenv('DBUSER')}:{os.getenv('DBPWD')}@{os.getenv('DBHOST')}:{os.getenv('DBPORT')}/{os.getenv('DBNAME')}"

engine = create_engine(
    DBURL,
    pool_pre_ping=True,      # Checks connection before using
    pool_recycle=3600        # Recycle connections every 1 hour
)

DBSession = sessionmaker(autocommit = False, autoflush = False, bind=engine)

Base = declarative_base()

def getConnection():
    db = DBSession()
    try:
        yield db
    finally:
        db.close()