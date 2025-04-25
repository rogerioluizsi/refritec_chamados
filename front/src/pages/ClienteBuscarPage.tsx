import React from 'react';
import { Box, Typography } from '@mui/material';
import ClienteSearch from '../components/clientes/ClienteSearch';

const ClienteBuscarPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Buscar Cliente
      </Typography>
      <ClienteSearch />
    </Box>
  );
};

export default ClienteBuscarPage; 