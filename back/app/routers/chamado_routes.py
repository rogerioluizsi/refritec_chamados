from fastapi import APIRouter, Depends, HTTPException, Query, status, Path, Header, Security
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func
from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta
from pydantic import BaseModel
import os

from ..database import get_db
from ..models import Chamado, Cliente, ItemChamado, HistoricoAlteracaoChamado, Usuario, RoleEnum, Caixa
from ..schemas import (
    Chamado as ChamadoSchema,
    ChamadoCreate,
    ChamadoUpdate,
    ChamadoDetail,
    ChamadoPaginated,
    ItemChamado as ItemChamadoSchema,
    ItemChamadoCreate,
    ItemChamadoUpdate
)

# Get API_KEY from environment
API_KEY = os.getenv("API_KEY")

# Security dependency
def verify_api_key(x_api_key: str = Header(..., description="API Key for authentication")):
    if not API_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="API Key not configured on server"
        )
    if x_api_key != API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API Key"
        )
    return x_api_key

# Dependency to get current user's role
def get_current_user_role(
    x_api_key: str = Depends(verify_api_key),
    x_user_role: str = Header(..., description="User role for authorization", alias="X-User-Role")
):
    if x_user_role not in [role.value for role in RoleEnum]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid user role"
        )
    return x_user_role

router = APIRouter(
    prefix="/api/chamados",
    tags=["chamados"],
    responses={
        404: {"description": "Chamado não encontrado"},
        401: {"description": "API Key inválida"},
        403: {"description": "Acesso não autorizado"}
    },
    dependencies=[Depends(verify_api_key)]  # Apply API key verification to all routes
)

# Define statistics schema
class ChamadoStatistics(BaseModel):
    total_open: int
    total_in_progress: int
    total_completed: int
    total_canceled: int
    total_value_open: float
    valor_recebido_mes: float
    chamados_by_client: Dict[str, int]
    total_clientes: int = 0

# Função auxiliar para verificar se um cliente existe
def get_cliente_or_404(db: Session, id_cliente: int):
    cliente = db.query(Cliente).filter(Cliente.id_cliente == id_cliente).first()
    if not cliente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cliente com ID {id_cliente} não encontrado"
        )
    return cliente

# Função auxiliar para verificar se um usuário existe
def get_usuario_or_404(db: Session, id_usuario: int):
    usuario = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuário com ID {id_usuario} não encontrado"
        )
    return usuario

# Função auxiliar para verificar se um chamado existe
def get_chamado_or_404(db: Session, id_chamado: int):
    chamado = db.query(Chamado).filter(Chamado.id_chamado == id_chamado).first()
    if not chamado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Chamado com ID {id_chamado} não encontrado"
        )
    return chamado

# Função auxiliar para verificar se um item de chamado existe
def get_item_chamado_or_404(db: Session, id_item_chamado: int):
    item = db.query(ItemChamado).filter(ItemChamado.id_item_chamado == id_item_chamado).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item de chamado com ID {id_item_chamado} não encontrado"
        )
    return item

# Função auxiliar para registrar histórico de alteração
def registrar_historico(db: Session, id_chamado: int, campo: str, valor_antigo, valor_novo, id_funcionario: int = None):
    historico = HistoricoAlteracaoChamado(
        id_chamado=id_chamado,
        campo_alterado=campo,
        valor_antigo=str(valor_antigo) if valor_antigo is not None else None,
        valor_novo=str(valor_novo) if valor_novo is not None else None,
        id_funcionario=id_funcionario
    )
    db.add(historico)

# Função auxiliar para calcular o valor total de itens de um chamado
def calcular_valor_total_itens(db: Session, id_chamado: int):
    total = db.query(
        func.sum(ItemChamado.quantidade * ItemChamado.valor_unitario)
    ).filter(
        ItemChamado.id_chamado == id_chamado
    ).scalar() or 0.0
    
    return total

