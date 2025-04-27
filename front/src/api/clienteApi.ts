import { api } from './api';
import { Cliente, CreateClienteDto, PaginatedResponse } from '../types';

export const clienteApi = {
  createCliente: async (cliente: CreateClienteDto): Promise<Cliente> => {
    const response = await api.post<Cliente>('/api/clientes/', cliente);
    return response.data;
  },

  getClienteById: async (id: number): Promise<Cliente> => {
    const response = await api.get<Cliente>(`/api/clientes/${id}`);
    return response.data;
  },

  getClienteByTelefone: async (telefone: string): Promise<Cliente> => {
    const response = await api.get<Cliente>(`/api/clientes/telefone/${telefone}`);
    return response.data;
  },

  listClientes: async (
    page: number = 1,
    per_page: number = 10,
    search?: string,
    nome?: string,
    telefone?: string
  ): Promise<PaginatedResponse<Cliente>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', per_page.toString());
    if (search) params.append('search', search);
    if (nome) params.append('nome', nome);
    if (telefone) params.append('telefone', telefone);

    const response = await api.get<PaginatedResponse<Cliente>>('/api/clientes', { params });
    return response.data;
  },

  updateCliente: async (id: number, data: { nome?: string; endereco?: string }): Promise<Cliente> => {
    const response = await api.put<Cliente>(`/api/clientes/${id}`, data);
    return response.data;
  },
}; 