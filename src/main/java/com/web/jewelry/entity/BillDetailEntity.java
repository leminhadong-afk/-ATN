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
@Table(name = "bill_details")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@DynamicUpdate
public class BillDetailEntity extends PrimaryEntity {

    @Column(name = "product_detail_id", length = EntityProperties.LENGTH_ID)
    private String productDetailId;

    @Column(name = "bill_id", length = EntityProperties.LENGTH_ID)
    private String billId;

    @Column(name = "quantity")
    private Integer quantity;

    @Column()
    private Double price;

    @Column
    private Integer deleteFlag;

    @Column(name = "discount_amount")
    private Double discountAmount; // Số tiền giảm giá cho sản phẩm này

    @Column(name = "final_price")
    private Double finalPrice; // Giá sau khi giảm

}