# IMPORTANT: Statistics endpoints must be defined BEFORE any path parameter routes
@router.get("/statistics", response_model=ChamadoStatistics)
def get_chamado_statistics(db: Session = Depends(get_db)):
    """
    Retorna estatísticas dos chamados, incluindo:
    - Total de chamados por status
    - Valor total em aberto
    - Valor recebido no mês atual
    - Contagem de chamados por cliente
    """
    # Obter data do início do mês atual
    today = date.today()
    first_day_of_month = date(today.year, today.month, 1)
    
    # Contar chamados por status
    total_open = db.query(func.count(Chamado.id_chamado)).filter(Chamado.status == "Aberto").scalar() or 0
    total_in_progress = db.query(func.count(Chamado.id_chamado)).filter(Chamado.status == "Em Andamento").scalar() or 0
    total_completed = db.query(func.count(Chamado.id_chamado)).filter(Chamado.status == "Concluído").scalar() or 0
    total_canceled = db.query(func.count(Chamado.id_chamado)).filter(Chamado.status == "Cancelado").scalar() or 0
    
    # Chamados em andamento
    chamados_em_andamento = db.query(Chamado).filter(Chamado.status == "Em Andamento").all()
    total_value_open = 0.0
    for chamado in chamados_em_andamento:
        total_value_open += calcular_valor_total_itens(db, chamado.id_chamado)
    
    # Chamados concluídos no mês atual
    chamados_concluidos_mes = db.query(Chamado).filter(
        Chamado.status == "Concluído",
        Chamado.data_conclusao >= first_day_of_month
    ).all()
    valor_recebido_mes = 0.0
    for chamado in chamados_concluidos_mes:
        valor_recebido_mes += calcular_valor_total_itens(db, chamado.id_chamado)
    
    # Contagem de chamados por cliente
    chamados_by_client = {}
    client_counts = db.query(
        Cliente.nome, func.count(Chamado.id_chamado)
    ).join(Chamado, Cliente.id_cliente == Chamado.id_cliente).group_by(
        Cliente.nome
    ).all()
    
    for client_name, count in client_counts:
        chamados_by_client[client_name] = count
    
    return ChamadoStatistics(
        total_open=total_open,
        total_in_progress=total_in_progress,
        total_completed=total_completed,
        total_canceled=total_canceled,
        total_value_open=total_value_open,
        valor_recebido_mes=valor_recebido_mes,
        chamados_by_client=chamados_by_client,
        total_clientes=0  # Will be filled by cliente_routes endpoint
    )

# Rotas de Chamados
@router.post("/", response_model=ChamadoSchema, status_code=status.HTTP_201_CREATED)
def create_chamado(chamado: ChamadoCreate, db: Session = Depends(get_db)):
    """
    Cria um novo chamado para um cliente existente.
    
    - **id_cliente**: ID do cliente (deve existir)
    - **id_usuario**: ID do técnico responsável (opcional)
    - **descricao**: Descrição do problema
    - **aparelho**: Qual eletrodoméstico está com problema
    - **status**: Situação do chamado (padrão: 'Aberto')
    - **observacao**: Notas adicionais (opcional)
    - **data_prevista**: Data estimada para conclusão (opcional)
    - **data_conclusao**: Data de conclusão do chamado (opcional)
    """
    # Verificar se o cliente existe
    get_cliente_or_404(db, chamado.id_cliente)
    
    # Verificar se o técnico existe, se foi fornecido
    if chamado.id_usuario:
        get_usuario_or_404(db, chamado.id_usuario)
    
    # Criar novo chamado
    try:
        db_chamado = Chamado(
            id_cliente=chamado.id_cliente,
            id_usuario=chamado.id_usuario,
            descricao=chamado.descricao,
            aparelho=chamado.aparelho,
            status=chamado.status,
            observacao=chamado.observacao,
            data_prevista=chamado.data_prevista,
            data_abertura=datetime.now(),
            data_conclusao=chamado.data_conclusao,
            valor=0.0  # Valor inicial zerado
        )
        db.add(db_chamado)
        db.commit()
        db.refresh(db_chamado)
        return db_chamado
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erro ao criar chamado. Verifique se os dados estão corretos."
        )

