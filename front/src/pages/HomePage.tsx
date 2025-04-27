import React, { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ChamadoList from '../components/chamados/ChamadoList';
import { ChamadoStatus } from '../types';
import { useChamados } from '../hooks/useChamados';

const HomePage: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<ChamadoStatus>('Aberto');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTecnico, setSelectedTecnico] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');

  // Get user role from localStorage (same as api.ts interceptor)
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
      } catch {}
    }
  }, []);

  // Fetch users (técnicos)
  const { useUsers } = useChamados();
  const { data: users, isLoading: isLoadingUsers } = useUsers();
  const tecnicos = users?.filter((u) => u.ativo);

  const handleStatusChange = (_event: React.SyntheticEvent, newValue: ChamadoStatus) => {
    setSelectedStatus(newValue);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleTecnicoChange = (event: SelectChangeEvent<string>) => {
    setSelectedTecnico(event.target.value);
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

      {/* Técnico filter for gerente/administrador */}
      {(userRole === 'gerente' || userRole === 'administrador') && (
        <Box mb={2}>
          <FormControl fullWidth variant="outlined" size="small" disabled={isLoadingUsers}>
            <InputLabel id="tecnico-select-label">Filtrar por Técnico</InputLabel>
            <Select
              labelId="tecnico-select-label"
              value={selectedTecnico}
              onChange={handleTecnicoChange}
              label="Filtrar por Técnico"
            >
              <MenuItem value="">Todos os Técnicos</MenuItem>
              {tecnicos && tecnicos.map((tecnico) => (
                <MenuItem key={tecnico.id_usuario} value={tecnico.id_usuario}>
                  {tecnico.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: 2 }}>
        <Tabs value={selectedStatus} onChange={handleStatusChange} aria-label="Status dos chamados">
          <Tab label="Abertos" value="Aberto" />
          <Tab label="Em Andamento" value="Em Andamento" />
          <Tab label="Concluídos" value="Concluído" />
        </Tabs>
      </Box>

      <ChamadoList
        status={selectedStatus}
        searchTerm={searchTerm}
        tecnicoId={selectedTecnico ? Number(selectedTecnico) : undefined}
      />
    </Box>
  );
};

export default HomePage; 