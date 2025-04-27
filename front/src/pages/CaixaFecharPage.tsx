import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, Grid, Card, CardContent, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface CaixaEntry {
  id_caixa: number;
  descricao: string;
  valor: number;
  tipo: string;
  data_lancamento: string;
  mes: number;
  ano: number;
  fechado: boolean;
}

interface CaixaSum {
  total_entrada: number;
  total_saida: number;
  saldo: number;
}

const currentYear = new Date().getFullYear();
const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const CaixaFecharPage: React.FC = () => {
  const [entries, setEntries] = useState<CaixaEntry[]>([]);
  const [sum, setSum] = useState<CaixaSum | null>(null);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(currentYear);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    fetchSum();
  }, [month, year]);

  const fetchData = async () => {
    const res = await axios.get(`/api/caixa`, { params: { mes: month, ano: year } });
    setEntries(res.data);
  };

  const fetchSum = async () => {
    const res = await axios.get(`/api/caixa/sum`, { params: { mes: month, ano: year } });
    setSum(res.data);
  };

  const handleCloseCaixa = async () => {
    // PATCH all entries for the month to fechado=true
    await Promise.all(entries.filter(e => !e.fechado).map(e =>
      axios.put(`/api/caixa/${e.id_caixa}`, { fechado: true })
    ));
    setSuccess(true);
    setTimeout(() => navigate('/caixa'), 1500);
  };

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>Fechar Caixa do Mês</Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <Select value={month} onChange={e => setMonth(Number(e.target.value))} size="small">
            {months.map((m, idx) => (
              <MenuItem key={idx + 1} value={idx + 1}>{m}</MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item>
          <Select value={year} onChange={e => setYear(Number(e.target.value))} size="small">
            {[currentYear - 1, currentYear, currentYear + 1].map(y => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </Select>
        </Grid>
      </Grid>
      <Box mt={2}>
        {sum && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1">Entradas</Typography>
                  <Typography color="success.main" variant="h5">R$ {sum.total_entrada.toFixed(2)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1">Saídas</Typography>
                  <Typography color="error.main" variant="h5">R$ {sum.total_saida.toFixed(2)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1">Saldo</Typography>
                  <Typography color={sum.saldo >= 0 ? 'success.main' : 'error.main'} variant="h5">R$ {sum.saldo.toFixed(2)}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
      <Box mt={4}>
        <Typography variant="h6">Lançamentos do mês</Typography>
        <TableContainer component={Paper} sx={{ mt: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Valor (R$)</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map(entry => (
                <TableRow key={entry.id_caixa}>
                  <TableCell>{new Date(entry.data_lancamento).toLocaleDateString()}</TableCell>
                  <TableCell>{entry.descricao}</TableCell>
                  <TableCell>{entry.tipo === 'entrada' ? 'Entrada' : 'Saída'}</TableCell>
                  <TableCell>{Number(entry.valor).toFixed(2)}</TableCell>
                  <TableCell>{entry.fechado ? 'Fechado' : 'Aberto'}</TableCell>
                </TableRow>
              ))}
              {entries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">Nenhum lançamento encontrado.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Box mt={3}>
        <Button variant="contained" color="primary" onClick={handleCloseCaixa} disabled={entries.every(e => e.fechado)}>
          Fechar Caixa do Mês
        </Button>
        {success && <Alert severity="success" sx={{ mt: 2 }}>Caixa fechado com sucesso!</Alert>}
      </Box>
    </Box>
  );
};

export default CaixaFecharPage; 