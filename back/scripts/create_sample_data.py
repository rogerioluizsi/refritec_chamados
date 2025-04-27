#!/usr/bin/env python3
"""
Script to create sample data for testing the multi-user scenario in the Refritec application.
"""

import sys
import os
from datetime import datetime, date, timedelta
import hashlib
from sqlalchemy.orm import Session
import logging

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, Base, engine
from app.models import Usuario, Cliente, Chamado, ItemChamado, RoleEnum

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def cleanup_database(db: Session):
    """Clean up all data from the database"""
    logger.info("Cleaning up database...")
    try:
        db.query(ItemChamado).delete()
        db.query(Chamado).delete()
        db.query(Cliente).delete()
        db.query(Usuario).delete()
        db.commit()
        logger.info("Database cleaned successfully")
    except Exception as e:
        logger.error(f"Error cleaning database: {str(e)}")
        db.rollback()
        raise

def create_sample_users(db: Session):
    """Create sample users with different roles"""
    logger.info("Creating sample users...")
    users = [
        {
            "username": "admin",
            "nome": "Administrador",
            "senha": "admin123",
            "role": RoleEnum.ADMINISTRADOR.value
        },
        {
            "username": "gerente",
            "nome": "Gerente",
            "senha": "gerente123",
            "role": RoleEnum.GERENTE.value
        },
        {
            "username": "tecnico1",
            "nome": "Técnico 1",
            "senha": "tecnico123",
            "role": RoleEnum.FUNCIONARIO.value
        },
        {
            "username": "tecnico2",
            "nome": "Técnico 2",
            "senha": "tecnico123",
            "role": RoleEnum.FUNCIONARIO.value
        }
    ]
    
    created_users = []
    for user_data in users:
        try:
            # Check if user already exists
            existing_user = db.query(Usuario).filter(Usuario.username == user_data["username"]).first()
            if existing_user:
                logger.info(f"User {user_data['username']} already exists")
                created_users.append(existing_user)
                continue
            
            # Create new user
            user = Usuario(
                username=user_data["username"],
                nome=user_data["nome"],
                senha=hash_password(user_data["senha"]),
                role=user_data["role"]
            )
            db.add(user)
            created_users.append(user)
            logger.info(f"Created user: {user.username}")
        except Exception as e:
            logger.error(f"Error creating user {user_data['username']}: {str(e)}")
            raise
    
    db.commit()
    for user in created_users:
        db.refresh(user)
        logger.info(f"User created: {user.username} (ID: {user.id_usuario}, Role: {user.role})")
    
    return created_users

def create_sample_clients(db: Session):
    """Create sample clients"""
    logger.info("Creating sample clients...")
    clients = [
        {
            "nome": "João Silva",
            "telefone": "11999887766",
            "endereco": "Rua das Flores, 123 - São Paulo"
        },
        {
            "nome": "Maria Santos",
            "telefone": "11988776655",
            "endereco": "Av. Paulista, 1000 - São Paulo"
        },
        {
            "nome": "Pedro Oliveira",
            "telefone": "11977665544",
            "endereco": "Rua Augusta, 500 - São Paulo"
        }
    ]
    
    created_clients = []
    for client_data in clients:
        try:
            # Check if client already exists
            existing_client = db.query(Cliente).filter(Cliente.telefone == client_data["telefone"]).first()
            if existing_client:
                logger.info(f"Client {client_data['nome']} already exists")
                created_clients.append(existing_client)
                continue
            
            # Create new client
            client = Cliente(**client_data)
            db.add(client)
            created_clients.append(client)
            logger.info(f"Created client: {client.nome}")
        except Exception as e:
            logger.error(f"Error creating client {client_data['nome']}: {str(e)}")
            raise
    
    db.commit()
    for client in created_clients:
        db.refresh(client)
        logger.info(f"Client created: {client.nome} (ID: {client.id_cliente})")
    
    return created_clients