@router.get("/", response_model=ChamadoPaginated)
def list_chamados(
    page: int = Query(1, ge=1, description="Número da página"),
    per_page: int = Query(10, ge=1, le=100, description="Itens por página"),
    status: Optional[str] = Query(None, description="Filtrar por status"),
    id_cliente: Optional[int] = Query(None, description="Filtrar por cliente"),
    id_usuario: Optional[int] = Query(None, description="Filtrar por técnico"),
    data_inicio: Optional[date] = Query(None, description="Filtrar por data de abertura (início)"),
    data_fim: Optional[date] = Query(None, description="Filtrar por data de abertura (fim)"),
    data_conclusao_inicio: Optional[date] = Query(None, description="Filtrar por data de conclusão (início)"),
    data_conclusao_fim: Optional[date] = Query(None, description="Filtrar por data de conclusão (fim)"),
    db: Session = Depends(get_db),
    current_user_role: str = Depends(get_current_user_role),
    current_user_id: int = Header(..., description="Current user ID")
):
    """
    Lista todos os chamados com suporte a paginação e filtros.
    - Administradores e gerentes podem ver todos os chamados
    - Funcionários só podem ver seus próprios chamados
    """
    # Construir a query base
    query = db.query(Chamado).options(joinedload(Chamado.cliente), joinedload(Chamado.tecnico))
    
    # Aplicar filtros baseados no papel do usuário
    if current_user_role == RoleEnum.FUNCIONARIO.value:
        query = query.filter(Chamado.id_usuario == current_user_id)
    
    # Aplicar filtros adicionais se fornecidos
    if status:
        query = query.filter(Chamado.status == status)
    if id_cliente:
        query = query.filter(Chamado.id_cliente == id_cliente)
    if id_usuario:
        query = query.filter(Chamado.id_usuario == id_usuario)
    if data_inicio:
        query = query.filter(Chamado.data_abertura >= data_inicio)
    if data_fim:
        query = query.filter(Chamado.data_abertura <= data_fim)
    if data_conclusao_inicio:
        query = query.filter(Chamado.data_conclusao >= data_conclusao_inicio)
    if data_conclusao_fim:
        query = query.filter(Chamado.data_conclusao <= data_conclusao_fim)
    
    # Ordenar por data de abertura (mais recentes primeiro)
    query = query.order_by(Chamado.data_abertura.desc())
    
    # Contar total de registros para paginação
    total = query.count()
    
    # Aplicar paginação
    chamados = query.offset((page - 1) * per_page).limit(per_page).all()
    
    return {
        "total": total,
        "page": page,
        "per_page": per_page,
        "items": chamados
    }

@router.get("/{id_chamado}", response_model=ChamadoDetail)
def get_chamado(
    id_chamado: int = Path(..., description="ID do chamado"),
    db: Session = Depends(get_db),
    current_user_role: str = Depends(get_current_user_role),
    current_user_id: int = Header(..., description="Current user ID")
):
    """
    Obtém detalhes de um chamado específico, incluindo seus itens e valor total.
    - Administradores e gerentes podem ver qualquer chamado
    - Funcionários só podem ver seus próprios chamados
    """
    # Buscar o chamado com itens relacionados
    chamado = db.query(Chamado).options(
        joinedload(Chamado.cliente),
        joinedload(Chamado.tecnico)
    ).filter(Chamado.id_chamado == id_chamado).first()
    
    if not chamado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Chamado com ID {id_chamado} não encontrado"
        )
    
    # Verificar permissão de acesso
    if current_user_role == RoleEnum.FUNCIONARIO.value and chamado.id_usuario != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para acessar este chamado"
        )
    
    # Calcular o valor total dos itens
    valor_total = calcular_valor_total_itens(db, id_chamado)
    
    # Preparar resposta
    response = dict(
        id_chamado=chamado.id_chamado,
        id_cliente=chamado.id_cliente,
        id_usuario=chamado.id_usuario,
        descricao=chamado.descricao,
        aparelho=chamado.aparelho,
        status=chamado.status,
        valor=chamado.valor,
        observacao=chamado.observacao,
        data_abertura=chamado.data_abertura,
        data_prevista=chamado.data_prevista,
        data_conclusao=chamado.data_conclusao,
        itens=chamado.itens,
        cliente=chamado.cliente,
        tecnico=chamado.tecnico,
        valor_total=valor_total
    )
    
    return response

@router.get("/cliente/{id_cliente}", response_model=List[ChamadoSchema])
def get_chamados_by_cliente(
    id_cliente: int = Path(..., description="ID do cliente"),
    db: Session = Depends(get_db)
):
    """
    Lista todos os chamados de um cliente específico.
    """
    # Verificar se o cliente existe
    get_cliente_or_404(db, id_cliente)
    
    # Buscar os chamados do cliente
    chamados = db.query(Chamado).options(
        joinedload(Chamado.tecnico)
    ).filter(Chamado.id_cliente == id_cliente).order_by(Chamado.data_abertura.desc()).all()
    
    return chamados

