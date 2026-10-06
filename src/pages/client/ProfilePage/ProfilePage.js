import {
  Card,
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  Upload,
  Avatar,
  message,
  Space,
  Typography,
  Divider,
  Row,
  Col,
  Spin,
  Modal,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  CalendarOutlined,
  EditOutlined,
  SaveOutlined,
  CameraOutlined,
  LockOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import Header from "../HomePage/Header";
import Footer from "../HomePage/Footer";
import { UserApi } from "../../../api/client/user/UserApi";
import { ProfileApi } from "../../../api/client/profile/ProfileApi";
import { isTokenExpired } from "../../../util/common/utils";
import styles from "./ProfilePage.module.css";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ProfilePage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [passwordForm] = Form.useForm();
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token || isTokenExpired(token)) {
      message.warning("Vui lòng đăng nhập để xem thông tin cá nhân");
      navigate("/");
      return;
    }

    fetchUserInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchUserInfo = async () => {
    setLoading(true);
    try {
      const response = await UserApi.getInfo();
      const data = response?.data || response;

      if (!data) {
        message.warning("Không tìm thấy thông tin người dùng");
        return;
      }

      console.log("User info fetched:", data); // Debug log

      setUserInfo(data);
      setAvatarUrl(data?.avatar || "");

      // Parse dateOfBirth - handle both string and Date object
      let parsedDateOfBirth = null;
      if (data?.dateOfBirth) {
        if (typeof data.dateOfBirth === "string") {
          // Handle ISO string format
          parsedDateOfBirth = dayjs(data.dateOfBirth);
        } else if (data.dateOfBirth instanceof Date) {
          parsedDateOfBirth = dayjs(data.dateOfBirth);
        } else if (typeof data.dateOfBirth === "number") {
          // Handle timestamp
          parsedDateOfBirth = dayjs(data.dateOfBirth);
        }
      }

      // Set form values with all user information
      const formValues = {
        name: data?.name || "",
        email: data?.email || "",
        phoneNumber: data?.phoneNumber || "",
        address: data?.address || "",
        dateOfBirth: parsedDateOfBirth,
        sex:
          data?.sex !== undefined && data?.sex !== null ? data.sex : undefined,
      };

      console.log("Setting form values:", formValues); // Debug log
      form.setFieldsValue(formValues);
    } catch (error) {
      console.error("Error fetching user info:", error);
      if (error.response?.status === 401) {
        message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
        localStorage.clear();
        navigate("/");
      } else if (error.response?.status === 404) {
        message.warning("Không tìm thấy thông tin người dùng");
      } else {
        message.error("Không thể tải thông tin cá nhân. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    // Reset form to original values
    if (userInfo) {
      form.setFieldsValue({
        name: userInfo?.name || "",
        email: userInfo?.email || "",
        phoneNumber: userInfo?.phoneNumber || "",
        address: userInfo?.address || "",
        dateOfBirth: userInfo?.dateOfBirth ? dayjs(userInfo.dateOfBirth) : null,
        sex: userInfo?.sex !== undefined ? userInfo.sex : undefined,
      });
    }
  };

  const handleSave = async (values) => {
    setSaving(true);
    try {
      // Prepare update data - convert dateOfBirth to ISO string format
      const updateData = {
        name: values.name,
        phoneNumber: values.phoneNumber,
        address: values.address || null,
        sex: values.sex !== undefined ? values.sex : null,
        dateOfBirth: values.dateOfBirth
          ? values.dateOfBirth.toISOString()
          : null,
        avatar: avatarUrl || null,
      };

      // Try to update
      try {
        const response = await UserApi.updateInfo(updateData);
        const messageText =
          response?.data || response || "Cập nhật thông tin thành công";
        message.success(messageText);
        setEditing(false);
        await fetchUserInfo(); // Refresh data
      } catch (error) {
        // Handle different error cases
        const status = error.response?.status;
        const errorMessage = error.response?.data?.message || error.message;

        if (
          status === 404 ||
          status === 405 ||
          errorMessage?.includes("No static resource")
        ) {
          message.warning(
            "Chức năng cập nhật thông tin đang được phát triển. Vui lòng thử lại sau."
          );
          setEditing(false); // Still exit edit mode
        } else if (status === 400) {
          message.error(errorMessage || "Dữ liệu không hợp lệ");
        } else if (status === 401) {
          message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
          localStorage.clear();
          navigate("/");
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error("Error updating user info:", error);
      const status = error.response?.status;
      if (status !== 404 && status !== 405) {
        message.error("Không thể cập nhật thông tin. Vui lòng thử lại sau.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (file) => {
    console.log("handleFileChange called with:", file);

    // Get file object - same pattern as ProductDetailManagement
    const fileObj =
      file.originFileObj || file.file?.originFileObj || file.file || file;

    console.log("Extracted fileObj:", fileObj);

    if (!fileObj) {
      console.error("No file object found");
      message.error("Không tìm thấy file. Vui lòng thử lại.");
      return;
    }

    // Validate file type
    if (!fileObj.type || !fileObj.type.startsWith("image/")) {
      message.error("Vui lòng chọn file ảnh");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (fileObj.size > maxSize) {
      message.error("Kích thước file không được vượt quá 5MB");
      return;
    }

    // Show loading state for upload
    setUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append("multipartFile", fileObj); // Use "multipartFile" to match ProductDetailManagement pattern

      console.log("Uploading file...", {
        name: fileObj.name,
        size: fileObj.size,
        type: fileObj.type,
      });

      const { FileUploadApi } = await import(
        "../../../api/admin/fileUpload/FileUploadApi"
      );
      const response = await FileUploadApi.uploadFileImage(formData);

      console.log("Upload response:", response);

      // Backend returns String (URL) directly in response body
      const url = response?.data;

      if (url && typeof url === "string" && url.trim().length > 0) {
        setAvatarUrl(url);
        message.success("Upload ảnh đại diện thành công");
        // Avatar URL will be saved when user clicks "Lưu thay đổi"
      } else {
        console.error("Invalid URL response:", url);
        throw new Error("Không nhận được URL từ server");
      }
    } catch (error) {
      console.error("Upload error details:", {
        message: error.message,
        response: error.response,
        data: error.response?.data,
      });

      let errorMessage = "Không thể upload ảnh. Vui lòng thử lại.";

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 400) {
          errorMessage = data?.message || "File không hợp lệ";
        } else if (status === 401) {
          errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
          localStorage.clear();
          navigate("/");
        } else if (status === 413) {
          errorMessage = "File quá lớn";
        } else if (status >= 500) {
          errorMessage = "Lỗi server. Vui lòng thử lại sau.";
        } else {
          errorMessage = data?.message || error.message || errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      message.error(errorMessage);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const uploadProps = {
    name: "file",
    listType: "picture-card",
    className: "avatar-uploader",
    maxCount: 1,
    showUploadList: false,
    accept: "image/*",
    beforeUpload: (file) => {
      // Validate before upload
      const isImage = file.type?.startsWith("image/");
      if (!isImage) {
        message.error("Vui lòng chọn file ảnh!");
        return Upload.LIST_IGNORE;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error("Kích thước file không được vượt quá 5MB!");
        return Upload.LIST_IGNORE;
      }
      return false; // Prevent auto upload - same as ProductDetailManagement
    },
    onChange: (info) => {
      console.log("Upload onChange event:", info);
      const { file } = info;

      // Only handle when file status changes
      if (file.status === "removed") {
        return;
      }

      // Call handleFileChange when file is selected
      if (file.originFileObj || file) {
        handleFileChange(file);
      }
    },
  };

  const openPasswordModal = () => {
    setPasswordModalVisible(true);
    passwordForm.resetFields();
    setOtpRequested(false); // Reset OTP state when opening modal
  };

  const closePasswordModal = () => {
    setPasswordModalVisible(false);
    passwordForm.resetFields();
    setOtpRequested(false); // Reset OTP state when closing modal
  };

  // Gửi OTP về email
  const handleRequestOtp = async () => {
    if (!userInfo?.id) {
      message.error("Không tìm thấy thông tin tài khoản");
      return;
    }
    setOtpLoading(true);
    try {
      await ProfileApi.requestChangePasswordOtp(userInfo.id);
      message.success("Đã gửi mã OTP về email của bạn");
      setOtpRequested(true);
      // Trigger validate lại trường OTP nếu đã nhập
      setTimeout(() => {
        passwordForm.validateFields(["otp"]);
      }, 0);
    } catch (error) {
      const msg = error?.response?.data?.message || error?.response?.data || "Không thể gửi OTP. Vui lòng thử lại.";
      message.error(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setOtpLoading(false);
    }
  };

  // Đổi mật khẩu với OTP
  const handleChangePassword = async (values) => {
    setChangingPassword(true);
    try {
      if (!userInfo?.id) {
        message.error("Không tìm thấy thông tin tài khoản");
        return;
      }
      if (!otpRequested) {
        message.error("Vui lòng nhận mã OTP trước khi đổi mật khẩu");
        return;
      }
      const passwordData = {
        customerId: userInfo.id,
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
        otp: values.otp,
      };

      await ProfileApi.changePassword(passwordData);
      message.success("Đổi mật khẩu thành công");
      setPasswordModalVisible(false);
      passwordForm.resetFields();
      setOtpRequested(false);
    } catch (error) {
      const msg = error?.response?.data?.message || error?.response?.data || "Không thể đổi mật khẩu. Vui lòng thử lại.";
      message.error(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.layout}>
        <Header />
        <div className={styles.loadingContainer}>
          <Spin size="large" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <Header />
      <div className={styles.container}>
        <div className={styles.content}>
          <Card className={styles.profileCard}>
            <div className={styles.headerSection}>
              <div className={styles.avatarSection}>
                {editing ? (
                  <Upload {...uploadProps}>
                    {uploadingAvatar ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "100%",
                          width: "100%",
                        }}
                      >
                        <Spin />
                      </div>
                    ) : avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="avatar"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "50%",
                        }}
                      />
                    ) : (
                      <div>
                        <CameraOutlined
                          style={{ fontSize: 24, color: "#999" }}
                        />
                        <div style={{ marginTop: 8, color: "#999" }}>
                          Đổi ảnh
                        </div>
                      </div>
                    )}
                  </Upload>
                ) : (
                  <Avatar
                    size={120}
                    src={avatarUrl}
                    icon={<UserOutlined />}
                    className={styles.avatar}
                  />
                )}
              </div>
              <div className={styles.userInfoHeader}>
                <Title level={2} className={styles.userName}>
                  {userInfo?.name ||
                    localStorage.getItem("name") ||
                    "Người dùng"}
                </Title>
                <Text className={styles.userCode}>
                  Mã: {userInfo?.code || "N/A"}
                </Text>
                <Text className={styles.userEmail} type="secondary">
                  {userInfo?.email || localStorage.getItem("email") || ""}
                </Text>
                {!editing && (
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={handleEdit}
                    className={styles.editButton}
                  >
                    Chỉnh sửa thông tin
                  </Button>
                )}
              </div>
            </div>

            <Divider />

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              className={styles.profileForm}
            >
              <Row gutter={[24, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label={
                      <Space>
                        <UserOutlined />
                        <span>Họ và tên</span>
                      </Space>
                    }
                    name="name"
                    rules={[
                      { required: true, message: "Vui lòng nhập họ và tên" },
                      {
                        max: 100,
                        message: "Họ và tên không được vượt quá 100 ký tự",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Nhập họ và tên"
                      disabled={!editing}
                      size="large"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label={
                      <Space>
                        <MailOutlined />
                        <span>Email</span>
                      </Space>
                    }
                    name="email"
                    rules={[
                      { required: true, message: "Vui lòng nhập email" },
                      { type: "email", message: "Email không hợp lệ" },
                    ]}
                  >
                    <Input
                      placeholder="Nhập email"
                      disabled={true}
                      size="large"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label={
                      <Space>
                        <PhoneOutlined />
                        <span>Số điện thoại</span>
                      </Space>
                    }
                    name="phoneNumber"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập số điện thoại",
                      },
                      {
                        pattern: /^[0-9]{10,11}$/,
                        message: "Số điện thoại không hợp lệ",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Nhập số điện thoại"
                      disabled={!editing}
                      size="large"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label={
                      <Space>
                        <CalendarOutlined />
                        <span>Ngày sinh</span>
                      </Space>
                    }
                    name="dateOfBirth"
                  >
                    <DatePicker
                      placeholder="Chọn ngày sinh"
                      disabled={!editing}
                      size="large"
                      style={{ width: "100%" }}
                      format="DD/MM/YYYY"
                      disabledDate={(current) => {
                        return current && current > dayjs().endOf("day");
                      }}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label={
                      <Space>
                        <UserOutlined />
                        <span>Giới tính</span>
                      </Space>
                    }
                    name="sex"
                  >
                    <Select
                      placeholder="Chọn giới tính"
                      disabled={!editing}
                      size="large"
                    >
                      <Option value={0}>Nam</Option>
                      <Option value={1}>Nữ</Option>
                      <Option value={2}>Khác</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item
                    label={
                      <Space>
                        <HomeOutlined />
                        <span>Địa chỉ</span>
                      </Space>
                    }
                    name="address"
                    rules={[
                      {
                        max: 500,
                        message: "Địa chỉ không được vượt quá 500 ký tự",
                      },
                    ]}
                  >
                    <TextArea
                      placeholder="Nhập địa chỉ"
                      disabled={!editing}
                      rows={3}
                      showCount
                      maxLength={500}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {editing && (
                <div className={styles.actionButtons}>
                  <Space>
                    <Button onClick={handleCancel} size="large">
                      Hủy
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      loading={saving}
                      size="large"
                    >
                      Lưu thay đổi
                    </Button>
                  </Space>
                </div>
              )}
            </Form>
          </Card>

          {/* Change Password Card */}
          <Card className={styles.passwordCard}>
            <div className={styles.passwordCardHeader}>
              <Space>
                <LockOutlined style={{ fontSize: 20, color: "#1a365d" }} />
                <Title level={4} className={styles.passwordCardTitle}>
                  Đổi mật khẩu
                </Title>
              </Space>
            </div>
            <Text className={styles.passwordCardDescription}>
              Để bảo mật tài khoản, vui lòng sử dụng mật khẩu mạnh và không chia
              sẻ với người khác.
            </Text>
            <Button
              type="primary"
              icon={<SafetyOutlined />}
              onClick={openPasswordModal}
              className={styles.changePasswordButton}
              size="large"
            >
              Đổi mật khẩu
            </Button>
          </Card>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        title={
          <Space>
            <LockOutlined />
            <span>Đổi mật khẩu</span>
          </Space>
        }
        open={passwordModalVisible}
        onCancel={closePasswordModal}
        footer={null}
        width={500}
        className={styles.passwordModal}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
          className={styles.passwordForm}
        >
          <Form.Item
            label="Mật khẩu hiện tại"
            name="oldPassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu hiện tại" },
            ]}
          >
            <Input.Password
              placeholder="Nhập mật khẩu hiện tại"
              size="large"
              prefix={<LockOutlined />}
            />
          </Form.Item>

          <Form.Item
            label="Mã OTP"
            name="otp"
            rules={[{ required: true, message: "Vui lòng nhập mã OTP" }]}
          >
            <Input
              placeholder="Nhập mã OTP gửi về email"
              size="large"
              maxLength={6}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <div style={{ marginBottom: 24 }}>
            <Button
              type="primary"
              onClick={handleRequestOtp}
              loading={otpLoading}
              disabled={otpRequested}
            >
              {otpRequested ? "Đã gửi OTP" : "Nhận mã OTP"}
            </Button>
          </div>

          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới" },
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
              placeholder="Nhập mật khẩu mới"
              size="large"
              prefix={<LockOutlined />}
            />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu mới"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
              {
                validator: (_, value) => {
                  // Use passwordForm to get the value of newPassword
                  if (
                    !value ||
                    passwordForm.getFieldValue("newPassword") === value
                  ) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp")
                  );
                },
              },
            ]}
            hasFeedback
          >
            <Input.Password
              placeholder="Xác nhận mật khẩu mới"
              size="large"
              prefix={<LockOutlined />}
            />
          </Form.Item>

          <div className={styles.passwordModalActions}>
            <Space>
              <Button
                onClick={() => setPasswordModalVisible(false)}
                size="large"
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={changingPassword}
                size="large"
                icon={<SaveOutlined />}
              >
                Đổi mật khẩu
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      <Footer />
    </div>
  );
};

export default ProfilePage;
