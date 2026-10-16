package com.vintageco.barbearia.controller;

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
}