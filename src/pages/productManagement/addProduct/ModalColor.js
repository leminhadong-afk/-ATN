import { PlusOutlined } from "@ant-design/icons";
import { Button, Modal, Input, message } from "antd";
import React, { useEffect, useState } from "react";
import { ColorManagementApi } from "../../../api/admin/colorManagemnet/ColorManagementApi";

const ModalColor = ({
  setListColorSelected,
  isModalOpen,
  handleCancel,
}) => {
  const [listColor, setListColor] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newColorName, setNewColorName] = useState("");

  const getColor = () => {
    ColorManagementApi.getColor().then((res) => {
      res.data.forEach((element) => {
        element.active = false;
      });
      setListColor(res.data);
    });
  };

  useEffect(() => {
    if (isModalOpen) {
      getColor();
    }
  }, [isModalOpen]);

  const addColorSelected = (item) => {
    setListColorSelected((prevList) => {
      const exists = prevList.find((sel) => sel.id === item.id);

      if (exists) {
        item.active = false;
        return prevList.filter((sel) => sel.id !== item.id);
      } else {
        item.active = true;
        return [...prevList, item];
      }
    });
  };

  const [creating, setCreating] = useState(false);

  const handleCreateColor = async () => {
    const trimmed = newColorName?.trim();
    if (!trimmed) {
      message.warning("Vui lòng nhập tên màu");
      return;
    }
    setCreating(true);
    try {
      await ColorManagementApi.create({ name: trimmed });
      message.success("Tạo màu thành công");
      setNewColorName("");
      setIsCreateOpen(false);
      getColor();
    } catch (e) {
      const errorMsg = e.response?.data?.message || e.message || "Tạo màu thất bại";
      message.error(errorMsg);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal
      title="Chọn màu:"
      open={isModalOpen}
      onOk={handleCancel}
      onCancel={handleCancel}
    >
      {listColor &&
        listColor.map((color) => {
          return (
            <Button
              onClick={() => {
                addColorSelected(color);
              }}
              style={{
                marginRight: 5,
                backgroundColor: color.active ? "#3182ce" : "",
                color: color.active ? "white" : "black",
              }}
              key={color.id}
            >
              {color.name}
            </Button>
          );
        })}

      <Button
        icon={<PlusOutlined />}
        style={{
          backgroundColor: "#1a365d",
          borderColor: "#1a365d",
          margin: "5px",
        }}
        type="primary"
        onClick={() => setIsCreateOpen(true)}
      />
      <Modal
        title="Tạo màu mới"
        open={isCreateOpen}
        onOk={handleCreateColor}
        onCancel={() => setIsCreateOpen(false)}
        okText="Tạo"
        cancelText="Hủy"
        confirmLoading={creating}
      >
        <Input
          placeholder="Nhập tên màu"
          value={newColorName}
          onChange={(e) => setNewColorName(e.target.value)}
          onPressEnter={handleCreateColor}
        />
      </Modal>
    </Modal>
  );
};

export default ModalColor;
