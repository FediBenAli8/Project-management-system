from sqlalchemy import create_engine, text
import pymysql

DATABASE_URL = "mysql+pymysql://root:@localhost:3306/"
engine = create_engine(DATABASE_URL)

with engine.connect() as connection:
    result = connection.execute(text("SHOW DATABASES"))
    print("Available databases:")
    for row in result:
        print(f"- {row[0]}")
