import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
} from '@mui/material';

interface Item {
  id_item?: number;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
}

interface ItemListProps {
  items: Item[];
  chamadoId: number;
}

const ItemList: React.FC<ItemListProps> = ({ items }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };
  
  const calculateTotal = () => {
    return items.reduce((total, item) => {
      return total + (item.quantidade * item.valor_unitario);
    }, 0);
  };

  if (items.length === 0) {
    return (
      <Typography variant="body1" color="textSecondary" align="center" py={3}>
        Nenhum item adicionado a este chamado.
      </Typography>
    );
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Descrição</TableCell>
              <TableCell align="right">Quantidade</TableCell>
              <TableCell align="right">Valor Unitário</TableCell>
              <TableCell align="right">Valor Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={item.id_item || index}>
                <TableCell>{item.descricao}</TableCell>
                <TableCell align="right">{item.quantidade}</TableCell>
                <TableCell align="right">{formatCurrency(item.valor_unitario)}</TableCell>
                <TableCell align="right">
                  {formatCurrency(item.quantidade * item.valor_unitario)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box display="flex" justifyContent="flex-end" mt={2}>
        <Typography variant="h6">
          Total: {formatCurrency(calculateTotal())}
        </Typography>
      </Box>
    </>
  );
};

export default ItemList; 