@router.get("/tecnico/{id_usuario}", response_model=List[ChamadoSchema])
def get_chamados_by_tecnico(
    id_usuario: int = Path(..., description="ID do técnico"),
    db: Session = Depends(get_db),
    current_user_role: str = Depends(get_current_user_role),
    current_user_id: int = Header(..., description="Current user ID")
):
    """
    Lista todos os chamados atribuídos a um técnico específico.
    - Administradores e gerentes podem ver chamados de qualquer técnico
    - Funcionários só podem ver seus próprios chamados
    """
    # Verificar se o usuário existe
    get_usuario_or_404(db, id_usuario)
    
    # Verificar permissão de acesso
    if current_user_role == RoleEnum.FUNCIONARIO.value and id_usuario != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para ver chamados de outros técnicos"
        )
    
    # Buscar os chamados do técnico
    chamados = db.query(Chamado).options(
        joinedload(Chamado.cliente)
    ).filter(Chamado.id_usuario == id_usuario).order_by(Chamado.data_abertura.desc()).all()
    
    return chamados

@router.put("/{id_chamado}", response_model=ChamadoSchema)
def update_chamado(
    id_chamado: int,
    chamado_update: ChamadoUpdate,
    db: Session = Depends(get_db),
    current_user_role: str = Depends(get_current_user_role),
    current_user_id: int = Header(..., description="Current user ID")
):
    """
    Atualiza um chamado existente.
    
    - Apenas os campos fornecidos serão atualizados
    - Alterações são registradas no histórico
    - O id_usuario pode ser atualizado para atribuir o chamado a um técnico diferente
    - Funcionários só podem atualizar seus próprios chamados
    - Administradores e gerentes podem atualizar qualquer chamado
    """
    # Buscar o chamado pelo ID
    db_chamado = get_chamado_or_404(db, id_chamado)
    
    # Verificar permissão de atualização
    if current_user_role == RoleEnum.FUNCIONARIO.value and db_chamado.id_usuario != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para atualizar este chamado"
        )
    
    # Verificar se o técnico existe, se foi fornecido
    if chamado_update.id_usuario is not None:
        get_usuario_or_404(db, chamado_update.id_usuario)
    
    # Atualizar os campos fornecidos e registrar alterações no histórico
    update_data = chamado_update.dict(exclude_unset=True)
    
    try:
        status_was = db_chamado.status
        for key, value in update_data.items():
            old_value = getattr(db_chamado, key)
            if old_value != value:  # Só registra no histórico se o valor mudou
                registrar_historico(db, id_chamado, key, old_value, value)
                setattr(db_chamado, key, value)

        # Se status mudou para 'Concluído' e não era antes, registrar no Caixa
        if (
            'status' in update_data and
            update_data['status'] == 'Concluído' and
            status_was != 'Concluído'
        ):
            # Calcular valor total dos itens do chamado
            valor_total = calcular_valor_total_itens(db, id_chamado)
            data_fechamento = db_chamado.data_conclusao or datetime.now()
            caixa_entry = Caixa(
                descricao=f"Recebimento chamado #{id_chamado}",
                valor=valor_total,
                tipo='entrada',
                data_lancamento=data_fechamento.date(),
                mes=data_fechamento.month,
                ano=data_fechamento.year,
                fechado=False,
                id_usuario=db_chamado.id_usuario,
                data_criacao=datetime.now()
            )
            db.add(caixa_entry)

        db.commit()
        db.refresh(db_chamado)
        return db_chamado
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erro ao atualizar chamado. Verifique se os dados estão corretos."
        )

@router.delete("/{id_chamado}", status_code=status.HTTP_200_OK)
def delete_chamado(id_chamado: int, db: Session = Depends(get_db)):
    """
    Soft delete do chamado (apenas muda o status para 'Cancelado').
    """
    # Buscar o chamado pelo ID
    db_chamado = get_chamado_or_404(db, id_chamado)
    
    # Verificar se já está cancelado
    if db_chamado.status == "Cancelado":
        return {"message": f"Chamado {id_chamado} já está cancelado"}
    
    try:
        # Registrar alteração no histórico
        registrar_historico(db, id_chamado, "status", db_chamado.status, "Cancelado")
        
        # Atualizar status para "Cancelado"
        db_chamado.status = "Cancelado"
        
        db.commit()
        return {"message": f"Chamado {id_chamado} cancelado com sucesso"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erro ao cancelar chamado: {str(e)}"
        )

