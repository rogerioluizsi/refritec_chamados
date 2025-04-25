import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Paper, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { format, addDays, isToday, isSunday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { chamadoApi } from '../api/chamadoApi';
import { Chamado } from '../types';
import { useNavigate } from 'react-router-dom';

export const Calendar: React.FC = () => {
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const navigateDay = (direction: number) => {
    let newDate = addDays(currentDate, direction);
    
    // Skip Sundays
    while (isSunday(newDate)) {
      newDate = addDays(newDate, direction);
    }
    
    setCurrentDate(newDate);
  };

  const handleChamadoClick = (id: number) => {
    navigate(`/chamados/${id}`);
  };

  useEffect(() => {
    const fetchChamados = async () => {
      setIsLoading(true);
      try {
        const dateString = format(currentDate, 'yyyy-MM-dd');
        const data = await chamadoApi.getChamadosByDay(dateString);
        setChamados(data || []);
      } catch (error) {
        console.error('Erro ao buscar chamados:', error);
        setChamados([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChamados();
  }, [currentDate]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pendente': 
      case 'aberto': return '#AB47BC';
      case 'em andamento': return '#42A5F5';
      case 'concluído': return '#66BB6A';
      case 'cancelado': return '#EF5350';
      default: return '#9E9E9E';
    }
  };

  return (
    <Box sx={{ p: isMobile ? 2 : 3, maxWidth: '100%' }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 3
      }}>
        <IconButton onClick={() => navigateDay(-1)} color="primary">
          <ArrowBackIosNewIcon />
        </IconButton>
        
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          sx={{ 
            textAlign: 'center',
            fontWeight: 'medium',
            color: isToday(currentDate) ? theme.palette.primary.main : 'inherit'
          }}
        >
          {format(currentDate, 'EEEE, d', { locale: ptBR })}
        </Typography>
        
        <IconButton onClick={() => navigateDay(1)} color="primary">
          <ArrowForwardIosIcon />
        </IconButton>
      </Box>

      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          minHeight: '60vh',
          position: 'relative'
        }}
      >
        {isLoading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            height: '100%',
            minHeight: '200px'
          }}>
            <Typography color="text.secondary">
              Carregando...
            </Typography>
          </Box>
        ) : chamados.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            height: '100%',
            minHeight: '200px'
          }}>
            <Typography color="text.secondary">
              Nenhum chamado para este dia
            </Typography>
          </Box>
        ) : (
          chamados.map((chamado) => (
            <Card 
              key={chamado.id_chamado} 
              sx={{ 
                mb: 2, 
                boxShadow: 'none',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  cursor: 'pointer'
                }
              }}
              onClick={() => handleChamadoClick(chamado.id_chamado)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {chamado.aparelho}
                  </Typography>
                  <Box 
                    sx={{ 
                      px: 1, 
                      py: 0.5, 
                      bgcolor: getStatusColor(chamado.status), 
                      borderRadius: 1,
                      ml: 1
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'white' }}>
                      {chamado.status}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {chamado.descricao}
                </Typography>
              </CardContent>
            </Card>
          ))
        )}
      </Paper>
    </Box>
  );
}; 