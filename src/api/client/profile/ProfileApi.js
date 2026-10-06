import { request } from "../../../util/axios/request.helper";

const baseUrl = "/customer";

export class ProfileApi {
  // Gửi OTP đổi mật khẩu (cần customerId)
  static requestChangePasswordOtp = (customerId) =>
    request({
      method: "POST",
      url: `${baseUrl}/request-change-password-otp`,
      data: { customerId },
    });

  // Đổi mật khẩu (cần OTP, customerId, oldPassword, newPassword)
  static changePassword = (data) =>
    request({
      method: "POST",
      url: `${baseUrl}/change-password`,
      data,
    });

  // Gửi OTP quên mật khẩu (cần email)
  static requestForgotPasswordOtp = (email) =>
    request({
      method: "POST",
      url: `${baseUrl}/request-forgot-password-otp`,
      data: { email },
    });

  // Đặt lại mật khẩu (cần email, newPassword, otp)
  static forgotPassword = (data) =>
    request({
      method: "POST",
      url: `${baseUrl}/forgot-password`,
      data,
    });
}
