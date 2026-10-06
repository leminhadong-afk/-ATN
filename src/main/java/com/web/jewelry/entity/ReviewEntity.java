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
@Table(name = "reviews")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@DynamicUpdate
public class ReviewEntity extends PrimaryEntity {

    @Column(name = "product_id", length = EntityProperties.LENGTH_ID)
    private String productId;

    @Column(name = "product_detail_id", length = EntityProperties.LENGTH_ID)
    private String productDetailId;

    @Column(name = "customer_id", length = EntityProperties.LENGTH_ID)
    private String customerId;

    @Column(name = "bill_id", length = EntityProperties.LENGTH_ID)
    private String billId;

    @Column(name = "star")
    private Integer star; // 1 -> 5

    @Column(name = "comment", length = 2000)
    private String comment;

    @jakarta.persistence.Lob
    @Column(name = "images", length = 1000000)
    private String images; // URLs separated by comma or base64 data

    @Column(name = "reply", length = 2000)
    private String reply;

    @Column(name = "reply_date")
    private Date replyDate;

    @Column(name = "status")
    private Integer status = 1; // 1: Show, 0: Hidden

    @Column(name = "delete_flag")
    private Integer deleteFlag = 0; // 0: Active, 1: Deleted
}
