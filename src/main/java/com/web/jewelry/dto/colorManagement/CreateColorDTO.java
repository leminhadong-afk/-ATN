package com.web.jewelry.dto.colorManagement;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateColorDTO {
    @NotBlank(message = "Không được để trống")
    private String name;


}
