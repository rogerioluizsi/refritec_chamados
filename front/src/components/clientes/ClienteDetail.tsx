import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  TextField,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { useClientes } from '../../hooks/useClientes';
import { useChamados } from '../../hooks/useChamados';
import { Cliente, ChamadoStatus } from '../../types';
import ChamadoList from '../chamados/ChamadoList';

interface ClienteDetailProps {
  clienteId: number;
}

const ClienteDetail: React.FC<ClienteDetailProps> = ({ clienteId }) => {
  const { useClienteDetails, useUpdateCliente } = useClientes();
  const { data: cliente, isLoading, error } = useClienteDetails(clienteId);
  const updateCliente = useUpdateCliente(clienteId);
  
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<{
    nome: string;
    endereco: string;
  }>({
    nome: '',
    endereco: '',
  });

  const statusOptions: (ChamadoStatus | 'Todos')[] = ['Todos', 'Aberto', 'Em Andamento', 'Concluído', 'Cancelado'];
  const [selectedStatus, setSelectedStatus] = useState<ChamadoStatus | 'Todos'>('Todos');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleEditClick = () => {
    if (cliente) {
      setFormData({
        nome: cliente.nome,
        endereco: cliente.endereco,
      });
      setEditMode(true);
    }
  };

  const handleSubmit = () => {
    updateCliente.mutate(formData, {
      onSuccess: () => {
        setEditMode(false);
      },
    });
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !cliente) {
    return (
      <Alert severity="error">
        Erro ao carregar detalhes do cliente. Por favor, tente novamente.
      </Alert>
    );
  }

  return (
    <Box>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" component="h1" gutterBottom>
            Detalhes do Cliente
          </Typography>
          
          {!editMode ? (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body1">
                  <strong>Nome:</strong> {cliente.nome}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body1">
                  <strong>Telefone:</strong> {cliente.telefone}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">
                  <strong>Endereço:</strong> {cliente.endereco}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Button 
                  variant="outlined" 
                  startIcon={<EditIcon />}
                  onClick={handleEditClick}
                  sx={{ mt: 2 }}
                >
                  Editar
                </Button>
              </Grid>
            </Grid>
          ) : (
            <Box component={Paper} p={2} mt={2} elevation={2}>
              <Typography variant="h6" component="h3" gutterBottom>
                Editar Cliente
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    id="nome"
                    name="nome"
                    label="Nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    id="endereco"
                    name="endereco"
                    label="Endereço"
                    value={formData.endereco}
                    onChange={handleInputChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box display="flex" gap={1}>
                    <Button 
                      variant="contained" 
                      onClick={handleSubmit}
                      disabled={updateCliente.isPending}
                    >
                      {updateCliente.isPending ? 'Salvando...' : 'Salvar'}
                    </Button>
                    <Button 
                      variant="outlined" 
                      onClick={() => setEditMode(false)}
                    >
                      Cancelar
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>
      
      <Divider sx={{ my: 4 }} />
      
      <Typography variant="h5" component="h2" gutterBottom>
        Chamados do Cliente
      </Typography>
      
      <Box mb={2}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            id="status-filter"
            value={selectedStatus}
            label="Status"
            onChange={(e) => setSelectedStatus(e.target.value as ChamadoStatus | 'Todos')}
          >
            {statusOptions.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      <ChamadoList clienteId={clienteId} status={selectedStatus === 'Todos' ? undefined : selectedStatus} />
    </Box>
  );
};

export default ClienteDetail; 