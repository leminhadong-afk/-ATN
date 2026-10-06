package com.web.jewelry.dto.customerManagement;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
public class ListCustomerDTO {
    private Long rowNum;

    private String avatar;

    private String id;

    private String customerCode;

    private String name;

    private Date dateOfBirth;

    private String email;

    private String phoneNumber;

    private String address;

    private Integer sex;

    private Integer deleteFlag;
}
