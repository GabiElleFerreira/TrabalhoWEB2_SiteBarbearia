import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import agendamentoRoutes from './src/routes/agendamentoRoutes.js';
import clienteRoutes from './src/routes/clienteRoutes.js';
import { testarConexao } from './src/database/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares essenciais
app.use(cors());
app.use(express.json());

// Rotas da API da Barbearia Vintage&Co
app.use('/api/agendamentos', agendamentoRoutes);
app.use('/api/clientes', clienteRoutes);

// Rota de saúde da API
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', barbearia: 'Vintage&Co', timestamp: new Date() });
});

// Inicialização do servidor após validar conexão com PostgreSQL
app.listen(PORT, async () => {
  console.log(`💈 Servidor Vintage&Co rodando na porta ${PORT}`);
  await testarConexao();
});