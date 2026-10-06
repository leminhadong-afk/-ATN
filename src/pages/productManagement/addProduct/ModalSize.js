import { PlusOutlined } from "@ant-design/icons";
import { Button, Modal, Input, message } from "antd";
import React, { useEffect, useState } from "react";
import { SizeManagementApi } from "../../../api/admin/sizeManagement/SizeManagementApi";

const ModalSize = ({ isModalOpen, handleCancel, setListSizeSelected, typeProductId }) => {
  const [listSize, setListSize] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newSizeName, setNewSizeName] = useState("");

  const getSize = () => {
    SizeManagementApi.getSize(typeProductId).then((res) => {
      // Sort the data by name in ascending order
      const sortedData = res.data
        .map((element) => ({ ...element, active: false })) // Add active property
        .sort((a, b) => a.name.localeCompare(b.name)); // Sort by name

      console.log(sortedData);

      setListSize(sortedData); // Save sorted data in listSize
    });
  };


  useEffect(() => {
    if (isModalOpen) {
      getSize();
    }
  }, [isModalOpen]);

  const addSizeSelected = (item) => {
    setListSizeSelected((prevList) => {
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

  const handleCreateSize = async () => {
    if (!newSizeName?.trim()) {
      message.warning("Vui lòng nhập tên size");
      return;
    }
    try {
      await SizeManagementApi.create({ name: newSizeName.trim(), typeProductId });
      message.success("Tạo size thành công");
      setNewSizeName("");
      setIsCreateOpen(false);
      getSize();
    } catch (e) {
      message.error("Tạo size thất bại");
    }
  };

  return (
    <div>
      <Modal
        title="Chọn size:"
        open={isModalOpen}
        onOk={handleCancel} // Đóng modal khi nhấn OK
        onCancel={handleCancel} // Đóng modal khi nhấn Cancel
      >
        {listSize &&
          listSize.map((size) => {
            return (
              <Button
                onClick={() => {
                  addSizeSelected(size);
                }}
                style={{
                  marginRight: 5,
                  backgroundColor: size.active ? "#3182ce" : "",
                  color: size.active ? "white" : "black",
                }}
                key={size.id}
              >
                {size.name}
              </Button>
            );
          })}

        <Button
          icon={<PlusOutlined />}
          style={{
            backgroundColor: "#1a365d",
            borderColor: "#1a365d",
            margin: "10px",
          }}
          type="primary"
          onClick={() => {
            if (!typeProductId) {
              message.warning("Vui lòng chọn loại trang sức trước khi thêm size.");
              return;
            }
            setIsCreateOpen(true);
          }}
        />
        <Modal
          title="Tạo size mới"
          open={isCreateOpen}
          onOk={handleCreateSize}
          onCancel={() => setIsCreateOpen(false)}
          okText="Tạo"
          cancelText="Hủy"
        >
          <Input
            placeholder="Nhập tên size"
            value={newSizeName}
            onChange={(e) => setNewSizeName(e.target.value)}
          />
        </Modal>
      </Modal>
    </div>
  );
};

export default ModalSize;
