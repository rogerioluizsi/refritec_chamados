from fastapi import APIRouter, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
import hashlib
import sqlite3
import os
from dotenv import load_dotenv
from pydantic import BaseModel
import datetime
from typing import Optional

# Load environment variables
load_dotenv()

# Create a simple login model
class LoginData(BaseModel):
    username: str
    password: str

# User management models
class UserCreate(BaseModel):
    username: str
    nome: str
    password: str
    role: str

class UserUpdate(BaseModel):
    nome: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None
    ativo: Optional[bool] = None

# Super simplified router
router = APIRouter()

def hash_password(password: str) -> str:
    """Create SHA-256 hash of password"""
    return hashlib.sha256(password.encode()).hexdigest()

def check_user_permissions(user_role: str, target_role: str) -> bool:
    """Check if user has permission to manage target role"""
    if user_role == "administrador":
        return True
    elif user_role == "gerente":
        return target_role in ["gerente", "funcionario"]
    return False

# Function to create admin user with password from .env
def create_admin_user():
    """Create admin user with password from .env file"""
    try:
        # Connect to database
        conn = sqlite3.connect('chamados.db')
        cursor = conn.cursor()
        
        # Get password from .env
        env_password = os.getenv('password', "123456")
        
        # Check if admin exists
        cursor.execute("SELECT * FROM Usuario WHERE username = 'admin'")
        if not cursor.fetchone():
            print("Creating admin user with password from .env file")
            # Hash password
            password_hash = hash_password(env_password)
            
            # Insert admin user with all required fields
            cursor.execute(
                """
                INSERT INTO Usuario (username, nome, senha, role, data_criacao, ativo)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    "admin",
                    "Administrador",
                    password_hash,
                    "administrador",
                    datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    1
                )
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
        conn = sqlite3.connect('chamados.db')
        cursor = conn.cursor()
        
        # Fetch password hash, role, and ativo status
        cursor.execute(
            "SELECT senha, role, ativo FROM Usuario WHERE username = ?",
            (login_data.username,)
        )
        user = cursor.fetchone()
        
        if user:
            senha_hash, role, ativo = user
            if not ativo:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Usuário inativo"
                )
            if senha_hash == hash_password(login_data.password):
                return {
                    "message": "Login bem-sucedido",
                    "role": role
                }
        
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

@router.post("/users")
def create_user(user_data: UserCreate, current_user_role: str):
    """Create a new user"""
    if not check_user_permissions(current_user_role, user_data.role):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para criar este tipo de usuário"
        )
    
    try:
        conn = sqlite3.connect('chamados.db')
        cursor = conn.cursor()
        
        # Check if username already exists
        cursor.execute("SELECT username FROM Usuario WHERE username = ?", (user_data.username,))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nome de usuário já existe"
            )
        
        # Hash password
        password_hash = hash_password(user_data.password)
        
        # Insert new user
        cursor.execute(
            """
            INSERT INTO Usuario (username, nome, senha, role, data_criacao, ativo)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                user_data.username,
                user_data.nome,
                password_hash,
                user_data.role,
                datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                1
            )
        )
        conn.commit()
        
        return {"message": "Usuário criado com sucesso"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    finally:
        if conn:
            conn.close()

@router.put("/users/{username}")
def update_user(username: str, user_data: UserUpdate, current_user_role: str):
    """Update an existing user"""
    try:
        conn = sqlite3.connect('chamados.db')
        cursor = conn.cursor()
        
        # Get current user data
        cursor.execute("SELECT role FROM Usuario WHERE username = ?", (username,))
        current_user = cursor.fetchone()
        
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        
        if not check_user_permissions(current_user_role, current_user[0]):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não tem permissão para editar este usuário"
            )
        
        # Build update query
        update_fields = []
        params = []
        
        if user_data.nome is not None:
            update_fields.append("nome = ?")
            params.append(user_data.nome)
        
        if user_data.password is not None:
            update_fields.append("senha = ?")
            params.append(hash_password(user_data.password))
        
        if user_data.role is not None:
            if not check_user_permissions(current_user_role, user_data.role):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Você não tem permissão para definir este tipo de usuário"
                )
            update_fields.append("role = ?")
            params.append(user_data.role)
        
        if user_data.ativo is not None:
            update_fields.append("ativo = ?")
            params.append(1 if user_data.ativo else 0)
        
        if not update_fields:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nenhum campo para atualizar"
            )
        
        # Add username to params
        params.append(username)
        
        # Execute update
        cursor.execute(
            f"UPDATE Usuario SET {', '.join(update_fields)} WHERE username = ?",
            params
        )
        conn.commit()
        
        return {"message": "Usuário atualizado com sucesso"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    finally:
        if conn:
            conn.close()

@router.delete("/users/{username}")
def delete_user(username: str, current_user_role: str):
    """Delete a user"""
    try:
        conn = sqlite3.connect('chamados.db')
        cursor = conn.cursor()
        
        # Get current user data
        cursor.execute("SELECT role FROM Usuario WHERE username = ?", (username,))
        current_user = cursor.fetchone()
        
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        
        if not check_user_permissions(current_user_role, current_user[0]):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não tem permissão para excluir este usuário"
            )
        
        # Delete user
        cursor.execute("DELETE FROM Usuario WHERE username = ?", (username,))
        conn.commit()
        
        return {"message": "Usuário excluído com sucesso"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    finally:
        if conn:
            conn.close()

