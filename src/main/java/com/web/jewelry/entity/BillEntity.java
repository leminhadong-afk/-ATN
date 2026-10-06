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
@Table(name = "bills")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@DynamicUpdate
public class BillEntity extends PrimaryEntity {

    @Column(length = EntityProperties.LENGTH_CODE)
    private String code;

    @Column
    private String type; // ONLINE, OFFLINE

    @Column(name = "total_amount")
    private Double totalAmount;

    @Column(name = "date_payment")
    private Date datePayment;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column
    private String address;

    @Column
    private String recipient;

    @Column
    private Integer status; // 0 : Chờ xác nhận, 1: Đã hoàn thành, 2: Đang giao hàng, 3: Đã giao hàng thành công, 4: Đã hủy

    @Column
    private Integer deleteFlag;

    @Column(name = "discount_amount")
    private Double discountAmount; // Số tiền giảm giá từ khuyến mãi

    @Column(name = "final_amount")
    private Double finalAmount; // Tổng tiền sau khi giảm giá

    @Column(name = "promotion_id")
    private Long promotionId; // ID của chương trình khuyến mãi áp dụng

    @Column(name = "employee_id",length = EntityProperties.LENGTH_ID)
    private String employeeId;

    @Column(name = "customer_id",length = EntityProperties.LENGTH_ID)
    private String customerId;

}
