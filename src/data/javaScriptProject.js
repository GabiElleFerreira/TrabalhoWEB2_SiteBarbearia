export const PROJETO_JAVASCRIPT = [
  {
    caminho: 'server.js',
    nome: 'server.js',
    categoria: 'SERVER',
    descricao: 'Servidor Express principal em JavaScript com middlewares CORS, JSON e rotas da barbearia.',
    conteudo: `import express from 'express';
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
  console.log(\`💈 Servidor Vintage&Co rodando na porta \${PORT}\`);
  await testarConexao();
});`
  },
  {
    caminho: 'src/database/db.js',
    nome: 'db.js',
    categoria: 'DATABASE',
    descricao: 'Arquivo de conexão direta com o PostgreSQL usando a biblioteca "pg" (Connection Pool).',
    conteudo: `import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Pool de conexões otimizado com PostgreSQL
export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'vintage_secret_pwd',
  database: process.env.DB_NAME || 'vintage_barbearia',
  max: 20, // máximo de 20 conexões simultâneas
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Função para testar conexão com o banco
export async function testarConexao() {
  try {
    const client = await pool.connect();
    console.log('🐘 Conectado com sucesso ao banco PostgreSQL!');
    client.release();
  } catch (error) {
    console.error('❌ Erro ao conectar ao PostgreSQL:', error.message);
  }
}

// Helper para executar consultas SQL parametrizadas seguras
export const query = (text, params) => pool.query(text, params);`
  },
  {
    caminho: 'src/services/agendamentoService.js',
    nome: 'agendamentoService.js',
    categoria: 'SERVICE',
    descricao: 'Arquivo central que JUNTA os dados do cliente, valida conflito de horário e salva no PostgreSQL.',
    conteudo: `import { query } from '../database/db.js';

/**
 * SERVIÇO QUE FAZ A JUNÇÃO DOS DADOS DO SITE PARA O BANCO POSTGRESQL
 */
export async function criarAgendamentoService({
  barbeiroId,
  servicoId,
  data,
  horaInicio,
  clienteNome,
  clienteTelefone,
  clienteEmail,
  observacoes
}) {
  // 1. Buscar dados do serviço selecionado (preço e duração)
  const servicoResult = await query(
    'SELECT id, nome, preco, duracao_minutos FROM tb_servico WHERE id = $1 AND ativo = TRUE',
    [servicoId]
  );
  if (servicoResult.rows.length === 0) {
    throw new Error('Serviço não encontrado ou inativo.');
  }
  const servico = servicoResult.rows[0];

  // 2. Calcular data/hora de término com base na duração do corte/barba
  const [hora, min] = horaInicio.split(':').map(Number);
  const dataHoraInicio = new Date(\`\${data}T\${horaInicio}:00\`);
  const dataHoraFim = new Date(dataHoraInicio.getTime() + servico.duracao_minutos * 60000);

  // 3. PREVENÇÃO DE CONFLITO: verificar se o barbeiro já tem agendamento sobreposto no PostgreSQL
  // Fórmula: novoInicio < fimExistente AND novoFim > inicioExistente
  const conflitoResult = await query(
    \`SELECT id FROM tb_agendamento
     WHERE barbeiro_id = $1
       AND status != 'CANCELADO'
       AND ($2 < data_hora_fim AND $3 > data_hora_inicio)
     LIMIT 1\`,
    [barbeiroId, dataHoraInicio, dataHoraFim]
  );

  if (conflitoResult.rows.length > 0) {
    throw new Error('Horário indisponível! O barbeiro já possui agendamento neste intervalo.');
  }

  // 4. Cadastrar ou localizar o cliente pelo telefone (DDD 85)
  let clienteId;
  const clienteExistente = await query(
    'SELECT id, pontos_fidelidade FROM tb_cliente WHERE telefone = $1',
    [clienteTelefone]
  );

  const pontosGanhos = Math.floor(Number(servico.preco) * 10); // R$ 1 = 10 pontos

  if (clienteExistente.rows.length > 0) {
    clienteId = clienteExistente.rows[0].id;
    // Atualiza pontos de fidelidade e quantidade de visitas
    await query(
      \`UPDATE tb_cliente 
       SET pontos_fidelidade = pontos_fidelidade + $1,
           total_atendimentos = total_atendimentos + 1,
           nome = COALESCE($2, nome),
           email = COALESCE($3, email)
       WHERE id = $4\`,
      [pontosGanhos, clienteNome, clienteEmail, clienteId]
    );
  } else {
    // Insere novo cliente com código fidelidade exclusivo
    const codigoFidelidade = 'VC-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const novoCliente = await query(
      \`INSERT INTO tb_cliente (nome, telefone, email, pontos_fidelidade, codigo_fidelidade, total_atendimentos)
       VALUES ($1, $2, $3, $4, $5, 1)
       RETURNING id\`,
      [clienteNome, clienteTelefone, clienteEmail, pontosGanhos, codigoFidelidade]
    );
    clienteId = novoCliente.rows[0].id;
  }

  // 5. Inserir o agendamento final no PostgreSQL
  const codigoReserva = 'VC-' + Math.floor(1000 + Math.random() * 9000);
  const agendamentoInserido = await query(
    \`INSERT INTO tb_agendamento 
       (codigo, cliente_id, barbeiro_id, servico_id, data_hora_inicio, data_hora_fim, status, observacoes)
     VALUES ($1, $2, $3, $4, $5, $6, 'CONFIRMADO', $7)
     RETURNING id, codigo, data_hora_inicio, data_hora_fim, status\`,
    [codigoReserva, clienteId, barbeiroId, servicoId, dataHoraInicio, dataHoraFim, observacoes]
  );

  return {
    ...agendamentoInserido.rows[0],
    servicoNome: servico.nome,
    servicoPreco: servico.preco,
    pontosGanhos
  };
}`
  },
  {
    caminho: 'src/controllers/agendamentoController.js',
    nome: 'agendamentoController.js',
    categoria: 'CONTROLLER',
    descricao: 'Recebe as requisições HTTP do frontend, valida os dados e envia resposta em JSON.',
    conteudo: `import { criarAgendamentoService } from '../services/agendamentoService.js';
import { query } from '../database/db.js';

// POST /api/agendamentos - Criação de agendamento vindo do site
export async function criarAgendamento(req, res) {
  try {
    const {
      barbeiroId,
      servicoId,
      data,
      horaInicio,
      clienteNome,
      clienteTelefone,
      clienteEmail,
      observacoes
    } = req.body;

    // Validações básicas de entrada
    if (!barbeiroId || !servicoId || !data || !horaInicio || !clienteNome || !clienteTelefone) {
      return res.status(400).json({
        erro: 'Dados incompletos. Todos os campos obrigatórios devem ser preenchidos.'
      });
    }

    const agendamento = await criarAgendamentoService({
      barbeiroId,
      servicoId,
      data,
      horaInicio,
      clienteNome,
      clienteTelefone,
      clienteEmail,
      observacoes
    });

    return res.status(201).json({
      mensagem: 'Agendamento confirmado com sucesso!',
      dados: agendamento
    });
  } catch (error) {
    console.error('Erro ao agendar:', error.message);
    const status = error.message.includes('Horário indisponível') ? 409 : 500;
    return res.status(status).json({ erro: error.message });
  }
}

// GET /api/agendamentos - Lista agendamentos para o painel de gestão
export async function listarAgendamentos(req, res) {
  try {
    const { data, barbeiroId } = req.query;

    let sql = \`
      SELECT 
        a.id, a.codigo, a.data_hora_inicio, a.data_hora_fim, a.status, a.observacoes,
        c.nome AS cliente_nome, c.telefone AS cliente_telefone,
        b.nome AS barbeiro_nome,
        s.nome AS servico_nome, s.preco AS servico_preco
      FROM tb_agendamento a
      JOIN tb_cliente c ON a.cliente_id = c.id
      JOIN tb_barbeiro b ON a.barbeiro_id = b.id
      JOIN tb_servico s ON a.servico_id = s.id
      WHERE 1=1
    \`;
    const params = [];

    if (data) {
      params.push(data);
      sql += \` AND DATE(a.data_hora_inicio) = $\${params.length}\`;
    }

    if (barbeiroId) {
      params.push(barbeiroId);
      sql += \` AND a.barbeiro_id = $\${params.length}\`;
    }

    sql += ' ORDER BY a.data_hora_inicio ASC';

    const result = await query(sql, params);
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}`
  },
  {
    caminho: 'src/routes/agendamentoRoutes.js',
    nome: 'agendamentoRoutes.js',
    categoria: 'ROUTES',
    descricao: 'Declaração das rotas REST de agendamento usando Express Router.',
    conteudo: `import { Router } from 'express';
import { criarAgendamento, listarAgendamentos } from '../controllers/agendamentoController.js';

const router = Router();

// Rota chamada pelo formulário de agendamento do site
router.post('/', criarAgendamento);

// Rota chamada pelo Painel de Gestão dos Barbeiros
router.get('/', listarAgendamentos);

export default router;`
  },
  {
    caminho: 'schema.sql',
    nome: 'schema.sql',
    categoria: 'DATABASE',
    descricao: 'Script DDL completo do PostgreSQL com chaves estrangeiras, índices e dados iniciais de Maracanaú/CE.',
    conteudo: `-- ========================================================
-- Schema DDL: Vintage&Co Barbearia (PostgreSQL)
-- ========================================================

CREATE TABLE IF NOT EXISTS tb_cliente (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(120),
    pontos_fidelidade INT NOT NULL DEFAULT 0,
    codigo_fidelidade VARCHAR(30) UNIQUE,
    total_atendimentos INT NOT NULL DEFAULT 0,
    data_cadastro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tb_barbeiro (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cargo VARCHAR(50) NOT NULL,
    especialidade VARCHAR(100) NOT NULL,
    foto_url VARCHAR(255),
    avaliacao NUMERIC(2, 1) DEFAULT 5.0,
    anos_experiencia INT NOT NULL DEFAULT 1,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    horario_inicio TIME NOT NULL DEFAULT '09:00:00',
    horario_fim TIME NOT NULL DEFAULT '19:00:00'
);

CREATE TABLE IF NOT EXISTS tb_servico (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(80) NOT NULL,
    descricao TEXT,
    preco NUMERIC(10, 2) NOT NULL,
    duracao_minutos INT NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS tb_agendamento (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    cliente_id INT NOT NULL REFERENCES tb_cliente(id) ON DELETE CASCADE,
    barbeiro_id INT NOT NULL REFERENCES tb_barbeiro(id) ON DELETE RESTRICT,
    servico_id INT NOT NULL REFERENCES tb_servico(id) ON DELETE RESTRICT,
    data_hora_inicio TIMESTAMP NOT NULL,
    data_hora_fim TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMADO',
    observacoes TEXT,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices de busca de horários e prevenção de conflitos
CREATE INDEX IF NOT EXISTS idx_agendamento_barbeiro_horario 
    ON tb_agendamento(barbeiro_id, data_hora_inicio, data_hora_fim, status);

CREATE INDEX IF NOT EXISTS idx_cliente_telefone_ce 
    ON tb_cliente(telefone);

-- Dados Iniciais com DDD 85 (Ceará)
INSERT INTO tb_barbeiro (nome, cargo, especialidade, avaliacao, anos_experiencia, ativo)
VALUES 
  ('Rodrigo Menezes', 'MESTRE BARBEIRO', 'Corte Clássico & Navalha', 4.9, 18, TRUE),
  ('Felipe Andrade', 'BARBEIRO SÊNIOR', 'Barba Esculpida & Bigode', 4.8, 11, TRUE),
  ('Caio Drummond', 'BARBEIRO ARTÍSTICO', 'Degradê & Desenho', 4.7, 9, TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO tb_servico (nome, descricao, preco, duracao_minutos)
VALUES
  ('Corte Clássico', 'Corte tradicional com acabamento perfeito na navalha.', 55.00, 45),
  ('Barba Completa', 'Aparar, modelar e finalizar com produtos premium.', 45.00, 40),
  ('Corte + Barba', 'O combo completo para o gentleman moderno.', 90.00, 75),
  ('Bigode & Cavanhaque', 'Modelagem precisa com navalha quente.', 30.00, 25),
  ('Tratamento Capilar', 'Hidratação profunda e tônico energizante.', 70.00, 60),
  ('Hot Towel Shave', 'Barbear tradicional com toalha quente e navalha reta.', 65.00, 50)
ON CONFLICT DO NOTHING;`
  },
  {
    caminho: 'package.json',
    nome: 'package.json',
    categoria: 'CONFIG',
    descricao: 'Configuração do projeto Node.js com Express e driver PostgreSQL "pg".',
    conteudo: `{
  "name": "vintage-barbearia-api",
  "version": "1.0.0",
  "type": "module",
  "description": "Backend JavaScript em Node.js com Express e PostgreSQL para agendamento de barbearia",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.21.2",
    "pg": "^8.12.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5"
  },
  "devDependencies": {
    "nodemon": "^3.1.4"
  }
}`
  },
  {
    caminho: 'docker-compose.yml',
    nome: 'docker-compose.yml',
    categoria: 'DATABASE',
    descricao: 'Orquestração do PostgreSQL 16 para rodar o banco localmente em um clique.',
    conteudo: `version: '3.8'

services:
  postgres-db:
    image: postgres:16-alpine
    container_name: vintage_postgres_js
    restart: always
    environment:
      POSTGRES_DB: vintage_barbearia
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: vintage_secret_pwd
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./schema.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d vintage_barbearia"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:`
  }
];
