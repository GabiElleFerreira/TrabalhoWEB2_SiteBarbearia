package com.vintageco.barbearia.model;

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
}