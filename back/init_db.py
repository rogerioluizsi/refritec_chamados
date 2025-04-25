import sqlite3
import os
from datetime import datetime, timedelta

# Database file name
DB_FILE = 'chamados.db'

# Remove existing database if it exists
if os.path.exists(DB_FILE):
    os.remove(DB_FILE)

# Connect to database (will create it if it doesn't exist)
conn = sqlite3.connect(DB_FILE)
cursor = conn.cursor()

# Read and execute the schema SQL file
with open('schema.sql', 'r') as schema_file:
    schema_sql = schema_file.read()
    cursor.executescript(schema_sql)

# Insert sample data
# Sample clients
clients = [
    ('11999887766', 'Maria Silva', 'Rua das Flores, 123 - São Paulo'),
    ('11988776655', 'João Santos', 'Av. Paulista, 1000 - São Paulo'),
    ('11977665544', 'Ana Oliveira', 'Rua Augusta, 500 - São Paulo'),
]

cursor.executemany(
    'INSERT INTO Cliente (telefone, nome, endereco) VALUES (?, ?, ?)',
    clients
)

# Get client IDs for reference
cursor.execute('SELECT id_cliente FROM Cliente')
client_ids = [row[0] for row in cursor.fetchall()]

# Sample service calls
today = datetime.now()
calls = [
    (client_ids[0], 'Geladeira não gela', 'Geladeira Brastemp', 'Aberto', 0.0, 
     'Cliente relata que a geladeira parou de gelar há 2 dias', 
     today.strftime('%Y-%m-%d %H:%M:%S'), 
     (today + timedelta(days=2)).strftime('%Y-%m-%d'),
     None),
    
    (client_ids[1], 'Máquina de lavar vaza água', 'Máquina de Lavar Electrolux', 'Em Análise', 120.0, 
     'Técnico fez primeira visita e identificou problema na mangueira', 
     (today - timedelta(days=5)).strftime('%Y-%m-%d %H:%M:%S'), 
     (today + timedelta(days=1)).strftime('%Y-%m-%d'),
     None),
    
    (client_ids[2], 'Forno microondas não esquenta', 'Microondas Panasonic', 'Concluído', 80.0, 
     'Necessário trocar placa eletrônica', 
     (today - timedelta(days=10)).strftime('%Y-%m-%d %H:%M:%S'), 
     (today + timedelta(days=7)).strftime('%Y-%m-%d'),
     (today - timedelta(days=2)).strftime('%Y-%m-%d %H:%M:%S')),
]

cursor.executemany(
    '''INSERT INTO Chamados 
       (id_cliente, descricao, aparelho, status, valor, observacao, data_abertura, data_prevista, data_conclusao) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
    calls
)

# Get service call IDs for reference
cursor.execute('SELECT id_chamado FROM Chamados')
call_ids = [row[0] for row in cursor.fetchall()]

# Sample service call items
items = [
    (call_ids[0], 'Visita Técnica', 1, 80.0),
    (call_ids[1], 'Mangueira de Entrada de Água', 1, 45.0),
    (call_ids[1], 'Mão de Obra', 1, 75.0),
    (call_ids[2], 'Placa Eletrônica', 1, 150.0),
    (call_ids[2], 'Mão de Obra', 1, 80.0),
]

cursor.executemany(
    'INSERT INTO Itens_Chamado (id_chamado, descricao, quantidade, valor_unitario) VALUES (?, ?, ?, ?)',
    items
)

# Sample history records
history = [
    (call_ids[1], 'status', 'Aberto', 'Em Análise', 
     (today - timedelta(days=3)).strftime('%Y-%m-%d %H:%M:%S'), 1),
    (call_ids[2], 'status', 'Aberto', 'Em Análise', 
     (today - timedelta(days=9)).strftime('%Y-%m-%d %H:%M:%S'), 1),
    (call_ids[2], 'status', 'Em Análise', 'Aguardando Peças', 
     (today - timedelta(days=7)).strftime('%Y-%m-%d %H:%M:%S'), 1),
]

cursor.executemany(
    '''INSERT INTO Historico_Alteracao_Chamados 
       (id_chamado, campo_alterado, valor_antigo, valor_novo, data_alteracao, id_funcionario) 
       VALUES (?, ?, ?, ?, ?, ?)''',
    history
)

# Commit and close
conn.commit()
conn.close()

print("Database initialized with sample data!")
print(f"Database file: {os.path.abspath(DB_FILE)}") 