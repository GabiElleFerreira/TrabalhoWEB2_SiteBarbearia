-- ========================================================
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
ON CONFLICT DO NOTHING;