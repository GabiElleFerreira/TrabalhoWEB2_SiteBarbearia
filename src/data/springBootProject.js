export const PROJETO_SPRING_BOOT = [
  {
    caminho: 'src/main/java/com/vintageco/barbearia/service/AgendamentoService.java',
    nome: 'AgendamentoService.java',
    categoria: 'SERVICE',
    descricao: '⭐ ARQUIVO QUE FAZ A JUNÇÃO: Valida conflito de horários no banco, localiza/cria cliente e salva no PostgreSQL.',
    conteudo: `package com.vintageco.barbearia.service;

import com.vintageco.barbearia.dto.AgendamentoRequestDTO;
import com.vintageco.barbearia.dto.AgendamentoResponseDTO;
import com.vintageco.barbearia.exception.ConflitoHorarioException;
import com.vintageco.barbearia.exception.RecursoNaoEncontradoException;
import com.vintageco.barbearia.model.*;
import com.vintageco.barbearia.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * SERVIÇO QUE FAZ A JUNÇÃO DOS DADOS DO SITE PARA O BANCO POSTGRESQL
 */
@Service
@RequiredArgsConstructor
public class AgendamentoService {

    private final AgendamentoRepository agendamentoRepository;
    private final ClienteRepository clienteRepository;
    private final BarbeiroRepository barbeiroRepository;
    private final ServicoRepository servicoRepository;

    @Transactional
    public AgendamentoResponseDTO criarAgendamento(AgendamentoRequestDTO dto) {
        // 1. Busca o barbeiro e o serviço selecionados no site
        Barbeiro barbeiro = barbeiroRepository.findById(dto.barbeiroId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Barbeiro não encontrado"));

        Servico servico = servicoRepository.findById(dto.servicoId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Serviço não encontrado"));

        // 2. Calcula horário de término com base na duração do corte
        LocalDateTime inicio = dto.dataHoraInicio();
        LocalDateTime fim = inicio.plusMinutes(servico.getDuracaoMinutos());

        // 3. Validação de horário de expediente do barbeiro (09:00 às 19:00)
        if (inicio.toLocalTime().isBefore(barbeiro.getHorarioInicio()) || 
            fim.toLocalTime().isAfter(barbeiro.getHorarioFim())) {
            throw new IllegalArgumentException("Horário solicitado está fora do expediente do barbeiro.");
        }

        // 4. PREVENÇÃO DE CONFLITO: checa sobreposição de horários no PostgreSQL
        boolean existeConflito = agendamentoRepository.existeConflitoHorario(barbeiro.getId(), inicio, fim);
        if (existeConflito) {
            throw new ConflitoHorarioException(
                "O barbeiro " + barbeiro.getNome() + " já possui agendamento neste horário."
            );
        }

        // 5. Cadastrar ou localizar o cliente pelo telefone com DDD 85 (Ceará)
        Cliente cliente = clienteRepository.findByTelefone(dto.clienteTelefone())
                .orElseGet(() -> {
                    String codigoFidelidade = "VC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                    return Cliente.builder()
                            .nome(dto.clienteNome())
                            .telefone(dto.clienteTelefone())
                            .email(dto.clienteEmail())
                            .codigoFidelidade(codigoFidelidade)
                            .pontosFidelidade(0)
                            .totalAtendimentos(0)
                            .build();
                });

        // 6. Pontos de fidelidade (R$ 1 gasto = 10 pontos)
        int pontosGanhos = servico.getPreco().intValue() * 10;
        cliente.adicionarPontos(pontosGanhos);
        clienteRepository.save(cliente);

        // 7. JUNÇÃO FINAL: Salva o agendamento completo no PostgreSQL
        String codigoReserva = "VC-" + (1000 + (int)(Math.random() * 9000));
        Agendamento agendamento = Agendamento.builder()
                .codigo(codigoReserva)
                .cliente(cliente)
                .barbeiro(barbeiro)
                .servico(servico)
                .dataHoraInicio(inicio)
                .dataHoraFim(fim)
                .status(StatusAgendamento.CONFIRMADO)
                .observacoes(dto.observacoes())
                .build();

        Agendamento salvo = agendamentoRepository.save(agendamento);
        return AgendamentoResponseDTO.fromEntity(salvo);
    }
}`
  },
  {
    caminho: 'src/main/java/com/vintageco/barbearia/controller/AgendamentoController.java',
    nome: 'AgendamentoController.java',
    categoria: 'CONTROLLER',
    descricao: 'Porta de entrada REST: recebe a requisição HTTP POST /api/agendamentos enviada pelo site.',
    conteudo: `package com.vintageco.barbearia.controller;

import com.vintageco.barbearia.dto.AgendamentoRequestDTO;
import com.vintageco.barbearia.dto.AgendamentoResponseDTO;
import com.vintageco.barbearia.service.AgendamentoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/agendamentos")
@RequiredArgsConstructor
@Tag(name = "Agendamentos", description = "Endpoints para agendamento de barbearia")
@CrossOrigin(origins = "*")
public class AgendamentoController {

    private final AgendamentoService agendamentoService;

    @PostMapping
    @Operation(summary = "Realiza agendamento com validação de conflito no PostgreSQL")
    public ResponseEntity<AgendamentoResponseDTO> criar(@RequestBody @Valid AgendamentoRequestDTO dto) {
        AgendamentoResponseDTO resposta = agendamentoService.criarAgendamento(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(resposta);
    }
}`
  },
  {
    caminho: 'src/main/java/com/vintageco/barbearia/repository/AgendamentoRepository.java',
    nome: 'AgendamentoRepository.java',
    categoria: 'REPOSITORY',
    descricao: 'Repositório JPA que executa a consulta no PostgreSQL para impedir conflitos de horários.',
    conteudo: `package com.vintageco.barbearia.repository;

import com.vintageco.barbearia.model.Agendamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {

    /**
     * Consulta no PostgreSQL: detecta matematicamente se já existe corte/barba no mesmo intervalo.
     * Fórmula: inicioNovo < fimExistente AND fimNovo > inicioExistente
     */
    @Query("""
        SELECT COUNT(a) > 0 
        FROM Agendamento a 
        WHERE a.barbeiro.id = :barbeiroId 
          AND a.status != com.vintageco.barbearia.model.StatusAgendamento.CANCELADO
          AND (:inicio < a.dataHoraFim AND :fim > a.dataHoraInicio)
    """)
    boolean existeConflitoHorario(
        @Param("barbeiroId") Long barbeiroId,
        @Param("inicio") LocalDateTime inicio,
        @Param("fim") LocalDateTime fim
    );
}`
  },
  {
    caminho: 'src/main/java/com/vintageco/barbearia/model/Agendamento.java',
    nome: 'Agendamento.java',
    categoria: 'ENTITY',
    descricao: 'Entidade JPA mapeando a tabela "tb_agendamento" com chaves estrangeiras no PostgreSQL.',
    conteudo: `package com.vintageco.barbearia.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_agendamento")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Agendamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String codigo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "barbeiro_id", nullable = false)
    private Barbeiro barbeiro;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "servico_id", nullable = false)
    private Servico servico;

    @Column(name = "data_hora_inicio", nullable = false)
    private LocalDateTime dataHoraInicio;

    @Column(name = "data_hora_fim", nullable = false)
    private LocalDateTime dataHoraFim;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private StatusAgendamento status = StatusAgendamento.CONFIRMADO;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @PrePersist
    public void prePersist() {
        if (this.criadoEm == null) this.criadoEm = LocalDateTime.now();
    }
}`
  },
  {
    caminho: 'src/main/java/com/vintageco/barbearia/model/Cliente.java',
    nome: 'Cliente.java',
    categoria: 'ENTITY',
    descricao: 'Entidade JPA do cliente com telefone DDD 85 e pontos acumulados do Cartão Fidelidade.',
    conteudo: `package com.vintageco.barbearia.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_cliente")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, unique = true, length = 20)
    private String telefone; // Ex: (85) 98765-4321

    @Column(length = 120)
    private String email;

    @Column(name = "pontos_fidelidade", nullable = false)
    @Builder.Default
    private Integer pontosFidelidade = 0;

    @Column(name = "codigo_fidelidade", unique = true, length = 30)
    private String codigoFidelidade;

    @Column(name = "total_atendimentos", nullable = false)
    @Builder.Default
    private Integer totalAtendimentos = 0;

    @Column(name = "data_cadastro", nullable = false, updatable = false)
    private LocalDateTime dataCadastro;

    @PrePersist
    public void prePersist() {
        if (this.dataCadastro == null) this.dataCadastro = LocalDateTime.now();
    }

    public void adicionarPontos(int pontos) {
        if (this.pontosFidelidade == null) this.pontosFidelidade = 0;
        this.pontosFidelidade += pontos;
        if (this.totalAtendimentos == null) this.totalAtendimentos = 0;
        this.totalAtendimentos += 1;
    }
}`
  },
  {
    caminho: 'src/main/java/com/vintageco/barbearia/model/Barbeiro.java',
    nome: 'Barbeiro.java',
    categoria: 'ENTITY',
    descricao: 'Entidade JPA do profissional com horário de expediente (09h às 19h).',
    conteudo: `package com.vintageco.barbearia.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalTime;

@Entity
@Table(name = "tb_barbeiro")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Barbeiro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, length = 50)
    private String cargo;

    @Column(nullable = false, length = 100)
    private String especialidade;

    @Column(name = "foto_url")
    private String fotoUrl;

    @Column(precision = 2, scale = 1)
    private BigDecimal avaliacao;

    @Column(name = "anos_experiencia", nullable = false)
    private Integer anosExperiencia;

    @Column(nullable = false)
    @Builder.Default
    private Boolean ativo = true;

    @Column(name = "horario_inicio", nullable = false)
    private LocalTime horarioInicio; // 09:00:00

    @Column(name = "horario_fim", nullable = false)
    private LocalTime horarioFim;    // 19:00:00
}`
  },
  {
    caminho: 'src/main/resources/application.yml',
    nome: 'application.yml',
    categoria: 'CONFIG',
    descricao: 'Configuração do Spring Boot conectando ao PostgreSQL na porta 5432.',
    conteudo: `spring:
  application:
    name: vintage-barbearia-api

  datasource:
    url: jdbc:postgresql://localhost:5432/vintage_barbearia
    username: postgres
    password: vintage_secret_pwd
    driver-class-name: org.postgresql.Driver

  jpa:
    database-platform: org.hibernate.dialect.PostgreSQLDialect
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        format_sql: true

  sql:
    init:
      mode: always
      schema-locations: classpath:schema.sql

server:
  port: 8080

springdoc:
  swagger-ui:
    path: /swagger-ui.html`
  },
  {
    caminho: 'src/main/resources/schema.sql',
    nome: 'schema.sql',
    categoria: 'DATABASE',
    descricao: 'Script DDL completo do PostgreSQL com constraints e dados de Maracanaú/CE com DDD 85.',
    conteudo: `-- ========================================================
-- Schema DDL: Vintage&Co Barbearia (PostgreSQL)
-- ========================================================

CREATE TABLE IF NOT EXISTS tb_cliente (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(120),
    pontos_fidelidade INT NOT NULL DEFAULT 0,
    codigo_fidelidade VARCHAR(30) UNIQUE,
    total_atendimentos INT NOT NULL DEFAULT 0,
    data_cadastro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tb_barbeiro (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cargo VARCHAR(50) NOT NULL,
    especialidade VARCHAR(100) NOT NULL,
    foto_url VARCHAR(255),
    avaliacao NUMERIC(2, 1) DEFAULT 5.0,
    anos_experiencia INT NOT NULL DEFAULT 1,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    horario_inicio TIME NOT NULL DEFAULT '09:00:00',
    horario_fim TIME NOT NULL DEFAULT '19:00:00'
);

CREATE TABLE IF NOT EXISTS tb_servico (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(80) NOT NULL,
    descricao TEXT,
    preco NUMERIC(10, 2) NOT NULL,
    duracao_minutos INT NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS tb_agendamento (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    cliente_id BIGINT NOT NULL REFERENCES tb_cliente(id),
    barbeiro_id BIGINT NOT NULL REFERENCES tb_barbeiro(id),
    servico_id BIGINT NOT NULL REFERENCES tb_servico(id),
    data_hora_inicio TIMESTAMP NOT NULL,
    data_hora_fim TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMADO',
    observacoes TEXT,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agendamento_barbeiro_data 
    ON tb_agendamento(barbeiro_id, data_hora_inicio, data_hora_fim, status);

-- Carga inicial com DDD 85
INSERT INTO tb_barbeiro (nome, cargo, especialidade, avaliacao, anos_experiencia, ativo, horario_inicio, horario_fim)
VALUES 
  ('Rodrigo Menezes', 'MESTRE BARBEIRO', 'Corte Clássico & Navalha', 4.9, 18, TRUE, '09:00:00', '19:00:00'),
  ('Felipe Andrade', 'BARBEIRO SÊNIOR', 'Barba Esculpida & Bigode', 4.8, 11, TRUE, '09:00:00', '19:00:00'),
  ('Caio Drummond', 'BARBEIRO ARTÍSTICO', 'Degradê & Desenho', 4.7, 9, TRUE, '09:00:00', '19:00:00')
ON CONFLICT DO NOTHING;

INSERT INTO tb_servico (nome, descricao, preco, duracao_minutos, ativo)
VALUES
  ('Corte Clássico', 'Corte tradicional com acabamento na navalha.', 55.00, 45, TRUE),
  ('Barba Completa', 'Aparar, modelar e hidratar com óleos premium.', 45.00, 40, TRUE),
  ('Corte + Barba', 'O combo supremo para o gentleman clássico.', 90.00, 75, TRUE),
  ('Bigode & Cavanhaque', 'Modelagem precisa com navalha quente.', 30.00, 25, TRUE),
  ('Tratamento Capilar', 'Hidratação profunda e massagem craniana.', 70.00, 60, TRUE),
  ('Hot Towel Shave', 'Barbear clássico com toalha a vapor.', 65.00, 50, TRUE)
ON CONFLICT DO NOTHING;`
  },
  {
    caminho: 'pom.xml',
    nome: 'pom.xml',
    categoria: 'CONFIG',
    descricao: 'Configuração Maven com Spring Boot 3.3.4, Java 21, JPA e driver PostgreSQL.',
    conteudo: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.4</version>
        <relativePath/>
    </parent>

    <groupId>com.vintageco</groupId>
    <artifactId>barbearia-api</artifactId>
    <version>1.0.0</version>
    <name>Vintage&Co Barbearia API (Spring Boot)</name>

    <properties>
        <java.version>21</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
            <version>2.6.0</version>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
    </dependencies>
</project>`
  },
  {
    caminho: 'docker-compose.yml',
    nome: 'docker-compose.yml',
    categoria: 'DATABASE',
    descricao: 'Orquestração do PostgreSQL 16 para rodar o banco localmente.',
    conteudo: `version: '3.8'

services:
  postgres-db:
    image: postgres:16-alpine
    container_name: vintage_postgres
    restart: always
    environment:
      POSTGRES_DB: vintage_barbearia
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: vintage_secret_pwd
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./src/main/resources/schema.sql:/docker-entrypoint-initdb.d/init.sql

volumes:
  postgres_data:`
  },
  {
    caminho: 'src/main/java/com/vintageco/barbearia/BarbeariaApplication.java',
    nome: 'BarbeariaApplication.java',
    categoria: 'CONFIG',
    descricao: 'Classe principal Spring Boot com @SpringBootApplication e método main().',
    conteudo: `package com.vintageco.barbearia;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BarbeariaApplication {

    public static void main(String[] args) {
        SpringApplication.run(BarbeariaApplication.class, args);
        System.out.println("💈 Vintage&Co Barbearia Backend (Spring Boot 3) iniciado com sucesso!");
    }
}`
  }
];

