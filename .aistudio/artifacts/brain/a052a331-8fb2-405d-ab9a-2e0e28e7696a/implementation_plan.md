# Vintage&Co Barbearia — Sistema de Agendamento, Gestão de Barbeiros e Arquitetura Spring Boot

Sistema de agendamento para a barbearia Vintage&Co, fiel ao design clássico em tons escuros e dourado, integrando gestão de clientes, controle de conflitos de horários por barbeiro, fidelidade e um visualizador interativo do projeto backend em Java Spring Boot com PostgreSQL.

### Decisões Confirmadas na Fase 1
- **Apresentação do Sistema**: Interface web interativa completa (agendamento em tempo real, painel de barbeiros e clientes) com visualizador e explorador de código da arquitetura Spring Boot 3 + PostgreSQL pronta para uso.
- **Banco de Dados no Spring Boot**: PostgreSQL com script de schema DDL (`schema.sql`), migrações, configuração `application.yml` e arquivo `docker-compose.yml` para execução em um comando (`docker compose up`).
- **Escopo Funcional**:
  1. Agendamento interativo com seleção de serviço, barbeiro, data e cálculo dinâmico de slots livres sem conflito.
  2. Cadastro e histórico de clientes com pontuação e níveis do Cartão Fidelidade (Bronze, Prata, Ouro).
  3. Painel de gestão da barbearia (agenda diária dos 3 mestres barbeiros, status de confirmação/conclusão, bloqueio de horários).
  4. Visualizador do projeto Java Spring Boot (Controllers, Services, Repositories, Entities JPA, DTOs, Docker e SQL).

---

## 1. Visão Geral & Conceito do Produto

- **O que faz**: Oferece aos clientes da Vintage&Co a experiência de agendar cortes e tratamentos escolhendo o profissional e horário disponível, enquanto fornece aos barbeiros uma visão clara da sua agenda e histórico dos clientes. Para o desenvolvedor/gestor técnico, disponibiliza a implementação completa e modular em Spring Boot 3.
- **Público-Alvo**: Clientes da barbearia em busca de reserva ágil e acompanhamento de pontos de fidelidade; barbeiros e administradores gerenciando atendimentos; desenvolvedores Java que necessitam de um backend limpo e eficiente.
- **Valor Central**: Eliminação de reservas duplicadas (conflito de horários), preservação da estética elegante da barbearia artesanal e código de backend desacoplado com boas práticas (SOLID, DTOs, Bean Validation).

---

## 2. Experiência do Usuário & Design Visual

### Fluxos Principais
1. **Página Inicial Vintage (Fiel ao Mockup)**:
   - Header com navegação fluida, links para Serviços, Barbeiros, Fidelidade, Depoimentos, Contato e botão de ação rápida "Agendar".
   - Hero com tipografia editorial elegante (*Playfair Display*), estatísticas históricas (35+ anos, 2.400+ clientes, 4.9★) e fotografia de utensílios artesanais.
   - Grade de Serviços detalhada com valores em reais e duração de cada atendimento.
   - Apresentação da equipe de mestres barbeiros (Rodrigo Menezes, Felipe Andrade, Caio Drummond) com botão direto de agendamento por profissional.
   - Seção interativa do Cartão de Fidelidade com consulta instantânea de pontos e exibição do cartão virtual com degradê dourado.
2. **Modal / Fluxo de Agendamento Inteligente**:
   - Etapa 1: Seleção do Serviço (com duração estimada e valor).
   - Etapa 2: Seleção do Barbeiro ou "Qualquer Barbeiro Disponível".
   - Etapa 3: Seleção da Data e cálculo de horários livres (identificando intervalos já ocupados por agendamentos existentes).
   - Etapa 4: Dados do Cliente (Nome, WhatsApp/Telefone, E-mail, observações).
   - Confirmação imediata com resumo, código do agendamento e acúmulo de pontos de fidelidade.
3. **Painel de Gestão da Barbearia (Admin & Barbeiros)**:
   - Visualização da agenda por data e por barbeiro com status (*Agendado*, *Concluído*, *Cancelado*).
   - Lista de clientes cadastrados, histórico de visitas e saldo de pontos.
   - Ação rápida para marcar presença ou cancelar agendamento.
4. **Explorador da Arquitetura Spring Boot**:
   - Seção dedicada e intuitiva onde o usuário pode navegar por todo o código-fonte Java (`Cliente`, `Barbeiro`, `Agendamento`, `AgendamentoService`, `AgendamentoController`), além do `pom.xml`, `application.yml`, `docker-compose.yml` e `schema.sql`.
   - Botão para copiar código de cada classe ou baixar o projeto estruturado.

### Identidade Visual & Tipografia
- **Paleta de Cores**:
  - Fundo principal: `#1C1208` (Dark) e `#150E06` (Darker).
  - Destaque nobre: `#C89B3C` (Gold) e `#D4AF37` (GoldLight).
  - Texto e contraste: `#F5E9D3` (Cream) com opacidades calibradas para legibilidade WCAG AA.
  - Cartão fidelidade: Gradiente linear `#C89B3C` a `#F2A900`.
- **Tipografia**:
  - Títulos e Destaques: `Playfair Display` (serif clássica, peso 600/700).
  - Textos de Apoio e Formulários: `Inter` (sans-serif neutra e de alta legibilidade).
  - Horários e Códigos: Tabular numerals para precisão visual.

---

## 3. Decisões do Produto & Arquitetura de Software

