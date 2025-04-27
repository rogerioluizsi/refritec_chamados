#!/usr/bin/env python3
"""
Script to test the multi-user scenario in the Refritec application.
"""

import sys
import os
import requests
from datetime import datetime, date
import json
from dotenv import load_dotenv

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load environment variables from .env file
load_dotenv()

# API configuration
API_BASE_URL = "http://localhost:8000/api"
API_KEY = os.getenv("API_KEY")

if not API_KEY:
    print("Error: API_KEY not found in .env file")
    sys.exit(1)

def make_request(method, endpoint, headers, data=None):
    """Make an API request and return the response"""
    url = f"{API_BASE_URL}/{endpoint}"
    response = requests.request(method, url, headers=headers, json=data)
    return response

def test_user_scenario(username, password, role, user_id):
    """Test API endpoints for a specific user role"""
    print(f"\nTesting scenario for user: {username} (Role: {role})")
    
    # Headers for API requests
    headers = {
        "X-API-Key": API_KEY,
        "X-User-Role": role,
        "X-User-ID": str(user_id),
        "current-user-id": str(user_id)
    }
    
    # Test 1: List all chamados
    print("\nTest 1: List all chamados")
    response = make_request("GET", "chamados", headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Total chamados: {data['total']}")
        print("First few chamados:")
        for chamado in data['items'][:3]:
            # Print available fields for debugging
            print(f"Available fields: {list(chamado.keys())}")
            # Use get() to safely access fields that might not exist
            print(f"- {chamado.get('descricao', 'N/A')} (ID: {chamado.get('id_chamado', 'N/A')}, Técnico: {chamado.get('id_usuario', 'N/A')})")
    else:
        print(f"Error: {response.text}")
    
    # Test 2: Get chamados by tecnico
    print("\nTest 2: Get chamados by tecnico")
    response = make_request("GET", f"chamados/tecnico/{user_id}", headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Total chamados for tecnico: {len(data)}")
        for chamado in data[:3]:
            # Print available fields for debugging
            print(f"Available fields: {list(chamado.keys())}")
            print(f"- {chamado.get('descricao', 'N/A')} (ID: {chamado.get('id_chamado', 'N/A')})")
    else:
        print(f"Error: {response.text}")
    
    # Test 3: Get chamado details
    print("\nTest 3: Get chamado details")
    response = make_request("GET", "chamados/1", headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Chamado details:")
        print(f"- ID: {data.get('id_chamado', 'N/A')}")
        print(f"- Descrição: {data.get('descricao', 'N/A')}")
        print(f"- Técnico: {data.get('id_usuario', 'N/A')}")
        print(f"- Status: {data.get('status', 'N/A')}")
        print(f"- Itens: {len(data.get('itens', []))}")
    else:
        print(f"Error: {response.text}")
    
    # Test 4: Update chamado
    print("\nTest 4: Update chamado")
    update_data = {
        "status": "Em Andamento",
        "observacao": "Teste de atualização"
    }
    response = make_request("PUT", "chamados/1", headers, update_data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Chamado updated:")
        print(f"- ID: {data.get('id_chamado', 'N/A')}")
        print(f"- Status: {data.get('status', 'N/A')}")
        print(f"- Observação: {data.get('observacao', 'N/A')}")
    else:
        print(f"Error: {response.text}")
    
    # Test 5: Add item to chamado
    print("\nTest 5: Add item to chamado")
    item_data = {
        "descricao": "Teste de item",
        "quantidade": 1,
        "valor_unitario": 50.00
    }
    response = make_request("POST", "chamados/1/itens", headers, item_data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Item added:")
        print(f"- ID: {data.get('id_item_chamado', 'N/A')}")
        print(f"- Descrição: {data.get('descricao', 'N/A')}")
        print(f"- Valor: {data.get('valor_unitario', 'N/A')}")
    else:
        print(f"Error: {response.text}")

def main():
    """Main function to test different user scenarios"""
    # Test scenarios for different user roles
    scenarios = [
        {
            "username": "admin",
            "password": "admin123",
            "role": "administrador",
            "user_id": 1
        },
        {
            "username": "gerente",
            "password": "gerente123",
            "role": "gerente",
            "user_id": 2
        },
        {
            "username": "tecnico1",
            "password": "tecnico123",
            "role": "funcionario",
            "user_id": 3
        }
    ]
    
    for scenario in scenarios:
        test_user_scenario(
            scenario["username"],
            scenario["password"],
            scenario["role"],
            scenario["user_id"]
        )

if __name__ == "__main__":
    main() 