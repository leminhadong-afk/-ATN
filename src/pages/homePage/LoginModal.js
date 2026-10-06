import React, { useState } from "react";
import { Modal, Form, Input, Button, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { SetLoading } from "../../app/reducer/common/LoadingSlice.reducer";
import { LoginApi } from "../../api/admin/login/LoginApi";
import { SCREEN } from "../../router/screen";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import styles from "./LoginModal.module.css";
import ModalForgotPass from "../client/HomePage/ModalForgotPass";

const { Text } = Typography;

const LoginModal = ({
  visible,
  onClose,
  onSwitchToRegister,
  onLoginSuccess,
}) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [forgotModalVisible, setForgotModalVisible] = useState(false);

  const handleLogin = async (values) => {
    setLoading(true);
    dispatch(SetLoading(true));

    try {
      const response = await LoginApi.login({
        email: values.email,
        password: values.password,
      });

      if (response.status === 200) {
        const data = response.data;
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("email", data.email);
        localStorage.setItem("name", data.name);

        onClose();
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          // Default navigation for admin users
          const role = data.role;
          if (role === "ADMIN" || role === "EMPLOYEE") {
            // Admin or Employee
            navigate(SCREEN.productManagement.path);
          }
        }
        message.success("Đăng nhập thành công!");
      }
    } catch (err) {
      if (err.response) {
        const { status, data } = err.response;
        if (status === 400) {
          message.error(data.message || "Đăng nhập thất bại!");
        } else {
          message.error("Tài khoản hoặc mật khẩu không đúng!");
        }
      } else {
        message.error(
          "Không thể kết nối đến server! Vui lòng kiểm tra kết nối."
        );
      }
    } finally {
      setLoading(false);
      dispatch(SetLoading(false));
    }
  };

  return (
    <>
      <Modal
        title={
          <div className={styles.modalTitle}>
            <h2>Đăng nhập</h2>
            <p className={styles.subtitle}>Chào mừng bạn quay trở lại!</p>
          </div>
        }
        open={visible}
        onCancel={onClose}
        footer={null}
        centered
        width={400}
        className={styles.loginModal}
        destroyOnClose
      >
        <div className={styles.formContainer}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleLogin}
            initialValues={{ email: "", password: "" }}
            className={styles.loginForm}
            size="large"
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Nhập email của bạn"
                className={styles.inputField}
              />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Nhập mật khẩu của bạn"
                className={styles.inputField}
              />
            </Form.Item>

            <Form.Item>
              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSwitchToRegister();
                  }}
                  className={styles.registerLink}
                >
                  Chưa có tài khoản? Đăng ký
                </button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className={styles.submitButton}
                >
                  Đăng nhập
                </Button>
              </div>
              <div style={{ textAlign: "right", marginTop: 8 }}>
                <button
                  type="button"
                  style={{
                    background: "none",
                    border: "none",
                    color: "#1a365d",
                    cursor: "pointer",
                    padding: 0,
                  }}
                  onClick={() => setForgotModalVisible(true)}
                >
                  Quên mật khẩu?
                </button>
              </div>
            </Form.Item>
          </Form>
        </div>
      </Modal>
      <ModalForgotPass
        visible={forgotModalVisible}
        onClose={() => setForgotModalVisible(false)}
      />
    </>
  );
};

export default LoginModal;
