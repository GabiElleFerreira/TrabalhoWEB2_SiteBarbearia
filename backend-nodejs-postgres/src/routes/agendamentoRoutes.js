import { Router } from 'express';
import { criarAgendamento, listarAgendamentos } from '../controllers/agendamentoController.js';

const router = Router();

// Rota chamada pelo formulário de agendamento do site
router.post('/', criarAgendamento);

// Rota chamada pelo Painel de Gestão dos Barbeiros
router.get('/', listarAgendamentos);

export default router;