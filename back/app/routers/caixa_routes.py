from fastapi import APIRouter, Depends, HTTPException, Query, status, Path
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
from datetime import date

from ..database import get_db
from ..models import Caixa, RoleEnum
from ..schemas import Caixa as CaixaSchema, CaixaCreate, CaixaUpdate
from .chamado_routes import get_current_user_role

router = APIRouter(
    prefix="/api/caixa",
    tags=["caixa"],
    responses={
        404: {"description": "Lançamento de caixa não encontrado"},
        401: {"description": "API Key inválida"},
        403: {"description": "Acesso não autorizado"}
    },
    dependencies=[Depends(get_current_user_role)]
)

def check_admin_or_manager(role: str):
    if role not in [RoleEnum.ADMINISTRADOR.value, RoleEnum.GERENTE.value]:
        raise HTTPException(status_code=403, detail="Acesso permitido apenas para administradores e gerentes.")

@router.get("/", response_model=List[CaixaSchema])
def list_caixa(
    db: Session = Depends(get_db),
    current_user_role: str = Depends(get_current_user_role),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    mes: Optional[int] = Query(None),
    ano: Optional[int] = Query(None),
    tipo: Optional[str] = Query(None, description="entrada ou saida")
):
    check_admin_or_manager(current_user_role)
    query = db.query(Caixa)
    if mes:
        query = query.filter(Caixa.mes == mes)
    if ano:
        query = query.filter(Caixa.ano == ano)
    if tipo:
        query = query.filter(Caixa.tipo == tipo)
    total = query.count()
    caixas = query.order_by(Caixa.data_lancamento.desc()).offset((page-1)*per_page).limit(per_page).all()
    return caixas

@router.get("/sum", response_model=dict)
def sum_caixa(
    db: Session = Depends(get_db),
    current_user_role: str = Depends(get_current_user_role),
    mes: Optional[int] = Query(None),
    ano: Optional[int] = Query(None)
):
    check_admin_or_manager(current_user_role)
    query = db.query(Caixa)
    if mes:
        query = query.filter(Caixa.mes == mes)
    if ano:
        query = query.filter(Caixa.ano == ano)
    total_entrada = sum([c.valor for c in query.filter(Caixa.tipo == 'entrada').all()])
    total_saida = sum([c.valor for c in query.filter(Caixa.tipo == 'saida').all()])
    saldo = total_entrada - total_saida
    return {"total_entrada": float(total_entrada), "total_saida": float(total_saida), "saldo": float(saldo)}

@router.get("/{id_caixa}", response_model=CaixaSchema)
def get_caixa(
    id_caixa: int = Path(..., description="ID do lançamento de caixa"),
    db: Session = Depends(get_db),
    current_user_role: str = Depends(get_current_user_role)
):
    check_admin_or_manager(current_user_role)
    caixa = db.query(Caixa).filter(Caixa.id_caixa == id_caixa).first()
    if not caixa:
        raise HTTPException(status_code=404, detail="Lançamento de caixa não encontrado")
    return caixa

@router.post("/", response_model=CaixaSchema, status_code=status.HTTP_201_CREATED)
def create_caixa(
    caixa_in: CaixaCreate,
    db: Session = Depends(get_db),
    current_user_role: str = Depends(get_current_user_role)
):
    check_admin_or_manager(current_user_role)
    try:
        caixa = Caixa(**caixa_in.dict())
        db.add(caixa)
        db.commit()
        db.refresh(caixa)
        return caixa
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Erro ao criar lançamento de caixa.")

@router.put("/{id_caixa}", response_model=CaixaSchema)
def update_caixa(
    id_caixa: int,
    caixa_update: CaixaUpdate,
    db: Session = Depends(get_db),
    current_user_role: str = Depends(get_current_user_role)
):
    check_admin_or_manager(current_user_role)
    caixa = db.query(Caixa).filter(Caixa.id_caixa == id_caixa).first()
    if not caixa:
        raise HTTPException(status_code=404, detail="Lançamento de caixa não encontrado")
    update_data = caixa_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(caixa, key, value)
    db.commit()
    db.refresh(caixa)
    return caixa

@router.delete("/{id_caixa}", status_code=200)
def delete_caixa(
    id_caixa: int,
    db: Session = Depends(get_db),
    current_user_role: str = Depends(get_current_user_role)
):
    check_admin_or_manager(current_user_role)
    caixa = db.query(Caixa).filter(Caixa.id_caixa == id_caixa).first()
    if not caixa:
        raise HTTPException(status_code=404, detail="Lançamento de caixa não encontrado")
    db.delete(caixa)
    db.commit()
    return {"message": f"Lançamento de caixa {id_caixa} removido com sucesso"} 