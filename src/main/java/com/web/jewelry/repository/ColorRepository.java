package com.web.jewelry.repository;

import com.web.jewelry.entity.ColorEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ColorRepository extends JpaRepository<ColorEntity, String> {
    Optional<ColorEntity> findColorEntitiesByName(String name);

    Optional<ColorEntity> findByNameIgnoreCaseAndDeleteFlag(String name, Integer deleteFlag);

    Optional<ColorEntity> findByNameIgnoreCaseAndIdNotAndDeleteFlag(String name, String id, Integer deleteFlag);

    List<ColorEntity> findAllByDeleteFlag(Integer deleteFlag);
}

