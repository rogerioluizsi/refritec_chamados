import uvicorn

if __name__ == "__main__":
    # Executa a aplicação usando Uvicorn com configurações padrão
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=False
    ) 