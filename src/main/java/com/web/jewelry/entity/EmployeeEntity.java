package com.web.jewelry.entity;

import com.web.jewelry.config.constant.classconstant.EntityProperties;
import com.web.jewelry.config.constant.enumconstant.Role;
import com.web.jewelry.entity.base.PrimaryEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.DynamicUpdate;

import java.util.Date;

@Entity
@Table(name = "employees")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@DynamicUpdate
public class EmployeeEntity extends PrimaryEntity {

    @Column(length = EntityProperties.LENGTH_CODE)
    private String code;

    @Column(length = EntityProperties.LENGTH_NAME)
    private String name;

    @Column
    private Date dateOfBirth;

    @Column
    private String address;

    @Column(length = EntityProperties.LENGTH_PHONE)
    private String phone;

    @Column(length = EntityProperties.LENGTH_EMAIL)
    private String email;

    @Column
    private Integer sex;

    @Column(length = EntityProperties.LENGTH_PASSWORD)
    private String password;

    @Column(length = EntityProperties.LENGTH_URL)
    private String avatar;

    @Column
    private Role role;

    @Column
    private Integer deleteFlag = 0;

}
