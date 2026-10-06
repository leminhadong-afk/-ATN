package com.web.jewelry.business.admin.reviewManagement.impl;

import com.web.jewelry.business.admin.reviewManagement.service.AdminReviewManagementService;
import com.web.jewelry.dto.review.AdminReplyReviewRequest;
import com.web.jewelry.dto.review.ProductRatingStatDTO;
import com.web.jewelry.dto.review.ReviewOverviewStatResponse;
import com.web.jewelry.dto.review.ReviewResponse;
import com.web.jewelry.entity.ReviewEntity;
import com.web.jewelry.repository.CustomerRepository;
import com.web.jewelry.repository.ProductRepository;
import com.web.jewelry.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminReviewManagementServiceImpl implements AdminReviewManagementService {

    private final ReviewRepository reviewRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    @Override
    public Page<ReviewResponse> getAllReviews(String productId, Integer status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        String pId = (productId != null && !productId.isBlank()) ? productId : null;
        Page<ReviewEntity> pageEntities = reviewRepository.filterReviewsForAdmin(pId, status, pageable);
        return pageEntities.map(this::mapToReviewResponse);
    }

    @Override
    public ReviewResponse replyReview(String reviewId, AdminReplyReviewRequest request) {
        ReviewEntity review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đánh giá với ID: " + reviewId));

        review.setReply(request.getReply());
        review.setReplyDate(new Date());

        ReviewEntity saved = reviewRepository.save(review);
        return mapToReviewResponse(saved);
    }

    @Override
    public ReviewResponse toggleReviewStatus(String reviewId, Integer status) {
        ReviewEntity review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đánh giá với ID: " + reviewId));

        review.setStatus(status);
        ReviewEntity saved = reviewRepository.save(review);
        return mapToReviewResponse(saved);
    }

    @Override
    public ReviewOverviewStatResponse getOverviewStatistics() {
        List<ReviewEntity> allReviews = reviewRepository.findAll().stream()
                .filter(r -> r.getDeleteFlag() == 0)
                .toList();

        long total = allReviews.size();
        if (total == 0) {
            return ReviewOverviewStatResponse.builder()
                    .totalReviews(0L)
                    .averageRating(0.0)
                    .star5Count(0L)
                    .star4Count(0L)
                    .star3Count(0L)
                    .star2Count(0L)
                    .star1Count(0L)
                    .topRatedProducts(new ArrayList<>())
                    .recentReviews(new ArrayList<>())
                    .build();
        }

        long s5 = allReviews.stream().filter(r -> r.getStar() != null && r.getStar() == 5).count();
        long s4 = allReviews.stream().filter(r -> r.getStar() != null && r.getStar() == 4).count();
        long s3 = allReviews.stream().filter(r -> r.getStar() != null && r.getStar() == 3).count();
        long s2 = allReviews.stream().filter(r -> r.getStar() != null && r.getStar() == 2).count();
        long s1 = allReviews.stream().filter(r -> r.getStar() != null && r.getStar() == 1).count();

        double avg = allReviews.stream()
                .filter(r -> r.getStar() != null)
                .mapToInt(ReviewEntity::getStar)
                .average()
                .orElse(0.0);
        avg = Math.round(avg * 10.0) / 10.0;

        // Top rated products aggregation
        Map<String, List<ReviewEntity>> reviewsByProduct = allReviews.stream()
                .filter(r -> r.getProductId() != null)
                .collect(Collectors.groupingBy(ReviewEntity::getProductId));

        List<ProductRatingStatDTO> topProducts = new ArrayList<>();
        reviewsByProduct.forEach((pId, pReviews) -> {
            long pTotal = pReviews.size();
            double pAvg = pReviews.stream()
                    .filter(r -> r.getStar() != null)
                    .mapToInt(ReviewEntity::getStar)
                    .average()
                    .orElse(0.0);
            pAvg = Math.round(pAvg * 10.0) / 10.0;

            String pName = productRepository.findById(pId)
                    .map(p -> p.getName())
                    .orElse("Sản phẩm #" + pId);

            topProducts.add(ProductRatingStatDTO.builder()
                    .productId(pId)
                    .productName(pName)
                    .averageStar(pAvg)
                    .totalReviews(pTotal)
                    .build());
        });

        // Sort by averageStar desc, totalReviews desc
        topProducts.sort((a, b) -> {
            int cmp = Double.compare(b.getAverageStar(), a.getAverageStar());
            if (cmp != 0) return cmp;
            return Long.compare(b.getTotalReviews(), a.getTotalReviews());
        });

        // Limit top 10
        List<ProductRatingStatDTO> top10 = topProducts.stream().limit(10).toList();

        // Recent 5 reviews
        Pageable top5Page = PageRequest.of(0, 5);
        Page<ReviewEntity> recentPage = reviewRepository.findByDeleteFlagOrderByCreatedDateDesc(0, top5Page);
        List<ReviewResponse> recentReviews = recentPage.getContent().stream()
                .map(this::mapToReviewResponse)
                .toList();

        return ReviewOverviewStatResponse.builder()
                .totalReviews(total)
                .averageRating(avg)
                .star5Count(s5)
                .star4Count(s4)
                .star3Count(s3)
                .star2Count(s2)
                .star1Count(s1)
                .topRatedProducts(top10)
                .recentReviews(recentReviews)
                .build();
    }

    private ReviewResponse mapToReviewResponse(ReviewEntity entity) {
        ReviewResponse res = ReviewResponse.builder()
                .id(entity.getId())
                .productId(entity.getProductId())
                .productDetailId(entity.getProductDetailId())
                .customerId(entity.getCustomerId())
                .billId(entity.getBillId())
                .star(entity.getStar())
                .comment(entity.getComment())
                .images(entity.getImages())
                .reply(entity.getReply())
                .replyDate(entity.getReplyDate())
                .status(entity.getStatus())
                .createdDate(entity.getCreatedDate())
                .build();

        if (entity.getCustomerId() != null) {
            customerRepository.findById(entity.getCustomerId()).ifPresent(c -> {
                res.setCustomerName(c.getName());
                res.setCustomerAvatar(c.getAvatar());
            });
        }

        if (entity.getProductId() != null) {
            productRepository.findById(entity.getProductId()).ifPresent(p -> {
                res.setProductName(p.getName());
            });
        }

        return res;
    }
}
