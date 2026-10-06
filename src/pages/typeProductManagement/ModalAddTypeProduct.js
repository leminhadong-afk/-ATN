import { Form, Input, Modal, message } from "antd";
import React, { useState } from "react";
import { TypeProductManagementApi } from "../../api/admin/typeProduct/TypeProductManagementApi"

const ModalAddTypeProduct = ({ isModalOpen, handleCancel, onTypeProductAdded }) => {
  const [form] = Form.useForm();
  const [name, setName] = useState("");

  const handleOk = async () => {
    try {
      const exists = await checkTypeOfJewelryExists(name);
      if (exists) {
        message.error("Tên loại trang sức đã tồn tại! Vui lòng nhập tên khác.");
        return;
      }

      await createTypeOfJewelry();
      message.success("Loại trang sức đã được thêm thành công!");
      form.resetFields();
      setName("");
      handleCancel();
      onTypeProductAdded();
    } catch (error) {
      message.error("Có lỗi xảy ra khi thêm loại trang sức!");
      console.error("Error creating jewelry type:", error);
    }
  };

  const createTypeOfJewelry = async () => {
    const typeOfJewelryData = { name };
    await TypeProductManagementApi.create(typeOfJewelryData);
  };

  const checkTypeOfJewelryExists = async (jewelryName) => {
    try {
      const response = await TypeProductManagementApi.getTypeOfJewelry();
      return response.data.some(type => type.name.toLowerCase() === jewelryName.toLowerCase());
    } catch (error) {
      console.error("Error checking jewelry type existence:", error);
      return false;
    }
  };

  return (
    <Modal
      title="Thêm loại trang sức"
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      centered
    >
      <Form form={form} layout="vertical" style={{ marginTop: '20px' }}>
        <Form.Item
          label="Tên loại trang sức"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên loại trang sức!" }]}
        >
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Nhẫn, Dây chuyền..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalAddTypeProduct;
