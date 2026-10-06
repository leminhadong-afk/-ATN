package com.web.jewelry.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSchemaUpdater implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            log.info("Checking and altering 'reviews' table columns in MySQL...");
            jdbcTemplate.execute("ALTER TABLE `reviews` MODIFY COLUMN `images` LONGTEXT");
            jdbcTemplate.execute("ALTER TABLE `reviews` MODIFY COLUMN `comment` TEXT");
            jdbcTemplate.execute("ALTER TABLE `reviews` MODIFY COLUMN `reply` TEXT");
            
            // dọn dẹp các bản ghi ảnh cũ bị cắt ngắn 255 ký tự do VARCHAR(255) trước đây
            jdbcTemplate.execute("UPDATE `reviews` SET `images` = NULL WHERE `images` LIKE 'data:image%' AND LENGTH(`images`) < 500");
            
            log.info("Successfully altered 'reviews' table columns to LONGTEXT / TEXT and cleaned up truncated images!");
        } catch (Exception e) {
            log.warn("Database schema update notice: {}", e.getMessage());
        }
    }
}
