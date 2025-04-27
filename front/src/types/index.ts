// Cliente types
export interface Cliente {
  id_cliente: number;
  telefone: string;
  nome: string;
  endereco: string;
}

export interface CreateClienteDto {
  telefone: string;
  nome: string;
  endereco: string;
}

// Chamado types
export interface Chamado {
  id_chamado: number;
  id_cliente: number;
  id_usuario?: number;
  descricao: string;
  aparelho: string;
  status: ChamadoStatus;
  observacao: string;
  data_abertura: string;
  data_prevista: string;
  cliente?: Cliente;
}

export type ChamadoStatus = 'Aberto' | 'Em Andamento' | 'Concluído' | 'Cancelado';

export interface CreateChamadoDto {
  id_cliente: number;
  id_usuario?: number;
  descricao: string;
  aparelho: string;
  status: ChamadoStatus;
  valor: number;
  observacao?: string;
  data_prevista?: Date | null;
}

export interface UpdateChamadoDto {
  id_usuario?: number;
  status?: ChamadoStatus;
  observacao?: string;
  data_prevista?: string;
}

// Item Chamado types
export interface ItemChamado {
  id_item_chamado: number;
  id_chamado: number;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
}

export interface CreateItemChamadoDto {
  descricao: string;
  quantidade: number;
  valor_unitario: number;
}

export interface UpdateItemChamadoDto {
  descricao?: string;
  quantidade?: number;
  valor_unitario?: number;
}

// Pagination types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Dashboard/Stats types
export interface ChamadoStats {
  total_open: number;
  total_in_progress: number;
  total_completed: number;
  total_canceled: number;
  total_value_open: number;
  valor_recebido_mes: number;
  total_clientes: number;
  chamados_by_client: { [key: string]: number };
}

// User types
export interface User {
  id_usuario: number;
  username: string;
  nome: string;
  role: string;
  data_criacao: string;
  ativo: boolean;
} 