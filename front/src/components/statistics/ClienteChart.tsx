import React from 'react';
import { Paper, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import useStatistics from '../../hooks/useStatistics';

const ClienteChart: React.FC = () => {
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
          Erro ao carregar dados do gráfico de clientes. Por favor, tente novamente mais tarde.
        </Alert>
      </Box>
    );
  }

  if (!stats || !stats.chamados_by_client) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  // Convert the chamados_by_client object to an array for the chart
  const chartData = Object.entries(stats.chamados_by_client).map(([name, count]) => ({
    cliente: name,
    chamados: count,
  }));

  // Sort by number of chamados in descending order
  chartData.sort((a, b) => b.chamados - a.chamados);

  // Take only the top 5 clients for better visualization
  const topClients = chartData.slice(0, 5);

  return (
    <Paper sx={{ p: 3, height: 400, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Chamados por Cliente (Top 5)
      </Typography>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart
          data={topClients}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="cliente" 
            angle={-45} 
            textAnchor="end" 
            height={80}
            tick={{ fontSize: 12 }}
          />
          <YAxis />
          <Tooltip 
            formatter={(value: number) => [`${value} chamados`, 'Quantidade']}
            labelFormatter={(label: string) => `Cliente: ${label}`}
          />
          <Bar dataKey="chamados" fill="#8884d8" name="Chamados" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default ClienteChart; 