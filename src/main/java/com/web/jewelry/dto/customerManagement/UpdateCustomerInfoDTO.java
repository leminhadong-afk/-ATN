package com.web.jewelry.dto.customerManagement;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
public class UpdateCustomerInfoDTO {

    @NotBlank(message = "Họ và tên không được để trống")
    private String name;

    private Date dateOfBirth;

    @NotBlank(message = "Số điện thoại không được để trống")
    private String phoneNumber;

    private Integer sex;

    private String address;

    private String avatar;
}

