# Sistema de Gestão de Chamados (Service Call Management System)

Um sistema simples para gerenciar chamados de serviços técnicos para eletrodomésticos.

## Estrutura do Banco de Dados

O sistema utiliza SQLite com as seguintes tabelas:

- **Cliente**: Armazena informações dos clientes
- **Chamados**: Registra os chamados de serviço
- **Itens_Chamado**: Lista de itens/serviços em cada chamado
- **Historico_Alteracao_Chamados**: Registra mudanças nos chamados

## Arquivos do Projeto

- `schema.sql` - Define a estrutura do banco de dados
- `init_db.py` - Script para inicializar o banco e inserir dados de exemplo
- `query_db.py` - Exemplos de consultas no banco de dados
- `requirements.txt` - Dependências do Python

## Como Usar

1. Instale as dependências:

```bash
pip install -r requirements.txt
```

2. Inicialize o banco de dados com dados de exemplo:

```bash
python init_db.py
```

3. Execute o script de consultas para ver exemplos de uso:

```bash
python query_db.py
```

## Características

- Registro de clientes com telefone como identificador principal
- Gestão de chamados de serviço para aparelhos eletrodomésticos
- Acompanhamento de status (Aberto, Em Análise, Aguardando Peças, etc.)
- Registro de itens e valores de cada serviço
- Histórico de alterações em chamados
- Cálculo automático de valores totais baseado nos itens 