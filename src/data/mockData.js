export const ASSETS = {
  tools: '/src/assets/images/barbershop_tools_1792166161540.jpg',
  rodrigo: '/src/assets/images/barber_rodrigo_1792166162131.jpg',
  felipe: '/src/assets/images/barber_felipe_1792166162736.jpg',
  caio: '/src/assets/images/barber_caio_1792166163597.jpg',
  interior: '/src/assets/images/barbershop_interior_1792166164177.jpg',
};

export const SERVICOS_INICIAIS = [
  {
    id: 'srv-1',
    nome: 'Corte Clássico',
    descricao: 'Corte tradicional com tesoura e acabamento perfeito na navalha e toalha perfumada.',
    preco: 55,
    duracaoMinutos: 45,
    iconeNome: 'scissors',
  },
  {
    id: 'srv-2',
    nome: 'Barba Completa',
    descricao: 'Aparar, alinhar linhas da face, óleo hidratante e finalização com produtos premium.',
    preco: 45,
    duracaoMinutos: 40,
    iconeNome: 'user-check',
  },
  {
    id: 'srv-3',
    nome: 'Corte + Barba',
    descricao: 'O combo supremo de estilo completo para o gentleman clássico e contemporâneo.',
    preco: 90,
    duracaoMinutos: 75,
    iconeNome: 'sparkles',
  },
  {
    id: 'srv-4',
    nome: 'Bigode & Cavanhaque',
    descricao: 'Modelagem cirúrgica e precisa com acabamento em navalha quente e cera artesanal.',
    preco: 30,
    duracaoMinutos: 25,
    iconeNome: 'smile',
  },
  {
    id: 'srv-5',
    nome: 'Tratamento Capilar',
    descricao: 'Hidratação profunda do couro cabeludo, massagem craniana relaxante e tônico revigorante.',
    preco: 70,
    duracaoMinutos: 60,
    iconeNome: 'droplets',
  },
  {
    id: 'srv-6',
    nome: 'Hot Towel Shave',
    descricao: 'Barbear tradicional no estilo clássico com toalha a vapor, espuma densa e navalhete afiada.',
    preco: 65,
    duracaoMinutos: 50,
    iconeNome: 'flame',
  },
];

export const BARBEIROS_INICIAIS = [
  {
    id: 'barb-1',
    nome: 'Rodrigo Menezes',
    cargo: 'MESTRE BARBEIRO',
    especialidade: 'Corte Clássico & Navalha',
    fotoUrl: ASSETS.rodrigo,
    avaliacao: 4.9,
    anosExperiencia: 18,
    ativo: true,
    horarioInicio: '09:00',
    horarioFim: '19:00',
  },
  {
    id: 'barb-2',
    nome: 'Felipe Andrade',
    cargo: 'BARBEIRO SÊNIOR',
    especialidade: 'Barba Esculpida & Bigode',
    fotoUrl: ASSETS.felipe,
    avaliacao: 4.8,
    anosExperiencia: 11,
    ativo: true,
    horarioInicio: '09:00',
    horarioFim: '19:00',
  },
  {
    id: 'barb-3',
    nome: 'Caio Drummond',
    cargo: 'BARBEIRO ARTÍSTICO',
    especialidade: 'Degradê & Desenho',
    fotoUrl: ASSETS.caio,
    avaliacao: 4.7,
    anosExperiencia: 9,
    ativo: true,
    horarioInicio: '09:00',
    horarioFim: '19:00',
  },
];

