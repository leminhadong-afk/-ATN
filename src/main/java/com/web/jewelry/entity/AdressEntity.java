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
@Table(name = "adress")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@DynamicUpdate
public class AdressEntity extends PrimaryEntity {
    @Column(length = EntityProperties.LENGTH_NAME)
    private String name;

    @Column
    private String type;

    @Column(name = "customer_id",length = EntityProperties.LENGTH_ID)
    private String customerId;
}
