package com.web.jewelry.repository;

import com.web.jewelry.entity.SizeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface SizeRepository extends JpaRepository<SizeEntity, String> {
    Optional<SizeEntity> getSizeEntityByNameAndTypeProductId(String name, String typeProductId);

    List<SizeEntity> findByTypeProductId(String typeProductId);
}
