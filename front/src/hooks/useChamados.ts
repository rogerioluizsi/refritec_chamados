import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chamadoApi } from '../api/chamadoApi';
import {
  Chamado,
  CreateChamadoDto,
  UpdateChamadoDto,
  ChamadoStatus,
  ItemChamado,
  CreateItemChamadoDto,
  UpdateItemChamadoDto,
} from '../types';

export const useChamados = () => {
  const queryClient = useQueryClient();

  // Query hooks
  const useListChamados = (page = 1, perPage = 10, status?: ChamadoStatus, clienteId?: number, tecnicoId?: number) => {
    return useQuery({
      queryKey: ['chamados', { page, perPage, status, clienteId, tecnicoId }],
      queryFn: () => chamadoApi.listChamados(page, perPage, status, clienteId, tecnicoId),
    });
  };

  const useUsers = () => {
    return useQuery({
      queryKey: ['users'],
      queryFn: () => chamadoApi.getUsers(),
    });
  };

  const useChamadoDetails = (id: number) => {
    return useQuery({
      queryKey: ['chamado', id],
      queryFn: () => chamadoApi.getChamadoById(id),
      enabled: !!id,
    });
  };

  const useChamadoItems = (chamadoId: number) => {
    return useQuery({
      queryKey: ['chamadoItems', chamadoId],
      queryFn: () => chamadoApi.getChamadoItems(chamadoId),
      enabled: !!chamadoId,
    });
  };

  const useClienteChamados = (clienteId: number, page = 1, perPage = 10) => {
    return useQuery({
      queryKey: ['clienteChamados', clienteId, { page, perPage }],
      queryFn: () => chamadoApi.getClienteChamados(clienteId, page, perPage),
      enabled: !!clienteId,
    });
  };

  // Mutation hooks
  const useCreateChamado = () => {
    return useMutation({
      mutationFn: (data: CreateChamadoDto) => chamadoApi.createChamado(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['chamados'] });
      },
    });
  };

  const useUpdateChamado = (id: number) => {
    return useMutation({
      mutationFn: (data: UpdateChamadoDto) => chamadoApi.updateChamado(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['chamados'] });
        queryClient.invalidateQueries({ queryKey: ['chamado', id] });
      },
    });
  };

  const useAddItemToChamado = (chamadoId: number) => {
    return useMutation({
      mutationFn: (data: CreateItemChamadoDto) => chamadoApi.addItemToChamado(chamadoId, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['chamadoItems', chamadoId] });
        queryClient.invalidateQueries({ queryKey: ['chamado', chamadoId] });
      },
    });
  };

  const useUpdateChamadoItem = (chamadoId: number) => {
    return useMutation({
      mutationFn: ({ itemId, data }: { itemId: number; data: UpdateItemChamadoDto }) =>
        chamadoApi.updateChamadoItem(itemId, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['chamadoItems', chamadoId] });
      },
    });
  };

  const useDeleteChamadoItem = (chamadoId: number) => {
    return useMutation({
      mutationFn: (itemId: number) => chamadoApi.deleteChamadoItem(itemId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['chamadoItems', chamadoId] });
      },
    });
  };

  return {
    useListChamados,
    useChamadoDetails,
    useChamadoItems,
    useClienteChamados,
    useCreateChamado,
    useUpdateChamado,
    useAddItemToChamado,
    useUpdateChamadoItem,
    useDeleteChamadoItem,
    useUsers,
  };
}; 