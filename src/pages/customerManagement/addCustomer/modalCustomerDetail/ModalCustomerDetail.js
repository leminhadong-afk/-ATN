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
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import styles from "./ModalCustomerDetail.module.css";
import { useNavigate } from "react-router";
import { CustomerManagementApi } from "../../../../api/admin/customerManagement/CustomerManagementApi";
import dayjs from "dayjs";

const ModalCustomerDetail = ({ isModalOpen, handleCancel, customerDetail }) => {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [sex, setSex] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [deleteFlag, setDeleteFlag] = useState("");
  const [errors, setErrors] = useState({});
  const [avatarUrl, setAvatarUrl] = useState("");

  const navigate = useNavigate();

  const validateFields = () => {
    const newErrors = {};
    if (!name) newErrors.name = "Họ và tên không được để trống.";
    if (!phoneNumber)
      newErrors.phoneNumber = "Số điện thoại không được để trống.";
    if (!email) newErrors.email = "Email không được để trống.";
    if (!address) newErrors.address = "Địa chỉ không được để trống.";
    if (!dateOfBirth) newErrors.dateOfBirth = "Ngày sinh không được để trống.";
    if (!deleteFlag) newErrors.deleteFlag = "Password không được để trống.";

    setErrors(newErrors); // Cập nhật trạng thái lỗi
    return Object.keys(newErrors).length === 0; // Trả về true nếu không có lỗi
  };
  // Khi nhận dữ liệu customerDetail, cập nhật trạng thái
  useEffect(() => {
    if (customerDetail) {
      setId(customerDetail.id);
      setCode(customerDetail.customerCode);
      setName(customerDetail.name);
      setSex(customerDetail.sex + "");
      setPhoneNumber(customerDetail.phoneNumber);
      setEmail(customerDetail.email);
      setAddress(customerDetail.address);
      setDateOfBirth(customerDetail.dateOfBirth);
      setDeleteFlag(customerDetail.deleteFlag + "");
      // Set avatar URL - check both avatar and avatarUrl fields
      const avatar = customerDetail.avatar || customerDetail.avatarUrl || "";
      setAvatarUrl(avatar);
    } else {
      // Reset all fields when customerDetail is null
      setAvatarUrl("");
    }
  }, [customerDetail, isModalOpen]);

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

    const updatedCustomer = {
      id: id,
      code: code,
      name,
      sex,
      phoneNumber,
      email,
      address,
      dateOfBirth,
      deleteFlag,
    };

    console.log("Customer Updated:", updatedCustomer);

    try {
      // API call to update the employee
      await CustomerManagementApi.update(updatedCustomer);
      message.success("Khách hàng được cập nhật thành công!");
      handleCancel(true); // Close the modal on success
    } catch (error) {
      if (error.response?.status === 400) {
        message.error("Email này đã tồn tại. Vui lòng sử dụng email khác.");
      } else {
        console.error("Error updating employee:", error);
        message.error("Có lỗi xảy ra khi sửa thông tin khách hàng.");
      }
    }
  };

  return (
    <div>
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
        {/* Ảnh đại diện - chỉ hiển thị, không upload */}
        <div className={styles.avatarContainer}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="avatar"
              className={styles.avatarImage}
            />
          ) : (
            <Avatar
              size={120}
              icon={<UserOutlined />}
              className={styles.avatar}
            />
          )}
        </div>

        <div className={styles.modalDetailContainer}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <div>
                <label>Họ và tên:</label>
                <Input
                  className={styles.selectContainer}
                  placeholder="Nhập họ và tên"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </Col>
            <Col span={12}>
              <div>
                <label>Email:</label>
                <Input
                  className={styles.selectContainer}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </Col>

            <Col span={12}>
              <div>
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
            </Col>
            <Col span={12}>
              <div>
                <label>Ngày sinh:</label>
                <DatePicker
                  style={{ width: "100%" }}
                  format="YYYY-MM-DD"
                  value={dateOfBirth ? dayjs(dateOfBirth, "YYYY-MM-DD") : null}
                  onChange={handleDateChange}
                />
              </div>
            </Col>

            <Col span={12}>
              <div>
                <label>Số điện thoại:</label>
                <Input
                  className={styles.selectContainer}
                  placeholder="Nhập số điện thoại"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </Col>
            <Col span={12}>
              <div>
                <label>Trạng thái:</label>
                <Select
                  placeholder="Trạng thái"
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
        </div>

        <div style={{
            marginTop:'10px',
            marginBottom: '10px'
          }}>
          <label
            
          >
            Địa chỉ:
          </label>
          <Input.TextArea
          rows={4}
            style={{
              marginBottom: "10px",
            }}
            placeholder="Nhập địa chỉ"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default ModalCustomerDetail;
