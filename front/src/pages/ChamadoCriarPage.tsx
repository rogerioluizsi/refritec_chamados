import React from 'react';
import { Box, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';
import ChamadoForm from '../components/chamados/ChamadoForm';

interface LocationState {
  clienteId: number;
  clienteNome: string;
}

const ChamadoCriarPage: React.FC = () => {
  const location = useLocation();
  const { clienteId, clienteNome } = location.state as LocationState;

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Criar Novo Chamado
      </Typography>
      <Typography variant="h6" gutterBottom>
        Cliente: {clienteNome}
      </Typography>
      <ChamadoForm clienteId={clienteId} />
    </Box>
  );
};

export default ChamadoCriarPage; 