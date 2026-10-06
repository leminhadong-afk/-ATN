import React, { useState } from "react";
import { Modal, Form, Input, Button } from "antd";

const statusMap = {
  0: "Chờ xác nhận",
  1: "Đã hoàn thành",
  2: "Đang giao hàng",
  3: "Đã giao hàng thành công",
  4: "Đã hủy",
};

const nextStatusMap = {
  0: 2,
  2: 3,
};

const nextStatusText = {
  2: "Đang giao hàng",
  3: "Đã giao hàng thành công",
};

const ModalUpdateStatusBill = ({
  open,
  onCancel,
  onOk,
  billId,
  billCode,
  currentStatus,
  loading,
}) => {
  const [form] = Form.useForm();

  // Tính trạng thái kế tiếp
  const getNextStatus = () => nextStatusMap[currentStatus] || currentStatus;

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        onOk({
          billId,
          status: getNextStatus(),
          notes: values.notes,
        });
        form.resetFields();
      })
      .catch(() => {});
  };

  return (
    <Modal
      open={open}
      title="Cập nhật trạng thái đơn hàng"
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={handleOk}
      confirmLoading={loading}
      okText="Cập nhật"
      cancelText="Hủy"
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Mã hóa đơn">
          <Input value={billCode} disabled />
        </Form.Item>
        <Form.Item label="Trạng thái hiện tại">
          <Input
            value={statusMap[currentStatus] || "Không xác định"}
            disabled
          />
        </Form.Item>
        <Form.Item
          label="Ghi chú"
          name="notes"
          rules={[{ required: true, message: "Vui lòng nhập ghi chú" }]}
        >
          <Input.TextArea
            rows={3}
            placeholder="Nhập ghi chú cập nhật trạng thái..."
          />
        </Form.Item>
      </Form>
      <div style={{ marginTop: 8, color: "#888" }}>
        Trạng thái tiếp theo sẽ là:{" "}
        <b>
          {nextStatusText[getNextStatus()]
            ? nextStatusText[getNextStatus()]
            : "Không thay đổi"}
        </b>
      </div>
    </Modal>
  );
};

export default ModalUpdateStatusBill;