### Decisão 1: Validação de Conflito de Horários
- **Abordagem**: Um agendamento possui início (`dataHoraInicio`) e término calculado automaticamente (`dataHoraFim = dataHoraInicio + duracaoMinutos`). Dois agendamentos para o mesmo barbeiro conflitam se:
  `novoInicio < agendamentoExistenteFim AND novoFim > agendamentoExistenteInicio`
- **Por que**: Garante que serviços de diferentes durações (ex: 25 min vs 75 min) nunca se sobreponham na agenda do mesmo profissional, além de respeitar a pausa entre cortes.

### Decisão 2: Arquitetura em Camadas no Spring Boot
- **Abordagem**: Padrão Controller-Service-Repository-Entity com DTOs e MapStruct/Records:
  - `controllers`: Endpoints REST (`/api/agendamentos`, `/api/barbeiros`, `/api/clientes`, `/api/servicos`).
  - `services`: Regras de negócio, cálculo de slots disponíveis e validação de duplicidade.
  - `repositories`: Spring Data JPA com queries derivadas e `@Query` com parâmetros temporais.
  - `entities`: Modelos mapeados via Hibernate `@Entity` com validação de chaves estrangeiras.
- **Por que**: Separação clara de responsabilidades, facilitando manutenção, testes unitários com JUnit 5 e evolução futura.

---

## 4. Arquitetura Técnica & Modelo de Dados

### Diagrama de Componentes e Fluxo de Dados

```
┌────────────────────────────────────────────────────────────────────────┐
│                   VINTAGE & CO FRONTEND (React + TS)                   │
├────────────────────────────────┬───────────────────────────────────────┤
│    Interface do Cliente        │      Painel de Gestão da Barbearia    │
│  - Catálogo de Serviços        │  - Agenda dos Barbeiros por Data      │
│  - Modal de Agendamento Real   │  - Gerenciamento de Status            │
│  - Consulta Cartão Fidelidade  │  - Base de Clientes Cadastrados       │
└───────────────┬────────────────┴───────────────────┬───────────────────┘
                │                                    │
                ▼                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               CAMADA DE SERVIÇOS & REGRAS DE NEGÓCIO                   │
│  - Verificação de Conflitos: [novoInicio, novoFim) ∩ [existente]       │
│  - Cálculo de Horários Livres (09:00 - 19:00)                          │
│  - Cálculo de Pontos de Fidelidade (1 real gasto = 10 pontos)          │
└────────────────────────────────┬───────────────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│               PROJETO BACKEND JAVA SPRING BOOT 3 (PostgreSQL)          │
├────────────────────────────────────────────────────────────────────────┤
│  Entities: Cliente, Barbeiro, Servico, Agendamento                     │
│  Repositories: AgendamentoRepository (validação por JPQL)              │
│  Services: AgendamentoService, DisponibilidadeService                  │
│  Controllers: AgendamentoController, ClienteController                 │
│  Infra: Dockerfile, docker-compose.yml, schema.sql, application.yml    │
└────────────────────────────────────────────────────────────────────────┘
```

### Modelo Relacional (PostgreSQL)
1. **`tb_cliente`**: `id` (BIGSERIAL PK), `nome` (VARCHAR), `telefone` (VARCHAR), `email` (VARCHAR), `pontos_fidelidade` (INT), `data_cadastro` (TIMESTAMP).
2. **`tb_barbeiro`**: `id` (BIGSERIAL PK), `nome` (VARCHAR), `cargo` (VARCHAR), `especialidade` (VARCHAR), `foto_url` (VARCHAR), `avaliacao` (DECIMAL), `ativo` (BOOLEAN).
3. **`tb_servico`**: `id` (BIGSERIAL PK), `nome` (VARCHAR), `descricao` (TEXT), `preco` (DECIMAL), `duracao_minutos` (INT).
4. **`tb_agendamento`**: `id` (BIGSERIAL PK), `cliente_id` (FK), `barbeiro_id` (FK), `servico_id` (FK), `data_hora_inicio` (TIMESTAMP), `data_hora_fim` (TIMESTAMP), `status` (VARCHAR: PENDENTE, CONFIRMADO, CONCLUIDO, CANCELADO), `observacao` (TEXT).

---

## 5. Plano de Execução

1. **Configuração e Assets**:
   - Ajustar `index.html` e `metadata.json` com títulos e descrição oficiais da Vintage&Co.
   - Gerar/verificar imagens de apoio de alta qualidade conforme as diretrizes do frontend.
2. **Estrutura de Estado e Dados**:
   - Criar os tipos TypeScript correspondentes às entidades do banco de dados (`Cliente`, `Barbeiro`, `Servico`, `Agendamento`, `HorarioDisponivel`).
   - Implementar o motor de agendamento e conflito de horários com persistência local reativa.
3. **Componentes da Interface**:
   - Navbar clássica responsiva com navegação por âncoras e botão de agendamento.
   - Seções Hero, Serviços, Barbeiros, Cartão de Fidelidade com modal de consulta, Depoimentos e Contato.
   - Modal de Agendamento em 4 passos com validação e feedback de sucesso.
   - Painel do Barbeiro / Gestão acessível com visão por data e filtros.
   - Visualizador Interativo de Código Spring Boot com abas organizadas (Entities, Services, Controllers, Docker/SQL) e syntax highlight.
4. **Validação & Compilação**:
   - Executar `compile_applet` para assegurar build limpo sem erros de tipagem.
