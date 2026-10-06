import { Form, Input, message, Modal } from "antd";
import React, { useState } from "react";
import { MaterialManagementApi } from "../../api/admin/materialManagement/MaterialManagementApi";

const ModalAddMaterial = ({ isModalOpen, handleCancel, onMaterialAdded }) => {
  const [form] = Form.useForm();
  const [name, setName] = useState("");

  const createMaterial = async () => {
    const materialData = {
      name,
    };

    await MaterialManagementApi.create(materialData);
  };

  const checkMaterialExists = async (materialName) => {
    try {
      const response = await MaterialManagementApi.getMaterial();
      const exists = response.data.some(material => material.name.toLowerCase() === materialName.toLowerCase());
      return exists;
    } catch (error) {
      console.error("Error checking material existence:", error);
      return false;
    }
  };

  const handleOk = async () => {
    try {
      const exists = await checkMaterialExists(name);
      if (exists) {
        message.error("Loại chất liệu này đã tồn tại! Vui lòng nhập tên khác.");
        return;
      }

      await createMaterial();
      message.success("Chất liệu đã được thêm thành công!");
      form.resetFields();
      handleCancel();
      onMaterialAdded();
    } catch (error) {
      message.error("Có lỗi xảy ra khi thêm chất liệu!");
      console.error("Error creating material:", error);
    }
  };

  return (
    <Modal
      title={<span style={{ color: '#1a365d', fontWeight: 700 }}>Thêm chất liệu mới</span>}
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      okButtonProps={{ style: { background: '#1a365d', borderColor: '#1a365d', borderRadius: '8px' } }}
      cancelButtonProps={{ style: { borderRadius: '8px' } }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Tên chất liệu"
          name="name"
          rules={[{ required: true, message: "Nhập tên chất liệu..." }]}
        >
          <Input
            placeholder="Nhập tên chất liệu ..."
            onChange={(e) => setName(e.target.value)}
            value={name}
            style={{ borderRadius: '8px' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalAddMaterial;
