-- SQLite schema for service call tracking application

-- Cliente (Client) table
CREATE TABLE Cliente (
    id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
    telefone VARCHAR(20) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    endereco TEXT
);

-- Chamados (Service Calls) table
CREATE TABLE Chamados (
    id_chamado INTEGER PRIMARY KEY AUTOINCREMENT,
    id_cliente INTEGER NOT NULL,
    descricao TEXT NOT NULL,
    aparelho VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Aberto',
    valor DECIMAL(10,2) DEFAULT 0.00,
    observacao TEXT,
    data_abertura DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_prevista DATE,
    data_conclusao DATETIME,
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente)
);

-- Historico_Alteracao_Chamados (Service Call Change History) table
CREATE TABLE Historico_Alteracao_Chamados (
    id_historico INTEGER PRIMARY KEY AUTOINCREMENT,
    id_chamado INTEGER NOT NULL,
    campo_alterado VARCHAR(50) NOT NULL,
    valor_antigo TEXT,
    valor_novo TEXT,
    data_alteracao DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_funcionario INTEGER,
    FOREIGN KEY (id_chamado) REFERENCES Chamados(id_chamado)
);

-- Itens_Chamado (Service Call Items) table
CREATE TABLE Itens_Chamado (
    id_item_chamado INTEGER PRIMARY KEY AUTOINCREMENT,
    id_chamado INTEGER NOT NULL,
    descricao TEXT NOT NULL,
    quantidade INTEGER DEFAULT 1,
    valor_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_chamado) REFERENCES Chamados(id_chamado)
);

-- Create indexes for better performance
CREATE INDEX idx_chamados_cliente ON Chamados(id_cliente);
CREATE INDEX idx_historico_chamado ON Historico_Alteracao_Chamados(id_chamado);
CREATE INDEX idx_itens_chamado ON Itens_Chamado(id_chamado);

-- Create a view to calculate total value of service calls based on items
CREATE VIEW Chamados_Valor_Total AS
SELECT 
    c.id_chamado,
    c.id_cliente,
    c.descricao,
    c.status,
    c.data_abertura,
    c.data_prevista,
    COALESCE(SUM(i.quantidade * i.valor_unitario), 0) AS valor_total
FROM 
    Chamados c
LEFT JOIN 
    Itens_Chamado i ON c.id_chamado = i.id_chamado
GROUP BY 
    c.id_chamado; 