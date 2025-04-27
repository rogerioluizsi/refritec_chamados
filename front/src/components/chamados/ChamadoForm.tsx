import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useChamados } from '../../hooks/useChamados';
import { CreateChamadoDto, ChamadoStatus, User } from '../../types';

interface ChamadoFormProps {
  clienteId: number;
}

interface ChamadoData {
  descricao: string;
  aparelho: string;
  status: ChamadoStatus;
  observacao: string;
  data_prevista: Date | null;
}

const ChamadoForm: React.FC<ChamadoFormProps> = ({ clienteId }) => {
  const navigate = useNavigate();
  const { useCreateChamado, useUsers } = useChamados();
  const createChamado = useCreateChamado();
  const { data: users, isLoading: isLoadingUsers } = useUsers();

  const [formData, setFormData] = useState<ChamadoData & { id_usuario?: number }>({
    descricao: '',
    aparelho: '',
    status: 'Aberto',
    observacao: '',
    data_prevista: null,
    id_usuario: undefined,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusChange = (e: any) => {
    setFormData(prev => ({
      ...prev,
      status: e.target.value as ChamadoStatus
    }));
  };

  const handleDateChange = (date: Date | null) => {
    setFormData(prev => ({
      ...prev,
      data_prevista: date
    }));
  };

  const handleUserChange = (e: any) => {
    setFormData(prev => ({
      ...prev,
      id_usuario: e.target.value ? Number(e.target.value) : undefined
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const chamadoData: CreateChamadoDto = {
        ...formData,
        id_cliente: clienteId,
        valor: 0, // Set a default value for the backend
      };
      
      await createChamado.mutateAsync(chamadoData);
      navigate('/');
    } catch (error) {
      console.error('Erro ao criar chamado:', error);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              name="aparelho"
              label="Aparelho"
              value={formData.aparelho}
              onChange={handleChange}
              placeholder="Ex: Geladeira Brastemp Frost Free"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              multiline
              rows={3}
              name="descricao"
              label="Descrição do Problema"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="Descreva o problema relatado pelo cliente"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={handleStatusChange}
              >
                <MenuItem value="Aberto">Aberto</MenuItem>
                <MenuItem value="Em Andamento">Em Andamento</MenuItem>
                <MenuItem value="Concluído">Concluído</MenuItem>
                <MenuItem value="Cancelado">Cancelado</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              name="data_prevista"
              label="Data Prevista"
              value={formData.data_prevista ? formData.data_prevista.toISOString().split('T')[0] : ''}
              onChange={(e) => handleDateChange(e.target.value ? new Date(e.target.value) : null)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="tecnico-label">Técnico Responsável</InputLabel>
              <Select
                labelId="tecnico-label"
                id="id_usuario"
                name="id_usuario"
                value={formData.id_usuario || ''}
                label="Técnico Responsável"
                onChange={handleUserChange}
                disabled={isLoadingUsers}
              >
                <MenuItem value="">Não atribuído</MenuItem>
                {users && users.map((user: User) => (
                  <MenuItem key={user.id_usuario} value={user.id_usuario}>{user.nome} ({user.role})</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              name="observacao"
              label="Observações"
              value={formData.observacao}
              onChange={handleChange}
              placeholder="Observações adicionais sobre o chamado"
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              disabled={createChamado.isPending}
            >
              {createChamado.isPending ? 'Criando...' : 'Criar Chamado'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default ChamadoForm; 