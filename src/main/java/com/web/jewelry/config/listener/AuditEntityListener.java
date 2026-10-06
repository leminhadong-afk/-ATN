package com.web.jewelry.config.listener;

import com.web.jewelry.entity.base.AuditEntity;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Calendar;

public class AuditEntityListener {

    @PrePersist
    public void prePersist(AuditEntity entity) {
        entity.setCreatedDate(getCurrentTime());
        entity.setLastModifiedDate(getCurrentTime());
        String username = getCurrentUsername();
        entity.setCreatedBy(username);
        entity.setLastModifiedBy(username);
    }

    @PreUpdate
    public void preUpdate(AuditEntity entity) {
        entity.setLastModifiedDate(getCurrentTime());
        entity.setLastModifiedBy(getCurrentUsername());
    }

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        return "anonymous";
    }

    private long getCurrentTime() {
        return Calendar.getInstance().getTimeInMillis();
    }
}