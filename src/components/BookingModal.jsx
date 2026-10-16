import React, { useState, useEffect } from 'react';
import { criarAgendamento, getHojeString, obterSlotsDisponiveis } from '../services/scheduleService.js';
import { Calendar, Clock, CheckCircle2, AlertCircle, X, ChevronRight, ChevronLeft, User, Phone, Mail, Award } from 'lucide-react';

export const BookingModal = ({
  isOpen,
  onClose,
  servicos = [],
  barbeiros = [],
  servicoPreSelecionadoId,
  barbeiroPreSelecionadoId,
  onAgendamentoCriado,
}) => {
  const [etapa, setEtapa] = useState(1);
  const [servicoId, setServicoId] = useState(servicos[0]?.id || '');
  const [barbeiroId, setBarbeiroId] = useState(barbeiros[0]?.id || '');
  const [dataSelecionada, setDataSelecionada] = useState(getHojeString());
  const [horaSelecionada, setHoraSelecionada] = useState('');
  
  // Dados do cliente
  const [nomeCliente, setNomeCliente] = useState('');
  const [telefoneCliente, setTelefoneCliente] = useState('');
  const [emailCliente, setEmailCliente] = useState('');
  const [observacoes, setObservacoes] = useState('');
  
  // Feedback
  const [erro, setErro] = useState(null);
  const [agendamentoSucesso, setAgendamentoSucesso] = useState(null);
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    if (servicoPreSelecionadoId) setServicoId(servicoPreSelecionadoId);
    if (barbeiroPreSelecionadoId) setBarbeiroId(barbeiroPreSelecionadoId);
  }, [servicoPreSelecionadoId, barbeiroPreSelecionadoId]);

  const servicoAtual = servicos.find((s) => s.id === servicoId) || servicos[0];
  const barbeiroAtual = barbeiros.find((b) => b.id === barbeiroId) || barbeiros[0];

  // Recalcular slots sempre que barbeiro, data ou serviço mudar
  useEffect(() => {
    if (barbeiroAtual && servicoAtual && dataSelecionada) {
      const slotsCalculados = obterSlotsDisponiveis(
        barbeiroAtual.id,
        dataSelecionada,
        servicoAtual.duracaoMinutos
      );
      setSlots(slotsCalculados);
      const slotExisteLivre = slotsCalculados.find((s) => s.horaInicio === horaSelecionada && s.disponivel);
      if (!slotExisteLivre) {
        setHoraSelecionada('');
      }
    }
  }, [barbeiroId, servicoId, dataSelecionada]);

  if (!isOpen) return null;

  const handleConfirmarAgendamento = (e) => {
    e.preventDefault();
    setErro(null);

    if (!nomeCliente.trim() || !telefoneCliente.trim()) {
      setErro('Por favor, preencha o seu nome e telefone.');
      return;
    }

    if (!horaSelecionada) {
      setErro('Por favor, selecione um horário disponível.');
      return;
    }

    const resultado = criarAgendamento({
      barbeiroId: barbeiroAtual.id,
      servicoId: servicoAtual.id,
      data: dataSelecionada,
      horaInicio: horaSelecionada,
      clienteNome: nomeCliente.trim(),
      clienteTelefone: telefoneCliente.trim(),
      clienteEmail: emailCliente.trim(),
      observacoes: observacoes.trim(),
    });

    if (!resultado.sucesso) {
      setErro(resultado.mensagem);
    } else {
      setAgendamentoSucesso(resultado.agendamento);
      if (onAgendamentoCriado) onAgendamentoCriado();
    }
  };

  const resetarModal = () => {
    setEtapa(1);
    setAgendamentoSucesso(null);
    setErro(null);
    setHoraSelecionada('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#150E06] border border-[#C89B3C]/30 rounded-lg shadow-2xl p-6 sm:p-8 text-[#F5E9D3] my-8 max-h-[90vh] overflow-y-auto">
        {/* Botão fechar */}
        <button
          onClick={resetarModal}
          className="absolute top-5 right-5 text-[#F5E9D3]/60 hover:text-[#C89B3C] transition-colors p-1"
          aria-label="Fechar"
        >
          <X className="w-6 h-6" />
        </button>

        {agendamentoSucesso ? (
          /* Tela de Sucesso */
          <div className="text-center py-6 space-y-6">
            <div className="inline-flex p-4 rounded-full bg-[#C89B3C]/10 border border-[#C89B3C]/40 text-[#C89B3C] mb-2">
              <CheckCircle2 className="w-14 h-14" />
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-[#C89B3C] font-medium">Reserva Confirmada</p>
              <h3 className="font-display text-3xl font-semibold mt-1">Horário Agendado com Sucesso!</h3>
              <p className="text-sm text-[#F5E9D3]/70 mt-2 max-w-md mx-auto">
                Seu agendamento foi registrado e sincronizado no banco de dados com prevenção de conflitos.
              </p>
            </div>

            <div className="bg-[#1C1208] border border-[#C89B3C]/20 p-5 rounded-lg text-left space-y-3 max-w-md mx-auto">
              <div className="flex justify-between items-center border-b border-[#C89B3C]/10 pb-2">
                <span className="text-xs text-[#F5E9D3]/60">Código da Reserva</span>
                <span className="font-mono text-sm font-bold text-[#C89B3C]">{agendamentoSucesso.codigo}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#F5E9D3]/80">Serviço:</span>
                <span className="text-sm font-semibold">{agendamentoSucesso.servicoNome} (R$ {agendamentoSucesso.servicoPreco})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#F5E9D3]/80">Mestre Barbeiro:</span>
                <span className="text-sm font-semibold">{agendamentoSucesso.barbeiroNome}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#F5E9D3]/80">Data & Horário:</span>
                <span className="text-sm font-semibold font-mono text-[#C89B3C]">
                  {agendamentoSucesso.data} às {agendamentoSucesso.horaInicio} - {agendamentoSucesso.horaFim}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#C89B3C]/10">
                <span className="text-xs text-[#F5E9D3]/60 flex items-center gap-1">
                  <Award className="w-4 h-4 text-[#C89B3C]" /> Pontos de Fidelidade
                </span>
                <span className="text-xs font-bold text-[#C89B3C]">+{agendamentoSucesso.servicoPreco * 10} pts acumulados</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={resetarModal}
                className="bg-[#C89B3C] text-[#150E06] px-8 py-3 font-semibold hover:bg-[#D4AF37] transition-colors"
              >
                Concluir
              </button>
            </div>
          </div>
        ) : (
          /* Fluxo de Etapas */
          <div>
            <div className="mb-6">
              <p className="text-xs uppercase tracking-widest text-[#C89B3C] font-medium">— RESERVA ONLINE —</p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold mt-1">Agendar seu Atendimento</h2>
              
              <div className="grid grid-cols-4 gap-2 mt-5">
                {[
                  { num: 1, label: 'Serviço' },
                  { num: 2, label: 'Barbeiro' },
                  { num: 3, label: 'Horário' },
                  { num: 4, label: 'Dados' },
                ].map((s) => (
                  <button
                    key={s.num}
                    onClick={() => {
                      if (s.num < etapa) setEtapa(s.num);
                    }}
                    disabled={s.num > etapa}
                    className={`text-left p-2 border-t-2 transition-all ${
                      etapa === s.num
                        ? 'border-[#C89B3C] text-[#C89B3C]'
                        : s.num < etapa
                        ? 'border-[#C89B3C]/40 text-[#F5E9D3]/80 cursor-pointer'
                        : 'border-[#F5E9D3]/10 text-[#F5E9D3]/30 cursor-not-allowed'
                    }`}
                  >
                    <span className="block text-xs font-mono">0{s.num}.</span>
                    <span className="text-xs font-medium truncate block">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {erro && (
              <div className="mb-5 p-3 bg-red-950/60 border border-red-500/40 rounded flex items-center gap-3 text-red-200 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                <span>{erro}</span>
              </div>
            )}

            {/* ETAPA 1: Seleção de Serviço */}
            {etapa === 1 && (
              <div className="space-y-4">
                <p className="text-sm text-[#F5E9D3]/70">Escolha o serviço desejado na nossa cartela tradicional:</p>
                <div className="grid sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                  {servicos.map((servico) => {
                    const selecionado = servicoId === servico.id;
                    return (
                      <div
                        key={servico.id}
                        onClick={() => setServicoId(servico.id)}
                        className={`p-4 border transition-all cursor-pointer rounded-sm ${
                          selecionado
                            ? 'border-[#C89B3C] bg-[#C89B3C]/10 shadow-lg'
                            : 'border-[#C89B3C]/20 bg-[#1C1208]/60 hover:border-[#C89B3C]/50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-display text-base font-semibold text-[#F5E9D3]">{servico.nome}</h4>
                          <span className="font-semibold text-[#C89B3C] text-sm">R$ {servico.preco}</span>
                        </div>
                        <p className="text-xs text-[#F5E9D3]/60 line-clamp-2 mb-2">{servico.descricao}</p>
                        <div className="flex items-center text-xs text-[#C89B3C]/80 font-mono">
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          <span>{servico.duracaoMinutos} min</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-4 border-t border-[#C89B3C]/10">
                  <button
                    onClick={() => setEtapa(2)}
                    className="bg-[#C89B3C] text-[#150E06] px-6 py-2.5 font-medium hover:bg-[#D4AF37] transition-colors flex items-center gap-2"
                  >
                    Próximo: Barbeiro <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 2: Seleção de Barbeiro */}
            {etapa === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-[#F5E9D3]/70">Selecione o mestre responsável pelo seu atendimento:</p>
                <div className="grid sm:grid-cols-3 gap-3">
                  {barbeiros.map((barbeiro) => {
                    const selecionado = barbeiroId === barbeiro.id;
                    return (
                      <div
                        key={barbeiro.id}
                        onClick={() => setBarbeiroId(barbeiro.id)}
                        className={`p-3 border text-center transition-all cursor-pointer rounded-sm ${
                          selecionado
                            ? 'border-[#C89B3C] bg-[#C89B3C]/10 shadow-md ring-1 ring-[#C89B3C]'
                            : 'border-[#C89B3C]/20 bg-[#1C1208]/60 hover:border-[#C89B3C]/50'
                        }`}
                      >
                        <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border border-[#C89B3C]/40 mb-3 bg-[#1C1208]">
                          <img
                            src={barbeiro.fotoUrl}
                            alt={barbeiro.nome}
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                        <h4 className="font-display text-sm font-semibold">{barbeiro.nome}</h4>
                        <p className="text-[10px] uppercase tracking-wider text-[#C89B3C] my-0.5">{barbeiro.cargo}</p>
                        <p className="text-xs text-[#F5E9D3]/60 mb-2 truncate">{barbeiro.especialidade}</p>
                        <div className="flex justify-between items-center text-[11px] text-[#F5E9D3]/70 pt-2 border-t border-[#C89B3C]/10">
                          <span>{barbeiro.anosExperiencia} anos exp.</span>
                          <span className="text-amber-400 font-semibold">★ {barbeiro.avaliacao}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-[#C89B3C]/10">
                  <button
                    onClick={() => setEtapa(1)}
                    className="border border-[#C89B3C]/30 text-[#F5E9D3]/80 px-4 py-2 hover:bg-[#C89B3C]/10 transition-colors flex items-center gap-1 text-sm"
                  >
                    <ChevronLeft className="w-4 h-4" /> Voltar
                  </button>
                  <button
                    onClick={() => setEtapa(3)}
                    className="bg-[#C89B3C] text-[#150E06] px-6 py-2.5 font-medium hover:bg-[#D4AF37] transition-colors flex items-center gap-2"
                  >
                    Próximo: Data e Horário <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 3: Data e Horários Livres (com Prevenção de Conflitos) */}
            {etapa === 3 && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1C1208] p-3 border border-[#C89B3C]/20 rounded">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#C89B3C] font-semibold mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Escolha o Dia do Atendimento:
                    </label>
                    <input
                      type="date"
                      value={dataSelecionada}
                      min={getHojeString()}
                      onChange={(e) => setDataSelecionada(e.target.value)}
                      className="bg-[#150E06] border border-[#C89B3C]/40 text-[#F5E9D3] px-3 py-1.5 text-sm rounded focus:outline-none focus:border-[#C89B3C]"
                    />
                  </div>
                  <div className="text-xs text-[#F5E9D3]/70 sm:text-right">
                    <p className="font-semibold text-[#F5E9D3]">{barbeiroAtual.nome}</p>
                    <p className="text-[#C89B3C]">{servicoAtual.nome} ({servicoAtual.duracaoMinutos} min)</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-[#F5E9D3]/70">Horários disponíveis calculados em tempo real:</p>
                    <div className="flex items-center gap-3 text-[11px] text-[#F5E9D3]/60">
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#C89B3C] rounded-full inline-block"></span> Livre</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-neutral-700 rounded-full inline-block"></span> Ocupado</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
                    {slots.map((slot) => {
                      const selecionado = horaSelecionada === slot.horaInicio;
                      if (!slot.disponivel) {
                        return (
                          <div
                            key={slot.horaInicio}
                            title={slot.motivoIndisponibilidade}
                            className="p-2 border border-neutral-800 bg-[#150E06]/40 text-neutral-500 rounded text-center opacity-60 cursor-not-allowed select-none"
                          >
                            <span className="font-mono text-sm line-through block">{slot.horaInicio}</span>
                            <span className="text-[10px] block truncate text-red-400/70">Ocupado</span>
                          </div>
                        );
                      }

                      return (
                        <button
                          key={slot.horaInicio}
                          type="button"
                          onClick={() => setHoraSelecionada(slot.horaInicio)}
                          className={`p-2 border rounded text-center transition-all ${
                            selecionado
                              ? 'border-[#C89B3C] bg-[#C89B3C] text-[#150E06] font-bold shadow-md'
                              : 'border-[#C89B3C]/30 bg-[#1C1208] text-[#F5E9D3] hover:border-[#C89B3C]'
                          }`}
                        >
                          <span className="font-mono text-sm block">{slot.horaInicio}</span>
                          <span className={`text-[10px] block ${selecionado ? 'text-[#150E06]' : 'text-[#C89B3C]'}`}>
                            Disponível
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {slots.filter((s) => s.disponivel).length === 0 && (
                    <div className="p-4 bg-amber-950/30 border border-amber-600/30 rounded text-center text-sm text-amber-200 mt-2">
                      Todos os horários de {barbeiroAtual.nome} estão ocupados nesta data. Por favor, escolha outro dia ou barbeiro.
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-[#C89B3C]/10">
                  <button
                    onClick={() => setEtapa(2)}
                    className="border border-[#C89B3C]/30 text-[#F5E9D3]/80 px-4 py-2 hover:bg-[#C89B3C]/10 transition-colors flex items-center gap-1 text-sm"
                  >
                    <ChevronLeft className="w-4 h-4" /> Voltar
                  </button>
                  <button
                    disabled={!horaSelecionada}
                    onClick={() => setEtapa(4)}
                    className={`px-6 py-2.5 font-medium flex items-center gap-2 transition-colors ${
                      horaSelecionada
                        ? 'bg-[#C89B3C] text-[#150E06] hover:bg-[#D4AF37]'
                        : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    Próximo: Seus Dados <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 4: Dados do Cliente e Confirmação */}
            {etapa === 4 && (
              <form onSubmit={handleConfirmarAgendamento} className="space-y-4">
                <div className="bg-[#1C1208] p-3.5 border border-[#C89B3C]/20 rounded space-y-1 text-xs">
                  <div className="flex justify-between text-[#F5E9D3]/70">
                    <span>Resumo da Reserva:</span>
                    <span className="text-[#C89B3C] font-semibold">{servicoAtual.nome} (R$ {servicoAtual.preco})</span>
                  </div>
                  <div className="flex justify-between text-[#F5E9D3]/70">
                    <span>Profissional:</span>
                    <span className="text-[#F5E9D3] font-medium">{barbeiroAtual.nome}</span>
                  </div>
                  <div className="flex justify-between text-[#F5E9D3]/70">
                    <span>Data e Horário:</span>
                    <span className="font-mono text-[#C89B3C] font-semibold">{dataSelecionada} às {horaSelecionada}</span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#C89B3C] mb-1 font-medium flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Carlos Mendes"
                      value={nomeCliente}
                      onChange={(e) => setNomeCliente(e.target.value)}
                      className="w-full bg-[#1C1208] border border-[#C89B3C]/30 text-[#F5E9D3] px-3 py-2 text-sm rounded focus:outline-none focus:border-[#C89B3C]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#C89B3C] mb-1 font-medium flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> Telefone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="(85) 98765-4321"
                      value={telefoneCliente}
                      onChange={(e) => setTelefoneCliente(e.target.value)}
                      className="w-full bg-[#1C1208] border border-[#C89B3C]/30 text-[#F5E9D3] px-3 py-2 text-sm rounded focus:outline-none focus:border-[#C89B3C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#C89B3C] mb-1 font-medium flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> E-mail (opcional para recibo)
                  </label>
                  <input
                    type="email"
                    placeholder="carlos@exemplo.com"
                    value={emailCliente}
                    onChange={(e) => setEmailCliente(e.target.value)}
                    className="w-full bg-[#1C1208] border border-[#C89B3C]/30 text-[#F5E9D3] px-3 py-2 text-sm rounded focus:outline-none focus:border-[#C89B3C]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#C89B3C] mb-1 font-medium">
                    Observações de Preferência (opcional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Navalhado alto, toalha quente, cabelo crespo..."
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="w-full bg-[#1C1208] border border-[#C89B3C]/30 text-[#F5E9D3] px-3 py-2 text-sm rounded focus:outline-none focus:border-[#C89B3C] resize-none"
                  ></textarea>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-[#C89B3C]/10">
                  <button
                    type="button"
                    onClick={() => setEtapa(3)}
                    className="border border-[#C89B3C]/30 text-[#F5E9D3]/80 px-4 py-2 hover:bg-[#C89B3C]/10 transition-colors flex items-center gap-1 text-sm"
                  >
                    <ChevronLeft className="w-4 h-4" /> Voltar
                  </button>
                  <button
                    type="submit"
                    className="bg-[#C89B3C] text-[#150E06] px-8 py-2.5 font-bold hover:bg-[#D4AF37] transition-colors flex items-center gap-2"
                  >
                    Confirmar Agendamento <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
