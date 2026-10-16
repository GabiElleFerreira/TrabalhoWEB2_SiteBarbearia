import { criarAgendamentoService } from '../services/agendamentoService.js';
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

    let sql = `
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
    `;
    const params = [];

    if (data) {
      params.push(data);
      sql += ` AND DATE(a.data_hora_inicio) = $${params.length}`;
    }

    if (barbeiroId) {
      params.push(barbeiroId);
      sql += ` AND a.barbeiro_id = $${params.length}`;
    }

    sql += ' ORDER BY a.data_hora_inicio ASC';

    const result = await query(sql, params);
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}