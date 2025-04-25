from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional, Dict
from sqlalchemy.sql import func
from pydantic import BaseModel

from ..database import get_db
from ..models import Cliente
from ..schemas import Cliente as ClienteSchema
from ..schemas import ClienteCreate, ClienteUpdate, ClientePaginated

router = APIRouter(
    prefix="/api/clientes",
    tags=["clientes"],
    responses={404: {"description": "Cliente não encontrado"}}
)

# Define statistics schema
class ClienteStats(BaseModel):
    total_clientes: int

# IMPORTANT: Statistics endpoints must be defined BEFORE any path parameter routes
@router.get("/statistics", response_model=ClienteStats)
def get_cliente_statistics(db: Session = Depends(get_db)):
    """
    Retorna estatísticas dos clientes, incluindo:
    - Total de clientes cadastrados
    """
    total_clientes = db.query(func.count(Cliente.id_cliente)).scalar() or 0
    
    return ClienteStats(total_clientes=total_clientes)

@router.post("/", response_model=ClienteSchema, status_code=status.HTTP_201_CREATED)
def create_cliente(cliente: ClienteCreate, db: Session = Depends(get_db)):
    """
    Cria um novo cliente.
    
    - **telefone**: Número de telefone do cliente (único)
    - **nome**: Nome completo do cliente
    - **endereco**: Endereço do cliente (opcional)
    """
    # Verificar se já existe cliente com este telefone
    db_cliente = db.query(Cliente).filter(Cliente.telefone == cliente.telefone).first()
    if db_cliente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cliente com telefone '{cliente.telefone}' já existe"
        )
    
    # Criar novo cliente
    try:
        db_cliente = Cliente(
            telefone=cliente.telefone,
            nome=cliente.nome,
            endereco=cliente.endereco
        )
        db.add(db_cliente)
        db.commit()
        db.refresh(db_cliente)
        return db_cliente
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erro ao criar cliente. Verifique se os dados estão corretos."
        )

@router.get("/telefone/{numero_telefone}", response_model=ClienteSchema)
def get_cliente_by_telefone(numero_telefone: str, db: Session = Depends(get_db)):
    """
    Busca um cliente pelo número de telefone.
    """
    db_cliente = db.query(Cliente).filter(Cliente.telefone == numero_telefone).first()
    if db_cliente is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cliente com telefone '{numero_telefone}' não encontrado"
        )
    return db_cliente

@router.get("/{id_cliente}", response_model=ClienteSchema)
def get_cliente(id_cliente: int, db: Session = Depends(get_db)):
    """
    Obtém detalhes de um cliente específico pelo ID.
    """
    db_cliente = db.query(Cliente).filter(Cliente.id_cliente == id_cliente).first()
    if db_cliente is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cliente com ID {id_cliente} não encontrado"
        )
    return db_cliente

@router.get("/", response_model=ClientePaginated)
def list_clientes(
    page: int = Query(1, ge=1, description="Número da página"),
    per_page: int = Query(10, ge=1, le=100, description="Itens por página"),
    nome: Optional[str] = Query(None, description="Filtrar por nome"),
    telefone: Optional[str] = Query(None, description="Filtrar por telefone"),
    db: Session = Depends(get_db)
):
    """
    Lista todos os clientes com suporte a paginação e filtros.
    """
    # Construir a query base
    query = db.query(Cliente)
    
    # Aplicar filtros se fornecidos
    if nome:
        query = query.filter(Cliente.nome.ilike(f"%{nome}%"))
    if telefone:
        query = query.filter(Cliente.telefone.ilike(f"%{telefone}%"))
    
    # Contar total de registros para paginação
    total = query.count()
    
    # Aplicar paginação
    clientes = query.offset((page - 1) * per_page).limit(per_page).all()
    
    return {
        "total": total,
        "page": page,
        "per_page": per_page,
        "items": clientes
    }

@router.put("/{id_cliente}", response_model=ClienteSchema)
def update_cliente(
    id_cliente: int,
    cliente_update: ClienteUpdate,
    db: Session = Depends(get_db)
):
    """
    Atualiza dados de um cliente existente.
    
    - Apenas os campos fornecidos serão atualizados
    - Retorna o cliente com os dados atualizados
    """
    # Buscar o cliente pelo ID
    db_cliente = db.query(Cliente).filter(Cliente.id_cliente == id_cliente).first()
    if db_cliente is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cliente com ID {id_cliente} não encontrado"
        )
    
    # Verificar se está tentando atualizar o telefone para um que já existe
    if cliente_update.telefone and cliente_update.telefone != db_cliente.telefone:
        telefone_existe = db.query(Cliente).filter(
            Cliente.telefone == cliente_update.telefone,
            Cliente.id_cliente != id_cliente
        ).first()
        if telefone_existe:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Telefone '{cliente_update.telefone}' já está em uso por outro cliente"
            )
    
    # Atualizar apenas os campos fornecidos
    update_data = cliente_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_cliente, key, value)
    
    try:
        db.commit()
        db.refresh(db_cliente)
        return db_cliente
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erro ao atualizar cliente. Verifique se os dados estão corretos."
        ) 