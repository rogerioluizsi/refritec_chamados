import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clienteApi } from '../api/clienteApi';
import { Cliente, CreateClienteDto } from '../types';

export const useClientes = () => {
  const queryClient = useQueryClient();

  // Query hooks
  const useListClientes = (page = 1, perPage = 10, search?: string, nome?: string, telefone?: string) => {
    return useQuery({
      queryKey: ['clientes', { page, perPage, search, nome, telefone }],
      queryFn: () => clienteApi.listClientes(page, perPage, search, nome, telefone),
    });
  };

  const useClienteDetails = (id: number) => {
    return useQuery({
      queryKey: ['cliente', id],
      queryFn: () => clienteApi.getClienteById(id),
      enabled: !!id,
    });
  };

  const useClienteByTelefone = (telefone: string) => {
    return useQuery({
      queryKey: ['clienteTelefone', telefone],
      queryFn: () => clienteApi.getClienteByTelefone(telefone),
      enabled: !!telefone && telefone.length > 3, // Only run query if telefone is meaningful
    });
  };

  // Mutation hooks
  const useCreateCliente = () => {
    return useMutation({
      mutationFn: (data: CreateClienteDto) => clienteApi.createCliente(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['clientes'] });
      },
    });
  };

  const useUpdateCliente = (id: number) => {
    return useMutation({
      mutationFn: (data: { nome?: string; endereco?: string }) => clienteApi.updateCliente(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['clientes'] });
        queryClient.invalidateQueries({ queryKey: ['cliente', id] });
      },
    });
  };

  return {
    useListClientes,
    useClienteDetails,
    useClienteByTelefone,
    useCreateCliente,
    useUpdateCliente,
  };
}; 