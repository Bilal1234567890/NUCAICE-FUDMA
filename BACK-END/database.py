import pymysql
pymysql.install_as_MySQLdb()

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

# Get the raw database URL from environment
raw_url = os.getenv("DATABASE_URL", "mysql+pymysql://root:@localhost:3306/nucaice")

# Remove any query string (e.g., ?ssl_mode=REQUIRED) to avoid conflicts
if "?" in raw_url:
    raw_url = raw_url.split("?")[0]

# Set the final URL
DATABASE_URL = raw_url

# For Aiven, we need SSL with a CA certificate
if "aivencloud.com" in DATABASE_URL:
    engine = create_engine(
        DATABASE_URL,
        connect_args={
            "ssl": {
                "ca": "/opt/render/project/src/BACK-END/ca.pem"   # Path on Render
            }
        }
    )
else:
    # Local development (no SSL)
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()