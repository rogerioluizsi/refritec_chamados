import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Layout from './components/layout/Layout';
import theme from './theme/theme';
import { Calendar } from './components/Calendar';

// Pages
import HomePage from './pages/HomePage';
import ChamadoDetailPage from './pages/ChamadoDetailPage';
import ClienteDetailPage from './pages/ClienteDetailPage';
import ClienteCriarPage from './pages/ClienteCriarPage';
import ClienteBuscarPage from './pages/ClienteBuscarPage';
import EstatisticasPage from './pages/EstatisticasPage';
import ChamadoCriarPage from './pages/ChamadoCriarPage';

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
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/chamados/:id" element={<ChamadoDetailPage />} />
              <Route path="/chamados/criar" element={<ChamadoCriarPage />} />
              <Route path="/clientes/criar" element={<ClienteCriarPage />} />
              <Route path="/clientes/buscar" element={<ClienteBuscarPage />} />
              <Route path="/clientes/:id" element={<ClienteDetailPage />} />
              <Route path="/estatisticas" element={<EstatisticasPage />} />
              <Route path="/calendario" element={<Calendar />} />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
