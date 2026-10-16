import React, { useState } from 'react';
import { atualizarStatusAgendamento, calcularTierFidelidade, getHojeString } from '../services/scheduleService.js';
import { Calendar, Users, DollarSign, Clock, Check, XCircle, Search, Scissors, ArrowUpRight, Plus } from 'lucide-react';

export const AdminPanel = ({
  agendamentos = [],
  barbeiros = [],
  clientes = [],
  onAtualizarDados,
  onAbrirNovoAgendamento,
  onVerCartaoCliente,
}) => {
  const [abaAtiva, setAbaAtiva] = useState('agenda');
  const [dataFiltro, setDataFiltro] = useState(getHojeString());
  const [barbeiroFiltroId, setBarbeiroFiltroId] = useState('todos');
  const [buscaCliente, setBuscaCliente] = useState('');

  // Filtragem dos agendamentos
  const agendamentosFiltrados = agendamentos.filter((a) => {
    const dataMatch = a.data === dataFiltro;
    const barbeiroMatch = barbeiroFiltroId === 'todos' || a.barbeiroId === barbeiroFiltroId;
    return dataMatch && barbeiroMatch;
  });

  // Métricas
  const totalHoje = agendamentos.filter((a) => a.data === dataFiltro).length;
  const concluidosHoje = agendamentos.filter((a) => a.data === dataFiltro && a.status === 'CONCLUIDO').length;
  const faturamentoHoje = agendamentos
    .filter((a) => a.data === dataFiltro && a.status !== 'CANCELADO')
    .reduce((acc, curr) => acc + curr.servicoPreco, 0);

  const handleMudarStatus = (id, novoStatus) => {
    atualizarStatusAgendamento(id, novoStatus);
    if (onAtualizarDados) onAtualizarDados();
  };

  // Filtragem dos clientes
  const clientesFiltrados = clientes.filter(
    (c) =>
      c.nome.toLowerCase().includes(buscaCliente.toLowerCase()) ||
      c.telefone.includes(buscaCliente) ||
      c.codigoFidelidade.toLowerCase().includes(buscaCliente.toLowerCase())
  );

  return (
    <div className="bg-[#150E06] border border-[#C89B3C]/20 rounded-lg p-6 lg:p-8 text-[#F5E9D3] shadow-2xl">
      {/* Topo do Painel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#C89B3C]/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#C89B3C] uppercase tracking-widest">
            <Scissors className="w-3.5 h-3.5 text-[#C89B3C]" />
            <span>Módulo Operacional</span>
          </div>
          <h2 className="font-display text-2xl lg:text-3xl font-semibold mt-1">Gestão de Horários e Clientes</h2>
          <p className="text-xs text-[#F5E9D3]/60 mt-1">
            Controle de disponibilidade dos barbeiros em tempo real e administração de clientes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onAbrirNovoAgendamento}
            className="bg-[#C89B3C] text-[#150E06] px-5 py-2.5 font-bold text-xs uppercase tracking-wider hover:bg-[#D4AF37] transition-colors flex items-center gap-2 rounded-sm shadow-md"
          >
            <Plus className="w-4 h-4" /> Novo Agendamento
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6">
        <div className="bg-[#1C1208] border border-[#C89B3C]/15 p-4 rounded-sm">
          <div className="flex justify-between items-start text-[#F5E9D3]/60 text-xs mb-1">
            <span>Agendamentos do Dia</span>
            <Calendar className="w-4 h-4 text-[#C89B3C]" />
          </div>
          <p className="text-2xl font-mono font-bold text-[#F5E9D3]">{totalHoje}</p>
          <p className="text-[11px] text-[#F5E9D3]/50 mt-1">Data: {dataFiltro}</p>
        </div>

        <div className="bg-[#1C1208] border border-[#C89B3C]/15 p-4 rounded-sm">
          <div className="flex justify-between items-start text-[#F5E9D3]/60 text-xs mb-1">
            <span>Atendimentos Concluídos</span>
            <Check className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-mono font-bold text-emerald-400">{concluidosHoje}</p>
          <p className="text-[11px] text-[#F5E9D3]/50 mt-1">
            {totalHoje > 0 ? `${Math.round((concluidosHoje / totalHoje) * 100)}% finalizados` : 'Nenhum agendamento'}
          </p>
        </div>

        <div className="bg-[#1C1208] border border-[#C89B3C]/15 p-4 rounded-sm">
          <div className="flex justify-between items-start text-[#F5E9D3]/60 text-xs mb-1">
            <span>Faturamento Previsto</span>
            <DollarSign className="w-4 h-4 text-[#C89B3C]" />
          </div>
          <p className="text-2xl font-mono font-bold text-[#C89B3C]">
            R$ {faturamentoHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-[#F5E9D3]/50 mt-1">Exclui cancelamentos</p>
        </div>

        <div className="bg-[#1C1208] border border-[#C89B3C]/15 p-4 rounded-sm">
          <div className="flex justify-between items-start text-[#F5E9D3]/60 text-xs mb-1">
            <span>Clientes na Base</span>
            <Users className="w-4 h-4 text-[#C89B3C]" />
          </div>
          <p className="text-2xl font-mono font-bold text-[#F5E9D3]">{clientes.length}</p>
          <p className="text-[11px] text-[#F5E9D3]/50 mt-1">Com pontuação ativa</p>
        </div>
      </div>

      {/* Navegação entre Abas */}
      <div className="flex border-b border-[#C89B3C]/15 mb-6">
        <button
          onClick={() => setAbaAtiva('agenda')}
          className={`px-6 py-3 font-medium text-sm transition-all border-b-2 flex items-center gap-2 ${
            abaAtiva === 'agenda'
              ? 'border-[#C89B3C] text-[#C89B3C] bg-[#C89B3C]/5'
              : 'border-transparent text-[#F5E9D3]/60 hover:text-[#F5E9D3]'
          }`}
        >
          <Clock className="w-4 h-4" /> Agenda & Horários dos Barbeiros
        </button>
        <button
          onClick={() => setAbaAtiva('clientes')}
          className={`px-6 py-3 font-medium text-sm transition-all border-b-2 flex items-center gap-2 ${
            abaAtiva === 'clientes'
              ? 'border-[#C89B3C] text-[#C89B3C] bg-[#C89B3C]/5'
              : 'border-transparent text-[#F5E9D3]/60 hover:text-[#F5E9D3]'
          }`}
        >
          <Users className="w-4 h-4" /> Base de Clientes & Fidelidade ({clientes.length})
        </button>
      </div>

      {/* ABA 1: AGENDA E HORÁRIOS */}
      {abaAtiva === 'agenda' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between bg-[#1C1208] p-4 border border-[#C89B3C]/20 rounded-sm">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#F5E9D3]/70 font-medium">Data:</span>
                <input
                  type="date"
                  value={dataFiltro}
                  onChange={(e) => setDataFiltro(e.target.value)}
                  className="bg-[#150E06] border border-[#C89B3C]/30 text-[#F5E9D3] px-3 py-1.5 text-xs rounded font-mono focus:outline-none focus:border-[#C89B3C]"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[#F5E9D3]/70 font-medium">Barbeiro:</span>
                <select
                  value={barbeiroFiltroId}
                  onChange={(e) => setBarbeiroFiltroId(e.target.value)}
                  className="bg-[#150E06] border border-[#C89B3C]/30 text-[#F5E9D3] px-3 py-1.5 text-xs rounded focus:outline-none focus:border-[#C89B3C]"
                >
                  <option value="todos">Todos os Mestres (3)</option>
                  {barbeiros.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nome} ({b.cargo})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-xs text-[#F5E9D3]/60 self-center">
              Mostrando <span className="font-mono text-[#C89B3C] font-semibold">{agendamentosFiltrados.length}</span> agendamento(s)
            </div>
          </div>

          {agendamentosFiltrados.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#C89B3C]/20 text-[#C89B3C] font-mono uppercase tracking-wider bg-[#1C1208]/60">
                    <th className="py-3 px-4">Horário</th>
                    <th className="py-3 px-4">Código</th>
                    <th className="py-3 px-4">Cliente / Contato</th>
                    <th className="py-3 px-4">Barbeiro</th>
                    <th className="py-3 px-4">Serviço</th>
                    <th className="py-3 px-4">Valor</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C89B3C]/10 font-sans">
                  {agendamentosFiltrados.map((a) => {
                    const statusCor =
                      a.status === 'CONCLUIDO'
                        ? 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30'
                        : a.status === 'CONFIRMADO'
                        ? 'text-[#C89B3C] bg-[#C89B3C]/10 border-[#C89B3C]/30'
                        : 'text-red-400 bg-red-950/40 border-red-500/30';

                    return (
                      <tr key={a.id} className="hover:bg-[#1C1208]/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-semibold text-[#F5E9D3]">
                          {a.horaInicio} - {a.horaFim}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#C89B3C]">{a.codigo}</td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-[#F5E9D3]">{a.clienteNome}</p>
                          <p className="text-[11px] text-[#F5E9D3]/60">{a.clienteTelefone}</p>
                        </td>
                        <td className="py-3.5 px-4 font-medium">{a.barbeiroNome}</td>
                        <td className="py-3.5 px-4">
                          <p>{a.servicoNome}</p>
                          <span className="text-[10px] text-[#F5E9D3]/50">{a.servicoDuracaoMinutos} min</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold">R$ {a.servicoPreco}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 text-[10px] font-semibold border rounded ${statusCor}`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            {a.status !== 'CONCLUIDO' && (
                              <button
                                onClick={() => handleMudarStatus(a.id, 'CONCLUIDO')}
                                title="Concluir Atendimento"
                                className="p-1.5 bg-emerald-900/40 hover:bg-emerald-800 text-emerald-300 rounded border border-emerald-600/30 transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {a.status !== 'CANCELADO' && (
                              <button
                                onClick={() => handleMudarStatus(a.id, 'CANCELADO')}
                                title="Cancelar Agendamento (Liberar Horário)"
                                className="p-1.5 bg-red-900/40 hover:bg-red-800 text-red-300 rounded border border-red-600/30 transition-colors"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-[#C89B3C]/20 rounded p-6 bg-[#1C1208]/30">
              <Clock className="w-8 h-8 text-[#C89B3C]/40 mx-auto mb-2" />
              <p className="text-sm font-semibold">Nenhum agendamento para este filtro</p>
              <p className="text-xs text-[#F5E9D3]/60 mt-1">
                Os horários deste barbeiro em {dataFiltro} estão 100% disponíveis para novos clientes.
              </p>
              <button
                onClick={onAbrirNovoAgendamento}
                className="mt-4 bg-[#C89B3C] text-[#150E06] px-5 py-2 font-bold text-xs uppercase tracking-wider hover:bg-[#D4AF37] transition-colors inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Agendar Horário Agora
              </button>
            </div>
          )}
        </div>
      )}

      {/* ABA 2: BASE DE CLIENTES & FIDELIDADE */}
      {abaAtiva === 'clientes' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between bg-[#1C1208] p-4 border border-[#C89B3C]/20 rounded-sm">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Buscar cliente por nome, telefone ou código..."
                value={buscaCliente}
                onChange={(e) => setBuscaCliente(e.target.value)}
                className="w-full bg-[#150E06] border border-[#C89B3C]/30 text-[#F5E9D3] pl-9 pr-3 py-1.5 text-xs rounded focus:outline-none focus:border-[#C89B3C]"
              />
              <Search className="w-4 h-4 text-[#C89B3C] absolute left-3 top-2" />
            </div>
            <div className="text-xs text-[#F5E9D3]/60 self-center">
              Total: <span className="font-mono text-[#C89B3C] font-semibold">{clientesFiltrados.length}</span> clientes
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#C89B3C]/20 text-[#C89B3C] font-mono uppercase tracking-wider bg-[#1C1208]/60">
                  <th className="py-3 px-4">Nome do Cliente</th>
                  <th className="py-3 px-4">Contato (Telefone / E-mail)</th>
                  <th className="py-3 px-4">Código Fidelidade</th>
                  <th className="py-3 px-4">Pontos Acumulados</th>
                  <th className="py-3 px-4">Nível</th>
                  <th className="py-3 px-4">Atendimentos</th>
                  <th className="py-3 px-4 text-right">Cartão Virtual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C89B3C]/10">
                {clientesFiltrados.map((cliente) => {
                  const tier = calcularTierFidelidade(cliente.pontosFidelidade);
                  const badgeColor =
                    tier === 'OURO'
                      ? 'bg-[#F2A900]/20 text-[#F2A900] border-[#F2A900]/40'
                      : tier === 'PRATA'
                      ? 'bg-slate-300/20 text-slate-200 border-slate-300/40'
                      : 'bg-amber-700/20 text-amber-300 border-amber-700/40';

                  return (
                    <tr key={cliente.id} className="hover:bg-[#1C1208]/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-[#F5E9D3]">{cliente.nome}</td>
                      <td className="py-3.5 px-4">
                        <p>{cliente.telefone}</p>
                        <p className="text-[11px] text-[#F5E9D3]/50">{cliente.email}</p>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#C89B3C]">{cliente.codigoFidelidade}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-sm text-[#F5E9D3]">
                        {cliente.pontosFidelidade.toLocaleString('pt-BR')} pts
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold border rounded ${badgeColor}`}>
                          {tier}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-center">{cliente.totalAtendimentos}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onVerCartaoCliente(cliente)}
                          className="text-[#C89B3C] hover:text-[#D4AF37] font-semibold text-xs inline-flex items-center gap-1 hover:underline"
                        >
                          Visualizar Cartão <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
