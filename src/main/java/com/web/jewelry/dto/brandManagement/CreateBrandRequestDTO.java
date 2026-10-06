package com.web.jewelry.dto.brandManagement;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateBrandRequestDTO {

    @NotBlank(message = "Không được để trống")
    private String name;

}
