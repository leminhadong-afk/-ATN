package com.web.jewelry.dto.couponManagement;

public interface CouponResponse {
     Long getRowNum();

     String getId();

     String getName();

     String getCode();

     Double getValue();

     Integer getUnit(); // 0: %, 1: VND

     Double getMaxValue();

     Double getMinCondition();

     Integer getQuantity();

     String getStartDate();

     String getEndDate();

     Integer getStatus(); // 0: inactive, 1: active, 2: expired

     Integer getType();   // 0: personal, 1: public

     String getCustomerId();
}
