package com.web.jewelry.dto.couponManagement;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;
import java.util.List;

@Getter
@Setter
public class UpdateCouponDTO {

    private String id;

    private String name;

    private String code;

    private Double value;

    private Integer unit; // 0: %, 1: VND

    private Double maxValue;

    private Double minCondition;

    private Integer quantity;

    private Date startDate;

    private Date endDate;

    private Integer type; // 0: personal, 1: public

    private List<ListCustomerIdDTO> customerDetail; // required if type = 0
}
