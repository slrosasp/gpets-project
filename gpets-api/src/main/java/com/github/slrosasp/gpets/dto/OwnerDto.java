package com.github.slrosasp.gpets.dto;

import lombok.Data;

@Data
public class OwnerDto {
    private String telefono;
    private String direccion;
    private String ciudad;
    private String displayName;
    private String fotoUrl;
    private String fechaNacimiento;
    private String pais;
    private String codigoPostal;
}

