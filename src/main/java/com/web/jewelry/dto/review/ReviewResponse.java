package com.web.jewelry.dto.review;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReviewResponse {

    private String id;
    private String productId;
    private String productName;
    private String productDetailId;
    private String customerId;
    private String customerName;
    private String customerAvatar;
    private String billId;
    private Integer star;
    private String comment;
    private String images;
    private String reply;
    private Date replyDate;
    private Integer status;
    private Long createdDate;
}
