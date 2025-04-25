import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useClientes } from '../../hooks/useClientes';
import { CreateClienteDto, Cliente } from '../../types';

interface ClienteFormProps {
  onSuccess?: () => void;
}

const ClienteForm: React.FC<ClienteFormProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const { useCreateCliente, useClienteByTelefone } = useClientes();
  const createCliente = useCreateCliente();
  const [searchTelefone, setSearchTelefone] = useState('');
  const searchCliente = useClienteByTelefone(searchTelefone);
  
  const [formData, setFormData] = useState<CreateClienteDto>({
    telefone: '',
    nome: '',
    endereco: '',
  });
  
  const [formErrors, setFormErrors] = useState<{
    telefone?: string;
    nome?: string;
    endereco?: string;
  }>({});
  
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [foundClient, setFoundClient] = useState<{ id: number; nome: string } | null>(null);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when field is edited
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined,
      });
    }

    // Search for client when phone number is complete
    if (name === 'telefone' && value.length >= 10) {
      setSearchTelefone(value);
      try {
        const result = await searchCliente.refetch();
        if (result.data) {
          setFoundClient({ id: result.data.id_cliente, nome: result.data.nome });
          setFormData({
            ...formData,
            nome: result.data.nome,
            endereco: result.data.endereco,
            telefone: value
          });
        } else {
          setFoundClient(null);
        }
      } catch (error) {
        console.error('Error searching for client:', error);
        setFoundClient(null);
      }
    } else if (name === 'telefone') {
      setFoundClient(null);
    }
  };

  const handleCreateChamado = () => {
    if (foundClient) {
      navigate('/chamados/criar', {
        state: {
          clienteId: foundClient.id,
          clienteNome: foundClient.nome
        }
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: {
      telefone?: string;
      nome?: string;
      endereco?: string;
    } = {};
    
    if (!formData.telefone) {
      errors.telefone = 'Telefone é obrigatório';
    } else if (!/^\d{10,11}$/.test(formData.telefone)) {
      errors.telefone = 'Telefone deve conter 10 ou 11 dígitos';
    }
    
    if (!formData.nome) {
      errors.nome = 'Nome é obrigatório';
    }
    
    if (!formData.endereco) {
      errors.endereco = 'Endereço é obrigatório';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      createCliente.mutate(formData, {
        onSuccess: () => {
          setFormData({
            telefone: '',
            nome: '',
            endereco: '',
          });
          setSubmitSuccess(true);
          
          if (onSuccess) {
            onSuccess();
          }
          
          // Reset success message after 3 seconds
          setTimeout(() => {
            setSubmitSuccess(false);
          }, 3000);
        },
        onError: (error: any) => {
          if (error.response?.data?.detail === 'Cliente with this telefone already exists') {
            setFormErrors({
              ...formErrors,
              telefone: 'Este telefone já está cadastrado',
            });
          }
        },
      });
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Cadastrar Novo Cliente
      </Typography>
      
      {submitSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Cliente cadastrado com sucesso!
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              required
              id="telefone"
              name="telefone"
              label="Telefone"
              placeholder="Ex: 11987654321"
              value={formData.telefone}
              onChange={handleInputChange}
              error={!!formErrors.telefone}
              helperText={formErrors.telefone}
              margin="normal"
              inputProps={{
                maxLength: 11,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              required
              id="nome"
              name="nome"
              label="Nome"
              value={formData.nome}
              onChange={handleInputChange}
              error={!!formErrors.nome}
              helperText={formErrors.nome}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              id="endereco"
              name="endereco"
              label="Endereço"
              value={formData.endereco}
              onChange={handleInputChange}
              error={!!formErrors.endereco}
              helperText={formErrors.endereco}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={createCliente.isPending || !!foundClient}
              >
                {createCliente.isPending ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    Cadastrando...
                  </>
                ) : (
                  'Cadastrar Cliente'
                )}
              </Button>
              
              {foundClient && (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleCreateChamado}
                >
                  Criar Novo Chamado
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default ClienteForm; 