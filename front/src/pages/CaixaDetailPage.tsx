import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, MenuItem, Paper, Grid, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

type CaixaEntry = {
  id_caixa: number;
  descricao: string;
  valor: number;
  tipo: string;
  data_lancamento: string;
  mes: number;
  ano: number;
  fechado: boolean;
};

const CaixaDetailPage: React.FC = () => {
  const { id } = useParams();
  const [entry, setEntry] = useState<CaixaEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [edit, setEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEntry();
    // eslint-disable-next-line
  }, [id]);

  const fetchEntry = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/caixa/${id}`);
      setEntry(res.data);
    } catch (err: any) {
      setError('Lançamento não encontrado.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CaixaEntry, value: any) => {
    if (!entry) return;
    setEntry({ ...entry, [field]: value });
  };

  const handleSave = async () => {
    if (!entry) return;
    setError('');
    try {
      await axios.put(`/api/caixa/${entry.id_caixa}`, {
        descricao: entry.descricao,
        valor: entry.valor,
        tipo: entry.tipo,
        data_lancamento: entry.data_lancamento,
        mes: entry.mes,
        ano: entry.ano,
        fechado: entry.fechado
      });
      setEdit(false);
      fetchEntry();
    } catch (err: any) {
      setError('Erro ao salvar alterações.');
    }
  };

  const handleDelete = async () => {
    if (!entry) return;
    try {
      await axios.delete(`/api/caixa/${entry.id_caixa}`);
      navigate('/caixa');
    } catch {
      setError('Erro ao remover lançamento.');
    }
  };

  if (loading) return <Box p={2}><Typography>Carregando...</Typography></Box>;
  if (!entry) return <Box p={2}><Typography color="error">{error}</Typography></Box>;

  return (
    <Box p={2} maxWidth={500} mx="auto">
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Detalhes do Lançamento</Typography>
        {edit ? (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField label="Descrição" value={entry.descricao} onChange={e => handleChange('descricao', e.target.value)} fullWidth required />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Valor (R$)" type="number" value={entry.valor} onChange={e => handleChange('valor', e.target.value)} fullWidth required inputProps={{ min: 0, step: 0.01 }} />
            </Grid>
            <Grid item xs={6}>
              <TextField select label="Tipo" value={entry.tipo} onChange={e => handleChange('tipo', e.target.value)} fullWidth>
                <MenuItem value="entrada">Entrada</MenuItem>
                <MenuItem value="saida">Saída</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField label="Data" type="date" value={entry.data_lancamento.slice(0, 10)} onChange={e => handleChange('data_lancamento', e.target.value)} fullWidth required InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={3}>
              <TextField select label="Mês" value={entry.mes} onChange={e => handleChange('mes', Number(e.target.value))} fullWidth>
                {months.map((m, idx) => (
                  <MenuItem key={idx + 1} value={idx + 1}>{m}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={3}>
              <TextField label="Ano" type="number" value={entry.ano} onChange={e => handleChange('ano', Number(e.target.value))} fullWidth />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary" onClick={handleSave} fullWidth>Salvar</Button>
            </Grid>
            <Grid item xs={12}>
              <Button variant="outlined" color="secondary" onClick={() => setEdit(false)} fullWidth>Cancelar</Button>
            </Grid>
            {error && (
              <Grid item xs={12}>
                <Typography color="error">{error}</Typography>
              </Grid>
            )}
          </Grid>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12}><Typography><b>Descrição:</b> {entry.descricao}</Typography></Grid>
            <Grid item xs={6}><Typography><b>Valor:</b> R$ {Number(entry.valor).toFixed(2)}</Typography></Grid>
            <Grid item xs={6}><Typography><b>Tipo:</b> {entry.tipo === 'entrada' ? 'Entrada' : 'Saída'}</Typography></Grid>
            <Grid item xs={6}><Typography><b>Data:</b> {new Date(entry.data_lancamento).toLocaleDateString()}</Typography></Grid>
            <Grid item xs={3}><Typography><b>Mês:</b> {months[entry.mes - 1]}</Typography></Grid>
            <Grid item xs={3}><Typography><b>Ano:</b> {entry.ano}</Typography></Grid>
            <Grid item xs={12}><Typography><b>Status:</b> {entry.fechado ? 'Fechado' : 'Aberto'}</Typography></Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary" onClick={() => setEdit(true)} fullWidth>Editar</Button>
            </Grid>
            <Grid item xs={12}>
              <Button variant="outlined" color="error" onClick={() => setConfirmDelete(true)} fullWidth>Remover</Button>
            </Grid>
            {error && (
              <Grid item xs={12}>
                <Typography color="error">{error}</Typography>
              </Grid>
            )}
          </Grid>
        )}
      </Paper>
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Remover Lançamento</DialogTitle>
        <DialogContent>Tem certeza que deseja remover este lançamento?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancelar</Button>
          <Button color="error" onClick={handleDelete}>Remover</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CaixaDetailPage; 