import pymysql
pymysql.install_as_MySQLdb()

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:@localhost:3306/nucaice")

# Check if we are using Aiven (or any SSL-required MySQL)
if "aivencloud.com" in SQLALCHEMY_DATABASE_URL:
    # Use the CA certificate
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={
            "ssl": {
                "ca": "/opt/render/project/src/BACK-END/ca.pem"   # Path on Render
            }
        }
    )
else:
    # Local development (no SSL)
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()