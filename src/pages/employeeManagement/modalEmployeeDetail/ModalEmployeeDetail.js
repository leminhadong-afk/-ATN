import {
  Avatar,
  Button,
  Col,
  DatePicker,
  Input,
  message,
  Modal,
  Row,
  Select,
  Spin,
  Upload,
} from "antd";
import { CameraOutlined, UserOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import styles from "./ModalEmployeeDetail.module.css";
import dayjs from "dayjs";
import { EmployeeManagementApi } from "../../../api/admin/employeeManagement/EmployeeManagementApi";
import { FileUploadApi } from "../../../api/admin/fileUpload/FileUploadApi";
import { useNavigate } from "react-router";
import { Option } from "antd/es/mentions";

const ModalEmployeeDetail = ({ isModalOpen, handleCancel, employeeDetail }) => {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [sex, setSex] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [role, setRole] = useState("");
  const [deleteFlag, setDeleteFlag] = useState("");
  const [errors, setErrors] = useState({});
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const navigate = useNavigate();

  const validateFields = () => {
    const newErrors = {};
    if (!name) newErrors.name = "Họ và tên không được để trống.";
    if (!phoneNumber)
      newErrors.phoneNumber = "Số điện thoại không được để trống.";
    if (!email) newErrors.email = "Email không được để trống.";
    if (!address) newErrors.address = "Địa chỉ không được để trống.";
    if (!dateOfBirth) newErrors.dateOfBirth = "Ngày sinh không được để trống.";
    if (role === "") newErrors.role = "Chức vụ không được để trống.";
    if (!deleteFlag) newErrors.deleteFlag = "Password không được để trống.";

    setErrors(newErrors); // Cập nhật trạng thái lỗi
    return Object.keys(newErrors).length === 0; // Trả về true nếu không có lỗi
  };

  // Khi nhận dữ liệu employeeDetail, cập nhật trạng thái
  useEffect(() => {
    console.log("employeeDetail received:", employeeDetail);
    console.log("employeeDetail.avatar:", employeeDetail?.avatar);

    if (employeeDetail) {
      setId(employeeDetail.id || employeeDetail.employeeId || "");
      setCode(employeeDetail.employeeCode || "");
      setName(employeeDetail.name || "");
      setSex(employeeDetail.sex + "" || "");
      setPhoneNumber(employeeDetail.phoneNumber || "");
      setEmail(employeeDetail.email || "");
      setAddress(employeeDetail.address || "");
      setDateOfBirth(employeeDetail.dateOfBirth || "");
      setRole(employeeDetail.role + "" || "");
      setDeleteFlag(employeeDetail.deleteFlag + "" || "");
      // Set avatar URL - check both avatar and avatarUrl fields
      const avatar = employeeDetail.avatar || employeeDetail.avatarUrl || "";
      console.log("=== LOAD EMPLOYEE DETAIL ===");
      console.log("employeeDetail.avatar:", employeeDetail.avatar);
      console.log("employeeDetail.avatarUrl:", employeeDetail.avatarUrl);
      console.log("Final avatar value:", avatar);
      console.log("Avatar is empty?", !avatar || avatar.trim() === "");
      setAvatarUrl(avatar);
    } else {
      // Reset all fields when employeeDetail is null
      setId("");
      setCode("");
      setAvatarUrl("");
    }
  }, [employeeDetail]);

  // **Kiểm tra giá trị khi chọn ngày sinh**
  const handleDateChange = (date, dateString) => {
    if (date) {
      console.log("Year:", date.year()); // Chỉ gọi khi `date` là hợp lệ
      console.log("Formatted Date:", dateString); // Chuỗi ngày định dạng "YYYY-MM-DD"
      setDateOfBirth(dateString); // Cập nhật giá trị state
    } else {
      console.log("No date selected");
      setDateOfBirth(""); // Đặt lại giá trị nếu không có ngày
    }
  };

  // **Xử lý upload ảnh đại diện**
  const handleFileChange = async (file) => {
    console.log("handleFileChange called with:", file);
    
    // Get file object - same pattern as ProductDetailManagement
    const fileObj = file.originFileObj || file.file?.originFileObj || file.file || file;
    
    console.log("Extracted fileObj:", {
      hasFileObj: !!fileObj,
      name: fileObj?.name,
      size: fileObj?.size,
      type: fileObj?.type,
      isFile: fileObj instanceof File
    });
    
    if (!fileObj) {
      console.error("No file object found");
      message.error("Không tìm thấy file. Vui lòng thử lại.");
      return;
    }

    // Validate file type
    if (!fileObj.type || !fileObj.type.startsWith('image/')) {
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
      formData.append("multipartFile", fileObj);
      
      console.log("Uploading file...", {
        name: fileObj.name,
        size: fileObj.size,
        type: fileObj.type
      });
      
      const response = await FileUploadApi.uploadFileImage(formData);
      
      console.log("Upload response:", response);
      
      // Backend returns String (URL) directly in response body
      const url = response?.data;
      
      if (url && typeof url === 'string' && url.trim().length > 0) {
        setAvatarUrl(url);
        message.success("Upload ảnh đại diện thành công");
      } else {
        console.error("Invalid URL response:", url);
        throw new Error("Không nhận được URL từ server");
      }
    } catch (error) {
      console.error("Upload error details:", {
        message: error.message,
        response: error.response,
        data: error.response?.data
      });
      
      let errorMessage = "Không thể upload ảnh. Vui lòng thử lại.";
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 400) {
          errorMessage = data?.message || "File không hợp lệ";
        } else if (status === 401) {
          errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
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
      const isImage = file.type?.startsWith('image/');
      if (!isImage) {
        message.error('Vui lòng chọn file ảnh!');
        return Upload.LIST_IGNORE;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Kích thước file không được vượt quá 5MB!');
        return Upload.LIST_IGNORE;
      }
      return false; // Prevent auto upload
    },
    onChange: (info) => {
      console.log("Upload onChange event:", info);
      const { file } = info;
      
      // Only handle when file is selected (not removed)
      if (file.status === 'removed') {
        return;
      }
      
      // Call handleFileChange when file is selected
      if (file.originFileObj || file) {
        handleFileChange(file);
      }
    },
  };

  // **Kiểm tra và lưu thay đổi**
  // Handle save (update employee)
  const handleSave = async () => {
    if (!validateFields()) {
      message.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    const phoneNumberPattern = /^[0-9]+$/;
    if (!phoneNumberPattern.test(phoneNumber)) {
      message.error("Số điện thoại chỉ được phép chứa số.");
      return;
    }

    const updatedEmployee = {
      id: id || employeeDetail?.id || employeeDetail?.employeeId || "", // Required by backend
      code,
      name,
      sex: sex !== "" ? parseInt(sex, 10) : undefined, // Convert to number
      phoneNumber,
      email,
      address,
      dateOfBirth,
      role: role !== "" ? parseInt(role, 10) : undefined, // Convert to number - need to check Role enum
      deleteFlag: deleteFlag !== "" ? parseInt(deleteFlag, 10) : undefined, // Convert to number
      avatar: avatarUrl && avatarUrl.trim() !== "" ? avatarUrl.trim() : null, // Send null if empty
    };

    console.log("=== SAVE EMPLOYEE DEBUG ===");
    console.log("avatarUrl state:", avatarUrl);
    console.log("avatarUrl type:", typeof avatarUrl);
    console.log("avatarUrl length:", avatarUrl?.length);
    console.log("Employee Updated:", JSON.stringify(updatedEmployee, null, 2));
    console.log("Avatar in updatedEmployee:", updatedEmployee.avatar);

    try {
      // API call to update the employee
      const response = await EmployeeManagementApi.update(updatedEmployee);
      console.log("Update response:", response);
      console.log("=== SAVE SUCCESS ===");
      message.success("Nhân viên được cập nhật thành công!");
      handleCancel(true); // Close the modal on success
    } catch (error) {
      if (error.response?.status === 400) {
        message.error("Email này đã tồn tại. Vui lòng sử dụng email khác.");
      } else {
        console.error("Error updating employee:", error);
        message.error("Có lỗi xảy ra khi sửa thông tin nhân viên.");
      }
    }
  };

  return (
    <Modal
      width={600}
      open={isModalOpen}
      onCancel={handleCancel}
      footer={[
        <Button type="primary" onClick={handleSave}>
          Lưu thay đổi
        </Button>,

        <Button key="close" onClick={handleCancel}>
          Close
        </Button>,
      ]}
    >
       {/* Ảnh đại diện */}
       <div className={styles.avatarContainer}>
        <Upload {...uploadProps}>
          {uploadingAvatar ? (
            <div className={styles.uploadLoading}>
              <Spin />
            </div>
          ) : avatarUrl ? (
            <img
              src={avatarUrl}
              alt="avatar"
              className={styles.avatarImage}
            />
          ) : (
            <div className={styles.uploadPlaceholder}>
              <CameraOutlined className={styles.uploadIcon} />
              <div className={styles.uploadText}>Upload ảnh</div>
            </div>
          )}
        </Upload>
      </div>

      {/* Họ và tên */}
      <Row gutter={[16, 24]}>
        <Col style={{
          marginBottom: "10px",
          marginTop: '10px'
        }} span={24}>
          <label>Họ và tên:</label>
          <Input
            className={styles.selectContainer}
            placeholder="Nhập họ và tên"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Col>
      </Row>

      {/* Thông tin chi tiết */}
      <Row gutter={[16, 24]}>
        {/* Cột bên trái */}
        <Col span={12}>
          <div style={{
          marginBottom: "5px",
          marginTop: '5px'
        }}>
            <label>Giới tính:</label>
            <Select
              placeholder="Chọn giới tính"
              className={styles.selectContainer}
              value={sex !== "" ? String(sex) : undefined}
              onChange={(value) => setSex(value)}
            >
              <Select.Option value="1">Nam</Select.Option>
              <Select.Option value="0">Nữ</Select.Option>
            </Select>
          </div>
          <div style={{
          marginBottom: "5px",
          marginTop: '5px'
        }}>
            <label>Số điện thoại:</label>
            <Input
              className={styles.selectContainer}
              placeholder="Nhập số điện thoại"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          <div style={{
          marginBottom: "5px",
          marginTop: '5px'
        }}>
            <label>Email:</label>
            <Input
              className={styles.selectContainer}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </Col>

        {/* Cột bên phải */}
        <Col  span={12}>
          <div style={{
          marginBottom: "5px",
          marginTop: '5px'
        }}>
            <label>Ngày sinh:</label>
            <DatePicker
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
              value={dateOfBirth ? dayjs(dateOfBirth, "YYYY-MM-DD") : null}
              onChange={handleDateChange}
            />
          </div>
          <div style={{
          marginBottom: "5px",
          marginTop: '5px'
        }}>
            <label>Chức vụ:</label>
            <Select
              placeholder="Chọn chức vụ"
              className={styles.selectContainer}
              value={role !== "" ? String(role) : undefined}
              onChange={(value) => setRole(value)}
            >
              <Select.Option value="0">Quản lý</Select.Option>
              <Select.Option value="1">Nhân viên</Select.Option>
            </Select>
          </div>
          <div style={{
          marginBottom: "5px",
          marginTop: '5px'
        }}>
            <label>Trạng thái:</label>
            <Select
              placeholder="Chọn trạng thái"
              className={styles.selectContainer}
              value={deleteFlag !== "" ? String(deleteFlag) : undefined}
              onChange={(value) => setDeleteFlag(value)}
            >
              <Select.Option value="0">Hoạt động</Select.Option>
              <Select.Option value="1">Ngừng hoạt động</Select.Option>
            </Select>
          </div>
        </Col>
      </Row>

      {/* Địa chỉ */}
      <Row gutter={[16, 24]}>
        <Col style={{
          marginBottom: "5px",
          marginTop: '10px'
        }} span={24}>
          <label>Địa chỉ:</label>
          <Input
            className={styles.selectContainer}
            placeholder="Nhập địa chỉ"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </Col>
      </Row>
    </Modal>
  );
};

export default ModalEmployeeDetail;
