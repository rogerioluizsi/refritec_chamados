#!/usr/bin/env python3
"""
Script to create a user in the Refritec application database.
"""

from app.models import Usuario
from app.database import SessionLocal
import hashlib

def create_user(username, nome, password):
    """Create a new user in the database"""
    # Hash the password using SHA-256 to match auth_routes.py
    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    
    # Create a database session
    db = SessionLocal()
    
    try:
        # Check if username already exists
        existing_user = db.query(Usuario).filter(Usuario.username == username).first()
        if existing_user:
            print(f"Error: Username '{username}' already exists")
            return False
        
        # Create new user
        new_user = Usuario(
            username=username,
            nome=nome,
            senha=hashed_password
        )
        
        # Add to database and commit
        db.add(new_user)
        db.commit()
        
        print(f"User created successfully:")
        print(f"ID: {new_user.id_usuario}")
        print(f"Username: {new_user.username}")
        print(f"Nome: {new_user.nome}")
        return True
    
    except Exception as e:
        db.rollback()
        print(f"Error creating user: {str(e)}")
        return False
    
    finally:
        db.close()

# Hardcoded user creation
if __name__ == "__main__":
    create_user("admin", "Administrador", "bibEpYrRGN0y5WS")
