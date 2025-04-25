from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import cliente_routes, chamado_routes, auth_routes
from .database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

# Create admin user using direct SQL
auth_routes.create_admin_user()

# Initialize FastAPI app
app = FastAPI(
    title="API de Chamados Técnicos",
    description="API para sistema de gestão de chamados técnicos",
    version="1.0.0"
)

# Allow all origins for simplicity in development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Include routers
app.include_router(cliente_routes.router)
app.include_router(chamado_routes.router)
app.include_router(auth_routes.router)

# Root route
@app.get("/")
async def root():
    return {
        "message": "API de Chamados Técnicos",
        "docs": "/docs"
    } 