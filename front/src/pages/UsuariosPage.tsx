import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { api } from '../api/api';

// User type
interface User {
  username: string;
  nome: string;
  role: string;
  ativo: boolean;
}

const roleOptions = [
  { value: 'administrador', label: 'Administrador' },
  { value: 'gerente', label: 'Gerente' },
  { value: 'funcionario', label: 'Funcionário' },
];

const UsuariosPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form, setForm] = useState({ username: '', nome: '', password: '', role: 'funcionario' });
  const [error, setError] = useState('');

  const userRole = localStorage.getItem('user_role');

  // Only allow administrador or gerente
  useEffect(() => {
    if (userRole !== 'administrador' && userRole !== 'gerente') {
      window.location.href = '/';
    }
  }, [userRole]);

  // Fetch users (requires backend GET /users endpoint)
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await api.get('/users');
        setUsers(res.data);
      } catch (e: any) {
        setError('Erro ao buscar usuários');
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  // Handlers for dialogs
  const handleAddOpen = () => {
    setForm({ username: '', nome: '', password: '', role: 'funcionario' });
    setAddOpen(true);
  };
  const handleAddClose = () => setAddOpen(false);
  const handleEditOpen = (user: User) => {
    setSelectedUser(user);
    setForm({ username: user.username, nome: user.nome, password: '', role: user.role });
    setEditOpen(true);
  };
  const handleEditClose = () => setEditOpen(false);
  const handleDeleteOpen = (user: User) => {
    setSelectedUser(user);
    setDeleteOpen(true);
  };
  const handleDeleteClose = () => setDeleteOpen(false);

  // Add user
  const handleAddUser = async () => {
    setError('');
    try {
      await api.post('/users', form, { params: { current_user_role: userRole } });
      setAddOpen(false);
      window.location.reload();
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Erro ao criar usuário');
    }
  };

  // Edit user
  const handleEditUser = async () => {
    setError('');
    try {
      await api.put(`/users/${selectedUser?.username}`, form, { params: { current_user_role: userRole } });
      setEditOpen(false);
      window.location.reload();
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Erro ao editar usuário');
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    setError('');
    try {
      await api.delete(`/users/${selectedUser?.username}`, { params: { current_user_role: userRole } });
      setDeleteOpen(false);
      window.location.reload();
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Erro ao excluir usuário');
    }
  };

  // Only administrador can add all roles, gerente only funcionario
  const availableRoles = userRole === 'administrador' ? roleOptions : roleOptions.filter(r => r.value === 'funcionario');

  return (
    <Box p={3}>
      {/* <Typography variant="h4" gutterBottom>Usuários</Typography> */}
      <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddOpen} sx={{ mb: 2 }}>
        Criar Usuário
      </Button>
      {error && <Typography color="error">{error}</Typography>}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Usuário</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Ativo</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.username}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.nome}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.ativo ? 'Sim' : 'Não'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditOpen(user)}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDeleteOpen(user)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add User Dialog */}
      <Dialog open={addOpen} onClose={handleAddClose}>
        <DialogTitle>Criar Usuário</DialogTitle>
        <DialogContent>
          <TextField label="Usuário" fullWidth margin="normal" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
          <TextField label="Nome" fullWidth margin="normal" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
          <TextField label="Senha" type="password" fullWidth margin="normal" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          <TextField select label="Tipo" fullWidth margin="normal" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
            {availableRoles.map(option => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddClose}>Cancelar</Button>
          <Button onClick={handleAddUser} variant="contained">Criar</Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editOpen} onClose={handleEditClose}>
        <DialogTitle>Editar Usuário</DialogTitle>
        <DialogContent>
          <TextField label="Nome" fullWidth margin="normal" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
          <TextField label="Senha (opcional)" type="password" fullWidth margin="normal" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          <TextField select label="Tipo" fullWidth margin="normal" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
            {availableRoles.map(option => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancelar</Button>
          <Button onClick={handleEditUser} variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={deleteOpen} onClose={handleDeleteClose}>
        <DialogTitle>Excluir Usuário</DialogTitle>
        <DialogContent>
          <Typography>Tem certeza que deseja excluir o usuário {selectedUser?.username}?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose}>Cancelar</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">Excluir</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsuariosPage; 