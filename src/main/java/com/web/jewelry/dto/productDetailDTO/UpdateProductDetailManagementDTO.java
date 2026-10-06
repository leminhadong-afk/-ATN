package com.web.jewelry.dto.productDetailDTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class UpdateProductDetailManagementDTO {

    @NotBlank(message = "Không được để trống")
    private String id;

    @NotBlank(message = "Không được để trống")
    private String productId;

    @NotBlank(message = "Không được để trống")
    private String productDetailName;

    @NotBlank(message = "Không được để trống")
    private String productCode;

    @NotBlank(message = "Không được để trống")
    private Long quantity;

    @NotNull (message = "Không được để trống")
    private Double price;

    @NotNull(message = "Không được để trống")
    private String brandId;

    @NotNull (message = "Không được để trống")
    private String materialId;

    @NotNull (message = "Không được để trống")
    private String typeId;

    @NotNull (message = "Không được để trống")
    private String sizeId;

    @NotNull (message = "Không được để trống")
    private String colorId;

    @NotBlank(message = "Không được để trống")
    private Integer status;

    @NotNull (message = "Không được để trống")
    private Integer deleteFlag;

}
