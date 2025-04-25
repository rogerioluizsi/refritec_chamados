from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# URL de conexão do banco de dados (por padrão, usará SQLite)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./chamados.db")

# Cria o motor de banco de dados SQLAlchemy
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

# Cria uma sessão local para usar nas consultas
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Classe Base para os modelos
Base = declarative_base()

# Função para obter uma sessão do banco de dados
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 