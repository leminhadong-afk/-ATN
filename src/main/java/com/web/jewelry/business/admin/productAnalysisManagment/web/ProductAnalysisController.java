package com.web.jewelry.business.admin.productAnalysisManagment.web;

import com.web.jewelry.business.admin.productAnalysisManagment.service.ProductAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@CrossOrigin("*")
@RequiredArgsConstructor
@RestController
@RequestMapping("/admin/analysis")
public class ProductAnalysisController {

    private final ProductAnalysisService productAnalysisService;

//    @GetMapping("/best-sale")
//    public ResponseEntity<Page<AnalystManagementDTO>> getBestSaleProduct(
//            @RequestParam(defaultValue = "0") int page,
//            @RequestParam(defaultValue = "10") int size) {
//        Pageable pageable = PageRequest.of(page, size);
//        return ResponseEntity.ok(productAnalysisService.getBestSaleProduct(pageable));
//    }
}