import React, { useEffect, useState } from "react";
import { Layout, Input, Button, Modal, message, Form } from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined, LockOutlined, CrownOutlined } from "@ant-design/icons";
import { LoginApi } from "../../api/admin/login/LoginApi";
import { useNavigate } from "react-router-dom";
import "./style-header.css";

const { Header } = Layout;
const { confirm } = Modal;

const HeaderComponent = ({ collapsed, toggleCollapsed }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const response = await LoginApi.changePassword(values);
      message.success(response.data || 'Đổi mật khẩu thành công!');
      handleCancel();
    } catch (error) {
      message.error(error.response?.data || 'Đổi mật khẩu thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sticky-header">
      <Header
        className={collapsed ? "collapsed" : ""}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 24px",
          width: "100%",
          zIndex: 1000,
          paddingLeft: collapsed ? 80 : 250,
          top: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          {!collapsed && (
            <div
              className="sidebar-toggle"
              onClick={toggleCollapsed}
              style={{
                cursor: "pointer",
                width: "32px",
                marginLeft: 20,
                marginRight: "20px",
                height: "32px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "rgba(212, 175, 55, 0.15)",
                border: "1px solid rgba(212, 175, 55, 0.3)",
                borderRadius: "50%",
                color: "#D4AF37",
                transition: "all 0.2s ease",
              }}
              title="Thu gọn menu"
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </div>
          )}
          {collapsed && (
            <div
              className="header-brand-clean"
              role="button"
              tabIndex={0}
              onClick={() => navigate("/")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") navigate("/");
              }}
              style={{
                marginLeft: 25,
                cursor: "pointer",
                userSelect: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              title="Về trang chủ"
            >
              <CrownOutlined style={{ color: "#D4AF37", fontSize: 18 }} />
              <span className="header-brand-clean-title">ROYAL JEWELRY</span>
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* <Button
            type="primary"
            icon={<LockOutlined />}
            onClick={showModal}
            style={{
              backgroundColor: "#FCA311",
              borderColor: "#FCA311",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            Đổi mật khẩu
          </Button> */}
        </div>
      </Header>

      {/* <Modal
        title="Đổi mật khẩu"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={400}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            name="currentPassword"
            label="Mật khẩu hiện tại"
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập mật khẩu hiện tại!',
              },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu hiện tại" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập mật khẩu mới!',
              },
              {
                min: 8,
                message: 'Mật khẩu phải có ít nhất 8 ký tự!',
              },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            dependencies={['newPassword']}
            rules={[
              {
                required: true,
                message: 'Vui lòng xác nhận mật khẩu mới!',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button onClick={handleCancel}>
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                style={{ backgroundColor: '#FCA311', borderColor: '#FCA311' }}
              >
                Xác nhận
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal> */}
    </div>
  );
};

export default HeaderComponent;
