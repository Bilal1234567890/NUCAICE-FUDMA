import pymysql
pymysql.install_as_MySQLdb()

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

# Get DATABASE_URL from environment
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:@localhost:3306/nucaice")

# Create engine with SSL options if using Aiven
# Check if we're using Aiven (host contains 'aivencloud.com')
if "aivencloud.com" in SQLALCHEMY_DATABASE_URL.lower():
    # For Aiven MySQL with SSL
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={
            "ssl": {
                "ssl_mode": "REQUIRED"
            }
        }
    )
else:
    # For local development
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()