import React, { useState } from 'react';
import { Box, Typography, TextField, Button, MenuItem, Paper, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const CaixaAddPage: React.FC = () => {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState('saida');
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('/api/caixa', {
        descricao,
        valor: parseFloat(valor),
        tipo,
        data_lancamento: data,
        mes,
        ano,
        fechado: false
      });
      navigate('/caixa');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao adicionar lançamento.');
    }
  };

  return (
    <Box p={2} maxWidth={500} mx="auto">
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Adicionar Lançamento</Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField label="Descrição" value={descricao} onChange={e => setDescricao(e.target.value)} fullWidth required />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Valor (R$)" type="number" value={valor} onChange={e => setValor(e.target.value)} fullWidth required inputProps={{ min: 0, step: 0.01 }} />
            </Grid>
            <Grid item xs={6}>
              <TextField select label="Tipo" value={tipo} onChange={e => setTipo(e.target.value)} fullWidth>
                <MenuItem value="entrada">Entrada</MenuItem>
                <MenuItem value="saida">Saída</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField label="Data" type="date" value={data} onChange={e => setData(e.target.value)} fullWidth required InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={3}>
              <TextField select label="Mês" value={mes} onChange={e => setMes(Number(e.target.value))} fullWidth>
                {months.map((m, idx) => (
                  <MenuItem key={idx + 1} value={idx + 1}>{m}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={3}>
              <TextField label="Ano" type="number" value={ano} onChange={e => setAno(Number(e.target.value))} fullWidth />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" fullWidth>Salvar</Button>
            </Grid>
            {error && (
              <Grid item xs={12}>
                <Typography color="error">{error}</Typography>
              </Grid>
            )}
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default CaixaAddPage; 