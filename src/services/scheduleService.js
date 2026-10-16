import { AGENDAMENTOS_INICIAIS, BARBEIROS_INICIAIS, CLIENTES_INICIAIS, SERVICOS_INICIAIS, getHojeString, getAmanhaString } from '../data/mockData.js';

export { getHojeString, getAmanhaString };

const STORAGE_KEYS = {
  AGENDAMENTOS: 'vintage_agendamentos_v2',
  CLIENTES: 'vintage_clientes_v2',
  BARBEIROS: 'vintage_barbeiros_v2',
  SERVICOS: 'vintage_servicos_v2',
};

// Converte "HH:mm" em minutos desde meia-noite
export const horaParaMinutos = (horaStr) => {
  const [h, m] = horaStr.split(':').map(Number);
  return h * 60 + m;
};

// Converte minutos em "HH:mm"
export const minutosParaHora = (minutos) => {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

// Normaliza telefone garantindo DDD 85 se for 11 antigo
export const normalizarTelefoneCE = (tel) => {
  if (!tel) return '(85) 98765-4321';
  if (tel.startsWith('(11)')) {
    return tel.replace('(11)', '(85)');
  }
  return tel;
};

// Verifica sobreposição de dois intervalos [inicioA, fimA) e [inicioB, fimB)
export const verificarSobreposicao = (inicioA, fimA, inicioB, fimB) => {
  const minInicioA = horaParaMinutos(inicioA);
  const minFimA = horaParaMinutos(fimA);
  const minInicioB = horaParaMinutos(inicioB);
  const minFimB = horaParaMinutos(fimB);

  return minInicioA < minFimB && minFimA > minInicioB;
};

export const obterClientes = () => {
  const dados = localStorage.getItem(STORAGE_KEYS.CLIENTES);
  if (!dados) {
    localStorage.setItem(STORAGE_KEYS.CLIENTES, JSON.stringify(CLIENTES_INICIAIS));
    return CLIENTES_INICIAIS;
  }
  try {
    const parsed = JSON.parse(dados);
    return parsed.map((c) => ({
      ...c,
      telefone: normalizarTelefoneCE(c.telefone),
    }));
  } catch {
    return CLIENTES_INICIAIS;
  }
};

export const obterBarbeiros = () => {
  const dados = localStorage.getItem(STORAGE_KEYS.BARBEIROS);
  if (!dados) {
    localStorage.setItem(STORAGE_KEYS.BARBEIROS, JSON.stringify(BARBEIROS_INICIAIS));
    return BARBEIROS_INICIAIS;
  }
  try {
    return JSON.parse(dados);
  } catch {
    return BARBEIROS_INICIAIS;
  }
};

export const obterServicos = () => {
  const dados = localStorage.getItem(STORAGE_KEYS.SERVICOS);
  if (!dados) {
    localStorage.setItem(STORAGE_KEYS.SERVICOS, JSON.stringify(SERVICOS_INICIAIS));
    return SERVICOS_INICIAIS;
  }
  try {
    return JSON.parse(dados);
  } catch {
    return SERVICOS_INICIAIS;
  }
};

export const obterAgendamentos = () => {
  const dados = localStorage.getItem(STORAGE_KEYS.AGENDAMENTOS);
  if (!dados) {
    localStorage.setItem(STORAGE_KEYS.AGENDAMENTOS, JSON.stringify(AGENDAMENTOS_INICIAIS));
    return AGENDAMENTOS_INICIAIS;
  }
  try {
    const parsed = JSON.parse(dados);
    return parsed.map((a) => ({
      ...a,
      clienteTelefone: normalizarTelefoneCE(a.clienteTelefone),
    }));
  } catch {
    return AGENDAMENTOS_INICIAIS;
  }
};

export const obterSlotsDisponiveis = (barbeiroId, dataStr, duracaoMinutos) => {
  const barbeiros = obterBarbeiros();
  const barbeiro = barbeiros.find((b) => b.id === barbeiroId) || barbeiros[0];

  const agendamentos = obterAgendamentos().filter(
    (a) => a.barbeiroId === barbeiro.id && a.data === dataStr && a.status !== 'CANCELADO'
  );

  const inicioTrabalhoMin = horaParaMinutos(barbeiro.horarioInicio || '09:00');
  const fimTrabalhoMin = horaParaMinutos(barbeiro.horarioFim || '19:00');

  const intervaloPassoMin = 30;
  const slots = [];

  for (let minAtual = inicioTrabalhoMin; minAtual + duracaoMinutos <= fimTrabalhoMin; minAtual += intervaloPassoMin) {
    const horaInicio = minutosParaHora(minAtual);
    const horaFim = minutosParaHora(minAtual + duracaoMinutos);

    const conflitaAlmoco = verificarSobreposicao(horaInicio, horaFim, '12:30', '13:30');

    const conflitoExistente = agendamentos.find((agd) =>
      verificarSobreposicao(horaInicio, horaFim, agd.horaInicio, agd.horaFim)
    );

    if (conflitoExistente) {
      slots.push({
        horaInicio,
        horaFim,
        disponivel: false,
        motivoIndisponibilidade: `Horário ocupado (${conflitoExistente.servicoNome})`,
      });
    } else if (conflitaAlmoco) {
      slots.push({
        horaInicio,
        horaFim,
        disponivel: false,
        motivoIndisponibilidade: 'Horário de almoço e higienização',
      });
    } else {
      slots.push({
        horaInicio,
        horaFim,
        disponivel: true,
      });
    }
  }

  return slots;
};

export const salvarOuAtualizarCliente = (nome, telefone, email, pontosAdicionais = 0) => {
  const clientes = obterClientes();
  const telefoneLimpo = telefone.replace(/\D/g, '');
  
  let cliente = clientes.find(
    (c) => c.telefone.replace(/\D/g, '') === telefoneLimpo || (email && c.email.toLowerCase() === email.toLowerCase())
  );

  if (cliente) {
    cliente.pontosFidelidade += pontosAdicionais;
    cliente.totalAtendimentos += 1;
    if (nome) cliente.nome = nome;
    if (email) cliente.email = email;
    if (telefone) cliente.telefone = telefone;
  } else {
    const randomCode = `VC-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    cliente = {
      id: `cli-${Date.now()}`,
      nome,
      telefone,
      email: email || `${nome.toLowerCase().replace(/\s+/g, '')}@cliente.com`,
      pontosFidelidade: pontosAdicionais,
      codigoFidelidade: randomCode,
      dataCadastro: new Date().toISOString().split('T')[0],
      totalAtendimentos: 1,
    };
    clientes.push(cliente);
  }

  localStorage.setItem(STORAGE_KEYS.CLIENTES, JSON.stringify(clientes));
  return cliente;
};

export const criarAgendamento = (dados) => {
  const barbeiros = obterBarbeiros();
  const servicos = obterServicos();
  const agendamentos = obterAgendamentos();

  const barbeiro = barbeiros.find((b) => b.id === dados.barbeiroId);
  const servico = servicos.find((s) => s.id === dados.servicoId);

  if (!barbeiro) return { sucesso: false, mensagem: 'Barbeiro não encontrado.' };
  if (!servico) return { sucesso: false, mensagem: 'Serviço não encontrado.' };

  const minInicio = horaParaMinutos(dados.horaInicio);
  const minFim = minInicio + servico.duracaoMinutos;
  const horaFim = minutosParaHora(minFim);

  const conflito = agendamentos.some(
    (a) =>
      a.barbeiroId === barbeiro.id &&
      a.data === dados.data &&
      a.status !== 'CANCELADO' &&
      verificarSobreposicao(dados.horaInicio, horaFim, a.horaInicio, a.horaFim)
  );

  if (conflito) {
    return {
      sucesso: false,
      mensagem: `Horário indisponível! O barbeiro ${barbeiro.nome} já possui outro agendamento neste intervalo.`,
    };
  }

  const pontosCalculados = servico.preco * 10;
  const cliente = salvarOuAtualizarCliente(
    dados.clienteNome,
    dados.clienteTelefone,
    dados.clienteEmail,
    pontosCalculados
  );

  const codigo = `VC-${Math.floor(1000 + Math.random() * 9000)}`;

  const novoAgendamento = {
    id: `agd-${Date.now()}`,
    codigo,
    clienteId: cliente.id,
    clienteNome: cliente.nome,
    clienteTelefone: cliente.telefone,
    clienteEmail: cliente.email,
    barbeiroId: barbeiro.id,
    barbeiroNome: barbeiro.nome,
    servicoId: servico.id,
    servicoNome: servico.nome,
    servicoPreco: servico.preco,
    servicoDuracaoMinutos: servico.duracaoMinutos,
    data: dados.data,
    horaInicio: dados.horaInicio,
    horaFim,
    status: 'CONFIRMADO',
    observacoes: dados.observacoes,
    criadoEm: new Date().toISOString(),
  };

  agendamentos.push(novoAgendamento);
  localStorage.setItem(STORAGE_KEYS.AGENDAMENTOS, JSON.stringify(agendamentos));

  return {
    sucesso: true,
    agendamento: novoAgendamento,
    mensagem: 'Agendamento confirmado com sucesso!',
  };
};

export const atualizarStatusAgendamento = (id, novoStatus) => {
  const agendamentos = obterAgendamentos();
  const index = agendamentos.findIndex((a) => a.id === id);
  if (index === -1) return false;

  agendamentos[index].status = novoStatus;
  localStorage.setItem(STORAGE_KEYS.AGENDAMENTOS, JSON.stringify(agendamentos));
  return true;
};

export const calcularTierFidelidade = (pontos) => {
  if (pontos >= 1500) return 'OURO';
  if (pontos >= 500) return 'PRATA';
  return 'BRONZE';
};

export const obterBeneficioTier = (tier) => {
  switch (tier) {
    case 'OURO':
      return '15% de desconto em todos os serviços + bebida de cortesia';
    case 'PRATA':
      return '10% de desconto em todos os serviços';
    case 'BRONZE':
    default:
      return '5% de desconto no próximo serviço';
  }
};
