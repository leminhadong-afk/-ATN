package com.web.jewelry.dto.productManagement;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateProductDetailManagementDTO {

    @NotBlank(message = "Không được để trống")
    private String productId;

    @NotBlank(message = "Không được để trống")
    private String sizeId;

    @NotBlank(message = "Không được để trống")
    private String colorId;

    @NotBlank(message = "Không được để trống")
    private String productCode;

    @NotNull(message = "Không được để trống")
    private String Description;

    @NotNull(message = "Không được để trống")
    private Double price;

    @NotNull(message = "Không được để trống")
    private Long quantity;

    @NotBlank(message = "Không được để trống")
    private String urlImg;

    private Integer status = 1;



}
