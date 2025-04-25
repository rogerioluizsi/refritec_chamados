import React from 'react';
import { Grid, Paper, Typography, Box, CircularProgress, Skeleton, Alert } from '@mui/material';
import {
  AssignmentTurnedIn as CompletedIcon,
  Build as InProgressIcon,
  Assignment as OpenIcon,
  Cancel as CanceledIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Payments as PaymentsIcon,
} from '@mui/icons-material';
import useStatistics from '../../hooks/useStatistics';

const StatisticsCards: React.FC = () => {
  const { data: stats, isLoading, error } = useStatistics();

  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4, 5, 6, 7].map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item}>
            <Paper sx={{ p: 2 }}>
              <Skeleton variant="rectangular" height={20} width="60%" sx={{ mb: 1 }} />
              <Skeleton variant="rectangular" height={40} width="80%" />
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (error) {
    return (
      <Box my={4}>
        <Alert severity="error">
          Erro ao carregar estatísticas. Por favor, tente novamente mais tarde.
        </Alert>
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={4}>
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: 140,
            bgcolor: 'primary.light',
            color: 'white',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Chamados Abertos
          </Typography>
          <Box display="flex" alignItems="center" justifyContent="space-between" flex={1}>
            <Typography variant="h3">{stats.total_open}</Typography>
            <OpenIcon fontSize="large" />
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: 140,
            bgcolor: 'warning.light',
            color: 'white',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Em Andamento
          </Typography>
          <Box display="flex" alignItems="center" justifyContent="space-between" flex={1}>
            <Typography variant="h3">{stats.total_in_progress}</Typography>
            <InProgressIcon fontSize="large" />
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: 140,
            bgcolor: 'success.light',
            color: 'white',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Concluídos
          </Typography>
          <Box display="flex" alignItems="center" justifyContent="space-between" flex={1}>
            <Typography variant="h3">{stats.total_completed}</Typography>
            <CompletedIcon fontSize="large" />
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: 140,
            bgcolor: 'error.light',
            color: 'white',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Cancelados
          </Typography>
          <Box display="flex" alignItems="center" justifyContent="space-between" flex={1}>
            <Typography variant="h3">{stats.total_canceled}</Typography>
            <CanceledIcon fontSize="large" />
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: 140,
            bgcolor: 'info.light',
            color: 'white',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Valor Total em Aberto
          </Typography>
          <Box display="flex" alignItems="center" justifyContent="space-between" flex={1}>
            <Typography variant="h3">R$ {stats.total_value_open.toLocaleString('pt-BR')}</Typography>
            <MoneyIcon fontSize="large" />
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: 140,
            bgcolor: 'secondary.light',
            color: 'white',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Valor Recebido no Mês
          </Typography>
          <Box display="flex" alignItems="center" justifyContent="space-between" flex={1}>
            <Typography variant="h3">R$ {stats.valor_recebido_mes.toLocaleString('pt-BR')}</Typography>
            <PaymentsIcon fontSize="large" />
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: 140,
            bgcolor: 'success.dark',
            color: 'white',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Total de Clientes
          </Typography>
          <Box display="flex" alignItems="center" justifyContent="space-between" flex={1}>
            <Typography variant="h3">{stats.total_clientes}</Typography>
            <PeopleIcon fontSize="large" />
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default StatisticsCards; 