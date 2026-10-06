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
@Table(name = "payment_transactions")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@DynamicUpdate
public class PaymentTransactionEntity extends PrimaryEntity {

    @Column(name = "bill_id", length = EntityProperties.LENGTH_ID)
    private String billId; // Liên kết tới BillEntity

    @Column(name = "provider", length = 20)
    private String provider; // 'MOMO', 'VNPAY', 'ZALOPAY', ...

    @Column(name = "order_id", length = 64)
    private String orderId; // orderId gửi sang MoMo

    @Column(name = "request_id", length = 64)
    private String requestId; // requestId gửi sang MoMo

    @Column(name = "amount")
    private Double amount; // Số tiền thanh toán

    @Column(name = "result_code")
    private Integer resultCode; // 0 = thành công, khác = lỗi

    @Column(name = "message")
    private String message; // Mô tả kết quả

    @Column(name = "trans_id", length = 64)
    private String transId; // Mã giao dịch từ MoMo

    @Column(name = "signature", length = 255)
    private String signature; // Chữ ký từ MoMo (để verify)

    @Column(name = "status", length = 20)
    private String status; // 'CREATED', 'PENDING', 'SUCCESS', 'FAILED'

    @Column(name = "raw_response", length = Integer.MAX_VALUE)
    private String rawResponse; // JSON raw từ MoMo callback

    @Column(name = "notify_time")
    private Date notifyTime; // Thời điểm nhận notify
}

