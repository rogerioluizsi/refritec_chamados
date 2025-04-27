import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import StatisticsCards from '../components/statistics/StatisticsCards';
import ClienteChart from '../components/statistics/ClienteChart';
import StatusChart from '../components/statistics/StatusChart';

const EstatisticasPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {/* Estatísticas */}
      </Typography>
      
      <StatisticsCards />
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <StatusChart />
        </Grid>
        <Grid item xs={12} md={6}>
          <ClienteChart />
        </Grid>
      </Grid>
    </Box>
  );
};

export default EstatisticasPage; 