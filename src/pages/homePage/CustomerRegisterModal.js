import React, { useState } from "react";
import { Modal, Form, Input, Button, Typography, message, DatePicker, Select, Row, Col } from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  ManOutlined,
  WomanOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "./RegisterModal.module.css";
import { CustomerManagementApi } from "../../api/admin/customerManagement/CustomerManagementApi";

const { Text } = Typography;

const CustomerRegisterModal = ({ visible, onClose, onSwitchToLogin }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState("");

  const handleDateChange = (date, dateString) => {
    if (date) {
      setDateOfBirth(dateString); // Đã là chuỗi định dạng "YYYY-MM-DD"
    } else {
      setDateOfBirth("");
    }
  };

  const handleRegister = async (values) => {
    setLoading(true);

    try {
      // Chuẩn bị dữ liệu gửi lên server
      const customerData = {
        name: values.name,
        email: values.email,
        phoneNumber: values.phone,
        dateOfBirth: dateOfBirth || null, // Đã là chuỗi định dạng "YYYY-MM-DD"
        address: values.address || null,
        sex: values.sex !== undefined ? parseInt(values.sex) : null,
      };

      console.log("Register data:", customerData);

      // Gọi API đăng ký
      await CustomerManagementApi.create(customerData);
      message.success("Đăng ký thành công! Vui lòng đăng nhập.");
      form.resetFields();
      setDateOfBirth("");
      onClose();
      onSwitchToLogin();
    } catch (error) {
      console.error("Registration error:", error);
      if (error?.response?.status === 400) {
        const errorMessage = error?.response?.data?.message || error?.response?.data;
        if (errorMessage && errorMessage.includes("Email")) {
          message.error("Email này đã tồn tại. Vui lòng sử dụng email khác.");
        } else if (errorMessage && errorMessage.includes("Số điện thoại")) {
          message.error("Số điện thoại này đã tồn tại. Vui lòng sử dụng số điện thoại khác.");
        } else {
          message.error("Email hoặc số điện thoại này đã tồn tại. Vui lòng sử dụng thông tin khác.");
        }
      } else if (error?.errorFields?.length > 0) {
        // Lỗi validation từ form
        form.scrollToField(error.errorFields[0].name);
      } else {
        message.error("Đăng ký thất bại! Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div className={styles.modalTitle}>
          <h2>Đăng ký tài khoản</h2>
          <p className={styles.subtitle}>
            Tạo tài khoản để mua sắm dễ dàng hơn
          </p>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={600}
      className={styles.registerModal}
      destroyOnClose
    >
      <div className={styles.formContainer}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleRegister}
          initialValues={{
            name: "",
            email: "",
            phone: "",
            dateOfBirth: null,
            address: "",
            sex: undefined,
          }}
          className={styles.registerForm}
          size="large"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Họ và tên"
                name="name"
                rules={[
                  { required: true, message: "Vui lòng nhập họ và tên!" },
                  { min: 2, message: "Tên phải có ít nhất 2 ký tự!" },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Nhập họ và tên của bạn"
                  className={styles.inputField}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                  {
                    pattern: /^[0-9]{10,11}$/,
                    message: "Số điện thoại không hợp lệ!",
                  },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="Nhập số điện thoại"
                  className={styles.inputField}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
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
                  className={styles.inputField}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Ngày sinh"
                name="dateOfBirth"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày sinh!" },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="YYYY-MM-DD"
                  value={dateOfBirth ? dayjs(dateOfBirth, "YYYY-MM-DD") : null}
                  onChange={handleDateChange}
                  className={styles.datePicker}
                  placeholder="Chọn ngày sinh"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Địa chỉ"
                name="address"
                rules={[
                  { required: true, message: "Vui lòng nhập địa chỉ!" },
                ]}
              >
                <Input
                  prefix={<HomeOutlined />}
                  placeholder="Nhập địa chỉ của bạn"
                  className={styles.inputField}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Giới tính"
                name="sex"
                rules={[
                  { required: true, message: "Vui lòng chọn giới tính!" },
                ]}
              >
                <Select
                  placeholder="Chọn giới tính"
                  className={styles.selectField}
                >
                  <Select.Option value="1">
                    <ManOutlined /> Nam
                  </Select.Option>
                  <Select.Option value="0">
                    <WomanOutlined /> Nữ
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu của bạn"
              className={styles.inputField}
            />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp!")
                  );
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập lại mật khẩu"
              className={styles.inputField}
            />
          </Form.Item> */}

          <Form.Item>
            <div className={styles.formActions}>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSwitchToLogin();
                }}
                className={styles.loginLink}
              >
                Đã có tài khoản? Đăng nhập
              </button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className={styles.submitButton}
              >
                Đăng ký
              </Button>
            </div>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default CustomerRegisterModal;
