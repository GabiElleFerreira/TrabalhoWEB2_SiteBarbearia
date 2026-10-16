package com.vintageco.barbearia.model;

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
}