def create_sample_chamados(db: Session, users, clients):
    """Create sample service calls"""
    logger.info("Creating sample service calls...")
    # Get current date
    today = datetime.now()
    
    chamados = [
        {
            "id_cliente": clients[0].id_cliente,
            "id_usuario": users[2].id_usuario,  # Técnico 1
            "descricao": "Geladeira não está gelando",
            "aparelho": "Geladeira Brastemp",
            "status": "Em Andamento",
            "data_abertura": today - timedelta(days=2),
            "data_prevista": today + timedelta(days=1)
        },
        {
            "id_cliente": clients[1].id_cliente,
            "id_usuario": users[3].id_usuario,  # Técnico 2
            "descricao": "Ar condicionado com vazamento",
            "aparelho": "Ar Condicionado Split",
            "status": "Aberto",
            "data_abertura": today - timedelta(days=1),
            "data_prevista": today + timedelta(days=2)
        },
        {
            "id_cliente": clients[2].id_cliente,
            "id_usuario": users[2].id_usuario,  # Técnico 1
            "descricao": "Máquina de lavar não centrifuga",
            "aparelho": "Máquina de Lavar Electrolux",
            "status": "Concluído",
            "data_abertura": today - timedelta(days=5),
            "data_conclusao": today - timedelta(days=2)
        }
    ]
    
    created_chamados = []
    for chamado_data in chamados:
        try:
            chamado = Chamado(**chamado_data)
            db.add(chamado)
            created_chamados.append(chamado)
            logger.info(f"Created chamado: {chamado.descricao}")
        except Exception as e:
            logger.error(f"Error creating chamado: {str(e)}")
            raise
    
    db.commit()
    for chamado in created_chamados:
        db.refresh(chamado)
        logger.info(f"Chamado created: {chamado.descricao} (ID: {chamado.id_chamado}, Técnico: {chamado.id_usuario})")
    
    return created_chamados

def create_sample_items(db: Session, chamados):
    """Create sample items for service calls"""
    logger.info("Creating sample items...")
    items = [
        {
            "id_chamado": chamados[0].id_chamado,
            "descricao": "Troca de gás",
            "quantidade": 1,
            "valor_unitario": 150.00
        },
        {
            "id_chamado": chamados[0].id_chamado,
            "descricao": "Mão de obra",
            "quantidade": 2,
            "valor_unitario": 100.00
        },
        {
            "id_chamado": chamados[1].id_chamado,
            "descricao": "Instalação de nova unidade",
            "quantidade": 1,
            "valor_unitario": 200.00
        },
        {
            "id_chamado": chamados[2].id_chamado,
            "descricao": "Troca de correia",
            "quantidade": 1,
            "valor_unitario": 80.00
        },
        {
            "id_chamado": chamados[2].id_chamado,
            "descricao": "Mão de obra",
            "quantidade": 1,
            "valor_unitario": 120.00
        }
    ]
    
    created_items = []
    for item_data in items:
        try:
            item = ItemChamado(**item_data)
            db.add(item)
            created_items.append(item)
            logger.info(f"Created item: {item.descricao}")
        except Exception as e:
            logger.error(f"Error creating item: {str(e)}")
            raise
    
    db.commit()
    for item in created_items:
        db.refresh(item)
        logger.info(f"Item created: {item.descricao} (ID: {item.id_item_chamado}, Chamado: {item.id_chamado})")
    
    return created_items

def verify_data_creation(db: Session):
    """Verify that all data was created successfully"""
    logger.info("Verifying data creation...")
    
    # Verify users
    users = db.query(Usuario).all()
    logger.info(f"Total users created: {len(users)}")
    for user in users:
        logger.info(f"User: {user.username} (ID: {user.id_usuario}, Role: {user.role})")
    
    # Verify clients
    clients = db.query(Cliente).all()
    logger.info(f"Total clients created: {len(clients)}")
    for client in clients:
        logger.info(f"Client: {client.nome} (ID: {client.id_cliente})")
    
    # Verify chamados
    chamados = db.query(Chamado).all()
    logger.info(f"Total chamados created: {len(chamados)}")
    for chamado in chamados:
        logger.info(f"Chamado: {chamado.descricao} (ID: {chamado.id_chamado}, Técnico: {chamado.id_usuario})")
    
    # Verify items
    items = db.query(ItemChamado).all()
    logger.info(f"Total items created: {len(items)}")
    for item in items:
        logger.info(f"Item: {item.descricao} (ID: {item.id_item_chamado}, Chamado: {item.id_chamado})")

def main():
    """Main function to create all sample data"""
    # Create database tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Clean up existing data
        cleanup_database(db)
        
        # Create sample data
        users = create_sample_users(db)
        clients = create_sample_clients(db)
        chamados = create_sample_chamados(db, users, clients)
        items = create_sample_items(db, chamados)
        
        # Verify data creation
        verify_data_creation(db)
        
        logger.info("Sample data created successfully!")
        
    except Exception as e:
        logger.error(f"Error creating sample data: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main() 