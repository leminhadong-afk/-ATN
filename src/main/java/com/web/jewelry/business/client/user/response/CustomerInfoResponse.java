package com.web.jewelry.business.client.user.response;

import java.util.Date;
import lombok.Data;

@Data
public class CustomerInfoResponse {
    private String id;
    private String code;
    private String name;
    private Date dateOfBirth;
    private String phoneNumber;
    private String email;
    private Integer sex;
    private String address;
    private String avatar;
}
