import React from 'react';
import { Box, Typography } from '@mui/material';
import ClienteForm from '../components/clientes/ClienteForm';
import { Cliente } from '../types';

const ClienteCriarPage: React.FC = () => {
  const handleSuccess = (cliente: Cliente) => {
    console.log('Cliente criado com sucesso:', cliente);
  };

  return (
    <Box sx={{ 
      padding: 3,
      maxWidth: 800,
      margin: '0 auto'
    }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        {/* Cadastrar Novo Cliente */}
      </Typography>
      <ClienteForm onSuccess={handleSuccess} />
    </Box>
  );
};

export default ClienteCriarPage; 