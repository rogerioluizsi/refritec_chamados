import React, { useState, useMemo } from 'react';
import { Box, Pagination, Typography, CircularProgress, Alert } from '@mui/material';
import { useChamados } from '../../hooks/useChamados';
import ChamadoCard from './ChamadoCard';
import { Chamado, ChamadoStatus } from '../../types';

interface ChamadoListProps {
  status?: ChamadoStatus;
  clienteId?: number;
  searchTerm?: string;
}

const ChamadoList: React.FC<ChamadoListProps> = ({ status = 'Aberto', clienteId, searchTerm = '' }) => {
  const [page, setPage] = useState(1);
  const { useListChamados } = useChamados();
  const { data, isLoading, error } = useListChamados(page, 10, status, clienteId);

  const filteredChamados = useMemo(() => {
    if (!data?.items) return [];
    if (!searchTerm) return data.items;

    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    return data.items.filter((chamado: Chamado) => {
      const clienteName = chamado.cliente?.nome?.toLowerCase() || '';
      const clienteTelefone = chamado.cliente?.telefone?.toLowerCase() || '';
      const aparelho = chamado.aparelho?.toLowerCase() || '';
      const descricao = chamado.descricao?.toLowerCase() || '';
      const id = chamado.id_chamado.toString();

      return (
        clienteName.includes(lowerCaseSearchTerm) ||
        clienteTelefone.includes(lowerCaseSearchTerm) ||
        aparelho.includes(lowerCaseSearchTerm) ||
        descricao.includes(lowerCaseSearchTerm) ||
        id.includes(lowerCaseSearchTerm)
      );
    });
  }, [data, searchTerm]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Erro ao carregar chamados. Por favor, tente novamente.
      </Alert>
    );
  }

  if (!filteredChamados.length) {
    return (
      <Box my={4}>
        <Alert severity="info">
          {searchTerm
            ? `Nenhum chamado encontrado para "${searchTerm}" com status ${status.toLowerCase()}.`
            : `Nenhum chamado ${status.toLowerCase()} encontrado.`}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={2}>
        <Typography variant="h5" component="h2">
          Chamados {status}
          {clienteId ? ` - Cliente #${clienteId}` : ''}
        </Typography>
      </Box>

      {filteredChamados.map((chamado) => (
        <ChamadoCard key={chamado.id_chamado} chamado={chamado} />
      ))}

      {/* Pagination - Only render if data and total_pages exist */}
      {data && data.total_pages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={data.total_pages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
};

export default ChamadoList; 