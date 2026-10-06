package com.web.jewelry.business.common.base;

import org.springframework.beans.factory.annotation.Value;

public interface SimpleEntityProjection {

    @Value("#{target.id}")
    String getId();

    @Value("#{target.name}")
    String getName();
}

