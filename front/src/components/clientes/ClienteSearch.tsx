import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Alert,
  Pagination,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon, Phone as PhoneIcon, Person as PersonIcon, Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import { useClientes } from '../../hooks/useClientes';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from 'use-debounce';

const ClienteSearch: React.FC = () => {
  const navigate = useNavigate();
  const { useListClientes } = useClientes();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300); // 300ms debounce
  const [page, setPage] = useState(1);
  
  // Real-time search using the unified search parameter
  const { data: clientesData, isLoading: isLoadingClientes } = useListClientes(
    page,
    10,
    debouncedSearchTerm, // Unified search term for both name and phone
    undefined,
    undefined
  );

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page on new search
  };
  
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };
  
  const handleClienteClick = (clienteId: number) => {
    navigate(`/clientes/${clienteId}`);
  };

  const handleEditCliente = (clienteId: number) => {
    navigate(`/clientes/editar/${clienteId}`);
  };

  const handleCriarChamado = (clienteId: number, clienteNome: string) => {
    navigate('/chamados/criar', { state: { clienteId, clienteNome } });
  };

  const noResultsFound = 
    debouncedSearchTerm.length > 0 && 
    !isLoadingClientes && 
    clientesData?.items.length === 0;

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Buscar Cliente
        </Typography>
        
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="search"
                label="Buscar cliente por nome ou telefone"
                value={searchTerm}
                onChange={handleSearchInputChange}
                placeholder="Digite nome ou telefone para buscar..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      {debouncedSearchTerm.length > 0 && (
        <Paper elevation={1} sx={{ p: 2 }}>
          <Typography variant="h6" component="h3" gutterBottom>
            Resultados da Busca
          </Typography>
          
          {isLoadingClientes ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : noResultsFound ? (
            <Alert severity="info">
              Nenhum cliente encontrado para a busca "{debouncedSearchTerm}".
            </Alert>
          ) : clientesData?.items ? (
            <>
              <List>
                {clientesData.items.map((cliente, index) => (
                  <React.Fragment key={cliente.id_cliente}>
                    {index > 0 && <Divider />}
                    <ListItem
                      secondaryAction={
                        <Box>
                          <IconButton 
                            edge="end" 
                            aria-label="edit" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCliente(cliente.id_cliente);
                            }}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            edge="end" 
                            aria-label="criar chamado"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCriarChamado(cliente.id_cliente, cliente.nome);
                            }}
                          >
                            <AddIcon />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemButton onClick={() => handleClienteClick(cliente.id_cliente)}>
                        <ListItemText
                          primary={cliente.nome}
                          secondary={`Telefone: ${cliente.telefone} | Endereço: ${cliente.endereco}`}
                        />
                      </ListItemButton>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
              
              {clientesData.total_pages > 1 && (
                <Box display="flex" justifyContent="center" mt={2}>
                  <Pagination
                    count={clientesData.total_pages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Box>
              )}
            </>
          ) : null}
        </Paper>
      )}
    </Box>
  );
};

export default ClienteSearch; 