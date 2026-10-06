package com.web.jewelry.repository;

import com.web.jewelry.entity.BrandEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BrandRepository extends JpaRepository<BrandEntity,String> {



    Optional<BrandEntity> findBrandEntityByName(String name);
}
