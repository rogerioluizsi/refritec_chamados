import React from 'react';
import { Paper, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import useStatistics from '../../hooks/useStatistics';

const COLORS = ['#1976d2', '#ff9800', '#4caf50', '#f44336'];

const StatusChart: React.FC = () => {
  const { data: stats, isLoading, error } = useStatistics();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box my={4}>
        <Alert severity="error">
          Erro ao carregar dados do gráfico de status. Por favor, tente novamente mais tarde.
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

  const data = [
    { name: 'Abertos', value: stats.total_open },
    { name: 'Em Andamento', value: stats.total_in_progress },
    { name: 'Concluídos', value: stats.total_completed },
    { name: 'Cancelados', value: stats.total_canceled },
  ];

  return (
    <Paper sx={{ p: 3, height: 400, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Chamados por Status
      </Typography>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`${value} chamados`, 'Quantidade']}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default StatusChart; 