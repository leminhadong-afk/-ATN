package com.web.jewelry.dto.review;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReviewOverviewStatResponse {
    private Long totalReviews;
    private Double averageRating;
    private Long star5Count;
    private Long star4Count;
    private Long star3Count;
    private Long star2Count;
    private Long star1Count;
    private List<ProductRatingStatDTO> topRatedProducts;
    private List<ReviewResponse> recentReviews;
}
