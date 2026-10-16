package com.vintageco.barbearia;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BarbeariaApplication {

    public static void main(String[] args) {
        SpringApplication.run(BarbeariaApplication.class, args);
        System.out.println("💈 Vintage&Co Barbearia Backend (Spring Boot 3) iniciado com sucesso!");
    }
}
