import React, { useState } from 'react';
import { calcularTierFidelidade, obterBeneficioTier, obterClientes, salvarOuAtualizarCliente } from '../services/scheduleService.js';
import { X, Search, PlusCircle, Award, CheckCircle, Sparkles, User, Phone } from 'lucide-react';

export const FidelityCardModal = ({
  isOpen,
  onClose,
  clienteSelecionado = null,
  onClienteAtualizado,
}) => {
  const [busca, setBusca] = useState('');
  const [clienteExibido, setClienteExibido] = useState(clienteSelecionado);
  const [modoCadastro, setModoCadastro] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoTelefone, setNovoTelefone] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  if (!isOpen) return null;

  const handleBuscar = (e) => {
    e.preventDefault();
    setMensagemSucesso('');
    const clientes = obterClientes();
    const termo = busca.trim().toLowerCase();
    const encontrado = clientes.find(
      (c) =>
        c.nome.toLowerCase().includes(termo) ||
        c.telefone.replace(/\D/g, '').includes(termo.replace(/\D/g, '')) ||
        c.codigoFidelidade.toLowerCase().includes(termo)
    );

    if (encontrado) {
      setClienteExibido(encontrado);
      setModoCadastro(false);
    } else {
      setClienteExibido(null);
    }
  };

  const handleCadastrarNovo = (e) => {
    e.preventDefault();
    if (!novoNome.trim() || !novoTelefone.trim()) return;

    const clienteCriado = salvarOuAtualizarCliente(novoNome.trim(), novoTelefone.trim(), '', 100);
    setClienteExibido(clienteCriado);
    setModoCadastro(false);
    setMensagemSucesso('Cartão de fidelidade criado com 100 pontos bônus de boas-vindas!');
    if (onClienteAtualizado) onClienteAtualizado();
  };

  const tierAtual = clienteExibido ? calcularTierFidelidade(clienteExibido.pontosFidelidade) : 'BRONZE';
  const beneficio = obterBeneficioTier(tierAtual);

  const metaProximoTier = tierAtual === 'BRONZE' ? 500 : tierAtual === 'PRATA' ? 1500 : 2500;
  const porcentagemProgresso = Math.min(100, Math.round(((clienteExibido?.pontosFidelidade || 0) / metaProximoTier) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-[#150E06] border border-[#C89B3C]/30 rounded-lg shadow-2xl p-6 sm:p-8 text-[#F5E9D3]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#F5E9D3]/60 hover:text-[#C89B3C] transition-colors p-1"
          aria-label="Fechar"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6">
          <p className="text-xs uppercase tracking-widest text-[#C89B3C] font-medium">— CLUBE DE VANTAGENS —</p>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold mt-1">Cartão de Fidelidade Vintage</h2>
          <p className="text-xs text-[#F5E9D3]/70 mt-1">
            Consulte seus pontos acumulados ou crie seu cartão para desbloquear até 15% de desconto.
          </p>
        </div>

        {mensagemSucesso && (
          <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded flex items-center gap-2 text-emerald-200 text-xs">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{mensagemSucesso}</span>
          </div>
        )}

        {!modoCadastro ? (
          <div>
            <form onSubmit={handleBuscar} className="flex gap-2 mb-6">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Digite seu telefone, nome ou código (ex: (85) 98765-4321)"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full bg-[#1C1208] border border-[#C89B3C]/30 text-[#F5E9D3] pl-9 pr-3 py-2 text-sm rounded focus:outline-none focus:border-[#C89B3C]"
                />
                <Search className="w-4 h-4 text-[#C89B3C] absolute left-3 top-3" />
              </div>
              <button
                type="submit"
                className="bg-[#C89B3C] text-[#150E06] px-5 py-2 font-semibold text-sm hover:bg-[#D4AF37] transition-colors"
              >
                Consultar
              </button>
            </form>

            {clienteExibido ? (
              <div className="space-y-6">
                <div className="card-gradient rounded-xl p-6 text-[#150E06] shadow-2xl relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[#150E06]/70 text-xs font-semibold tracking-wider">VINTAGE&CO</p>
                      <p className="text-[10px] text-[#150E06]/60">GENTLEMAN'S CLUB</p>
                    </div>
                    <span className="bg-[#150E06]/15 backdrop-blur-xs px-3 py-0.5 text-xs font-bold rounded tracking-wider border border-[#150E06]/20">
                      {tierAtual}
                    </span>
                  </div>

                  <div className="my-5">
                    <p className="text-4xl font-display font-bold leading-none">
                      {clienteExibido.pontosFidelidade.toLocaleString('pt-BR')}{' '}
                      <span className="text-sm font-normal">pts</span>
                    </p>
                    <p className="text-base font-semibold text-[#150E06]/90 mt-1">{clienteExibido.nome}</p>
                    <p className="text-xs text-[#150E06]/70">{clienteExibido.telefone}</p>
                  </div>

                  <div className="flex justify-between items-center text-xs text-[#150E06]/60 font-mono">
                    <span>{clienteExibido.codigoFidelidade}</span>
                    <span>{clienteExibido.totalAtendimentos} visitas</span>
                  </div>
                </div>

                <div className="bg-[#1C1208] border border-[#C89B3C]/20 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#F5E9D3]/70">Benefício Ativo ({tierAtual}):</span>
                    <span className="text-[#C89B3C] font-semibold">{beneficio}</span>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-[#F5E9D3]/60 mb-1">
                      <span>Progresso até próximo nível</span>
                      <span className="font-mono">{clienteExibido.pontosFidelidade} / {metaProximoTier} pts</span>
                    </div>
                    <div className="w-full bg-[#150E06] h-2 rounded-full overflow-hidden border border-[#C89B3C]/20">
                      <div
                        className="bg-[#C89B3C] h-full transition-all duration-500"
                        style={{ width: `${porcentagemProgresso}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => {
                      setClienteExibido(null);
                      setModoCadastro(true);
                    }}
                    className="text-xs text-[#C89B3C] hover:underline flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Cadastrar outro cliente
                  </button>
                  <button
                    onClick={onClose}
                    className="bg-[#C89B3C] text-[#150E06] px-6 py-2 text-xs font-semibold hover:bg-[#D4AF37]"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-[#C89B3C]/20 rounded-lg p-6 bg-[#1C1208]/40">
                <Award className="w-10 h-10 text-[#C89B3C]/50 mx-auto mb-2" />
                <p className="text-sm font-semibold text-[#F5E9D3]">Nenhum cliente selecionado</p>
                <p className="text-xs text-[#F5E9D3]/60 mt-1 max-w-sm mx-auto">
                  Consulte digitando seu telefone acima (ex: Carlos Mendes, André Lustosa) ou crie seu cartão instantâneo gratuito.
                </p>
                <button
                  onClick={() => setModoCadastro(true)}
                  className="mt-4 bg-[#C89B3C] text-[#150E06] px-6 py-2 text-xs font-semibold hover:bg-[#D4AF37] transition-colors inline-flex items-center gap-1"
                >
                  <PlusCircle className="w-4 h-4" /> Criar Meu Cartão Grátis
                </button>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleCadastrarNovo} className="space-y-4">
            <div className="p-3 bg-[#C89B3C]/10 border border-[#C89B3C]/30 rounded text-xs text-[#C89B3C] flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Crie seu cartão agora e ganhe 100 pontos de bônus imediato!</span>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#C89B3C] mb-1 font-medium flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Seu Nome Completo
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Gabriel Santos"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                className="w-full bg-[#1C1208] border border-[#C89B3C]/30 text-[#F5E9D3] px-3 py-2 text-sm rounded focus:outline-none focus:border-[#C89B3C]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#C89B3C] mb-1 font-medium flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> Telefone / WhatsApp
              </label>
              <input
                type="tel"
                required
                placeholder="(85) 98765-4321"
                value={novoTelefone}
                onChange={(e) => setNovoTelefone(e.target.value)}
                className="w-full bg-[#1C1208] border border-[#C89B3C]/30 text-[#F5E9D3] px-3 py-2 text-sm rounded focus:outline-none focus:border-[#C89B3C]"
              />
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-[#C89B3C]/10">
              <button
                type="button"
                onClick={() => setModoCadastro(false)}
                className="text-xs text-[#F5E9D3]/70 hover:text-[#C89B3C]"
              >
                Voltar à Consulta
              </button>
              <button
                type="submit"
                className="bg-[#C89B3C] text-[#150E06] px-6 py-2.5 font-bold text-sm hover:bg-[#D4AF37] transition-colors"
              >
                Gerar Cartão Fidelidade
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
