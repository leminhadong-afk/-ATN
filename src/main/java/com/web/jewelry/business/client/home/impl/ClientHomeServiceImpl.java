package com.web.jewelry.business.client.home.impl;

import com.web.jewelry.business.client.home.service.ClientHomeService;
import com.web.jewelry.dto.productDetailDTO.FindProductOverviewDTO;
import com.web.jewelry.dto.productDetailDTO.ProductDetailOverviewProjection;
import com.web.jewelry.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClientHomeServiceImpl implements ClientHomeService {

    private final ProductRepository productRepository;

    @Override
    public Page<ProductDetailOverviewProjection> getProductOverview(FindProductOverviewDTO req) {
        if (req.getColors() != null && !req.getColors().isEmpty()) {
            req.setColorsCsv(String.join(",", req.getColors()));
        } else {
            req.setColorsCsv(null);
        }
        if (req.getSizes() != null && !req.getSizes().isEmpty()) {
            req.setSizesCsv(String.join(",", req.getSizes()));
        } else {
            req.setSizesCsv(null);
        }
        PageRequest pageable = PageRequest.of(
                req.getPage() == null ? 0 : req.getPage(),
                req.getSize() == null ? 20 : req.getSize()
        );
        return productRepository.getProductOverviewForClient(pageable, req);
    }

    @Override
    public Page<ProductDetailOverviewProjection> getNewArrivals(int page, int size) {
        long now = System.currentTimeMillis();
        long thirtyDaysMs = 30L * 24 * 60 * 60 * 1000;
        long minCreatedDate = now - thirtyDaysMs;
        PageRequest pageable = PageRequest.of(page, size);
        return productRepository.getNewArrivals(pageable, minCreatedDate);
    }

    @Override
    public java.util.List<com.web.jewelry.dto.productDetailDTO.ProductBestsellerProjection> getBestSellers(long minSold) {
        return productRepository.getBestSellers(minSold);
    }
}
