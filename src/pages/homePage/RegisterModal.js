import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  message,
  Row,
  Col,
  Button,
  Popconfirm,
} from "antd";
import { EmployeeManagementApi } from "../../api/admin/employeeManagement/EmployeeManagementApi";
import dayjs from "dayjs";
import styles from "./RegisterModal.module.css";
import { useNavigate } from "react-router";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  TeamOutlined,
  ManOutlined,
  WomanOutlined,
} from "@ant-design/icons";

const RegisterModal = ({ visible, onCancel, onSwitchToLogin }) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      // Validate toàn bộ các trường trong form
      const values = await form.validateFields();

      // Nếu không có lỗi, tiếp tục xử lý dữ liệu
      const employeeData = {
        ...values,
        dateOfBirth: dateOfBirth, // Đã là chuỗi định dạng "YYYY-MM-DD"
      };

      // Gửi dữ liệu lên server
      await EmployeeManagementApi.create(employeeData);
      message.success("Nhân viên được thêm thành công!");

      // Xóa dữ liệu trong form sau khi thành công
      form.resetFields();
      setDateOfBirth("");

      // Điều hướng về trang quản lý nhân viên
      navigate("/employee-management");
    } catch (errorInfo) {
      // Nếu là lỗi từ validate phía frontend
      if (errorInfo?.errorFields?.length > 0) {
        form.scrollToField(errorInfo.errorFields[0].name);
      }

      // Nếu lỗi là từ phía backend
      if (errorInfo.response?.status === 400) {
        message.error("Email này đã tồn tại. Vui lòng sử dụng email khác.");
      } else {
        console.error("Error adding employee:", errorInfo);
        message.error("Có lỗi xảy ra khi thêm nhân viên.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date, dateString) => {
    if (date) {
      setDateOfBirth(dateString); // Đã là chuỗi định dạng "YYYY-MM-DD"
    } else {
      setDateOfBirth("");
    }
  };

  return (
    <Modal
      title={
        <div className={styles.modalTitle}>
          <h2>Đăng ký nhân viên mới</h2>
          <p className={styles.subtitle}>Vui lòng điền đầy đủ thông tin bên dưới</p>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      className={styles.registerModal}
      destroyOnClose
    >
      <div className={styles.formContainer}>
        <Form 
          form={form} 
          layout="vertical"
          className={styles.employeeForm}
          size="large"
        >
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="name"
                label="Tên nhân viên"
                rules={[
                  { required: true, message: "Vui lòng nhập tên nhân viên" },
                ]}
              >
                <Input 
                  prefix={<UserOutlined />}
                  placeholder="Nhập tên nhân viên"
                  className={styles.inputField}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="phoneNumber"
                label="Số điện thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                  {
                    pattern: /^[0-9]+$/,
                    message: "Vui lòng nhập chỉ số",
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

          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="dateOfBirth"
                label="Ngày sinh"
                rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
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
            <Col xs={24} sm={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  {
                    type: "email",
                    message: "Vui lòng nhập email hợp lệ",
                    trigger: "onBlur",
                  },
                ]}
              >
                <Input 
                  prefix={<MailOutlined />}
                  placeholder="Nhập email"
                  className={styles.inputField}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="address"
                label="Địa chỉ"
                rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
              >
                <Input 
                  prefix={<HomeOutlined />}
                  placeholder="Nhập địa chỉ"
                  className={styles.inputField}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="role"
                label="Chức vụ"
                rules={[{ required: true, message: "Vui lòng chọn chức vụ" }]}
              >
                <Select 
                  placeholder="Chọn chức vụ"
                  className={styles.selectField}
                  suffixIcon={<TeamOutlined />}
                >
                  <Select.Option value="0">Quản lý</Select.Option>
                  <Select.Option value="1">Nhân viên</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="sex"
                label="Giới tính"
                rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
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

          <div className={styles.formActions}>
            <div className={styles.actionButtons}>
              <Popconfirm
                title="Xác nhận thêm nhân viên"
                description="Bạn có chắc chắn muốn thêm nhân viên này vào hệ thống?"
                onConfirm={handleSubmit}
                okText="Xác nhận"
                cancelText="Hủy"
              >
                <Button
                  type="primary"
                  size="large"
                  loading={loading}
                  className={styles.submitButton}
                >
                  Thêm nhân viên
                </Button>
              </Popconfirm>
              <Button 
                onClick={onCancel}
                className={styles.cancelButton}
              >
                Hủy
              </Button>
            </div>
            <span className={styles.switchText}>
              Đã có tài khoản?{" "}
              <a
                onClick={() => {
                  onCancel();
                  onSwitchToLogin();
                }}
                className={styles.switchLink}
              >
                Đăng nhập
              </a>
            </span>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default RegisterModal;
