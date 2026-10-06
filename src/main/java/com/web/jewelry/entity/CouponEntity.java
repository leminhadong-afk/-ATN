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

import java.util.Date;

@Entity
@Table(name = "coupon")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@DynamicUpdate
public class CouponEntity extends PrimaryEntity {
    @Column(length = EntityProperties.LENGTH_NAME)
    private String name;

    @Column(length = EntityProperties.LENGTH_CODE)
    private String code;

    private Double value;

    private Integer unit; // 0: %, 1: vnd

    @Column(name = "max_value")
    private Double maxValue;    // Nếu dùng phần trăm (unit = 0)

    @Column(name = "min_condition")
    private Double minCondition;

    private Integer quantity;

    @Column(name = "start_date")
    private Date startDate;

    @Column(name = "end_date")
    private Date endDate;

    private Integer status;    // 0: không hoạt động, 1: hoạt động, 2: hết hạn

    private Integer type;   // 0: personal, 1: public


}
