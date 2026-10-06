package com.web.jewelry.dto.employeeManagement;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
public class ListEmployeeDTO {
    private Long rowNum;

    private String avatar;

    private String id;

    private String employeeCode;

    private String name;

    private Date dateOfBirth;

    private String email;

    private String phoneNumber;

    private String address;

    private Integer sex;

    private Integer role;

    private String password;

    private Integer deleteFlag;
}
