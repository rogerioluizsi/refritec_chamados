from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any, ForwardRef
from datetime import datetime, date

# Esquemas para Cliente
class ClienteBase(BaseModel):
    telefone: str = Field(..., min_length=8, max_length=20, example="11999887766")
    nome: str = Field(..., min_length=2, max_length=100, example="Maria Silva")
    endereco: Optional[str] = Field(None, example="Rua das Flores, 123 - São Paulo")

class ClienteCreate(ClienteBase):
    """Esquema para criação de cliente"""
    pass

class ClienteUpdate(BaseModel):
    """Esquema para atualização de cliente"""
    telefone: Optional[str] = Field(None, min_length=8, max_length=20, example="11999887766")
    nome: Optional[str] = Field(None, min_length=2, max_length=100, example="Maria Silva Atualizado")
    endereco: Optional[str] = Field(None, example="Av. Paulista, 1000 - São Paulo")

class Cliente(ClienteBase):
    """Esquema para respostas de cliente"""
    id_cliente: int
    
    class Config:
        orm_mode = True
        from_attributes = True

class ClienteDetail(Cliente):
    """Esquema detalhado de cliente com chamados"""
    class Config:
        orm_mode = True
        from_attributes = True

# Esquemas para paginação
class PaginatedResponse(BaseModel):
    """Esquema genérico para respostas paginadas"""
    total: int
    page: int
    per_page: int
    items: List

class ClientePaginated(PaginatedResponse):
    """Esquema para resposta paginada de clientes"""
    items: List[Cliente]

# Esquemas para Item de Chamado
class ItemChamadoBase(BaseModel):
    descricao: str = Field(..., min_length=2, example="Mangueira de Entrada de Água")
    quantidade: int = Field(1, ge=1, example=1)
    valor_unitario: float = Field(..., ge=0, example=45.0)

class ItemChamadoCreate(ItemChamadoBase):
    """Esquema para criação de item de chamado"""
    pass

class ItemChamadoUpdate(BaseModel):
    """Esquema para atualização de item de chamado"""
    descricao: Optional[str] = Field(None, min_length=2, example="Mangueira de Entrada de Água Nova")
    quantidade: Optional[int] = Field(None, ge=1, example=2)
    valor_unitario: Optional[float] = Field(None, ge=0, example=50.0)

class ItemChamado(ItemChamadoBase):
    """Esquema para respostas de item de chamado"""
    id_item_chamado: int
    id_chamado: int
    
    class Config:
        orm_mode = True
        from_attributes = True
        
    @property
    def valor_total(self) -> float:
        return self.quantidade * self.valor_unitario

# Create a forward reference for Usuario
UsuarioRef = ForwardRef('Usuario')

# Esquemas para Chamado
class ChamadoBase(BaseModel):
    id_cliente: int = Field(..., example=1)
    id_usuario: Optional[int] = Field(None, example=1, description="ID do técnico responsável")
    descricao: str = Field(..., min_length=5, example="Geladeira não gela")
    aparelho: str = Field(..., min_length=2, example="Geladeira Brastemp")
    status: str = Field("Aberto", example="Aberto")
    observacao: Optional[str] = Field(None, example="Cliente relata que a geladeira parou de gelar há 2 dias")
    data_prevista: Optional[date] = Field(None, example="2023-12-31")
    data_conclusao: Optional[datetime] = Field(None, example="2023-12-15T14:30:00")

class ChamadoCreate(ChamadoBase):
    """Esquema para criação de chamado"""
    pass

class ChamadoUpdate(BaseModel):
    """Esquema para atualização de chamado"""
    id_usuario: Optional[int] = Field(None, example=1, description="ID do técnico responsável")
    descricao: Optional[str] = Field(None, min_length=5, example="Geladeira não gela - atualizado")
    aparelho: Optional[str] = Field(None, min_length=2, example="Geladeira Brastemp Frost Free")
    status: Optional[str] = Field(None, example="Em Análise")
    valor: Optional[float] = Field(None, ge=0, example=150.0)
    observacao: Optional[str] = Field(None, example="Técnico identificou problema no compressor")
    data_prevista: Optional[date] = Field(None, example="2024-01-15")
    data_conclusao: Optional[datetime] = Field(None, example="2023-12-15T14:30:00")

class Chamado(ChamadoBase):
    """Esquema para respostas de chamado"""
    id_chamado: int
    valor: float
    data_abertura: datetime
    cliente: Optional[Cliente] = None
    tecnico: Optional[UsuarioRef] = None
    
    class Config:
        orm_mode = True
        from_attributes = True

class ChamadoDetail(Chamado):
    """Esquema detalhado de chamado com itens"""
    itens: List[ItemChamado] = []
    cliente: Optional[Cliente] = None
    tecnico: Optional[UsuarioRef] = None
    valor_total: Optional[float] = None
    
    class Config:
        orm_mode = True
        from_attributes = True

class ChamadoPaginated(PaginatedResponse):
    """Esquema para resposta paginada de chamados"""
    items: List[Chamado]

# Schemas de Usuário
class UsuarioBase(BaseModel):
    nome: str
    username: str

class UsuarioCreate(UsuarioBase):
    password: str
    
    class Config:
        # Map password to senha when going to ORM model
        orm_mode = True
        from_attributes = True
        alias_generator = lambda x: "senha" if x == "password" else x

class UsuarioLogin(BaseModel):
    username: str
    password: str

class Usuario(UsuarioBase):
    id_usuario: int
    
    class Config:
        orm_mode = True
        from_attributes = True

# Update forward references
Chamado.update_forward_refs()
ChamadoDetail.update_forward_refs() 