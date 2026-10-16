import { query } from '../database/db.js';

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
  const dataHoraInicio = new Date(`${data}T${horaInicio}:00`);
  const dataHoraFim = new Date(dataHoraInicio.getTime() + servico.duracao_minutos * 60000);

  // 3. PREVENÇÃO DE CONFLITO: verificar se o barbeiro já tem agendamento sobreposto no PostgreSQL
  // Fórmula: novoInicio < fimExistente AND novoFim > inicioExistente
  const conflitoResult = await query(
    `SELECT id FROM tb_agendamento
     WHERE barbeiro_id = $1
       AND status != 'CANCELADO'
       AND ($2 < data_hora_fim AND $3 > data_hora_inicio)
     LIMIT 1`,
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
      `UPDATE tb_cliente 
       SET pontos_fidelidade = pontos_fidelidade + $1,
           total_atendimentos = total_atendimentos + 1,
           nome = COALESCE($2, nome),
           email = COALESCE($3, email)
       WHERE id = $4`,
      [pontosGanhos, clienteNome, clienteEmail, clienteId]
    );
  } else {
    // Insere novo cliente com código fidelidade exclusivo
    const codigoFidelidade = 'VC-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const novoCliente = await query(
      `INSERT INTO tb_cliente (nome, telefone, email, pontos_fidelidade, codigo_fidelidade, total_atendimentos)
       VALUES ($1, $2, $3, $4, $5, 1)
       RETURNING id`,
      [clienteNome, clienteTelefone, clienteEmail, pontosGanhos, codigoFidelidade]
    );
    clienteId = novoCliente.rows[0].id;
  }

  // 5. Inserir o agendamento final no PostgreSQL
  const codigoReserva = 'VC-' + Math.floor(1000 + Math.random() * 9000);
  const agendamentoInserido = await query(
    `INSERT INTO tb_agendamento 
       (codigo, cliente_id, barbeiro_id, servico_id, data_hora_inicio, data_hora_fim, status, observacoes)
     VALUES ($1, $2, $3, $4, $5, $6, 'CONFIRMADO', $7)
     RETURNING id, codigo, data_hora_inicio, data_hora_fim, status`,
    [codigoReserva, clienteId, barbeiroId, servicoId, dataHoraInicio, dataHoraFim, observacoes]
  );

  return {
    ...agendamentoInserido.rows[0],
    servicoNome: servico.nome,
    servicoPreco: servico.preco,
    pontosGanhos
  };
}