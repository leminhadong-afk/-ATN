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
public class ReviewStatResponse {

    private String productId;
    private Double averageStar;
    private Long totalReviews;
    private Long star5Count;
    private Long star4Count;
    private Long star3Count;
    private Long star2Count;
    private Long star1Count;
}
