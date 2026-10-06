package com.web.jewelry.business.admin.reviewManagement.service;

import com.web.jewelry.dto.review.AdminReplyReviewRequest;
import com.web.jewelry.dto.review.ReviewOverviewStatResponse;
import com.web.jewelry.dto.review.ReviewResponse;
import org.springframework.data.domain.Page;

public interface AdminReviewManagementService {

    Page<ReviewResponse> getAllReviews(String productId, Integer status, int page, int size);

    ReviewResponse replyReview(String reviewId, AdminReplyReviewRequest request);

    ReviewResponse toggleReviewStatus(String reviewId, Integer status);

    ReviewOverviewStatResponse getOverviewStatistics();
}
