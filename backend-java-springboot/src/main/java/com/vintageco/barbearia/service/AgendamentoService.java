package com.vintageco.barbearia.service;

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
}