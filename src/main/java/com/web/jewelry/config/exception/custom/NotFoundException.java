package com.web.jewelry.config.exception.custom;

public class NotFoundException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    private String message;

    public NotFoundException() {
    }

    public NotFoundException(String message) {
        this.message = message;
    }

    @Override
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
