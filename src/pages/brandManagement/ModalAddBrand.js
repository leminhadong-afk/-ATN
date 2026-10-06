import { Form, Input, Modal, message } from "antd";
import React, { useState } from "react";
import { BrandManagementApi } from "../../api/admin/brandManagement/BrandManagementApi"; // Adjust the import path as necessary

const ModalAddBrand = ({ isModalOpen, handleCancel, onBrandAdded }) => {
  const [form] = Form.useForm(); // Use Ant Design's Form instance
  const [name, setName] = useState("");

  const handleOk = async () => {
    try {
      // Check if brand already exists before creating
      const exists = await checkBrandExists(name);
      if (exists) {
        message.error("Tên thương hiệu đã tồn tại! Vui lòng nhập tên khác."); // Show error message if brand exists
        return; // Stop further execution if brand exists
      }

      await createBrand();
      message.success("Thương hiệu đã được thêm thành công!"); // Show success message
      form.resetFields(); // Reset the form fields
      handleCancel();
      onBrandAdded();
    } catch (error) {
      message.error("Có lỗi xảy ra khi thêm thương hiệu!"); // Show error message
      console.error("Error creating brand:", error);
    }
  };

  const createBrand = async () => {
    // Create brand object
    const brandData = {
      name
    };

    console.log(brandData);

    await BrandManagementApi.create(brandData);
  };

  const checkBrandExists = async (brandName) => {
    try {
      const response = await BrandManagementApi.getBrands(); // Fetch all brands
      const exists = response.data.some(brand => brand.name.toLowerCase() === brandName.toLowerCase()); // Check if the name exists
      return exists; // Return true if brand name exists
    } catch (error) {
      console.error("Error checking brand existence:", error);
      return false; // Return false if there's an error
    }
  };

  return (
    <Modal
      title={<span style={{ color: '#1a365d', fontWeight: 700 }}>Thêm thương hiệu mới</span>}
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      okButtonProps={{ style: { background: '#1a365d', borderColor: '#1a365d', borderRadius: '8px' } }}
      cancelButtonProps={{ style: { borderRadius: '8px' } }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Tên thương hiệu"
          name="name"
          rules={[
            {
              required: true,
              message: "Nhập tên thương hiệu...",
            },
          ]}
        >
          <Input
            placeholder="Nhập tên thương hiệu ..."
            onChange={(e) => setName(e.target.value)}
            value={name}
            style={{ borderRadius: '8px' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalAddBrand;
