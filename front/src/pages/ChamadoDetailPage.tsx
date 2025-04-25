import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import ChamadoDetail from '../components/chamados/ChamadoDetail';

const ChamadoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const chamadoId = parseInt(id || '0', 10);

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
          Detalhes do Chamado
        </Typography>
      </Box>

      {chamadoId > 0 ? (
        <ChamadoDetail chamadoId={chamadoId} />
      ) : (
        <Typography color="error">ID do chamado inválido.</Typography>
      )}
    </Box>
  );
};

export default ChamadoDetailPage; 