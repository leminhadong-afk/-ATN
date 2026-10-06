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
@Table(name = "transactions")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@DynamicUpdate
public class TransactionEntity extends PrimaryEntity {

    @Column(name = "bill_id", length = EntityProperties.LENGTH_ID)
    private String billId;

    @Column
    private Double money;

    @Column
    private String code;

    @Column
    private Integer status;

    @Column
    private Integer typeTransaction; //  tièn mặt hay chuyển khoản (0: tiền mặt, 1: chuyển khoản)

    @Column
    private Integer typeMethod; // tại quầy hay onl ( 0: tại quầy, 1: onl)

}
