import uvicorn

if __name__ == "__main__":
    # Run the application with Uvicorn with hot reloading enabled
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=False  
    ) 