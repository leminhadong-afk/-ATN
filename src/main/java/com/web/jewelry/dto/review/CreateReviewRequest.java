package com.web.jewelry.dto.review;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CreateReviewRequest {

    @NotBlank(message = "ID sản phẩm không được để trống")
    private String productId;

    private String productDetailId;

    // billId là tùy chọn: Có billId khi đánh giá từ đơn hàng đã mua, null khi đánh giá trực tiếp tại trang sản phẩm
    private String billId;

    @NotNull(message = "Số sao đánh giá không được để trống")
    @Min(value = 1, message = "Đánh giá tối thiểu 1 sao")
    @Max(value = 5, message = "Đánh giá tối đa 5 sao")
    private Integer star;

    private String comment;

    private String images; // URLs separated by comma
}
