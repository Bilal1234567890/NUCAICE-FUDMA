import pymysql
pymysql.install_as_MySQLdb()

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

# Get the database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:@localhost:3306/nucaice")

# For Aiven, add SSL parameter directly to the URL
if "aivencloud.com" in DATABASE_URL and "?" not in DATABASE_URL:
    DATABASE_URL = f"{DATABASE_URL}?ssl_mode=REQUIRED"

# Create the engine WITHOUT connect_args (SSL is handled in the URL)
engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()