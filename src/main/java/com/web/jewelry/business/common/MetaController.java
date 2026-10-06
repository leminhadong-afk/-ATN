package com.web.jewelry.business.common;

import com.web.jewelry.dto.productDetailDTO.ProductFiltersResponse;
import com.web.jewelry.repository.BrandRepository;
import com.web.jewelry.repository.ColorRepository;
import com.web.jewelry.repository.MaterialRepository;
import com.web.jewelry.repository.SizeRepository;
import com.web.jewelry.repository.TypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.stream.Collectors;

@RestController
@RequestMapping("/client/meta")
@RequiredArgsConstructor
public class MetaController {

    private final BrandRepository brandRepository;
    private final MaterialRepository materialRepository;
    private final TypeRepository typeRepository;
    private final ColorRepository colorRepository;
    private final SizeRepository sizeRepository;

    @GetMapping("/product-filters")
    public ResponseEntity<ProductFiltersResponse> getProductFilters() {
        ProductFiltersResponse response = new ProductFiltersResponse(
                brandRepository.findAll().stream()
                        .map(b -> toOption(b.getId(), b.getName()))
                        .collect(Collectors.toList()),
                materialRepository.findAll().stream()
                        .map(m -> toOption(m.getId(), m.getName()))
                        .collect(Collectors.toList()),
                typeRepository.findAll().stream()
                        .map(t -> toOption(t.getId(), t.getName()))
                        .collect(Collectors.toList()),
                colorRepository.findAll().stream().map(c -> c.getName()).distinct().collect(Collectors.toList()),
                sizeRepository.findAll().stream().map(s -> s.getName()).distinct().collect(Collectors.toList())
        );

        return ResponseEntity.ok(response);
    }

    private ProductFiltersResponse.SimpleOption toOption(String id, String name) {
        return new ProductFiltersResponse.SimpleOption(id, name);
    }
}
