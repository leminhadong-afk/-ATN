import React, { useState } from "react";
import { Modal, Form, Input, Button, Typography, message } from "antd";
import { ProfileApi } from "../../../api/client/profile/ProfileApi";
import "./style-forgot-modal.css";
import { MailOutlined, LockOutlined, SafetyOutlined } from "@ant-design/icons";

const { Text } = Typography;

const ModalForgotPass = ({ visible, onClose }) => {
  const [form] = Form.useForm();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);

  // Step 1: Nhập email, gửi OTP
  const handleSendOtp = async () => {
    const values = await form.validateFields(["email"]);
    setLoading(true);
    try {
      await ProfileApi.requestForgotPasswordOtp(values.email);
      setEmail(values.email);
      setOtpRequested(true);
      setStep(2);
      message.success("Đã gửi mã OTP về email của bạn");
    } catch (error) {
      const msg = error?.response?.data?.message || error?.response?.data || "Không thể gửi OTP. Vui lòng thử lại.";
      message.error(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Nhập OTP và mật khẩu mới
  const handleResetPassword = async () => {
    const values = await form.validateFields(["otp", "newPassword"]);
    setLoading(true);
    try {
      await ProfileApi.forgotPassword({
        email,
        otp: values.otp,
        newPassword: values.newPassword,
      });
      message.success("Đổi mật khẩu thành công. Vui lòng đăng nhập lại.");
      setStep(1);
      setOtpRequested(false);
      form.resetFields();
      onClose();
    } catch (error) {
      const msg = error?.response?.data?.message || error?.response?.data || "Không thể đổi mật khẩu. Vui lòng thử lại.";
      message.error(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={<div className="forgotTitle">Quên mật khẩu</div>}
      open={visible}
      onCancel={() => {
        setStep(1);
        setOtpRequested(false);
        form.resetFields();
        onClose();
      }}
      footer={null}
      centered
      width={400}
      className="forgotModal"
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="forgotForm">
        {step === 1 && (
          <>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Nhập email của bạn"
                className="forgotInput"
              />
            </Form.Item>
            <Button
              type="primary"
              className="forgotButton"
              loading={loading}
              onClick={handleSendOtp}
            >
              Gửi mã OTP
            </Button>
          </>
        )}
        {step === 2 && (
          <>
            <Form.Item
              label="Mã OTP"
              name="otp"
              rules={[{ required: true, message: "Vui lòng nhập mã OTP!" }]}
            >
              <Input
                prefix={<SafetyOutlined />}
                placeholder="Nhập mã OTP gửi về email"
                maxLength={6}
                className="forgotInput"
              />
            </Form.Item>
            <Form.Item
              label="Mật khẩu mới"
              name="newPassword"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
                { max: 50, message: "Mật khẩu không được vượt quá 50 ký tự" },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: "Mật khẩu phải chứa chữ hoa, chữ thường và số",
                },
              ]}
              hasFeedback
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Nhập mật khẩu mới"
                className="forgotInput"
              />
            </Form.Item>
            <Button
              type="primary"
              className="forgotButton"
              loading={loading}
              onClick={handleResetPassword}
            >
              Đổi mật khẩu
            </Button>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default ModalForgotPass;
