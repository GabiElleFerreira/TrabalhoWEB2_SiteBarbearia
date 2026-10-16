import React, { useState } from 'react';
import { PROJETO_SPRING_BOOT } from '../data/springBootProject.js';
import { PROJETO_JAVASCRIPT } from '../data/javaScriptProject.js';
import { baixarArquivosComoZip } from '../services/zipDownloadService.js';
import {
  Copy,
  Check,
  FileText,
  Terminal,
  Sparkles,
  Server,
  Download,
  Coffee,
  Code2,
  FolderArchive,
  Loader2,
  FileCode,
  CheckCircle2,
} from 'lucide-react';

export const CodeExplorer = () => {
  const [linguagem, setLinguagem] = useState('JAVA'); // Padrão: Java Spring Boot
  const arquivosAtuais = linguagem === 'JAVA' ? PROJETO_SPRING_BOOT : PROJETO_JAVASCRIPT;

  const [arquivoSelecionado, setArquivoSelecionado] = useState(PROJETO_SPRING_BOOT[0]);
  const [filtroCategoria, setFiltroCategoria] = useState('TODOS');
  const [copiado, setCopiado] = useState(false);
  const [baixandoZip, setBaixandoZip] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  const categorias = ['TODOS', 'SERVICE', 'CONTROLLER', 'REPOSITORY', 'ENTITY', 'DATABASE', 'CONFIG'];

  const arquivosFiltrados = arquivosAtuais.filter(
    (a) => filtroCategoria === 'TODOS' || a.categoria === filtroCategoria
  );

  const handleMudarLinguagem = (novaLinguagem) => {
    setLinguagem(novaLinguagem);
    setFiltroCategoria('TODOS');
    if (novaLinguagem === 'JAVA') {
      setArquivoSelecionado(PROJETO_SPRING_BOOT[0]);
    } else {
      setArquivoSelecionado(PROJETO_JAVASCRIPT[0]);
    }
  };

  const handleCopiarCodigo = () => {
    navigator.clipboard.writeText(arquivoSelecionado.conteudo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleBaixarArquivoIndividual = () => {
    const blob = new Blob([arquivoSelecionado.conteudo], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = arquivoSelecionado.nome;
    link.click();
    URL.revokeObjectURL(url);
    
    setMensagemSucesso(`Arquivo "${arquivoSelecionado.nome}" baixado!`);
    setTimeout(() => setMensagemSucesso(''), 4000);
  };

  const handleBaixarZip = async (tipo) => {
    try {
      setBaixandoZip(true);
      const nomeArquivo = await baixarArquivosComoZip(tipo);
      setMensagemSucesso(`Pacote compactado "${nomeArquivo}" baixado com sucesso!`);
      setTimeout(() => setMensagemSucesso(''), 5000);
    } catch (error) {
      console.error('Erro ao gerar ZIP:', error);
    } finally {
      setBaixandoZip(false);
    }
  };

  return (
    <div className="bg-[#150E06] border border-[#C89B3C]/20 rounded-lg p-6 lg:p-8 text-[#F5E9D3] shadow-2xl space-y-6">
      {/* Header com Seletor de Linguagem: Java vs JavaScript */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#C89B3C]/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#C89B3C] uppercase tracking-widest">
            <Server className="w-3.5 h-3.5" />
            <span>Arquitetura Backend & Banco de Dados PostgreSQL</span>
          </div>
          <h2 className="font-display text-2xl lg:text-3xl font-semibold mt-1">
            {linguagem === 'JAVA' ? 'Projeto Java Spring Boot 3' : 'Projeto JavaScript (Node.js)'}
          </h2>
          <p className="text-xs text-[#F5E9D3]/70 mt-1">
            {linguagem === 'JAVA'
              ? 'Código em Java 21 com Spring Boot 3, Spring Data JPA, Hibernate e PostgreSQL com DDD (85).'
              : 'Código em JavaScript com Node.js, Express e driver oficial "pg" com PostgreSQL.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Seletor de Linguagem */}
          <div className="flex items-center gap-1 bg-[#1C1208] p-1 border border-[#C89B3C]/30 rounded">
            <button
              onClick={() => handleMudarLinguagem('JAVA')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded transition-all flex items-center gap-1.5 ${
                linguagem === 'JAVA'
                  ? 'bg-[#C89B3C] text-[#150E06] shadow'
                  : 'text-[#F5E9D3]/70 hover:text-[#F5E9D3]'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              ☕ Java (Spring Boot)
            </button>
            <button
              onClick={() => handleMudarLinguagem('JS')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded transition-all flex items-center gap-1.5 ${
                linguagem === 'JS'
                  ? 'bg-[#C89B3C] text-[#150E06] shadow'
                  : 'text-[#F5E9D3]/70 hover:text-[#F5E9D3]'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              ⚡ JavaScript (Node.js)
            </button>
          </div>
        </div>
      </div>

      {/* BARRA DE AÇÃO PRINCIPAL: BAIXAR TODOS OS ARQUIVOS */}
      <div className="p-4 bg-gradient-to-r from-[#C89B3C]/20 via-[#1C1208] to-[#C89B3C]/10 border border-[#C89B3C]/40 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#C89B3C] text-[#150E06] flex items-center justify-center font-bold shrink-0 shadow">
            <FolderArchive className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-[#F5E9D3]">
              Download Completo dos Arquivos da Barbearia
            </h3>
            <p className="text-xs text-[#F5E9D3]/70">
              Baixe todos os arquivos organizados em pastas (código, banco PostgreSQL, Docker e documentação).
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Botão Baixar Todos os Arquivos (Pacote Completo) */}
          <button
            onClick={() => handleBaixarZip('TODOS')}
            disabled={baixandoZip}
            className="flex-1 md:flex-initial bg-[#C89B3C] hover:bg-[#D4AF37] text-[#150E06] px-4 py-2.5 text-xs font-bold rounded flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {baixandoZip ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Compactando ZIP...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Baixar Todos os Arquivos (.ZIP)</span>
              </>
            )}
          </button>

          {/* Botão Baixar Apenas Java ou Apenas JS */}
          <button
            onClick={() => handleBaixarZip(linguagem)}
            disabled={baixandoZip}
            className="bg-[#1C1208] hover:bg-[#C89B3C]/15 border border-[#C89B3C]/50 text-[#C89B3C] px-3.5 py-2.5 text-xs font-semibold rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar Projeto {linguagem === 'JAVA' ? 'Java' : 'JavaScript'} (.ZIP)</span>
          </button>
        </div>
      </div>

      {/* Alerta de Sucesso de Download */}
      {mensagemSucesso && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded flex items-center gap-2 text-xs text-emerald-300 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {/* Box Didático: O arquivo que faz a junção dos dados no PostgreSQL */}
      <div className="p-4 bg-[#C89B3C]/10 border border-[#C89B3C]/30 rounded-lg space-y-3">
        <div className="flex items-center gap-2 text-[#C89B3C] font-semibold text-sm">
          <Sparkles className="w-4 h-4 text-[#C89B3C]" />
          <span>
            {linguagem === 'JAVA'
              ? 'No Java: Os 3 arquivos que fazem a junção dos dados no PostgreSQL'
              : 'No JavaScript: Os 3 arquivos que fazem a junção dos dados no PostgreSQL'}
          </span>
        </div>

        {linguagem === 'JAVA' ? (
          <div className="grid md:grid-cols-3 gap-3 text-xs">
            <div className="bg-[#150E06] p-3 rounded border border-[#C89B3C]/20">
              <span className="font-mono text-[#C89B3C] font-bold block mb-1">1. AgendamentoController.java</span>
              <p className="text-[#F5E9D3]/70 leading-relaxed">
                Porta de entrada REST: recebe o JSON do site via <code className="text-[#C89B3C]">POST /api/agendamentos</code>.
              </p>
            </div>
            <div className="bg-[#150E06] p-3 rounded border border-[#C89B3C]/40 ring-1 ring-[#C89B3C]/60 bg-[#C89B3C]/5">
              <span className="font-mono text-[#C89B3C] font-bold block mb-1">⭐ 2. AgendamentoService.java (A JUNÇÃO)</span>
              <p className="text-[#F5E9D3]/70 leading-relaxed">
                Junta Cliente + Barbeiro + Serviço, checa conflito de horário e salva no banco.
              </p>
            </div>
            <div className="bg-[#150E06] p-3 rounded border border-[#C89B3C]/20">
              <span className="font-mono text-[#C89B3C] font-bold block mb-1">3. AgendamentoRepository.java</span>
              <p className="text-[#F5E9D3]/70 leading-relaxed">
                Executa o SQL no PostgreSQL via Spring Data JPA com query de prevenção de conflito.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-3 text-xs">
            <div className="bg-[#150E06] p-3 rounded border border-[#C89B3C]/20">
              <span className="font-mono text-[#C89B3C] font-bold block mb-1">1. agendamentoController.js</span>
              <p className="text-[#F5E9D3]/70 leading-relaxed">
                Recebe a requisição HTTP POST do site.
              </p>
            </div>
            <div className="bg-[#150E06] p-3 rounded border border-[#C89B3C]/40 ring-1 ring-[#C89B3C]/60 bg-[#C89B3C]/5">
              <span className="font-mono text-[#C89B3C] font-bold block mb-1">⭐ 2. agendamentoService.js (A JUNÇÃO)</span>
              <p className="text-[#F5E9D3]/70 leading-relaxed">
                Junta os dados, valida conflito de horário e salva no PostgreSQL.
              </p>
            </div>
            <div className="bg-[#150E06] p-3 rounded border border-[#C89B3C]/20">
              <span className="font-mono text-[#C89B3C] font-bold block mb-1">3. db.js</span>
              <p className="text-[#F5E9D3]/70 leading-relaxed">
                Pool de conexão com o PostgreSQL executando queries com o driver "pg".
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Categorias de Filtro */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#C89B3C]/10">
        <div className="flex flex-wrap gap-1.5">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setFiltroCategoria(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-all ${
                filtroCategoria === cat
                  ? 'bg-[#C89B3C] text-[#150E06] font-bold shadow-sm'
                  : 'bg-[#1C1208] text-[#F5E9D3]/60 hover:text-[#F5E9D3] border border-[#C89B3C]/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <span className="text-xs text-[#F5E9D3]/50 font-mono">
          {arquivosFiltrados.length} {arquivosFiltrados.length === 1 ? 'arquivo' : 'arquivos'}
        </span>
      </div>

      {/* Split de Arquivos e Código */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Lista de Arquivos */}
        <div className="lg:col-span-4 space-y-2 max-h-[550px] overflow-y-auto pr-1">
          {arquivosFiltrados.map((arq) => {
            const selecionado = arquivoSelecionado.caminho === arq.caminho;
            return (
              <div
                key={arq.caminho}
                onClick={() => setArquivoSelecionado(arq)}
                className={`p-3 rounded border text-left cursor-pointer transition-all ${
                  selecionado
                    ? 'border-[#C89B3C] bg-[#C89B3C]/10 ring-1 ring-[#C89B3C]'
                    : 'border-[#C89B3C]/10 bg-[#1C1208]/80 hover:border-[#C89B3C]/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-[#F5E9D3] truncate flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#C89B3C]" />
                    {arq.nome}
                  </span>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#150E06] border border-[#C89B3C]/20 text-[#C89B3C] font-mono">
                    {arq.categoria}
                  </span>
                </div>
                <p className="text-[11px] text-[#F5E9D3]/60 line-clamp-2 leading-relaxed">{arq.descricao}</p>
                <p className="text-[10px] text-[#C89B3C]/60 font-mono mt-1 truncate">{arq.caminho}</p>
              </div>
            );
          })}
        </div>

        {/* Visualizador de Código */}
        <div className="lg:col-span-8 bg-[#0D0804] border border-[#C89B3C]/30 rounded-lg overflow-hidden flex flex-col shadow-inner">
          <div className="bg-[#1C1208] border-b border-[#C89B3C]/20 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="font-mono text-xs text-[#C89B3C] font-semibold">{arquivoSelecionado.caminho}</span>
              <p className="text-[11px] text-[#F5E9D3]/60">{arquivoSelecionado.descricao}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopiarCodigo}
                className="bg-[#150E06] border border-[#C89B3C]/40 hover:bg-[#C89B3C]/10 text-[#F5E9D3] px-3 py-1.5 text-xs rounded flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiado ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#C89B3C]" />
                    <span>Copiar</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBaixarArquivoIndividual}
                title="Baixar este arquivo específico"
                className="bg-[#C89B3C] hover:bg-[#D4AF37] text-[#150E06] px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar {arquivoSelecionado.nome}</span>
              </button>
            </div>
          </div>

          <div className="p-4 overflow-x-auto max-h-[480px] font-mono text-xs leading-relaxed text-[#F5E9D3]/90 bg-[#0D0804]">
            <pre className="whitespace-pre">
              <code>{arquivoSelecionado.conteudo}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Guia Rápido de Execução no Terminal */}
      <div className="p-4 bg-[#1C1208] border border-[#C89B3C]/20 rounded-lg space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#C89B3C]">
          <Terminal className="w-4 h-4" />
          <span>Como executar os arquivos baixados no seu computador:</span>
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-[#0D0804] p-3 rounded border border-[#C89B3C]/10 space-y-1">
            <span className="text-[#C89B3C] font-semibold block">☕ Com Java (Spring Boot):</span>
            <p className="text-[#F5E9D3]/60">1. Inicie o PostgreSQL: <code className="text-[#F5E9D3]">docker compose up -d</code></p>
            <p className="text-[#F5E9D3]/60">2. Inicie o Spring Boot: <code className="text-[#F5E9D3]">mvn spring-boot:run</code></p>
            <p className="text-[#F5E9D3]/60">3. Documentação Swagger: <code className="text-[#C89B3C]">http://localhost:8080/swagger-ui.html</code></p>
          </div>
          <div className="bg-[#0D0804] p-3 rounded border border-[#C89B3C]/10 space-y-1">
            <span className="text-[#C89B3C] font-semibold block">⚡ Com JavaScript (Node.js):</span>
            <p className="text-[#F5E9D3]/60">1. Inicie o PostgreSQL: <code className="text-[#F5E9D3]">docker compose up -d</code></p>
            <p className="text-[#F5E9D3]/60">2. Instale e execute: <code className="text-[#F5E9D3]">npm install && npm run dev</code></p>
            <p className="text-[#F5E9D3]/60">3. Endpoint REST: <code className="text-[#C89B3C]">http://localhost:3000/api/agendamentos</code></p>
          </div>
        </div>
      </div>
    </div>
  );
};
