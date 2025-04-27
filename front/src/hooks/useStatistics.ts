import { useQuery } from '@tanstack/react-query';
import { api } from '../api/api';
import { ChamadoStats } from '../types';
import { QueryKeys } from '../api/queryKeys';
import { caixaApi } from '../api/chamadoApi';

interface ChamadoStatisticsResponse {
  total_open: number;
  total_in_progress: number;
  total_completed: number;
  total_canceled: number;
  total_value_open: number;
  valor_recebido_mes: number;
  chamados_by_client: Record<string, number>;
  total_clientes?: number;
}

interface ClienteStatisticsResponse {
  total_clientes: number;
}

// Fetch both chamado, cliente, and caixa statistics
const fetchChamadoStats = async (): Promise<ChamadoStats> => {
  try {
    const [chamadoResponse, clienteResponse, caixaSum] = await Promise.all([
      api.get<ChamadoStatisticsResponse>('/api/chamados/statistics'),
      api.get<ClienteStatisticsResponse>('/api/clientes/statistics'),
      caixaApi.getCaixaSum()
    ]);
    
    // Combine the responses
    return {
      total_open: chamadoResponse.data.total_open,
      total_in_progress: chamadoResponse.data.total_in_progress,
      total_completed: chamadoResponse.data.total_completed,
      total_canceled: chamadoResponse.data.total_canceled,
      total_value_open: chamadoResponse.data.total_value_open,
      valor_recebido_mes: chamadoResponse.data.valor_recebido_mes,
      chamados_by_client: chamadoResponse.data.chamados_by_client,
      total_clientes: clienteResponse.data.total_clientes,
      total_entrada: caixaSum.total_entrada,
      total_saida: caixaSum.total_saida,
      saldo: caixaSum.saldo,
    };
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error;
  }
};

/**
 * Custom hook to fetch and cache chamado statistics
 */
export const useStatistics = () => {
  return useQuery({
    queryKey: QueryKeys.CHAMADO_STATS,
    queryFn: fetchChamadoStats,
  });
};

export default useStatistics; 