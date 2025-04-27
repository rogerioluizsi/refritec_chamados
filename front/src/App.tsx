import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProvider } from './contexts/UserContext';

import Layout from './components/layout/Layout';
import theme from './theme/theme';
import { Calendar } from './components/Calendar';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';

// Pages
import HomePage from './pages/HomePage';
import ChamadoDetailPage from './pages/ChamadoDetailPage';
import ClienteDetailPage from './pages/ClienteDetailPage';
import ClienteCriarPage from './pages/ClienteCriarPage';
import ClienteBuscarPage from './pages/ClienteBuscarPage';
import EstatisticasPage from './pages/EstatisticasPage';
import ChamadoCriarPage from './pages/ChamadoCriarPage';
import ClienteEditarPage from './pages/ClienteEditarPage';
import UsuariosPage from './pages/UsuariosPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <UserProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <Routes>
              {/* Public route */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Layout><HomePage /></Layout>} />
                <Route path="/chamados/:id" element={<Layout><ChamadoDetailPage /></Layout>} />
                <Route path="/chamados/criar" element={<Layout><ChamadoCriarPage /></Layout>} />
                <Route path="/clientes/criar" element={<Layout><ClienteCriarPage /></Layout>} />
                <Route path="/clientes/buscar" element={<Layout><ClienteBuscarPage /></Layout>} />
                <Route path="/clientes/editar/:id" element={<Layout><ClienteEditarPage /></Layout>} />
                <Route path="/clientes/:id" element={<Layout><ClienteDetailPage /></Layout>} />
                <Route path="/estatisticas" element={<Layout><EstatisticasPage /></Layout>} />
                <Route path="/calendario" element={<Layout><Calendar /></Layout>} />
                <Route path="/usuarios" element={<Layout><UsuariosPage /></Layout>} />
              </Route>
            </Routes>
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </UserProvider>
  );
}

export default App;
