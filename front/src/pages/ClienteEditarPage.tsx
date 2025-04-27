import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import ClienteDetail from '../components/clientes/ClienteDetail';

const ClienteEditarPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const clienteId = parseInt(id || '0', 10);

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          variant="outlined"
          sx={{ mr: 2 }}
        >
          Voltar
        </Button>
        <Typography variant="h4" component="h1">
          {/* Editar Cliente */}
        </Typography>
      </Box>

      {clienteId > 0 ? (
        <ClienteDetail clienteId={clienteId} />
      ) : (
        <Typography color="error">ID do cliente inválido.</Typography>
      )}
    </Box>
  );
};

export default ClienteEditarPage; 