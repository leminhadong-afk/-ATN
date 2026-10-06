package com.web.jewelry.business.client.review.service;

import com.web.jewelry.dto.review.CreateReviewRequest;
import com.web.jewelry.dto.review.ReviewResponse;
import com.web.jewelry.dto.review.ReviewStatResponse;
import org.springframework.data.domain.Page;

public interface ClientReviewService {

    Page<ReviewResponse> getProductReviews(String productId, Integer star, int page, int size);

    ReviewStatResponse getProductReviewStat(String productId);

    ReviewResponse createReview(CreateReviewRequest request);

    boolean checkEligibleToReview(String billId, String productId);
}
