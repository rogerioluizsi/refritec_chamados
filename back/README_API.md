# RefriTec API - Simplified Documentation

## Running the API
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Cliente Endpoints

### Create a Client
```
POST /api/clientes/
```
```json
{
  "telefone": "11987654321",
  "nome": "Client Name",
  "endereco": "Client Address"
}
```

### Get Client by ID
```
GET /api/clientes/{id_cliente}
```

### Get Client by Telephone
```
GET /api/clientes/telefone/{numero_telefone}
```

### List Clients
```
GET /api/clientes?page=1&per_page=10&nome=search&telefone=search
```

### Update Client
```
PUT /api/clientes/{id_cliente}
```
```json
{
  "nome": "Updated Name",
  "endereco": "Updated Address"
}
```

## Chamado Endpoints (Service Calls)

### Create a Service Call
```
POST /api/chamados/
```
```json
{
  "id_cliente": 1,
  "descricao": "Service description",
  "aparelho": "Device type",
  "status": "Aberto",
  "observacao": "Additional notes"
}
```

### Get Service Call Details
```
GET /api/chamados/{id_chamado}
```

### Get Client's Service Calls
```
GET /api/chamados/cliente/{id_cliente}
```

### List Service Calls with Filters
```
GET /api/chamados?page=1&per_page=10&status=Aberto&id_cliente=1
```

### Update Service Call
```
PUT /api/chamados/{id_chamado}
```
```json
{
  "status": "Em Andamento",
  "observacao": "Updated notes"
}
```

## Item Endpoints (Service Call Items)

### Add Item to Service Call
```
POST /api/chamados/{id_chamado}/itens
```
```json
{
  "descricao": "Item description",
  "quantidade": 1,
  "valor_unitario": 50.00
}
```

### Get Items for Service Call
```
GET /api/chamados/{id_chamado}/itens
```

### Update Service Call Item
```
PUT /api/chamados/itens/{id_item_chamado}
```
```json
{
  "descricao": "Updated description",
  "valor_unitario": 75.00
}
```

## Testing the API

You can test the API using the scripts we created:

1. Basic endpoint testing:
```bash
./test_api.sh
```

2. Testing updates and details:
```bash
./test_api_more.sh
```

3. Testing pagination and filtering:
```bash
./test_filters.sh
```

4. Open API documentation in browser:
```bash
./test_api_docs.sh
``` 