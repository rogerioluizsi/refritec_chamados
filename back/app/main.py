from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from .routers import cliente_routes, chamado_routes
from .database import engine, Base

# Cria as tabelas no banco de dados se não existirem
# Na prática, para ambientes de produção, você pode querer usar ferramentas
# como Alembic para migrações de banco de dados
Base.metadata.create_all(bind=engine)

# Inicializa a aplicação FastAPI
app = FastAPI(
    title="API de Chamados Técnicos",
    description="API para sistema de gestão de chamados técnicos para eletrodomésticos",
    version="1.0.0"
)

# Definição de origens permitidas
allowed_origins = [
    "http://localhost",
    "http://127.0.0.1",
    "http://144.22.197.21"
]

# Configuração de CORS para permitir solicitações de origens específicas
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir os roteadores
app.include_router(cliente_routes.router)
app.include_router(chamado_routes.router)

# Rota raiz
@app.get("/")
async def root():
    return {
        "message": "Bem-vindo à API de Chamados Técnicos",
        "docs": "/docs",
        "version": "1.0.0"
    } 