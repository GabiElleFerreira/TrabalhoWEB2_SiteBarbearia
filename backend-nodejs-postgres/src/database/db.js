import pg from 'pg';
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
export const query = (text, params) => pool.query(text, params);