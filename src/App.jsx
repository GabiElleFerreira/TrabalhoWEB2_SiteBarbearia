import React, { useState } from 'react';
import { Navbar } from './components/Navbar.jsx';
import { BookingModal } from './components/BookingModal.jsx';
import { FidelityCardModal } from './components/FidelityCardModal.jsx';
import { AdminPanel } from './components/AdminPanel.jsx';
import { CodeExplorer } from './components/CodeExplorer.jsx';
import {
  obterAgendamentos,
  obterBarbeiros,
  obterClientes,
  obterServicos,
} from './services/scheduleService.js';
import { ASSETS } from './data/mockData.js';
import {
  CreditCard,
  Clock,
  MapPin,
  Phone,
  Calendar,
  ArrowRight,
  Download,
  FolderArchive,
} from 'lucide-react';
import { baixarArquivosComoZip } from './services/zipDownloadService.js';

export default function App() {

  const [servicos, setServicos] = useState(obterServicos());
  const [barbeiros, setBarbeiros] = useState(obterBarbeiros());
  const [clientes, setClientes] = useState(obterClientes());
  const [agendamentos, setAgendamentos] = useState(obterAgendamentos());

  const [visaoAtual, setVisaoAtual] = useState('site');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isFidelityModalOpen, setIsFidelityModalOpen] = useState(false);
  const [servicoPreSelecionadoId, setServicoPreSelecionadoId] = useState(undefined);
  const [barbeiroPreSelecionadoId, setBarbeiroPreSelecionadoId] = useState(undefined);
  const [clienteSelecionadoParaCartao, setClienteSelecionadoParaCartao] = useState(null);

  const recarregarDados = () => {
    setClientes(obterClientes());
    setAgendamentos(obterAgendamentos());
  };

  const handleAbrirAgendamentoComServico = (servicoId) => {
    setServicoPreSelecionadoId(servicoId);
    setBarbeiroPreSelecionadoId(undefined);
    setIsBookingModalOpen(true);
  };

  const handleAbrirAgendamentoComBarbeiro = (barbeiroId) => {
    setBarbeiroPreSelecionadoId(barbeiroId);
    setServicoPreSelecionadoId(undefined);
    setIsBookingModalOpen(true);
  };

  const handleAbrirFidelidadeParaCliente = (cliente) => {
    setClienteSelecionadoParaCartao(cliente);
    setIsFidelityModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#1C1208] text-[#F5E9D3] font-sans antialiased flex flex-col selection:bg-[#C89B3C]/30 selection:text-[#F5E9D3]">
      {/* Barra de Navegação Superior */}
      <Navbar
        visaoAtual={visaoAtual}
        onMudarVisao={setVisaoAtual}
        onAbrirAgendamento={() => {
          setServicoPreSelecionadoId(undefined);
          setBarbeiroPreSelecionadoId(undefined);
          setIsBookingModalOpen(true);
        }}
        onAbrirFidelidade={() => {
          setClienteSelecionadoParaCartao(null);
          setIsFidelityModalOpen(true);
        }}
      />

      <main className="flex-1">
        {visaoAtual === 'painel' ? (
          /* PAINEL OPERACIONAL DE GESTÃO DA BARBEARIA */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => setVisaoAtual('site')}
                className="text-xs text-[#C89B3C] hover:underline flex items-center gap-1 font-medium"
              >
                ← Voltar para o Site Principal
              </button>
            </div>
            <AdminPanel
              agendamentos={agendamentos}
              barbeiros={barbeiros}
              clientes={clientes}
              onAtualizarDados={recarregarDados}
              onAbrirNovoAgendamento={() => setIsBookingModalOpen(true)}
              onVerCartaoCliente={handleAbrirFidelidadeParaCliente}
            />
          </div>
        ) : visaoAtual === 'codigo' ? (
          /* VISUALIZADOR DA ARQUITETURA JAVA SPRING BOOT & POSTGRESQL */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => setVisaoAtual('site')}
                className="text-xs text-[#C89B3C] hover:underline flex items-center gap-1 font-medium"
              >
                ← Voltar para o Site Principal
              </button>
            </div>
            <CodeExplorer />
          </div>
        ) : (
          /* SITE PRINCIPAL DA BARBEARIA VINTAGE&CO */
          <>
            {/* Seção Início / Hero */}
            <section id="inicio" className="relative min-h-[calc(100vh-80px)] flex items-center py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
              <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                  <p className="text-[#C89B3C] tracking-widest text-xs uppercase font-medium">— DESDE 1987 —</p>
                  <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl leading-tight font-semibold">
                    A Arte do Corte <br />
                    <span className="text-[#C89B3C]">Perfeito.</span>
                  </h1>
                  <p className="text-[#F5E9D3]/80 max-w-md leading-relaxed text-sm sm:text-base">
                    Tradição, precisão e estilo clássico. Onde cada detalhe é tratado com o respeito que um verdadeiro gentleman merece.
                  </p>

                  {/* Badge de Download dos Arquivos do Projeto */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={() => setVisaoAtual('codigo')}
                      className="inline-flex items-center gap-1.5 bg-[#C89B3C]/10 border border-[#C89B3C]/40 text-[#C89B3C] hover:bg-[#C89B3C]/20 px-3.5 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer"
                    >
                      <FolderArchive className="w-3.5 h-3.5" />
                      <span>Ver Código do Projeto (Java & JS)</span>
                    </button>
                    <button
                      onClick={() => baixarArquivosComoZip('TODOS')}
                      className="inline-flex items-center gap-1.5 bg-[#C89B3C] text-[#150E06] hover:bg-[#D4AF37] px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer shadow"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Baixar Todos os Arquivos (.ZIP)</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-2">
                    <button
                      onClick={() => setIsBookingModalOpen(true)}
                      className="bg-[#C89B3C] text-[#150E06] px-8 py-3.5 font-bold text-xs uppercase tracking-wider hover:bg-[#D4AF37] transition-colors shadow-lg flex items-center gap-2"
                    >
                      <Calendar className="w-4 h-4" /> AGENDAR HORÁRIO
                    </button>
                    <button
                      onClick={() => setIsFidelityModalOpen(true)}
                      className="border border-[#C89B3C] text-[#C89B3C] px-8 py-3.5 font-bold text-xs uppercase tracking-wider hover:bg-[#C89B3C]/10 transition-colors flex items-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" /> CARTÃO DE FIDELIDADE
                    </button>
                  </div>


                  <div className="flex gap-10 pt-4 border-t border-[#C89B3C]/10">
                    <div>
                      <p className="text-3xl font-display font-semibold text-[#F5E9D3]">35+</p>
                      <p className="text-[11px] text-[#F5E9D3]/60 tracking-wider uppercase font-mono">ANOS</p>
                    </div>
                    <div>
                      <p className="text-3xl font-display font-semibold text-[#F5E9D3]">2.400+</p>
                      <p className="text-[11px] text-[#F5E9D3]/60 tracking-wider uppercase font-mono">CLIENTES</p>
                    </div>
                    <div>
                      <p className="text-3xl font-display font-semibold text-[#F5E9D3]">4.9★</p>
                      <p className="text-[11px] text-[#F5E9D3]/60 tracking-wider uppercase font-mono">AVALIAÇÃO</p>
                    </div>
                  </div>
                </div>

                <div className="hidden md:flex justify-end">
                  <div className="relative">
                    <div className="border border-[#C89B3C]/30 p-2 absolute -top-4 -right-4 w-80 h-[480px]"></div>
                    <img
                      src={ASSETS.tools}
                      alt="Utensílios de barbearia artesanal"
                      referrerPolicy="no-referrer"
                      className="relative z-10 w-80 h-[480px] object-cover shadow-2xl rounded-sm"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Seção Serviços */}
            <section id="servicos" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#150E06] border-y border-[#C89B3C]/10">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-14">
                  <p className="text-[#C89B3C] tracking-widest text-xs uppercase font-medium mb-2">NOSSOS SERVIÇOS</p>
                  <h2 className="font-display text-3xl sm:text-5xl font-semibold">O que oferecemos</h2>
                  <p className="text-xs text-[#F5E9D3]/60 mt-2">Clique em um serviço para selecionar horário disponível</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {servicos.map((servico) => (
                    <div
                      key={servico.id}
                      onClick={() => handleAbrirAgendamentoComServico(servico.id)}
                      className="border border-[#C89B3C]/15 p-6 hover:border-[#C89B3C]/50 transition-all bg-[#1C1208]/70 rounded-sm cursor-pointer group hover:-translate-y-1"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-display text-xl font-semibold group-hover:text-[#C89B3C] transition-colors">
                          {servico.nome}
                        </h3>
                        <span className="text-[#C89B3C] font-semibold text-lg font-mono">R$ {servico.preco}</span>
                      </div>
                      <p className="text-xs text-[#F5E9D3]/70 mb-4 leading-relaxed">{servico.descricao}</p>
                      <div className="flex justify-between items-center text-xs text-[#C89B3C]/80 pt-3 border-t border-[#C89B3C]/10">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5" /> {servico.duracaoMinutos} min
                        </span>
                        <span className="text-[#C89B3C] font-semibold text-[11px] group-hover:underline flex items-center gap-1">
                          Agendar este <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-12">
                  <button
                    onClick={() => setIsBookingModalOpen(true)}
                    className="inline-block bg-[#C89B3C] text-[#150E06] px-8 py-3.5 font-bold text-xs uppercase tracking-wider hover:bg-[#D4AF37] transition-colors shadow-md"
                  >
                    AGENDAR UM SERVIÇO
                  </button>
                </div>
              </div>
            </section>

            {/* Seção Barbeiros / Equipe */}
            <section id="barbeiros" className="py-20 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-14">
                  <p className="text-[#C89B3C] tracking-widest text-xs uppercase font-medium mb-2">NOSSA EQUIPE</p>
                  <h2 className="font-display text-3xl sm:text-5xl font-semibold">Os Mestres</h2>
                  <p className="text-xs text-[#F5E9D3]/60 mt-2">Escolha seu profissional de confiança para verificar horários</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {barbeiros.map((barbeiro) => (
                    <div key={barbeiro.id} className="group">
                      <div className="relative overflow-hidden mb-4 bg-[#150E06] rounded-sm">
                        <img
                          src={barbeiro.fotoUrl}
                          alt={barbeiro.nome}
                          referrerPolicy="no-referrer"
                          className="w-full h-96 object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-105"
                        />
                        <div className="absolute top-4 right-4 bg-[#150E06]/90 px-2.5 py-1 text-xs font-semibold border border-[#C89B3C]/30 text-amber-300">
                          ★ {barbeiro.avaliacao}
                        </div>
                      </div>
                      <h3 className="font-display text-xl font-semibold">{barbeiro.nome}</h3>
                      <p className="text-[#C89B3C] text-xs font-semibold uppercase tracking-wider mt-0.5 mb-1">
                        {barbeiro.cargo}
                      </p>
                      <p className="text-xs text-[#F5E9D3]/70 mb-3">{barbeiro.especialidade}</p>
                      <div className="flex justify-between items-center pt-2 border-t border-[#C89B3C]/10">
                        <span className="text-xs text-[#F5E9D3]/60 font-mono">{barbeiro.anosExperiencia} anos de experiência</span>
                        <button
                          onClick={() => handleAbrirAgendamentoComBarbeiro(barbeiro.id)}
                          className="text-[#C89B3C] text-xs font-bold uppercase tracking-wider hover:underline flex items-center gap-1"
                        >
                          AGENDAR COM ELE →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Seção Cartão de Fidelidade */}
            <section id="cartao" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#150E06] border-y border-[#C89B3C]/10">
              <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <p className="text-[#C89B3C] tracking-widest text-xs uppercase font-medium mb-2">PROGRAMA DE FIDELIDADE</p>
                  <h2 className="font-display text-3xl sm:text-5xl font-semibold mb-4">
                    Seu Cartão <span className="text-[#C89B3C]">Vintage</span>
                  </h2>
                  <p className="text-[#F5E9D3]/80 mb-8 leading-relaxed text-sm">
                    Acumule pontos em cada visita, suba de nível e desbloqueie benefícios exclusivos — de descontos automáticos a cortes gratuitos. Cada R$ 1 gasto equivale a 10 pontos de fidelidade.
                  </p>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3">
                      <span className="bg-[#8B4513] px-3 py-1 text-white font-bold text-xs tracking-wider rounded-xs">
                        BRONZE
                      </span>
                      <span className="text-xs text-[#F5E9D3]/80">5% de desconto no próximo serviço (até 499 pts)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="bg-[#8C98A8] px-3 py-1 text-white font-bold text-xs tracking-wider rounded-xs">
                        PRATA
                      </span>
                      <span className="text-xs text-[#F5E9D3]/80">10% de desconto em todos os serviços (500 a 1.499 pts)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="bg-[#F2A900] px-3 py-1 text-[#150E06] font-bold text-xs tracking-wider rounded-xs">
                        OURO
                      </span>
                      <span className="text-xs text-[#F5E9D3]/80">15% de desconto em todos os serviços + cortesia (1.500+ pts)</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsFidelityModalOpen(true)}
                    className="bg-[#C89B3C] text-[#150E06] px-8 py-3.5 font-bold text-xs uppercase tracking-wider hover:bg-[#D4AF37] transition-colors flex items-center gap-2 shadow-lg"
                  >
                    <CreditCard className="w-4 h-4" /> CONSULTAR OU CRIAR MEU CARTÃO
                  </button>
                </div>

                <div className="flex justify-center md:justify-end">
                  <div
                    onClick={() => setIsFidelityModalOpen(true)}
                    className="card-gradient w-80 sm:w-96 h-52 rounded-xl p-6 flex flex-col justify-between shadow-2xl cursor-pointer hover:scale-105 transition-transform"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[#150E06]/80 text-xs font-bold tracking-wider">VINTAGE&CO</p>
                        <p className="text-[10px] text-[#150E06]/60 font-mono">GENTLEMAN'S CLUB</p>
                      </div>
                      <span className="bg-[#150E06]/15 backdrop-blur-xs px-2.5 py-0.5 text-xs font-bold rounded text-[#150E06] border border-[#150E06]/20">
                        OURO
                      </span>
                    </div>
                    <div>
                      <p className="text-4xl font-display font-bold text-[#150E06] leading-none">
                        1.250 <span className="text-sm font-normal">pts</span>
                      </p>
                      <p className="text-[#150E06] font-semibold text-sm mt-1">Carlos Mendes</p>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-[#150E06]/60 font-mono">
                      <span>VC-XKWQ-PRLF</span>
                      <span>Toque para consultar</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Seção Depoimentos */}
            <section id="depoimentos" className="py-20 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-14">
                  <p className="text-[#C89B3C] tracking-widest text-xs uppercase font-medium mb-2">DEPOIMENTOS</p>
                  <h2 className="font-display text-3xl sm:text-5xl font-semibold">O que dizem</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="border border-[#C89B3C]/15 p-8 bg-[#150E06]/60 hover:border-[#C89B3C]/40 transition-colors rounded-sm">
                    <p className="text-[#C89B3C] text-3xl leading-none mb-3 font-serif">“</p>
                    <p className="text-xs text-[#F5E9D3]/80 mb-6 leading-relaxed">
                      Melhor barbearia da cidade, sem dúvida. O Rodrigo é um verdadeiro artista. O agendamento é pontual e sem filas.
                    </p>
                    <div className="flex justify-between items-center pt-2 border-t border-[#C89B3C]/10">
                      <p className="font-display text-sm font-semibold">André Lustosa</p>
                      <span className="star-yellow text-xs">★★★★★</span>
                    </div>
                  </div>

                  <div className="border border-[#C89B3C]/15 p-8 bg-[#150E06]/60 hover:border-[#C89B3C]/40 transition-colors rounded-sm">
                    <p className="text-[#C89B3C] text-3xl leading-none mb-3 font-serif">“</p>
                    <p className="text-xs text-[#F5E9D3]/80 mb-6 leading-relaxed">
                      Ambiente incrível, parece que voltei no tempo. O atendimento com toalha quente e navalha superou minhas expectativas.
                    </p>
                    <div className="flex justify-between items-center pt-2 border-t border-[#C89B3C]/10">
                      <p className="font-display text-sm font-semibold">Marcos Silveira</p>
                      <span className="star-yellow text-xs">★★★★★</span>
                    </div>
                  </div>

                  <div className="border border-[#C89B3C]/15 p-8 bg-[#150E06]/60 hover:border-[#C89B3C]/40 transition-colors rounded-sm">
                    <p className="text-[#C89B3C] text-3xl leading-none mb-3 font-serif">“</p>
                    <p className="text-xs text-[#F5E9D3]/80 mb-6 leading-relaxed">
                      Faz dois anos que sou cliente e não troco por nada. O programa de fidelidade com desconto direto é sensacional.
                    </p>
                    <div className="flex justify-between items-center pt-2 border-t border-[#C89B3C]/10">
                      <p className="font-display text-sm font-semibold">Thiago Rezende</p>
                      <span className="star-yellow text-xs">★★★★★</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Seção Contato / Localização */}
            <section id="contato" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#150E06] border-y border-[#C89B3C]/10">
              <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <p className="text-[#C89B3C] tracking-widest text-xs uppercase font-medium mb-2">NOS ENCONTRE</p>
                  <h2 className="font-display text-3xl sm:text-5xl font-semibold mb-8">Onde estamos</h2>

                  <div className="space-y-6 text-sm">
                    <div className="flex gap-4">
                      <MapPin className="text-[#C89B3C] w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold mb-0.5 text-[#F5E9D3]">Endereço</h4>
                        <p className="text-xs text-[#F5E9D3]/70">
                          Rua dos Cavalheiros, 195 — Centro<br />Maracanaú — CE
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Phone className="text-[#C89B3C] w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold mb-0.5 text-[#F5E9D3]">Telefone & WhatsApp</h4>
                        <p className="text-xs text-[#F5E9D3]/70">(85) 99887-6543</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Clock className="text-[#C89B3C] w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold mb-0.5 text-[#F5E9D3]">Horários de Funcionamento</h4>
                        <p className="text-xs text-[#F5E9D3]/70">
                          Seg–Sex: 09h às 19h<br />Sábado: 08h às 18h<br />Domingo: Fechado
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-[#C89B3C]/30 p-2 rounded-sm shadow-xl bg-[#1C1208]">
                  <img
                    src={ASSETS.interior}
                    alt="Ambiente interno da Vintage&Co Barbearia"
                    referrerPolicy="no-referrer"
                    className="w-full h-80 sm:h-96 object-cover rounded-xs"
                  />
                </div>
              </div>
            </section>

            {/* Seção Agendar Callout */}
            <section id="agendar" className="py-20 px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl mx-auto text-center">
                <p className="text-[#C89B3C] tracking-widest text-xs uppercase font-medium mb-2">AGENDAMENTO</p>
                <h2 className="font-display text-3xl sm:text-5xl font-semibold mb-4">Reserve seu Horário</h2>
                <p className="text-xs sm:text-sm text-[#F5E9D3]/80 mb-8">
                  Escolha o serviço, o profissional e o melhor horário para você com confirmação imediata.
                </p>

                <div className="border border-[#C89B3C]/20 p-8 bg-[#150E06]/80 rounded-sm space-y-4">
                  <p className="text-[#C89B3C] text-sm font-semibold flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4" /> Agende online ou pelo telefone:
                  </p>
                  <p className="font-display text-3xl sm:text-4xl text-[#F5E9D3] font-semibold tracking-wide">
                    (85) 99887-6543
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => setIsBookingModalOpen(true)}
                      className="bg-[#C89B3C] text-[#150E06] px-8 py-3.5 font-bold text-xs uppercase tracking-wider hover:bg-[#D4AF37] transition-colors shadow-lg inline-flex items-center gap-2"
                    >
                      <Calendar className="w-4 h-4" /> AGENDAR ONLINE AGORA
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Rodapé Clássico */}
      <footer className="border-t border-[#C89B3C]/15 py-8 px-4 sm:px-6 lg:px-8 bg-[#150E06] text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-display text-[#C89B3C] font-semibold text-sm">
            VINTAGE&CO BARBEARIA © 2026
          </p>

          <div className="flex flex-wrap items-center gap-6 text-[#F5E9D3]/60">
            <button
              onClick={() => setIsFidelityModalOpen(true)}
              className="hover:text-[#C89B3C] transition-colors"
            >
              Cartão de Fidelidade
            </button>
            <button
              onClick={() => setVisaoAtual('painel')}
              className="hover:text-[#C89B3C] transition-colors"
            >
              Painel de Horários
            </button>
            <button
              onClick={() => setVisaoAtual('codigo')}
              className="hover:text-[#C89B3C] transition-colors"
            >
              ☕ Java (Spring Boot) & PostgreSQL
            </button>
            <a
              href="https://instagram.com/vintageco.barbearia"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#C89B3C] transition-colors"
            >
              @vintageco.barbearia
            </a>
          </div>
        </div>
      </footer>

      {/* Modais de Interação */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        servicos={servicos}
        barbeiros={barbeiros}
        servicoPreSelecionadoId={servicoPreSelecionadoId}
        barbeiroPreSelecionadoId={barbeiroPreSelecionadoId}
        onAgendamentoCriado={recarregarDados}
      />

      <FidelityCardModal
        isOpen={isFidelityModalOpen}
        onClose={() => setIsFidelityModalOpen(false)}
        clienteSelecionado={clienteSelecionadoParaCartao}
        onClienteAtualizado={recarregarDados}
      />
    </div>
  );
}
