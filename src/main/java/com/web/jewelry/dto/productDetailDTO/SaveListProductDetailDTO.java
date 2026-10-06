package com.web.jewelry.dto.productDetailDTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class SaveListProductDetailDTO {
    @NotBlank(message = "Không được để trống")
    private String id;

    @NotBlank(message = "Không được để trống")
    private Long quantity;

    @NotNull(message = "Không được để trống")
    private Double price;

    @NotBlank(message = "Không được để trống")
    private Integer status;

    @NotBlank(message = "Không được để trống")
    private String urlImg;
}
