from fastapi import APIRouter, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
import hashlib
import sqlite3
from pydantic import BaseModel

# Create a simple login model
class LoginData(BaseModel):
    username: str
    password: str

# Super simplified router
router = APIRouter()

def hash_password(password: str) -> str:
    """Create SHA-256 hash of password"""
    return hashlib.sha256(password.encode()).hexdigest()

# Basic function to create admin user using raw SQL
def create_admin_user():
    """Create admin user directly using SQL"""
    try:
        # Connect to database
        conn = sqlite3.connect('chamados.db')
        cursor = conn.cursor()
        
        # Check if admin exists
        cursor.execute("SELECT * FROM Usuario WHERE username = 'admin'")
        if not cursor.fetchone():
            print("Usuaio nao existe, criando usuario admin")
            # Hash password
            password_hash = hash_password("uma senha segura")
            
            # Insert admin user
            cursor.execute(
                "INSERT INTO Usuario (username, nome, senha) VALUES (?, ?, ?)",
                ("admin", "Administrador", password_hash)
            )
            conn.commit()
            print("Admin user created successfully")
        else:
            print("Admin user already exists")
            
    except Exception as e:
        print(f"Error creating admin user: {str(e)}")
    finally:
        if conn:
            conn.close()

# Super simple login endpoint
@router.post("/login")
def login(login_data: LoginData):
    """Basic login using raw SQL"""
    try:
        # Connect to database
        conn = sqlite3.connect('chamados.db')
        cursor = conn.cursor()
        
        # Find user
        cursor.execute("SELECT senha FROM Usuario WHERE username = ?", (login_data.username,))
        user = cursor.fetchone()
        
        if user and user[0] == hash_password(login_data.password):
            return {"message": "Login bem-sucedido"}
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Nome de usuário ou senha incorretos"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    finally:
        if conn:
            conn.close()

