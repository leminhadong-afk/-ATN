package com.web.jewelry.business.client.review.web;

import com.web.jewelry.business.client.review.service.ClientReviewService;
import com.web.jewelry.dto.review.CreateReviewRequest;
import com.web.jewelry.dto.review.ReviewResponse;
import com.web.jewelry.dto.review.ReviewStatResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin("*")
@RestController
@RequestMapping("/client/reviews")
@RequiredArgsConstructor
public class ClientReviewController {

    private final ClientReviewService clientReviewService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<Page<ReviewResponse>> getProductReviews(
            @PathVariable String productId,
            @RequestParam(required = false) Integer star,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ReviewResponse> reviews = clientReviewService.getProductReviews(productId, star, page, size);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/stat/{productId}")
    public ResponseEntity<ReviewStatResponse> getProductReviewStat(@PathVariable String productId) {
        ReviewStatResponse stat = clientReviewService.getProductReviewStat(productId);
        return ResponseEntity.ok(stat);
    }

    @PostMapping
    public ResponseEntity<?> createReview(@Valid @RequestBody CreateReviewRequest request) {
        try {
            ReviewResponse review = clientReviewService.createReview(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(review);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/check-eligible")
    public ResponseEntity<Boolean> checkEligibleToReview(
            @RequestParam String billId,
            @RequestParam String productId) {
        boolean eligible = clientReviewService.checkEligibleToReview(billId, productId);
        return ResponseEntity.ok(eligible);
    }
}
