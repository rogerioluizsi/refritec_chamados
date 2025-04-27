import { api } from './api';
import {
  Chamado,
  CreateChamadoDto,
  UpdateChamadoDto,
  PaginatedResponse,
  ChamadoStatus,
  ItemChamado,
  CreateItemChamadoDto,
  UpdateItemChamadoDto,
  User,
} from '../types';

export const chamadoApi = {
  createChamado: async (chamado: CreateChamadoDto): Promise<Chamado> => {
    const response = await api.post<Chamado>('/api/chamados/', chamado);
    return response.data;
  },

  getChamadoById: async (id: number): Promise<Chamado> => {
    const response = await api.get<Chamado>(`/api/chamados/${id}`);
    return response.data;
  },

  getClienteChamados: async (clienteId: number, page: number = 1, per_page: number = 10): Promise<PaginatedResponse<Chamado>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', per_page.toString());
    
    const response = await api.get<PaginatedResponse<Chamado>>(`/api/chamados/cliente/${clienteId}`, { params });
    return response.data;
  },

  listChamados: async (
    page: number = 1,
    per_page: number = 10,
    status?: ChamadoStatus,
    clienteId?: number,
    tecnicoId?: number
  ): Promise<PaginatedResponse<Chamado>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', per_page.toString());
    if (status) params.append('status', status);
    if (clienteId) params.append('id_cliente', clienteId.toString());
    if (tecnicoId) params.append('id_usuario', tecnicoId.toString());

    const response = await api.get<PaginatedResponse<Chamado>>('/api/chamados', { params });
    return response.data;
  },

  updateChamado: async (id: number, data: UpdateChamadoDto): Promise<Chamado> => {
    const response = await api.put<Chamado>(`/api/chamados/${id}`, data);
    return response.data;
  },

  // Item Chamado methods
  addItemToChamado: async (chamadoId: number, item: CreateItemChamadoDto): Promise<ItemChamado> => {
    const response = await api.post<ItemChamado>(`/api/chamados/${chamadoId}/itens`, item);
    return response.data;
  },

  getChamadoItems: async (chamadoId: number): Promise<ItemChamado[]> => {
    const response = await api.get<ItemChamado[]>(`/api/chamados/${chamadoId}/itens`);
    return response.data;
  },

  updateChamadoItem: async (itemId: number, data: UpdateItemChamadoDto): Promise<ItemChamado> => {
    const response = await api.put<ItemChamado>(`/api/chamados/itens/${itemId}`, data);
    return response.data;
  },

  deleteChamadoItem: async (itemId: number): Promise<void> => {
    await api.delete(`/api/chamados/itens/${itemId}`);
  },

  getChamadosByDay: async (date: string): Promise<Chamado[]> => {
    const response = await api.get<Chamado[]>(`/api/chamados/calendar/day?date=${date}`);
    return response.data;
  },

  getUsers: async (): Promise<User[]> => {
    const response = await api.get<{ users: User[] }>(`/users`);
    return response.data.users;
  },
};

export const caixaApi = {
  getCaixaSum: async (mes?: number, ano?: number): Promise<{ total_entrada: number; total_saida: number; saldo: number }> => {
    const params = new URLSearchParams();
    if (mes) params.append('mes', mes.toString());
    if (ano) params.append('ano', ano.toString());
    const response = await api.get('/api/caixa/sum', { params });
    return response.data;
  },
}; 