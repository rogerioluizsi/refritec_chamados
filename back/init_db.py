import sqlite3
import os
from dotenv import load_dotenv
from app.routers.auth_routes import create_admin_user

# Load environment variables
load_dotenv()

# Database file name
DB_FILE = 'chamados.db'

# Remove existing database if it exists
if os.path.exists(DB_FILE):
    os.remove(DB_FILE)

# Connect to database (will create it if it doesn't exist)
conn = sqlite3.connect(DB_FILE)
cursor = conn.cursor()

# Read and execute the schema SQL file
with open('schema.sql', 'r') as schema_file:
    schema_sql = schema_file.read()
    cursor.executescript(schema_sql)

# Commit and close
conn.commit()
conn.close()

# Create admin user with password from .env file
create_admin_user()

print("Database initialized with schema!")
print(f"Database file: {os.path.abspath(DB_FILE)}")
print("Admin user created successfully") 