# Rotas para itens de chamado
@router.post("/{id_chamado}/itens", response_model=ItemChamadoSchema)
def create_item_chamado(
    id_chamado: int,
    item: ItemChamadoCreate,
    db: Session = Depends(get_db),
    current_user_role: str = Depends(get_current_user_role),
    current_user_id: int = Header(..., description="Current user ID")
):
    """
    Adiciona um novo item de custo a um chamado existente.
    - Administradores e gerentes podem adicionar itens a qualquer chamado
    - Funcionários só podem adicionar itens aos seus próprios chamados
    """
    # Verificar se o chamado existe
    db_chamado = get_chamado_or_404(db, id_chamado)
    
    # Verificar permissão de acesso
    if current_user_role == RoleEnum.FUNCIONARIO.value and db_chamado.id_usuario != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para adicionar itens a este chamado"
        )
    
    # Verificar se o chamado não está cancelado
    if db_chamado.status == "Cancelado":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível adicionar itens a um chamado cancelado"
        )
    
    try:
        # Criar o novo item
        db_item = ItemChamado(
            id_chamado=id_chamado,
            descricao=item.descricao,
            quantidade=item.quantidade,
            valor_unitario=item.valor_unitario
        )
        db.add(db_item)
        
        # Atualizar o valor total do chamado
        db.commit()
        db.refresh(db_item)
        
        # Recalcular valor total e atualizar chamado
        novo_valor = calcular_valor_total_itens(db, id_chamado)
        if db_chamado.valor != novo_valor:
            registrar_historico(db, id_chamado, "valor", db_chamado.valor, novo_valor)
            db_chamado.valor = novo_valor
            db.commit()
        
        return db_item
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erro ao adicionar item ao chamado"
        )

@router.get("/{id_chamado}/itens", response_model=List[ItemChamadoSchema])
def list_itens_chamado(
    id_chamado: int,
    db: Session = Depends(get_db),
    current_user_role: str = Depends(get_current_user_role),
    current_user_id: int = Header(..., description="Current user ID")
):
    """
    Lista todos os itens de custo de um chamado específico.
    - Administradores e gerentes podem ver itens de qualquer chamado
    - Funcionários só podem ver itens dos seus próprios chamados
    """
    # Verificar se o chamado existe
    db_chamado = get_chamado_or_404(db, id_chamado)
    
    # Verificar permissão de acesso
    if current_user_role == RoleEnum.FUNCIONARIO.value and db_chamado.id_usuario != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para ver itens deste chamado"
        )
    
    # Buscar os itens do chamado
    itens = db.query(ItemChamado).filter(ItemChamado.id_chamado == id_chamado).all()
    
    return itens

@router.put("/itens/{id_item_chamado}", response_model=ItemChamadoSchema)
def update_item_chamado(
    id_item_chamado: int,
    item_update: ItemChamadoUpdate,
    db: Session = Depends(get_db),
    current_user_role: str = Depends(get_current_user_role),
    current_user_id: int = Header(..., description="Current user ID")
):
    """
    Atualiza um item de custo específico.
    - Administradores e gerentes podem atualizar itens de qualquer chamado
    - Funcionários só podem atualizar itens dos seus próprios chamados
    """
    # Buscar o item pelo ID
    db_item = get_item_chamado_or_404(db, id_item_chamado)
    
    # Buscar o chamado associado
    db_chamado = get_chamado_or_404(db, db_item.id_chamado)
    
    # Verificar permissão de acesso
    if current_user_role == RoleEnum.FUNCIONARIO.value and db_chamado.id_usuario != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para atualizar itens deste chamado"
        )
    
    # Verificar se o chamado não está cancelado
    if db_chamado.status == "Cancelado":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível atualizar itens de um chamado cancelado"
        )
    
    try:
        # Atualizar apenas os campos fornecidos
        update_data = item_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_item, key, value)
        
        db.commit()
        db.refresh(db_item)
        
        # Recalcular valor total e atualizar chamado
        novo_valor = calcular_valor_total_itens(db, db_item.id_chamado)
        if db_chamado.valor != novo_valor:
            registrar_historico(db, db_item.id_chamado, "valor", db_chamado.valor, novo_valor)
            db_chamado.valor = novo_valor
            db.commit()
        
        return db_item
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erro ao atualizar item do chamado"
        )

