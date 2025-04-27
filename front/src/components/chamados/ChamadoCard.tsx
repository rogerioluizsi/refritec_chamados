import React from 'react';
import { Card, CardContent, CardActions, Typography, Button, Chip, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Chamado, User } from '../../types';
import { formatDate, getDueDateStatus } from '../../utils/dateUtils';
import { useChamados } from '../../hooks/useChamados';

interface ChamadoCardProps {
  chamado: Chamado;
}

const ChamadoCard: React.FC<ChamadoCardProps> = ({ chamado }) => {
  const navigate = useNavigate();
  const dueDateStatus = getDueDateStatus(chamado.data_prevista);
  const { useUsers } = useChamados();
  const { data: users, isLoading: isLoadingUsers } = useUsers();

  // Find the responsible technician
  const tecnico: User | undefined = users?.find((user: User) => user.id_usuario === chamado.id_usuario);

  // Define color based on status
  const getStatusColor = () => {
    switch (dueDateStatus.status) {
      case 'overdue':
        return 'error';
      case 'today':
        return 'warning';
      case 'upcoming':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusText = () => {
    switch (dueDateStatus.status) {
      case 'overdue':
        return `${dueDateStatus.daysOverdue} dias de atraso`;
      case 'today':
        return 'Vence hoje';
      case 'upcoming':
        return 'Em dia';
      default:
        return '';
    }
  };

  return (
    <Card
      sx={{
        mb: 2,
        borderLeft: 3,
        borderColor: 
          dueDateStatus.status === 'overdue' 
            ? 'error.main' 
            : dueDateStatus.status === 'today' 
              ? 'warning.main' 
              : 'success.main',
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Box>
            <Typography variant="h6" component="div">
              {chamado.cliente?.nome || `Cliente #${chamado.id_cliente}`}
            </Typography>
            {chamado.cliente?.telefone && (
              <Typography variant="body2" color="text.secondary">
                {chamado.cliente.telefone}
              </Typography>
            )}
            {/* Técnico Responsável */}
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mt: 0.5 }}>
              <strong>Técnico Responsável:</strong>{' '}
              {isLoadingUsers ? 'Carregando...' :
                tecnico ? `${tecnico.nome} (${tecnico.role})` : 'Não atribuído'}
            </Typography>
          </Box>
          <Chip
            label={getStatusText()}
            color={getStatusColor()}
            size="small"
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Aparelho:</strong> {chamado.aparelho}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Descrição:</strong> {chamado.descricao}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          <strong>Data Prevista:</strong> {formatDate(chamado.data_prevista)}
        </Typography>
      </CardContent>
      
      <CardActions>
        <Button 
          size="small" 
          color="primary" 
          onClick={() => navigate(`/chamados/${chamado.id_chamado}`)}
        >
          Ver Detalhes
        </Button>
      </CardActions>
    </Card>
  );
};

export default ChamadoCard; 