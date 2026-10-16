import React, { useState } from 'react';
import { Scissors, Menu, X, LayoutDashboard, Code, Calendar, Download, Loader2 } from 'lucide-react';
import { baixarArquivosComoZip } from '../services/zipDownloadService.js';

export const Navbar = ({
  onAbrirAgendamento,
  onAbrirFidelidade,
  visaoAtual,
  onMudarVisao,
}) => {
  const [menuAberto, setMenuAberto] = useState(false);
  const [baixando, setBaixando] = useState(false);

  const handleBaixarZipCompleto = async () => {
    try {
      setBaixando(true);
      await baixarArquivosComoZip('TODOS');
    } catch (e) {
      console.error(e);
    } finally {
      setBaixando(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#150E06]/95 backdrop-blur-md border-b border-[#C89B3C]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3.5 gap-6">
          {/* Zone 1: Brand Wordmark */}
          <button
            onClick={() => onMudarVisao('site')}
            className="font-display text-2xl font-semibold text-[#C89B3C] flex items-center gap-2 tracking-tight whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
          >
            <Scissors className="w-5 h-5 text-[#D4AF37]" />
            <span>Vintage<span className="text-[#F5E9D3]">&Co</span></span>
          </button>

          {/* Zone 2: Clean Single-line Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs uppercase tracking-wider font-medium text-[#F5E9D3]/80">
            <button
              onClick={() => {
                onMudarVisao('site');
                window.location.hash = '#servicos';
              }}
              className="hover:text-[#C89B3C] transition-colors whitespace-nowrap"
            >
              Serviços
            </button>
            <button
              onClick={() => {
                onMudarVisao('site');
                window.location.hash = '#barbeiros';
              }}
              className="hover:text-[#C89B3C] transition-colors whitespace-nowrap"
            >
              Barbeiros
            </button>
            <button
              onClick={onAbrirFidelidade}
              className="hover:text-[#C89B3C] transition-colors whitespace-nowrap"
            >
              Fidelidade
            </button>
            <button
              onClick={() => {
                onMudarVisao('site');
                window.location.hash = '#depoimentos';
              }}
              className="hover:text-[#C89B3C] transition-colors whitespace-nowrap"
            >
              Depoimentos
            </button>
            <button
              onClick={() => {
                onMudarVisao('site');
                window.location.hash = '#contato';
              }}
              className="hover:text-[#C89B3C] transition-colors whitespace-nowrap"
            >
              Contato
            </button>
          </nav>

          {/* Zone 3: Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Alternador de Visão Operacional / Código */}
            <div className="hidden sm:flex items-center gap-1 bg-[#1C1208] p-1 border border-[#C89B3C]/20 rounded-sm">
              <button
                onClick={() => onMudarVisao('site')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-xs transition-colors flex items-center gap-1.5 ${
                  visaoAtual === 'site'
                    ? 'bg-[#C89B3C] text-[#150E06]'
                    : 'text-[#F5E9D3]/70 hover:text-[#F5E9D3]'
                }`}
              >
                Início
              </button>
              <button
                onClick={() => onMudarVisao('painel')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-xs transition-colors flex items-center gap-1.5 ${
                  visaoAtual === 'painel'
                    ? 'bg-[#C89B3C] text-[#150E06]'
                    : 'text-[#F5E9D3]/70 hover:text-[#F5E9D3]'
                }`}
              >
                <LayoutDashboard className="w-3 h-3" />
                Painel
              </button>
              <button
                onClick={() => onMudarVisao('codigo')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-xs transition-colors flex items-center gap-1.5 ${
                  visaoAtual === 'codigo'
                    ? 'bg-[#C89B3C] text-[#150E06]'
                    : 'text-[#F5E9D3]/70 hover:text-[#F5E9D3]'
                }`}
              >
                <Code className="w-3 h-3" />
                Arquitetura
              </button>
            </div>

            {/* Botão Baixar Código (.ZIP) */}
            <button
              onClick={handleBaixarZipCompleto}
              disabled={baixando}
              title="Baixar todos os arquivos (Java + JS + PostgreSQL + Docker)"
              className="hidden sm:flex items-center gap-1.5 bg-[#1C1208] hover:bg-[#C89B3C]/15 border border-[#C89B3C]/40 text-[#C89B3C] px-3 py-1.5 text-xs font-semibold rounded transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {baixando ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Baixar ZIP</span>
            </button>

            {/* Primary Action CTA */}
            <button
              onClick={onAbrirAgendamento}
              className="bg-[#C89B3C] text-[#150E06] px-4 sm:px-5 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#D4AF37] transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Agendar</span>
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMenuAberto(!menuAberto)}
              className="lg:hidden text-[#F5E9D3] p-1 hover:text-[#C89B3C]"
              aria-label="Abrir Menu"
            >
              {menuAberto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>


        {/* Mobile Dropdown */}
        {menuAberto && (
          <div className="lg:hidden py-4 border-t border-[#C89B3C]/10 space-y-3">
            <div className="flex gap-2 pb-2 border-b border-[#C89B3C]/10">
              <button
                onClick={() => {
                  onMudarVisao('site');
                  setMenuAberto(false);
                }}
                className={`flex-1 py-1.5 text-xs text-center font-semibold rounded ${
                  visaoAtual === 'site' ? 'bg-[#C89B3C] text-[#150E06]' : 'bg-[#1C1208] text-[#F5E9D3]/70'
                }`}
              >
                Início
              </button>
              <button
                onClick={() => {
                  onMudarVisao('painel');
                  setMenuAberto(false);
                }}
                className={`flex-1 py-1.5 text-xs text-center font-semibold rounded ${
                  visaoAtual === 'painel' ? 'bg-[#C89B3C] text-[#150E06]' : 'bg-[#1C1208] text-[#F5E9D3]/70'
                }`}
              >
                Painel
              </button>
              <button
                onClick={() => {
                  onMudarVisao('codigo');
                  setMenuAberto(false);
                }}
                className={`flex-1 py-1.5 text-xs text-center font-semibold rounded ${
                  visaoAtual === 'codigo' ? 'bg-[#C89B3C] text-[#150E06]' : 'bg-[#1C1208] text-[#F5E9D3]/70'
                }`}
              >
                ☕ Java Spring Boot
              </button>
            </div>

            <div className="flex flex-col gap-2 text-xs uppercase tracking-wider font-medium text-[#F5E9D3]/80">
              <button
                onClick={() => {
                  onMudarVisao('site');
                  setMenuAberto(false);
                  window.location.hash = '#servicos';
                }}
                className="text-left py-1 hover:text-[#C89B3C]"
              >
                Serviços
              </button>
              <button
                onClick={() => {
                  onMudarVisao('site');
                  setMenuAberto(false);
                  window.location.hash = '#barbeiros';
                }}
                className="text-left py-1 hover:text-[#C89B3C]"
              >
                Barbeiros
              </button>
              <button
                onClick={() => {
                  onAbrirFidelidade();
                  setMenuAberto(false);
                }}
                className="text-left py-1 hover:text-[#C89B3C]"
              >
                Cartão Fidelidade
              </button>
              <button
                onClick={() => {
                  onMudarVisao('site');
                  setMenuAberto(false);
                  window.location.hash = '#depoimentos';
                }}
                className="text-left py-1 hover:text-[#C89B3C]"
              >
                Depoimentos
              </button>
              <button
                onClick={() => {
                  onMudarVisao('site');
                  setMenuAberto(false);
                  window.location.hash = '#contato';
                }}
                className="text-left py-1 hover:text-[#C89B3C]"
              >
                Contato
              </button>
            </div>

            <button
              onClick={() => {
                handleBaixarZipCompleto();
                setMenuAberto(false);
              }}
              disabled={baixando}
              className="w-full mt-2 bg-[#C89B3C] text-[#150E06] py-2 text-xs font-bold rounded flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Todos os Arquivos (.ZIP)</span>
            </button>
          </div>
        )}

      </div>
    </header>
  );
};
