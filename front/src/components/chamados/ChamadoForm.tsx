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
import { CreateChamadoDto, ChamadoStatus } from '../../types';

interface ChamadoFormProps {
  clienteId: number;
}

interface ChamadoData {
  descricao: string;
  aparelho: string;
  status: ChamadoStatus;
  valor: number;
  observacao: string;
  data_prevista: Date | null;
}

const ChamadoForm: React.FC<ChamadoFormProps> = ({ clienteId }) => {
  const navigate = useNavigate();
  const { useCreateChamado } = useChamados();
  const createChamado = useCreateChamado();

  const [formData, setFormData] = useState<ChamadoData>({
    descricao: '',
    aparelho: '',
    status: 'Aberto',
    valor: 0,
    observacao: '',
    data_prevista: null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'valor' ? parseFloat(value) || 0 : value
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const chamadoData: CreateChamadoDto = {
        ...formData,
        id_cliente: clienteId,
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
              type="number"
              name="valor"
              label="Valor Estimado (R$)"
              value={formData.valor === 0 ? '' : formData.valor}
              onChange={handleChange}
              inputProps={{ 
                step: "0.01",
                min: "0",
                placeholder: "0,00"
              }}
            />
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