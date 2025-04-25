import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  SelectChangeEvent,
  Grid,
} from '@mui/material';
import { Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import { useChamados } from '../../hooks/useChamados';
import { formatDate, getDueDateStatus } from '../../utils/dateUtils';
import { ChamadoStatus, UpdateChamadoDto, CreateItemChamadoDto, UpdateItemChamadoDto } from '../../types';
import ItemList from '../../components/chamados/ItemList';

interface ChamadoDetailProps {
  chamadoId: number;
}

const ChamadoDetail: React.FC<ChamadoDetailProps> = ({ chamadoId }) => {
  const { useChamadoDetails, useChamadoItems, useUpdateChamado, useAddItemToChamado } = useChamados();
  const { data: chamado, isLoading, error } = useChamadoDetails(chamadoId);
  const { data: items, isLoading: isLoadingItems } = useChamadoItems(chamadoId);
  const updateChamado = useUpdateChamado(chamadoId);
  const addItem = useAddItemToChamado(chamadoId);

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<UpdateChamadoDto>({
    status: undefined,
    observacao: '',
  });

  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState<CreateItemChamadoDto>({
    descricao: '',
    quantidade: 1,
    valor_unitario: 0,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleStatusChange = (e: SelectChangeEvent) => {
    setFormData({
      ...formData,
      status: e.target.value as ChamadoStatus,
    });
  };

  const handleSubmit = () => {
    updateChamado.mutate(formData, {
      onSuccess: () => {
        setEditMode(false);
      },
    });
  };

  const handleNewItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewItem({
      ...newItem,
      [name]: name === 'quantidade' || name === 'valor_unitario' 
        ? parseFloat(value) || 0 
        : value,
    });
  };

  const handleAddItem = () => {
    addItem.mutate(newItem, {
      onSuccess: () => {
        setItemDialogOpen(false);
        setNewItem({
          descricao: '',
          quantidade: 1,
          valor_unitario: 0,
        });
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

  if (error || !chamado) {
    return (
      <Alert severity="error">
        Erro ao carregar detalhes do chamado. Por favor, tente novamente.
      </Alert>
    );
  }

  // Get status color
  const dueDateStatus = getDueDateStatus(chamado.data_prevista);
  const statusColor = 
    dueDateStatus.status === 'overdue' 
      ? 'error' 
      : dueDateStatus.status === 'today' 
        ? 'warning' 
        : 'success';

  return (
    <Box>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" component="h1">
              Chamado #{chamado.id_chamado}
            </Typography>
            <Chip 
              label={chamado.status} 
              color={chamado.status === 'Aberto' ? 'primary' : chamado.status === 'Em Andamento' ? 'warning' : 'success'} 
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
            <Box>
              <Typography variant="body1">
                <strong>Cliente:</strong> {chamado.cliente?.nome || `Cliente #${chamado.id_cliente}`}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body1">
                <strong>Aparelho:</strong> {chamado.aparelho}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body1">
                <strong>Data de Criação:</strong> {formatDate(chamado.data_criacao)}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <Typography variant="body1" sx={{ mr: 1 }}>
                <strong>Data Prevista:</strong> {formatDate(chamado.data_prevista)}
              </Typography>
              <Chip 
                size="small" 
                color={statusColor} 
                label={
                  dueDateStatus.status === 'overdue' 
                    ? `${dueDateStatus.daysOverdue} dias de atraso` 
                    : dueDateStatus.status === 'today' 
                      ? 'Vence hoje' 
                      : 'Em dia'
                } 
              />
            </Box>
            <Box sx={{ gridColumn: { xs: '1', md: '1 / span 2' } }}>
              <Typography variant="body1">
                <strong>Descrição:</strong> {chamado.descricao}
              </Typography>
            </Box>
            <Box sx={{ gridColumn: { xs: '1', md: '1 / span 2' } }}>
              <Typography variant="body1">
                <strong>Observações:</strong> {chamado.observacao || 'Nenhuma observação registrada.'}
              </Typography>
            </Box>
          </Box>

          {!editMode ? (
            <Button 
              variant="outlined" 
              startIcon={<EditIcon />}
              onClick={() => {
                setFormData({
                  status: chamado.status,
                  observacao: chamado.observacao,
                });
                setEditMode(true);
              }}
            >
              Editar
            </Button>
          ) : (
            <Box component={Paper} p={2} elevation={2}>
              <Typography variant="h6" component="h3" gutterBottom>
                Editar Chamado
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <Box>
                  <FormControl fullWidth>
                    <InputLabel id="status-label">Status</InputLabel>
                    <Select
                      labelId="status-label"
                      id="status"
                      name="status"
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
                </Box>
                <Box sx={{ gridColumn: { xs: '1', md: '1 / span 2' } }}>
                  <TextField
                    fullWidth
                    id="observacao"
                    name="observacao"
                    label="Observações"
                    multiline
                    rows={3}
                    value={formData.observacao}
                    onChange={handleInputChange}
                  />
                </Box>
                <Box sx={{ gridColumn: { xs: '1', md: '1 / span 2' } }}>
                  <Box display="flex" gap={1}>
                    <Button 
                      variant="contained" 
                      onClick={handleSubmit}
                      disabled={updateChamado.isPending}
                    >
                      {updateChamado.isPending ? 'Salvando...' : 'Salvar'}
                    </Button>
                    <Button 
                      variant="outlined" 
                      onClick={() => setEditMode(false)}
                    >
                      Cancelar
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" component="h2">
          Itens do Chamado
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setItemDialogOpen(true)}
        >
          Adicionar Item
        </Button>
      </Box>

      {isLoadingItems ? (
        <Box display="flex" justifyContent="center" my={2}>
          <CircularProgress size={30} />
        </Box>
      ) : (
        <ItemList items={items || []} chamadoId={chamadoId} />
      )}

      {/* Add Item Dialog */}
      <Dialog open={itemDialogOpen} onClose={() => setItemDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Adicionar Item</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="descricao"
              label="Descrição"
              name="descricao"
              value={newItem.descricao}
              onChange={handleNewItemChange}
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="quantidade"
                  label="Quantidade"
                  name="quantidade"
                  type="number"
                  inputProps={{ min: 1 }}
                  value={newItem.quantidade}
                  onChange={handleNewItemChange}
                />
              </Box>
              <Box>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="valor_unitario"
                  label="Valor Unitário (R$)"
                  name="valor_unitario"
                  type="number"
                  inputProps={{ min: 0, step: 0.01 }}
                  value={newItem.valor_unitario}
                  onChange={handleNewItemChange}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setItemDialogOpen(false)}>Cancelar</Button>
          <Button 
            onClick={handleAddItem}
            disabled={addItem.isPending || !newItem.descricao || newItem.quantidade < 1}
          >
            {addItem.isPending ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChamadoDetail; 