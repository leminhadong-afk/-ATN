package com.web.jewelry.repository;

import com.web.jewelry.entity.TypeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TypeRepository extends JpaRepository<TypeEntity,String> {
    Optional<TypeEntity> getTypeEntityByName(String name);
}
