package com.web.jewelry.entity;

import com.web.jewelry.config.constant.classconstant.EntityProperties;
import com.web.jewelry.entity.base.PrimaryEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.DynamicUpdate;

@Entity
@Table(name = "sizes")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@DynamicUpdate
public class SizeEntity extends PrimaryEntity {
    @Column(length = EntityProperties.LENGTH_NAME)
    private String name;

    @Column
    private Integer status = 1;

    @Column
    private Integer deleteFlag = 0;

    @Column(name = "type_product_id",length = EntityProperties.LENGTH_ID)
    private String typeProductId;
}
