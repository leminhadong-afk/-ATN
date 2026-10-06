package com.web.jewelry.business.client.home.web;

import com.web.jewelry.business.client.home.service.ClientHomeService;
import com.web.jewelry.dto.productDetailDTO.FindProductOverviewDTO;
import com.web.jewelry.dto.productDetailDTO.ProductDetailOverviewProjection;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/client/home")
@Slf4j
@RequiredArgsConstructor
public class ClientHomeController {

    private final ClientHomeService clientHomeService;

    @GetMapping("/products/overview")
    public ResponseEntity<org.springframework.data.domain.Page<ProductDetailOverviewProjection>> getProductOverview(@ModelAttribute FindProductOverviewDTO req) {
        return ResponseEntity.ok(clientHomeService.getProductOverview(req));
    }

    @GetMapping("/products/new")
    public ResponseEntity<org.springframework.data.domain.Page<ProductDetailOverviewProjection>> getNewArrivals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        return ResponseEntity.ok(clientHomeService.getNewArrivals(page, size));
    }

    @GetMapping("/products/bestseller")
    public ResponseEntity<java.util.List<com.web.jewelry.dto.productDetailDTO.ProductBestsellerProjection>> getBestSellers(
            @RequestParam(defaultValue = "5") long minSold
    ) {
        return ResponseEntity.ok(clientHomeService.getBestSellers(minSold));
    }
}