@router.delete("/itens/{id_item_chamado}", status_code=status.HTTP_200_OK)
def delete_item_chamado(
    id_item_chamado: int,
    db: Session = Depends(get_db),
    current_user_role: str = Depends(get_current_user_role),
    current_user_id: int = Header(..., description="Current user ID")
):
    """
    Remove um item de custo de um chamado.
    - Administradores e gerentes podem remover itens de qualquer chamado
    - Funcionários só podem remover itens dos seus próprios chamados
    """
    # Buscar o item pelo ID
    db_item = get_item_chamado_or_404(db, id_item_chamado)
    
    # Buscar o chamado associado
    db_chamado = get_chamado_or_404(db, db_item.id_chamado)
    
    # Verificar permissão de acesso
    if current_user_role == RoleEnum.FUNCIONARIO.value and db_chamado.id_usuario != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para remover itens deste chamado"
        )
    
    # Verificar se o chamado não está cancelado
    if db_chamado.status == "Cancelado":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível remover itens de um chamado cancelado"
        )
    
    try:
        # Salvar o ID do chamado antes de excluir o item
        id_chamado = db_item.id_chamado
        
        # Excluir o item
        db.delete(db_item)
        db.commit()
        
        # Recalcular valor total e atualizar chamado
        novo_valor = calcular_valor_total_itens(db, id_chamado)
        if db_chamado.valor != novo_valor:
            registrar_historico(db, id_chamado, "valor", db_chamado.valor, novo_valor)
            db_chamado.valor = novo_valor
            db.commit()
        
        return {"message": f"Item {id_item_chamado} removido com sucesso"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erro ao remover item do chamado: {str(e)}"
        )

@router.get("/calendar/week", response_model=Dict[str, List[ChamadoSchema]])
def get_chamados_by_week(
    start_date: Optional[date] = Query(None, description="Data inicial da semana"),
    db: Session = Depends(get_db),
    current_user_role: str = Depends(get_current_user_role),
    current_user_id: int = Header(..., description="Current user ID")
):
    """
    Retorna os chamados agrupados por dia da semana.
    - Administradores e gerentes podem ver chamados de qualquer técnico
    - Funcionários só podem ver seus próprios chamados
    Se start_date não for fornecida, usa a data atual como início da semana.
    """
    if not start_date:
        # Se não fornecida, usa a data atual
        today = date.today()
        # Ajusta para o início da semana (segunda-feira)
        start_date = today - timedelta(days=today.weekday())
    
    # Calcula o fim da semana (domingo)
    end_date = start_date + timedelta(days=6)
    
    # Construir a query base
    query = db.query(Chamado).options(
        joinedload(Chamado.cliente),
        joinedload(Chamado.tecnico)
    ).filter(
        func.date(Chamado.data_abertura) >= start_date,
        func.date(Chamado.data_abertura) <= end_date
    )
    
    # Aplicar filtro baseado no papel do usuário
    if current_user_role == RoleEnum.FUNCIONARIO.value:
        query = query.filter(Chamado.id_usuario == current_user_id)
    
    # Busca os chamados da semana
    chamados = query.order_by(Chamado.data_abertura).all()
    
    # Agrupa os chamados por dia
    chamados_by_day = {}
    current_date = start_date
    while current_date <= end_date:
        chamados_by_day[current_date.isoformat()] = [
            chamado for chamado in chamados 
            if chamado.data_abertura.date() == current_date
        ]
        current_date += timedelta(days=1)
    
    return chamados_by_day

@router.get("/calendar/day", response_model=List[ChamadoSchema])
def get_chamados_by_day(
    date: Optional[date] = Query(None, description="Data específica para busca de chamados"),
    db: Session = Depends(get_db),
    current_user_role: str = Depends(get_current_user_role),
    current_user_id: int = Header(..., description="Current user ID")
):
    """
    Retorna os chamados para um dia específico.
    - Administradores e gerentes podem ver chamados de qualquer técnico
    - Funcionários só podem ver seus próprios chamados
    Se date não for fornecida, usa a data atual.
    """
    if not date:
        date = datetime.now().date()
    
    # Construir a query base
    query = db.query(Chamado).options(
        joinedload(Chamado.cliente),
        joinedload(Chamado.tecnico)
    ).filter(
        Chamado.data_prevista == date
    )
    
    # Aplicar filtro baseado no papel do usuário
    if current_user_role == RoleEnum.FUNCIONARIO.value:
        query = query.filter(Chamado.id_usuario == current_user_id)
    
    # Busca os chamados do dia
    chamados = query.order_by(Chamado.data_abertura).all()
    
    return chamados 