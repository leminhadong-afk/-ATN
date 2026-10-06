package com.web.jewelry.util;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public class MomoUtils {

    public static String signHmacSHA256(String data, String secretKey) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(secretKey.getBytes(), "HmacSHA256");
            hmac.init(secret_key);
            byte[] hash = hmac.doFinal(data.getBytes());
            return bytesToHex(hash);
        } catch (Exception e) {
            throw new RuntimeException("Error while signing HMAC SHA256: " + e.getMessage());
        }
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) sb.append(String.format("%02x", b));
        return sb.toString();
    }

}
