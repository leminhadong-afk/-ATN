package com.web.jewelry.business.client.home.service;

import com.web.jewelry.dto.productDetailDTO.FindProductOverviewDTO;
import com.web.jewelry.dto.productDetailDTO.ProductDetailOverviewProjection;
import org.springframework.data.domain.Page;

public interface ClientHomeService {
    Page<ProductDetailOverviewProjection> getProductOverview(FindProductOverviewDTO req);

    Page<ProductDetailOverviewProjection> getNewArrivals(int page, int size);

    java.util.List<com.web.jewelry.dto.productDetailDTO.ProductBestsellerProjection> getBestSellers(long minSold);
}
