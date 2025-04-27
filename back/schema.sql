-- SQLite schema for service call tracking application

-- Cliente (Client) table
CREATE TABLE Cliente (
    id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
    telefone VARCHAR(20) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    endereco TEXT
);

-- Chamado (Service Call) table
CREATE TABLE Chamado (
    id_chamado INTEGER PRIMARY KEY AUTOINCREMENT,
    id_cliente INTEGER NOT NULL,
    id_usuario INTEGER,
    descricao TEXT NOT NULL,
    aparelho VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Aberto',
    valor DECIMAL(10,2) DEFAULT 0.00,
    observacao TEXT,
    data_abertura DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_prevista DATE,
    data_conclusao DATETIME,
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

-- HistoricoAlteracaoChamado (Service Call Change History) table
CREATE TABLE HistoricoAlteracaoChamado (
    id_historico INTEGER PRIMARY KEY AUTOINCREMENT,
    id_chamado INTEGER NOT NULL,
    campo_alterado VARCHAR(50) NOT NULL,
    valor_antigo TEXT,
    valor_novo TEXT,
    data_alteracao DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_funcionario INTEGER,
    FOREIGN KEY (id_chamado) REFERENCES Chamado(id_chamado)
);

-- ItemChamado (Service Call Item) table
CREATE TABLE ItemChamado (
    id_item_chamado INTEGER PRIMARY KEY AUTOINCREMENT,
    id_chamado INTEGER NOT NULL,
    descricao TEXT NOT NULL,
    quantidade INTEGER DEFAULT 1,
    valor_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_chamado) REFERENCES Chamado(id_chamado)
);

-- Usuario (User) table
CREATE TABLE Usuario (
    id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    senha VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'funcionario',
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT 1,
    CHECK (role IN ('administrador', 'gerente', 'funcionario'))
);

-- Create indexes for better performance
CREATE INDEX idx_chamado_cliente ON Chamado(id_cliente);
CREATE INDEX idx_chamado_usuario ON Chamado(id_usuario);
CREATE INDEX idx_historico_chamado ON HistoricoAlteracaoChamado(id_chamado);
CREATE INDEX idx_item_chamado ON ItemChamado(id_chamado);
CREATE INDEX idx_usuario_username ON Usuario(username);

-- Create a view to calculate total value of service calls based on items
CREATE VIEW ChamadoValorTotal AS
SELECT 
    c.id_chamado,
    c.id_cliente,
    c.id_usuario,
    c.descricao,
    c.status,
    c.data_abertura,
    c.data_prevista,
    COALESCE(SUM(i.quantidade * i.valor_unitario), 0) AS valor_total
FROM 
    Chamado c
LEFT JOIN 
    ItemChamado i ON c.id_chamado = i.id_chamado
GROUP BY 
    c.id_chamado; 