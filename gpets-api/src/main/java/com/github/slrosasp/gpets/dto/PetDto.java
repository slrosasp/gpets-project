package com.github.slrosasp.gpets.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class PetDto {
    private String id;
    private String ownerId;
    private String nombre;
    private String especie;
    private String raza;
    private Integer edad;
    private String color;
    private Double peso;
    private String fotoUrl;
    private Double latitud;
    private Double longitud;
}
