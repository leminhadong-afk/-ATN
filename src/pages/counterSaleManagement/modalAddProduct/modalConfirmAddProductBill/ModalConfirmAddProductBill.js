import React, { useEffect, useState } from "react";
import styles from "./ModalConfirmAddProductBill.module.css";
import { Input, message, Modal } from "antd";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { BillDetailsManagementApi } from "../../../../api/admin/billDetailsManagement/BillDetailsManagementApi";

const ModalConfirmAddProductBill = ({
  isModalOpendExtra,
  handleCancelExtra,
  selectedProduct,
  billIdSelectedDetail,
  getBillDetails,
  fetchData,
}) => {
  const [quantity, setQuantity] = useState(1);

  // Hàm xử lý giảm số lượng
  const decreaseQuantity = () => {
    setQuantity((prevQuantity) => Math.max(1, prevQuantity - 1)); // Đảm bảo quantity >= 1
  };

  // Hàm xử lý tăng số lượng
  const increaseQuantity = () => {
    if (quantity + 1 > selectedProduct.quantity) {
      // Kiểm tra nếu số lượng vượt quá kho
      message.warning("Số lượng sản phẩm trong kho không đủ!"); // Hiển thị thông báo
    } else {
      setQuantity((prevQuantity) => prevQuantity + 1); // Tăng số lượng nếu hợp lệ
    }
  };

  // Reset quantity về 1 khi modal đóng
  useEffect(() => {
    if (!isModalOpendExtra) {
      setQuantity(1); // Reset quantity
    }
  }, [isModalOpendExtra]);

  useEffect(() => {
    console.log(selectedProduct);
  }, [selectedProduct]);

  const validateQuantity = (quantity, availableQuantity) => {
    if (isNaN(quantity) || quantity < 1) {
      message.error("Số lượng không hợp lệ. Vui lòng nhập số lượng lớn hơn 0.");
      return false;
    }
    if (quantity > availableQuantity) {
      Modal.error({
        title: "Số lượng không hợp lệ",
        content: `Số lượng trong kho không đủ. Chỉ còn ${availableQuantity} sản phẩm.`,
        centered: true,
      });
      return false;
    }
    return true;
  };

  const handleOk = (product) => {
    const inputQuantity = Number(quantity);

    // Kiểm tra số lượng nhập
    if (!validateQuantity(inputQuantity, selectedProduct.quantity)) {
      return;
    }

    // Xác nhận người dùng có chắc chắn muốn thêm sản phẩm không
    Modal.confirm({
      title: "Xác nhận thêm sản phẩm",
      content: (
        <>
          Bạn có chắc chắn muốn thêm sản phẩm "
          <strong>{selectedProduct.productName}</strong>" vào hóa đơn với số lượng{" "}
          <strong>{inputQuantity}</strong>?
        </>
      ),
      centered: true,
      onOk: async () => {
        const params = {
          productDetailId: selectedProduct.productDetailId,
          quantity: inputQuantity,
          price: selectedProduct.price,
          billId: billIdSelectedDetail,
        };

        console.log(params);

        try {
          // Gọi API để tạo BillDetail
          const createBillDetail = await BillDetailsManagementApi.create(params);

          if (createBillDetail) {
            message.success("Thêm sản phẩm vào hóa đơn thành công!");
          }
        } catch (error) {
          message.error("Thêm sản phẩm vào hóa đơn thất bại!");
        }
        getBillDetails();
        fetchData();
        handleCancelExtra(); // Đóng modal
      },
      onCancel() {
        console.log("Người dùng đã hủy việc thêm sản phẩm");
      },
    });
  };


  return (
    <Modal
      title={
        `Sản phẩm ` +
        selectedProduct.productName +
        ` " ` +
        selectedProduct.colorName +
        ` "`
      }
      open={isModalOpendExtra}
      onOk={handleOk}
      onCancel={handleCancelExtra}
      width={800}
      centered={true}
    >
      <div className={styles.Container}>
        {selectedProduct ? (
          <div className={styles.ContainerItems}>
            {/* Image Column */}
            <div className={styles.BillDetailImg}>
              <img
                src={selectedProduct.urlImg}
                alt={selectedProduct.productName || "Bill Detail"}
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "cover",
                  borderRadius: "10px",
                }}
              />
            </div>
            {/* Details Column */}
            <div className={styles.BillDetailItems}>
              <p>
                <strong>Tên SP:</strong> {selectedProduct.productName || "N/A"}
              </p>
              <p>
                <strong>Giá:</strong>{" "}
                {selectedProduct.price
                  ? selectedProduct.price.toLocaleString()
                  : "N/A"}{" "}
                VND
              </p>
              <p>
                <strong>Size:</strong> {selectedProduct.sizeName || "N/A"}
              </p>
              <p>
                <strong>Màu sắc:</strong> {selectedProduct.colorName || "N/A"}
              </p>
              <p>
                <strong>Sản phẩm trong kho:</strong> {selectedProduct.quantity}
              </p>
            </div>
            {/* Quantity Column */}
            <div className={styles.BillDetailQuantity}>
              <div
                style={{
                  borderRadius: "40px",
                  border: " 1px solid #ccc",
                }}
              >
                <div
                  style={{
                    margin: "5px",
                  }}
                >
                  <MinusOutlined
                    style={{
                      margin: "5px",
                      fontSize: "10px",
                      marginRight: "10px",
                    }}
                    onClick={decreaseQuantity}
                  />
                  <Input
                    value={quantity}
                    onChange={(e) => {
                      const inputQuantity = e.target.value;
                      setQuantity(inputQuantity); // Cập nhật giá trị mà không ràng buộc
                    }}
                    onBlur={() => {
                      const inputQuantity = Number(quantity);
                      if (
                        inputQuantity < 1 ||
                        inputQuantity > selectedProduct.quantity
                      ) {
                        message.error(
                          `Số lượng trong kho không đủ, Xin vui lòng nhập lại.`
                        );
                        // setQuantity(1); // Reset về giá trị mặc định hợp lệ
                      }
                    }}
                    style={{
                      width: "50px",
                      textAlign: "center",
                      border: "1px solid #fff",
                      borderRadius: "4px",
                    }}
                  />

                  <PlusOutlined
                    style={{
                      margin: "5px",
                      fontSize: "10px",
                      marginLeft: "10px",
                    }}
                    onClick={increaseQuantity}
                  />
                </div>
              </div>
            </div>
            {/* Total Price Column */}
            <div className={styles.BillDetailTotal}>
              <div>
                {selectedProduct.price && selectedProduct.quantity
                  ? (selectedProduct.price * quantity).toLocaleString()
                  : "N/A"}{" "}
                VND
              </div>
            </div>
          </div>
        ) : (
          <p>Chưa chọn sản phẩm</p>
        )}
      </div>
    </Modal>
  );
};

export default ModalConfirmAddProductBill;
