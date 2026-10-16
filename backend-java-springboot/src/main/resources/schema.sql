-- ========================================================
-- Schema DDL: Vintage&Co Barbearia (PostgreSQL)
-- ========================================================

CREATE TABLE IF NOT EXISTS tb_cliente (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(120),
    pontos_fidelidade INT NOT NULL DEFAULT 0,
    codigo_fidelidade VARCHAR(30) UNIQUE,
    total_atendimentos INT NOT NULL DEFAULT 0,
    data_cadastro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tb_barbeiro (
    id BIGSERIAL PRIMARY KEY,
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
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(80) NOT NULL,
    descricao TEXT,
    preco NUMERIC(10, 2) NOT NULL,
    duracao_minutos INT NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS tb_agendamento (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    cliente_id BIGINT NOT NULL REFERENCES tb_cliente(id),
    barbeiro_id BIGINT NOT NULL REFERENCES tb_barbeiro(id),
    servico_id BIGINT NOT NULL REFERENCES tb_servico(id),
    data_hora_inicio TIMESTAMP NOT NULL,
    data_hora_fim TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMADO',
    observacoes TEXT,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agendamento_barbeiro_data 
    ON tb_agendamento(barbeiro_id, data_hora_inicio, data_hora_fim, status);

-- Carga inicial com DDD 85
INSERT INTO tb_barbeiro (nome, cargo, especialidade, avaliacao, anos_experiencia, ativo, horario_inicio, horario_fim)
VALUES 
  ('Rodrigo Menezes', 'MESTRE BARBEIRO', 'Corte Clássico & Navalha', 4.9, 18, TRUE, '09:00:00', '19:00:00'),
  ('Felipe Andrade', 'BARBEIRO SÊNIOR', 'Barba Esculpida & Bigode', 4.8, 11, TRUE, '09:00:00', '19:00:00'),
  ('Caio Drummond', 'BARBEIRO ARTÍSTICO', 'Degradê & Desenho', 4.7, 9, TRUE, '09:00:00', '19:00:00')
ON CONFLICT DO NOTHING;

INSERT INTO tb_servico (nome, descricao, preco, duracao_minutos, ativo)
VALUES
  ('Corte Clássico', 'Corte tradicional com acabamento na navalha.', 55.00, 45, TRUE),
  ('Barba Completa', 'Aparar, modelar e hidratar com óleos premium.', 45.00, 40, TRUE),
  ('Corte + Barba', 'O combo supremo para o gentleman clássico.', 90.00, 75, TRUE),
  ('Bigode & Cavanhaque', 'Modelagem precisa com navalha quente.', 30.00, 25, TRUE),
  ('Tratamento Capilar', 'Hidratação profunda e massagem craniana.', 70.00, 60, TRUE),
  ('Hot Towel Shave', 'Barbear clássico com toalha a vapor.', 65.00, 50, TRUE)
ON CONFLICT DO NOTHING;