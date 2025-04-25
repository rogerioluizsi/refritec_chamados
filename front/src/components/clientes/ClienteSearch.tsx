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
} from '@mui/material';
import { Search as SearchIcon, Phone as PhoneIcon, Person as PersonIcon, Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import { useClientes } from '../../hooks/useClientes';
import { useNavigate } from 'react-router-dom';

const ClienteSearch: React.FC = () => {
  const navigate = useNavigate();
  const { useListClientes, useClienteByTelefone } = useClientes();
  
  const [searchType, setSearchType] = useState<'nome' | 'telefone'>('nome');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  
  const { data: clientesData, isLoading: isLoadingClientes } = useListClientes(
    page,
    10,
    searchType === 'nome' ? searchTerm : undefined,
    searchType === 'telefone' ? searchTerm : undefined,
  );
  
  const { data: clienteByTelefone, isLoading: isLoadingByTelefone } = useClienteByTelefone(
    searchType === 'telefone' ? searchTerm : ''
  );

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setSubmitted(false);
  };
  
  const handleSearchTypeChange = (type: 'nome' | 'telefone') => {
    setSearchType(type);
    setSearchTerm('');
    setSubmitted(false);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSubmitted(true);
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
    submitted && 
    searchTerm.length > 0 && 
    !isLoadingClientes && 
    !isLoadingByTelefone && 
    ((searchType === 'nome' && clientesData?.items.length === 0) || 
     (searchType === 'telefone' && !clienteByTelefone));

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Buscar Cliente
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Button
            variant={searchType === 'nome' ? 'contained' : 'outlined'}
            startIcon={<PersonIcon />}
            onClick={() => handleSearchTypeChange('nome')}
            sx={{ mr: 1 }}
          >
            Por Nome
          </Button>
          <Button
            variant={searchType === 'telefone' ? 'contained' : 'outlined'}
            startIcon={<PhoneIcon />}
            onClick={() => handleSearchTypeChange('telefone')}
          >
            Por Telefone
          </Button>
        </Box>
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={9}>
              <TextField
                fullWidth
                id="search"
                label={`Buscar por ${searchType === 'nome' ? 'nome' : 'telefone'}`}
                value={searchTerm}
                onChange={handleSearchInputChange}
                placeholder={searchType === 'nome' ? "Digite o nome do cliente" : "Digite o telefone (somente números)"}
                inputProps={{
                  maxLength: searchType === 'telefone' ? 11 : undefined,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                fullWidth
                type="submit"
                variant="contained"
                startIcon={<SearchIcon />}
                sx={{ height: '56px' }}
                disabled={searchTerm.length === 0}
              >
                Buscar
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      {submitted && searchTerm.length > 0 && (
        <Paper elevation={1} sx={{ p: 2 }}>
          <Typography variant="h6" component="h3" gutterBottom>
            Resultados da Busca
          </Typography>
          
          {isLoadingClientes || isLoadingByTelefone ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : noResultsFound ? (
            <Alert severity="info">
              Nenhum cliente encontrado para a busca "{searchTerm}".
            </Alert>
          ) : searchType === 'telefone' && clienteByTelefone ? (
            <List>
              <ListItem
                secondaryAction={
                  <Box>
                    <IconButton 
                      edge="end" 
                      aria-label="edit" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCliente(clienteByTelefone.id_cliente);
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
                        handleCriarChamado(clienteByTelefone.id_cliente, clienteByTelefone.nome);
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemButton onClick={() => handleClienteClick(clienteByTelefone.id_cliente)}>
                  <ListItemText
                    primary={clienteByTelefone.nome}
                    secondary={`Telefone: ${clienteByTelefone.telefone} | Endereço: ${clienteByTelefone.endereco}`}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          ) : searchType === 'nome' && clientesData?.items ? (
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