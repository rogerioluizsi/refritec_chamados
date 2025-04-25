import React from 'react';
import { Box, Typography } from '@mui/material';
import ClienteForm from '../components/clientes/ClienteForm';

const ClienteCriarPage: React.FC = () => {
  return (
    <Box sx={{ 
      padding: 3,
      maxWidth: 800,
      margin: '0 auto'
    }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Cadastrar Novo Cliente
      </Typography>
      <ClienteForm />
    </Box>
  );
};

export default ClienteCriarPage; 