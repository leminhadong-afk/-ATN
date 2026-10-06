import React from "react";
import styles from "./ModalProductDetail.module.css";
import { Modal, Button, Input, Select } from "antd";

function ModalProductDetail({
  isModalOpen,
  handleCancel,
  onModalProductDetail,
}) {
  return (
    <Modal
      title="Product Details"
      width={1000}
      visible={isModalOpen}
      onCancel={handleCancel}
      footer={[
        <Button type="primary">Lưu thay đổi</Button>,

        <Button key="close" onClick={handleCancel}>
          Close
        </Button>,
      ]}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div className={styles.imgContainer}>Img</div>
      </div>
      <div className={styles.modalDetailContainer}>
        <div className={styles.selectContainerLeft}>
          <div>
            <label>Thương hiệu: </label>
            <Select className={styles.selectContainer} disabled></Select>
          </div>
          <div>
            <label>Loại sản phẩm: </label>
            <Select className={styles.selectContainer} disabled></Select>
          </div>
          <div>
            <label>Kích thước: </label>
            <Select className={styles.selectContainer} disabled></Select>
          </div>
          <div>
            <label>Trạng thái: </label>
            <Select className={styles.selectContainer}></Select>
          </div>
        </div>

        <div className={styles.selectContainerRight}>
          <div>
            <label>Chất liệu: </label>
            <Select className={styles.selectContainer} disabled></Select>
          </div>
          <div>
            <label>Màu sắc: </label>
            <Select className={styles.selectContainer} disabled></Select>
          </div>
          <div>
            <label>Số lượng: </label>
            <Select className={styles.selectContainer}></Select>
          </div>
          <div>
            <label>Giá: </label>
            <Input
              style={{
                width: "100%",
              }}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default ModalProductDetail;
