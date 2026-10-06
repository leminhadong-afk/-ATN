package com.web.jewelry.business.client.momo.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreatePaymentMomoDTO {
    private String billId;
    private Double amount;
}
