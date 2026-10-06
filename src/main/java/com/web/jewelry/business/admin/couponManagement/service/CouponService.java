package com.web.jewelry.business.admin.couponManagement.service;

import com.web.jewelry.dto.couponManagement.CreateCouponDTO;
import com.web.jewelry.dto.couponManagement.FindCouponDTO;
import com.web.jewelry.dto.couponManagement.ListCouponDTO;
import com.web.jewelry.dto.couponManagement.UpdateCouponDTO;
import org.springframework.data.domain.Page;

public interface CouponService {
    String createCoupon (CreateCouponDTO request);

    Page<ListCouponDTO> searchCoupon (FindCouponDTO req);

    String updateCoupon ( UpdateCouponDTO request);
}
