from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Numeric, Date, Boolean, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from .database import Base

class RoleEnum(str, enum.Enum):
    ADMINISTRADOR = "administrador"
    GERENTE = "gerente"
    FUNCIONARIO = "funcionario"

class Usuario(Base):
    """Modelo para a tabela de Usuários"""
    __tablename__ = "Usuario"
    
    id_usuario = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nome = Column(String(100), nullable=False)
    username = Column(String(50), unique=True, nullable=False, index=True)
    senha = Column(String(100), nullable=False)
    role = Column(String(20), nullable=False, default=RoleEnum.FUNCIONARIO)
    data_criacao = Column(DateTime, default=func.now())
    ativo = Column(Boolean, default=True)
    
    # Add relationship to chamados
    chamados = relationship("Chamado", back_populates="tecnico")
    
    def __repr__(self):
        return f"<Usuario(id={self.id_usuario}, nome={self.nome}, username={self.username}, role={self.role})>"

class Cliente(Base):
    """Modelo para a tabela Cliente"""
    __tablename__ = "Cliente"
    
    id_cliente = Column(Integer, primary_key=True, index=True, autoincrement=True)
    telefone = Column(String(20), unique=True, nullable=False, index=True)
    nome = Column(String(100), nullable=False)
    endereco = Column(Text)
    
    # Relacionamento com chamados
    chamados = relationship("Chamado", back_populates="cliente", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Cliente(id={self.id_cliente}, nome={self.nome}, telefone={self.telefone})>"

class Chamado(Base):
    """Modelo para a tabela Chamados"""
    __tablename__ = "Chamados"
    
    id_chamado = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_cliente = Column(Integer, ForeignKey("Cliente.id_cliente"), nullable=False)
    id_usuario = Column(Integer, ForeignKey("Usuario.id_usuario"), nullable=True)
    descricao = Column(Text, nullable=False)
    aparelho = Column(String(100), nullable=False)
    status = Column(String(50), nullable=False, default="Aberto")
    valor = Column(Numeric(10, 2), default=0.00)
    observacao = Column(Text)
    data_abertura = Column(DateTime, default=func.now())
    data_prevista = Column(Date)
    data_conclusao = Column(DateTime, nullable=True)
    
    # Relacionamentos
    cliente = relationship("Cliente", back_populates="chamados")
    tecnico = relationship("Usuario", back_populates="chamados")
    itens = relationship("ItemChamado", back_populates="chamado", cascade="all, delete-orphan")
    historico = relationship("HistoricoAlteracaoChamado", back_populates="chamado", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Chamado(id={self.id_chamado}, cliente_id={self.id_cliente}, tecnico_id={self.id_usuario}, status={self.status})>"

class ItemChamado(Base):
    """Modelo para a tabela Itens_Chamado"""
    __tablename__ = "Itens_Chamado"
    
    id_item_chamado = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_chamado = Column(Integer, ForeignKey("Chamados.id_chamado"), nullable=False)
    descricao = Column(Text, nullable=False)
    quantidade = Column(Integer, default=1)
    valor_unitario = Column(Numeric(10, 2), nullable=False)
    
    # Relacionamento
    chamado = relationship("Chamado", back_populates="itens")
    
    def __repr__(self):
        return f"<ItemChamado(id={self.id_item_chamado}, chamado_id={self.id_chamado}, descr={self.descricao})>"

class HistoricoAlteracaoChamado(Base):
    """Modelo para a tabela Historico_Alteracao_Chamados"""
    __tablename__ = "Historico_Alteracao_Chamados"
    
    id_historico = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_chamado = Column(Integer, ForeignKey("Chamados.id_chamado"), nullable=False)
    campo_alterado = Column(String(50), nullable=False)
    valor_antigo = Column(Text)
    valor_novo = Column(Text)
    data_alteracao = Column(DateTime, default=func.now())
    id_funcionario = Column(Integer)
    
    # Relacionamento
    chamado = relationship("Chamado", back_populates="historico")
    
    def __repr__(self):
        return f"<HistoricoAlteracao(id={self.id_historico}, chamado_id={self.id_chamado}, campo={self.campo_alterado})>" 