export const CLIENTES_INICIAIS = [
  {
    id: 'cli-1',
    nome: 'Carlos Mendes',
    telefone: '(85) 98765-4321',
    email: 'carlos.mendes@email.com',
    pontosFidelidade: 1250,
    codigoFidelidade: 'VC-XKWQ-PRLF',
    dataCadastro: '2024-01-15',
    totalAtendimentos: 14,
  },
  {
    id: 'cli-2',
    nome: 'André Lustosa',
    telefone: '(85) 98654-3210',
    email: 'andre.lustosa@email.com',
    pontosFidelidade: 620,
    codigoFidelidade: 'VC-ALST-8821',
    dataCadastro: '2024-03-10',
    totalAtendimentos: 7,
  },
  {
    id: 'cli-3',
    nome: 'Marcos Silveira',
    telefone: '(85) 98543-2109',
    email: 'marcos.silveira@email.com',
    pontosFidelidade: 340,
    codigoFidelidade: 'VC-MSLV-4912',
    dataCadastro: '2024-05-22',
    totalAtendimentos: 4,
  },
  {
    id: 'cli-4',
    nome: 'Thiago Rezende',
    telefone: '(85) 98432-1098',
    email: 'thiago.rezende@email.com',
    pontosFidelidade: 1890,
    codigoFidelidade: 'VC-TREZ-9031',
    dataCadastro: '2023-11-04',
    totalAtendimentos: 21,
  },
];

export const getHojeString = () => {
  const d = new Date();
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
};

export const getAmanhaString = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
};

export const AGENDAMENTOS_INICIAIS = [
  {
    id: 'agd-1',
    codigo: 'VC-8841',
    clienteId: 'cli-1',
    clienteNome: 'Carlos Mendes',
    clienteTelefone: '(85) 98765-4321',
    clienteEmail: 'carlos.mendes@email.com',
    barbeiroId: 'barb-1',
    barbeiroNome: 'Rodrigo Menezes',
    servicoId: 'srv-1',
    servicoNome: 'Corte Clássico',
    servicoPreco: 55,
    servicoDuracaoMinutos: 45,
    data: getHojeString(),
    horaInicio: '09:00',
    horaFim: '09:45',
    status: 'CONFIRMADO',
    observacoes: 'Prefere acabamento alto na navalha',
    criadoEm: '2026-10-15T14:30:00Z',
  },
  {
    id: 'agd-2',
    codigo: 'VC-8842',
    clienteId: 'cli-2',
    clienteNome: 'André Lustosa',
    clienteTelefone: '(85) 98654-3210',
    clienteEmail: 'andre.lustosa@email.com',
    barbeiroId: 'barb-2',
    barbeiroNome: 'Felipe Andrade',
    servicoId: 'srv-2',
    servicoNome: 'Barba Completa',
    servicoPreco: 45,
    servicoDuracaoMinutos: 40,
    data: getHojeString(),
    horaInicio: '10:00',
    horaFim: '10:40',
    status: 'CONFIRMADO',
    observacoes: 'Uso de óleo aromático de cedro',
    criadoEm: '2026-10-15T15:00:00Z',
  },
  {
    id: 'agd-3',
    codigo: 'VC-8843',
    clienteId: 'cli-3',
    clienteNome: 'Marcos Silveira',
    clienteTelefone: '(85) 98543-2109',
    clienteEmail: 'marcos.silveira@email.com',
    barbeiroId: 'barb-1',
    barbeiroNome: 'Rodrigo Menezes',
    servicoId: 'srv-3',
    servicoNome: 'Corte + Barba',
    servicoPreco: 90,
    servicoDuracaoMinutos: 75,
    data: getHojeString(),
    horaInicio: '11:00',
    horaFim: '12:15',
    status: 'CONFIRMADO',
    observacoes: 'Cliente VIP',
    criadoEm: '2026-10-15T16:20:00Z',
  },
  {
    id: 'agd-4',
    codigo: 'VC-8844',
    clienteId: 'cli-4',
    clienteNome: 'Thiago Rezende',
    clienteTelefone: '(85) 98432-1098',
    clienteEmail: 'thiago.rezende@email.com',
    barbeiroId: 'barb-3',
    barbeiroNome: 'Caio Drummond',
    servicoId: 'srv-1',
    servicoNome: 'Corte Clássico',
    servicoPreco: 55,
    servicoDuracaoMinutos: 45,
    data: getAmanhaString(),
    horaInicio: '14:00',
    horaFim: '14:45',
    status: 'CONFIRMADO',
    observacoes: 'Fade médio navalhado',
    criadoEm: '2026-10-15T17:10:00Z',
  },
];
