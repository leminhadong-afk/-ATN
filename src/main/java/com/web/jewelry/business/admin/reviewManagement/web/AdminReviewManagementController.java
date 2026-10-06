package com.web.jewelry.business.admin.reviewManagement.web;

import com.web.jewelry.business.admin.reviewManagement.service.AdminReviewManagementService;
import com.web.jewelry.dto.review.AdminReplyReviewRequest;
import com.web.jewelry.dto.review.ReviewOverviewStatResponse;
import com.web.jewelry.dto.review.ReviewResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin("*")
@RestController
@RequestMapping("/admin/reviews")
@RequiredArgsConstructor
public class AdminReviewManagementController {

    private final AdminReviewManagementService adminReviewManagementService;

    @GetMapping
    public ResponseEntity<Page<ReviewResponse>> getAllReviews(
            @RequestParam(required = false) String productId,
            @RequestParam(required = false) Integer status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ReviewResponse> pageResult = adminReviewManagementService.getAllReviews(productId, status, page, size);
        return ResponseEntity.ok(pageResult);
    }

    @GetMapping("/statistics")
    public ResponseEntity<ReviewOverviewStatResponse> getOverviewStatistics() {
        ReviewOverviewStatResponse stat = adminReviewManagementService.getOverviewStatistics();
        return ResponseEntity.ok(stat);
    }

    @PutMapping("/{reviewId}/reply")
    public ResponseEntity<?> replyReview(
            @PathVariable String reviewId,
            @Valid @RequestBody AdminReplyReviewRequest request) {
        try {
            ReviewResponse response = adminReviewManagementService.replyReview(reviewId, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{reviewId}/status")
    public ResponseEntity<?> toggleReviewStatus(
            @PathVariable String reviewId,
            @RequestParam Integer status) {
        try {
            ReviewResponse response = adminReviewManagementService.toggleReviewStatus(reviewId, status);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
