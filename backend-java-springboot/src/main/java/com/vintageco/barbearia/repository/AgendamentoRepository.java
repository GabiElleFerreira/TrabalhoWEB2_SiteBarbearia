package com.vintageco.barbearia.repository;

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
}