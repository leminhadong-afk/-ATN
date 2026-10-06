package com.web.jewelry.dto.brandManagement;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class UpdateDeleteFlagRequestDTO {
    @NotBlank(message = "Không được để trống")
    private String id;

    @NotNull(message = "Không được để trống")
    private Integer deleteFlag;
}
