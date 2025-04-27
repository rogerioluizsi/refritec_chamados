import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, Grid, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/api';

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

const CaixaPage: React.FC = () => {
  const [entries, setEntries] = useState<CaixaEntry[]>([]);
  const [sum, setSum] = useState<CaixaSum | null>(null);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(currentYear);
  const [loading, setLoading] = useState(false);
  const [multiMonth, setMultiMonth] = useState<number[]>([month]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    fetchSum();
  }, [month, year]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/caixa`, { params: { mes: month, ano: year } });
      setEntries(res.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchSum = async () => {
    const res = await api.get(`/api/caixa/sum`, { params: { mes: month, ano: year } });
    setSum(res.data);
  };

  const handleMonthChange = (e: any) => setMonth(e.target.value);
  const handleYearChange = (e: any) => setYear(e.target.value);

  return (
    <Box p={2}>
      {/* <Typography variant="h4" gutterBottom>Controle de Caixa</Typography> */}
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <Select value={month} onChange={handleMonthChange} size="small">
            {months.map((m, idx) => (
              <MenuItem key={idx + 1} value={idx + 1}>{m}</MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item>
          <Select value={year} onChange={handleYearChange} size="small">
            {[currentYear - 1, currentYear, currentYear + 1].map(y => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item>
          <Button variant="contained" color="primary" onClick={() => navigate('/caixa/adicionar')}>Adicionar Lançamento</Button>
        </Grid>
        <Grid item>
          <Button variant="outlined" color="secondary" onClick={() => navigate('/caixa/fechar')}>Fechar Caixa</Button>
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
                <TableCell>Ações</TableCell>
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
                  <TableCell>
                    <Button size="small" onClick={() => navigate(`/caixa/${entry.id_caixa}`)}>Ver/Editar</Button>
                  </TableCell>
                </TableRow>
              ))}
              {entries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">Nenhum lançamento encontrado.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default CaixaPage; 