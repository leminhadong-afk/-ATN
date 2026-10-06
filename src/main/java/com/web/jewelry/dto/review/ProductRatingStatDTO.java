package com.web.jewelry.dto.review;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductRatingStatDTO {
    private String productId;
    private String productName;
    private Double averageStar;
    private Long totalReviews;
}
