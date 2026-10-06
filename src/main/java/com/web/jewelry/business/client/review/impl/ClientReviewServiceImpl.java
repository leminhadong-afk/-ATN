package com.web.jewelry.business.client.review.impl;

import com.web.jewelry.business.client.review.service.ClientReviewService;
import com.web.jewelry.business.common.service.service.CommonService;
import com.web.jewelry.dto.review.CreateReviewRequest;
import com.web.jewelry.dto.review.ReviewResponse;
import com.web.jewelry.dto.review.ReviewStatResponse;
import com.web.jewelry.entity.BillEntity;
import com.web.jewelry.entity.CustomerEntity;
import com.web.jewelry.entity.ReviewEntity;
import com.web.jewelry.repository.BillDetailRepository;
import com.web.jewelry.repository.BillRepository;
import com.web.jewelry.repository.CustomerRepository;
import com.web.jewelry.repository.ProductDetailRepository;
import com.web.jewelry.repository.ProductRepository;
import com.web.jewelry.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClientReviewServiceImpl implements ClientReviewService {

    private final ReviewRepository reviewRepository;
    private final BillRepository billRepository;
    private final BillDetailRepository billDetailRepository;
    private final ProductRepository productRepository;
    private final ProductDetailRepository productDetailRepository;
    private final CustomerRepository customerRepository;
    private final CommonService commonService;

    @Override
    public Page<ReviewResponse> getProductReviews(String productId, Integer star, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ReviewEntity> reviewEntities;

        if (star != null && star >= 1 && star <= 5) {
            reviewEntities = reviewRepository.findByProductIdAndStarAndStatusAndDeleteFlagOrderByCreatedDateDesc(
                    productId, star, 1, 0, pageable);
        } else {
            reviewEntities = reviewRepository.findByProductIdAndStatusAndDeleteFlagOrderByCreatedDateDesc(
                    productId, 1, 0, pageable);
        }

        return reviewEntities.map(this::mapToReviewResponse);
    }

    @Override
    public ReviewStatResponse getProductReviewStat(String productId) {
        List<ReviewEntity> reviews = reviewRepository.findByProductIdAndStatusAndDeleteFlag(productId, 1, 0);

        long total = reviews.size();
        if (total == 0) {
            return ReviewStatResponse.builder()
                    .productId(productId)
                    .averageStar(0.0)
                    .totalReviews(0L)
                    .star5Count(0L)
                    .star4Count(0L)
                    .star3Count(0L)
                    .star2Count(0L)
                    .star1Count(0L)
                    .build();
        }

        long s5 = reviews.stream().filter(r -> r.getStar() == 5).count();
        long s4 = reviews.stream().filter(r -> r.getStar() == 4).count();
        long s3 = reviews.stream().filter(r -> r.getStar() == 3).count();
        long s2 = reviews.stream().filter(r -> r.getStar() == 2).count();
        long s1 = reviews.stream().filter(r -> r.getStar() == 1).count();

        double avg = reviews.stream().mapToInt(ReviewEntity::getStar).average().orElse(0.0);
        avg = Math.round(avg * 10.0) / 10.0;

        return ReviewStatResponse.builder()
                .productId(productId)
                .averageStar(avg)
                .totalReviews(total)
                .star5Count(s5)
                .star4Count(s4)
                .star3Count(s3)
                .star2Count(s2)
                .star1Count(s1)
                .build();
    }

    @Override
    public ReviewResponse createReview(CreateReviewRequest request) {
        CustomerEntity currentCustomer = commonService.getCurrentCustomer();
        if (currentCustomer == null) {
            throw new RuntimeException("Bạn cần đăng nhập để thực hiện đánh giá sản phẩm");
        }

        // Nếu có truyền billId: kiểm tra tính hợp lệ của đơn hàng đã mua
        if (request.getBillId() != null && !request.getBillId().isBlank()) {
            BillEntity bill = billRepository.findById(request.getBillId())
                    .orElseThrow(() -> new RuntimeException("Hóa đơn không tồn tại"));

            if (!currentCustomer.getId().equals(bill.getCustomerId())) {
                throw new RuntimeException("Hóa đơn này không thuộc về tài khoản của bạn");
            }

            if (bill.getStatus() != 3) {
                throw new RuntimeException("Chỉ đơn hàng đã giao thành công mới có thể gửi đánh giá theo hóa đơn");
            }

            boolean alreadyReviewed = reviewRepository.existsByCustomerIdAndBillIdAndProductIdAndDeleteFlag(
                    currentCustomer.getId(), request.getBillId(), request.getProductId(), 0);
            if (alreadyReviewed) {
                throw new RuntimeException("Bạn đã gửi đánh giá cho sản phẩm này trong đơn hàng này rồi");
            }
        }

        ReviewEntity review = new ReviewEntity();
        review.setProductId(request.getProductId());
        review.setProductDetailId(request.getProductDetailId());
        review.setCustomerId(currentCustomer.getId());
        review.setBillId(request.getBillId());
        review.setStar(request.getStar());
        review.setComment(request.getComment());
        review.setImages(request.getImages());
        review.setStatus(1);
        review.setDeleteFlag(0);

        ReviewEntity saved = reviewRepository.save(review);
        return mapToReviewResponse(saved);
    }

    @Override
    public boolean checkEligibleToReview(String billId, String productId) {
        CustomerEntity currentCustomer = commonService.getCurrentCustomer();
        if (currentCustomer == null) {
            return false;
        }

        if (billId != null && !billId.isBlank()) {
            Optional<BillEntity> billOpt = billRepository.findById(billId);
            if (billOpt.isEmpty()) {
                return false;
            }
            BillEntity bill = billOpt.get();
            if (!currentCustomer.getId().equals(bill.getCustomerId()) || bill.getStatus() != 3) {
                return false;
            }
            return !reviewRepository.existsByCustomerIdAndBillIdAndProductIdAndDeleteFlag(
                    currentCustomer.getId(), billId, productId, 0);
        }

        return true;
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
