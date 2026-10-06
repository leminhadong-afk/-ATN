package com.web.jewelry.config.mailconfig;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring5.SpringTemplateEngine;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailSender {

    private final JavaMailSender javaMailSender;

    private final SpringTemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String sender;

    @Async
    public void sendEmail(String[] toEmails, String subject, String titleEmail, String bodyEmail) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("title", titleEmail);
        variables.put("body", bodyEmail);

        String htmlBody = generateEmailContent(variables);
        sendSimpleMail(toEmails, htmlBody, subject);
    }

    private String generateEmailContent(Map<String, Object> variables) {
        Context context = new Context();
        context.setVariables(variables);
        return templateEngine.process("email", context);
    }

    private void sendSimpleMail(String[] recipients, String msgBody, String subject) {
        try {
            if (recipients == null || recipients.length == 0) {
                log.warn("No recipients provided for email subject: {}", subject);
                return;
            }
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage,
                    true, StandardCharsets.UTF_8.toString());
            mimeMessageHelper.setFrom(sender);
            mimeMessageHelper.setTo(recipients);
            mimeMessageHelper.setText(msgBody, true);
            mimeMessageHelper.setSubject(subject);
            javaMailSender.send(mimeMessage);
            log.info("Successfully sent email to {} with subject: {}", Arrays.toString(recipients), subject);
        } catch (Exception e) {
            log.error("Failed to send email to {}. Error: {}", Arrays.toString(recipients), e.getMessage(), e);
        }
    }

}

