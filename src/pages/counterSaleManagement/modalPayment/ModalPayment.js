import React, { useEffect, useState } from "react";
import styles from "./ModalPayment.module.css";
import {
  Button,
  Input,
  message,
  Modal,
  Popconfirm,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
} from "antd";
import { TransactionManagementApi } from "../../../api/admin/transactionManagement/TransactionManagementApi";
import { DeleteOutlined } from "@ant-design/icons";

const ModalPayment = ({
  isModalOpenPayment,
  handleCancelPayment,
  calculateTotalPrice,
  billId,
}) => {
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [cashMethod, setCashMethod] = useState();
  const [transferMethod, setTransferMethod] = useState();
  const [selectedMethod, setSelectedMethod] = useState("");
  const [transactionCode, setTransactionCode] = useState("");
  const [type, setType] = useState();

  const [isTransferEnabled, setIsTransferEnabled] = useState(false); // Trạng thái của Switch
  const [requiredTransferAmount, setRequiredTransferAmount] = useState(0); // Số tiền cần chuyển khoản
  const [loading, setLoading] = useState(false); // State để quản lý trạng thái loading
  const [transactionDetail, setTransactionDetail] = useState([]); // State để lưu chi tiết giao dịch
  const [isPaymentCompleted, setIsPaymentCompleted] = useState(false); // State để track xem đã thanh toán thành công chưa

  // Cập nhật số tiền cần chuyển khoản khi bật/tắt Switch
  useEffect(() => {
    // Chỉ tính toán khi modal đang mở và có giá trị hợp lệ
    if (!isModalOpenPayment) {
      return;
    }
    
    if (isTransferEnabled) {
      const totalPrice = calculateTotalPrice();
      const cashAmount = parseFloat(cashMethod) || 0;
      
      // Chỉ hiển thị lỗi nếu cashAmount > 0 và transferAmount < 0
      // Không hiển thị lỗi khi cashAmount = 0 (chưa nhập)
      if (cashAmount > 0) {
        const transferAmount = totalPrice - cashAmount;
        if (transferAmount < 0) {
          message.error("Số tiền mặt vượt quá tổng tiền!");
          setRequiredTransferAmount(0);
          setIsTransferEnabled(false);
          return;
        } else {
          setRequiredTransferAmount(transferAmount);
        }
      } else {
        // Nếu chưa nhập tiền mặt, set requiredTransferAmount = totalPrice
        setRequiredTransferAmount(totalPrice);
      }
    } else {
      setRequiredTransferAmount(0);
    }
  }, [isTransferEnabled, cashMethod, calculateTotalPrice, isModalOpenPayment]);

  const handleOk = async () => {
    // Kiểm tra và lấy các giá trị
    const total = parseFloat(calculateTotalPrice()); // Tổng tiền hóa đơn
    const cashAmount = parseFloat(cashMethod); // Tiền mặt khách đã nhập

    console.log("total: " + total);
    console.log("cashAmount: " + cashAmount);

    // Tính toán tiền chuyển khoản nếu bật switch (Chuyển khoản)
    const transferAmount = isTransferEnabled ? total - cashAmount : 0;
    console.log("transferAmount:");

    console.log(transferAmount);
    // Nếu switch bật thì tính chuyển khoản, nếu không thì là 0

    // Kiểm tra nếu số tiền mặt hoặc chuyển khoản là không hợp lệ (NaN)
    if (isNaN(cashAmount) || isNaN(transferAmount)) {
      message.error("Vui lòng nhập đầy đủ thông tin thanh toán.");
      return;
    }

    // Kiểm tra nếu số tiền mặt lớn hơn tổng hóa đơn (chỉ khi không dùng chuyển khoản)
    // Nếu dùng cả tiền mặt và chuyển khoản, cashAmount có thể nhỏ hơn total
    if (!isTransferEnabled && cashAmount > total) {
      message.error("Số tiền mặt không thể lớn hơn tổng hóa đơn.");
      return;
    }

    // Kiểm tra nếu số tiền mặt lớn hơn tổng hóa đơn khi dùng kết hợp
    if (isTransferEnabled && cashAmount > total) {
      message.error("Số tiền mặt không thể lớn hơn tổng hóa đơn.");
      return;
    }

    // Kiểm tra nếu tổng tiền thanh toán (tiền mặt + chuyển khoản) không đủ
    if (cashAmount + transferAmount < total) {
      message.error(
        "Tổng số tiền thanh toán (tiền mặt + chuyển khoản) không đủ."
      );
      return;
    }
    
    // Kiểm tra nếu tổng tiền thanh toán vượt quá tổng hóa đơn
    if (cashAmount + transferAmount > total) {
      message.error(
        "Tổng số tiền thanh toán không được vượt quá tổng hóa đơn."
      );
      return;
    }

    // Tạo dữ liệu gửi tới API theo định dạng yêu cầu
    let requestData = {
      billId, // ID của hóa đơn
      payments: [], // Mảng chứa các phương thức thanh toán
    };

    // Nếu có phương thức thanh toán "Tiền mặt"
    if (cashAmount > 0) {
      requestData.payments.push({
        money: cashAmount, // Số tiền mặt khách đã nhập
        type: 0, // Tiền mặt
      });
    }

    // Nếu có phương thức thanh toán "Chuyển khoản" (chỉ khi switch bật)
    if (transferAmount > 0) {
      requestData.payments.push({
        money: transferAmount, // Số tiền chuyển khoản tự động tính
        type: 1, // Chuyển khoản
      });
    }

    // Log dữ liệu gửi đi
    console.log("Dữ liệu gửi API:", requestData);

    // Gọi API để thực hiện thanh toán
    try {
      setLoading(true);
      const response = await TransactionManagementApi.create(requestData); // API lấy toàn bộ khách hàng
      console.log("API response:", response);
      setTransactionDetail(response.data.content);
      message.success("Thanh toán thành công!");
      
      // Đánh dấu đã thanh toán thành công để disable nút xác nhận
      setIsPaymentCompleted(true);
      
      // Reset form sau khi thanh toán thành công để tránh validation error
      setCashMethod("");
      setTransferMethod("");
      setIsTransferEnabled(false);
      setRequiredTransferAmount(0);
      setTransactionCode("");
    } catch (error) {
      console.error("Error during payment:", error);
      message.error("Lỗi khi thanh toán.");
    } finally {
      setLoading(false);
      getTransactionDetail();
    }
  };

  const handleMethodSelection = (method) => {
    setSelectedMethod(method); // Cập nhật phương thức thanh toán
    if (method === "Tiền mặt") {
      setType(0); // Nếu chọn Tiền mặt, setType = 0
    } else if (method === "Chuyển khoản") {
      setType(1); // Nếu chọn Chuyển khoản, setType = 1
    }

    if (method !== "Chuyển khoản") {
      setTransactionCode(""); // Xóa mã giao dịch nếu chọn phương thức khác
    }

    getTransactionDetail();
  };

  const getTransactionDetail = async () => {
    try {
      const response = await TransactionManagementApi.getTransaction(billId); // API lấy chi tiết giao dịch
      console.log("API response:", response);
      setTransactionDetail(response.data);
      
      // Kiểm tra xem hóa đơn đã được thanh toán đủ chưa
      if (response.data && Array.isArray(response.data)) {
        const totalPaid = response.data.reduce((sum, transaction) => {
          // Chỉ tính các giao dịch đã thanh toán (status = 1)
          return sum + (transaction.status === 1 ? parseFloat(transaction.money) || 0 : 0);
        }, 0);
        
        const totalPrice = parseFloat(calculateTotalPrice());
        
        // Nếu đã thanh toán đủ hoặc vượt quá tổng tiền, disable nút
        if (totalPaid >= totalPrice && totalPrice > 0) {
          setIsPaymentCompleted(true);
        }
      }
    } catch (error) {
      console.error("Error during get transaction detail:", error);
      message.error("Lỗi khi lấy chi tiết giao dịch.");
    }
  };

  useEffect(() => {
    if (isModalOpenPayment && billId) {
      // Reset trạng thái thanh toán khi mở modal mới (sẽ được cập nhật lại sau khi getTransactionDetail)
      setIsPaymentCompleted(false);
      getTransactionDetail();
    }
  }, [billId, isModalOpenPayment]);
  
  // Reset form khi modal đóng
  useEffect(() => {
    if (!isModalOpenPayment) {
      setIsPaymentCompleted(false);
      setCashMethod("");
      setTransferMethod("");
      setIsTransferEnabled(false);
      setRequiredTransferAmount(0);
      setTransactionCode("");
    }
  }, [isModalOpenPayment]);

  // thông tin cột đã thanh toántoán
  const columns = [
    // {
    //   title: "ID",
    //   dataIndex: "id",
    //   key: "id",
    // },
    {
      title: "Phương thức",
      dataIndex: "typeTransaction",
      key: "typeTransaction",
      render: (typeTransaction) => {
        return typeTransaction === 1 ? (
          <Tag color="green">Chuyển khoản</Tag>
        ) : (
          <Tag color="red">Tiền mặt</Tag>
        );
      },
    },
    {
      title: "Số tiền",
      key: "money",
      dataIndex: "money",
    },
    {
      title: "Trạng thái",
      key: "status",
      dataIndex: "status",
      render: (status) => {
        return status === 1 ? (
          <Tag color="green">Đã thanh toán</Tag>
        ) : (
          <Tag color="red">Chưa thanh toán</Tag>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Space size="middle">
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa giao dịch này?"
              okText="Đồng ý"
              cancelText="Hủy"
              onConfirm={() => handleDelete(record.id)} // Gọi hàm khi xác nhận xóa
            >
              <DeleteOutlined style={{ color: "red", cursor: "pointer" }} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleDelete = async (id) => {
    try {
      // Gọi API xóa
      await TransactionManagementApi.deleteTransaction(id);
      message.success("Xóa giao dịch thành công!");
      getTransactionDetail();

      // Nếu cần, thêm logic để cập nhật danh sách sau khi xóa
      // Ví dụ: fetch lại danh sách hoặc xóa trực tiếp trong state
    } catch (error) {
      message.error("Lỗi khi xóa giao dịch!");
      console.error(error);
    }
  };

  const myAccount = {
    BANK_ID: "MBBank",  // ten ngan hnag
    ACCOUNT_NO: "686815122003", // 
  };

  const genQR = () => {
    const totalPrice = calculateTotalPrice(); // Lấy giá trị tổng tiền
    const description = "Thanh toan SP";
    const QR = `https://img.vietqr.io/image/${myAccount.BANK_ID}-${
      myAccount.ACCOUNT_NO
    }-compact.png?amount=${totalPrice}&addInfo=${encodeURIComponent(
      description
    )}`;
    console.log(QR);

    return QR;
  };

  const genQRTransaction = () => {
    const description = "Thanh toan SP";
    const QR = `https://img.vietqr.io/image/${myAccount.BANK_ID}-${
      myAccount.ACCOUNT_NO
    }-compact.png?amount=${requiredTransferAmount}&addInfo=${encodeURIComponent(
      description
    )}`;
    return QR;
  };

  // Hàm xử lý thay đổi giá trị trong input
  const handleCashMethodChange = (e) => {
    const value = e.target.value;

    // Check if the entered value is a valid number
    if (isNaN(value) && value !== "") {
      message.error("Vui lòng nhập số tiền (bằng số)"); // Show error message if not a number
    } else {
      setCashMethod(value); // Update the state with valid input
      console.log(value); // Log the input for debugging
    }
  };

  return (
    <Modal
      title="Thanh toán"
      open={isModalOpenPayment}
      footer={[
        <Button key="cancel" onClick={handleCancelPayment}>
          Hủy
        </Button>,
        <Popconfirm
          title="Xác nhận số tiền khách thanh toán?"
          onConfirm={handleOk}
          okText="Vâng"
          cancelText="Hủy"
          disabled={isPaymentCompleted}
        >
          <Button 
            key="ok" 
            type="primary" 
            loading={confirmLoading}
            disabled={isPaymentCompleted}
          >
            {isPaymentCompleted ? "Đã thanh toán" : "Xác nhận"}
          </Button>
        </Popconfirm>,
      ]}
      onCancel={handleCancelPayment}
      width={600}
      centered={true}
    >
      <div className={styles.TotalAmount}>
        <h2>Tổng tiền hàng</h2>
        <div className={styles.TotalAmountDue}>
          {calculateTotalPrice().toLocaleString()} VND
        </div>
      </div>

      <div>
        <strong>Tiền khách đưa : </strong>
        <Input
          style={{
            marginTop: "10px",
            marginBottom: "10px",
          }}
          placeholder="Nhập số tiền khách thanh toán"
          value={cashMethod} // Liên kết giá trị input với state
          onChange={handleCashMethodChange} // Cập nhật giá trị của cashMethod khi input thay đổi
        />

        {/* Thêm Switch để bật/tắt phương thức "Chuyển khoản" khi thanh toán bằng tiền mặt */}
        <div className={styles.TransferSwitch}>
          Thanh toán cả tiền mặt và chuyển khoản?
          <Switch
            style={{
              marginLeft: "20px",
            }}
            checked={isTransferEnabled}
            onChange={(checked) => setIsTransferEnabled(checked)}
          />
        </div>

        {/* Nếu bật Switch thì hiển thị ô nhập thông tin chuyển khoản */}
        {isTransferEnabled && (
          <div>
            <strong>
              Số tiền chuyển khoản: {requiredTransferAmount.toLocaleString()}{" "}
              VND{" "}
            </strong>
            {/* Hiển thị mã QR với giá tiền */}
            <img
              src={genQRTransaction()} // Sử dụng URL trả về từ hàm genQR
              alt="QR Code"
              style={{
                width: 150,
                height: 150,
                marginBottom: 10,
                marginTop: 10,
              }}
            />
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: "10px",
        }}
      >
        <Table columns={columns} dataSource={transactionDetail} rowKey="id" />
      </div>
    </Modal>
  );
};

export default ModalPayment;
