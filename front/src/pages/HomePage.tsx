import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ChamadoList from '../components/chamados/ChamadoList';
import { ChamadoStatus } from '../types';

const HomePage: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<ChamadoStatus>('Aberto');
  const [searchTerm, setSearchTerm] = useState('');

  const handleStatusChange = (_event: React.SyntheticEvent, newValue: ChamadoStatus) => {
    setSelectedStatus(newValue);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {/* Gerenciar Chamados */}
      </Typography>

      <Box mb={2}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar chamados (cliente, aparelho, descrição...)"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: 2 }}>
        <Tabs value={selectedStatus} onChange={handleStatusChange} aria-label="Status dos chamados">
          <Tab label="Abertos" value="Aberto" />
          <Tab label="Em Andamento" value="Em Andamento" />
          <Tab label="Concluídos" value="Concluído" />
        </Tabs>
      </Box>

      <ChamadoList status={selectedStatus} searchTerm={searchTerm} />
    </Box>
  );
};

export default HomePage; 