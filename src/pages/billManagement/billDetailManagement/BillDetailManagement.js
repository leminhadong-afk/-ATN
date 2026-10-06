import React, { useEffect, useState } from "react";
import styles from "./BillDetailManagement.module.css";
import { Button, Steps, Table, Tag, message, Modal, Input } from "antd";
import { useNavigate, useParams } from "react-router";
import { BillManagementApi } from "../../../api/admin/billManagement/BillManagementApi";
import { BillHistoryManagementApi } from "../../../api/admin/billHistoryManagement/BillHistoryManagement";
import dayjs from "dayjs";
import { TransactionManagementApi } from "../../../api/admin/transactionManagement/TransactionManagementApi";
import moment from "moment/moment";
import { BillDetailsManagementApi } from "../../../api/admin/billDetailsManagement/BillDetailsManagementApi";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import ModalUpdateStatusBill from "./ModalUpdateStatusBill";

const BillDetailManagement = () => {
  const navigate = useNavigate();
  const { billId } = useParams();
  const [listBill, setListBill] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listBillHistory, setListBillHistory] = useState([]);
  const [listBillDetails, setListBillDetails] = useState([]);
  const [transaction, setTransaction] = useState([]);
  const [items, setItems] = useState([
    { title: "Tạo đơn hàng", subTitle: "Left 00:00:08", description: "" },
    { title: "Hoàn thành", subTitle: "Left 00:00:08", description: "" },
  ]);

  const [creatdDateBillHistory, setCreateDateBillHistory] = useState();
  const [discount, getDiscount] = useState(0);
  const [shippingFee, getShippingFee] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);

  const getBillHistory = async () => {
    try {
      setLoading(true);
      const response = await BillHistoryManagementApi.infoBillHistory(billId);
      setListBillHistory(response.data);
      console.log("listBillHistory after setting state:", response.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  // Lấy thông tin Bill
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await BillManagementApi.infoBill(billId);
      setListBill(response.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const getTransaction = async () => {
    try {
      setLoading(true);
      const response = await TransactionManagementApi.getTransaction(billId);
      setTransaction(response.data);
      console.log("transaction after setting state:", response.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  // lấy thông tin bill details
  const fetchBillDetails = async () => {
    try {
      setLoading(true);
      const response = await BillDetailsManagementApi.infoBillDetails(billId); // Corrected the method call
      setListBillDetails(response.data); // Update the list state
      console.log("listBillDetails after setting state:", response.data); // Debugging output
    } catch (error) {
      console.error("Failed to fetch bill details:", error); // Log the error
      // Optionally show an error message to the user
    } finally {
      setLoading(false); // Ensure loading is stopped
    }
  };

  // Khi component tải lên, lấy thông tin Bill và Bill History
  useEffect(() => {
    if (listBillHistory && listBillHistory.length > 0) {
      // Sắp xếp listBillHistory theo status từ nhỏ đến lớn
      const sortedHistory = [...listBillHistory].sort(
        (a, b) => a.status - b.status
      );

      const newItems = sortedHistory.map((history) => {
        let title = "";
        let description = "";
        let subTitle = "";

        // Xác định title và description dựa trên status
        switch (history.status) {
          case 0:
            title = "Tạo đơn hàng";
            description = "Tạo đơn hàng thành công";
            break;
          case 1:
            title = "Thanh toán đơn hàng";
            description = "Thanh toán đơn hàng thành công";
            break;
          case 2:
            title = "Đơn hàng bị hủy";
            description = "Đơn hàng bị hủy";
            break;
          default:
            title = "Trạng thái không xác định";
            description = "Không thể xác định trạng thái";
            break;
        }

        // Định dạng createdDate của chính đối tượng hiện tại
        subTitle = dayjs(history.createdDate).format("DD/MM/YYYY HH:mm:ss ");

        return {
          title,
          description,
          subTitle,
        };
      });

      // Cập nhật items với dữ liệu đã xử lý
      setItems(newItems);
    }
  }, [listBillHistory]);

  useEffect(() => {
    console.log("bill hítory");

    console.log(listBillHistory);

    console.log("bill details");

    console.log(listBillDetails);

    fetchData();
    getBillHistory();
    getTransaction();
    fetchBillDetails();
  }, []);

  const handleBack = () => {
    navigate("/bill-management"); // Quay lại trang trước đó
  };

  // Transaction
  const columns = [
    {
      title: "Số tiền",
      dataIndex: "money",
      key: "money",
      render: (money) => (
        <span>{new Intl.NumberFormat("vi-VN").format(money)} VND</span>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (createdDate) => (
        <span>{dayjs(createdDate).format("DD/MM/YYYY HH:mm:ss")}</span>
      ),
    },

    {
      title: "Phương thức thanh toán",
      dataIndex: "typeTransaction",
      key: "typeTransaction",
      render: (typeTransaction) => (
        <Tag
          color={typeTransaction === 0 ? "green" : "blue"}
          style={{
            fontSize: "13px", // Tăng kích thước chữ
            padding: "5px 10px", // Tăng kích thước padding
          }}
        >
          {typeTransaction === 0 ? "Tiền mặt" : "Chuyển khoản"}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={status === 1 ? "green" : "red"}
          style={{
            fontSize: "13px", // Tăng kích thước chữ
            padding: "5px 10px", // Tăng kích thước padding
          }}
        >
          {status === 1 ? "Thành công" : "Chờ xác nhận"}
        </Tag>
      ),
    },
    {
      title:
        listBill.type === "OFFLINE" ? "Nhân viên xác nhận" : "Nguồn xác nhận",
      dataIndex: "employeeName",
      key: "employeeName",
      render: (text, record) => {
        if (listBill.type === "ONLINE") {
          return (
            <Tag
              color="magenta"
              style={{
                fontWeight: "bold",
                fontSize: "13px",
                padding: "5px 14px",
                background: "#fff0f6",
                border: "1px solid #ffadd2",
                color: "#c41d7f",
                borderRadius: "8px",
                letterSpacing: 1,
              }}
            >
              VnPay
            </Tag>
          );
        } else {
          return record.employeeName;
        }
      },
    },
  ];

  // Calculate the total payment from the list of bill details
  const calculateTotalPrice = () => {
    return listBillDetails.reduce((total, item) => {
      if (item.price && item.quantity) {
        return total + item.price * item.quantity;
      }
      return total;
    }, 0);
  };

  // Thêm hàm sinh steps động theo type/status
  const getBillSteps = () => {
    if (!listBill?.type) return [];
    // Check if ONLINE and has status 4 in history
    if (listBill.type === "ONLINE") {
      const hasCancelled = listBillHistory.some((h) => h.status === 4);
      if (hasCancelled) {
        // Only show "Chờ xác nhận" and "Đã hủy" with description from billHistory
        const status0 = listBillHistory.find((h) => h.status === 0);
        const status4 = listBillHistory.find((h) => h.status === 4);
        return [
          {
            title: "Chờ xác nhận",
            status: 0,
            description: status0?.note ?? "",
          },
          {
            title: "Đã hủy",
            status: 4,
            description: status4?.note ?? "",
          },
        ];
      } else {
        // Show all 3 steps, description from billHistory
        const status0 = listBillHistory.find((h) => h.status === 0);
        const status2 = listBillHistory.find((h) => h.status === 2);
        const status3 = listBillHistory.find((h) => h.status === 3);
        return [
          {
            title: "Chờ xác nhận",
            status: 0,
            description: status0?.note ?? "",
          },
          {
            title: "Đang giao hàng",
            status: 2,
            description: status2?.note ?? "",
          },
          {
            title: "Đã giao hàng thành công",
            status: 3,
            description: status3?.note ?? "",
          },
        ];
      }
    }
    // OFFLINE logic unchanged
    if (listBill.type === "OFFLINE") {
      return [
        {
          title: "Chờ xác nhận",
          status: 0,
          description: "Tạo đơn hàng tại quầy",
        },
        {
          title: "Đã hoàn thành",
          status: 1,
          description: "Đơn hàng đã thanh toán tại quầy",
        },
      ];
    }
    return [];
  };

  // Dummy handleUpdateStatus, replace with your logic
  const handleUpdateStatus = async (payload) => {
    setModalLoading(true);
    try {
      await BillDetailsManagementApi.updateStatusBill(payload);
      message.success("Cập nhật trạng thái thành công!");
      setShowModal(false);
      // Refresh data
      fetchData();
      getBillHistory();
    } catch (e) {
      message.error("Cập nhật trạng thái thất bại!");
    } finally {
      setModalLoading(false);
    }
  };

  // Handle cancel bill (admin)
  const handleCancelBill = async () => {
    setCancelLoading(true);
    try {
      const res = await BillManagementApi.adminCancelBill(billId, cancelReason);
      if (res.data.success) {
        message.success(res.data.message || "Hủy đơn hàng thành công!");
        setShowCancelModal(false);
        setCancelReason("");
        fetchData();
        getBillHistory();
      } else {
        message.error(res.data.message || "Hủy đơn hàng thất bại!");
      }
    } catch (e) {
      message.error("Hủy đơn hàng thất bại!");
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          margin: "20px",
        }}
      >
        <h2>Quản lý đơn hàng</h2>
        <Button
          type="default"
          onClick={handleBack}
          style={{ marginTop: "20px" }}
        >
          Quay lại
        </Button>
      </div>

      {/* BillHistory */}
      <div className={styles.Container} style={{ position: "relative" }}>
        <div className={styles.BillHistory}>
          <h3>Lịch sử đơn hàng</h3>
          {/* Nút cập nhật trạng thái & hủy đơn hàng ở góc trên bên phải */}
          <div
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 10,
              display: "flex",
              gap: 8,
            }}
          >
            {listBill?.status !== 3 &&
              listBill?.status !== 1 &&
              listBill?.status !== 4 && (
                <Button type="primary" onClick={() => setShowModal(true)}>
                  Cập nhật trạng thái
                </Button>
              )}
            {(listBill?.status === 0 || listBill?.status === 2) && (
              <Button
                type="primary"
                danger
                onClick={() => setShowCancelModal(true)}
              >
                Hủy đơn hàng
              </Button>
            )}
            {/* Modal nhập lý do hủy đơn hàng */}
            <Modal
              title="Nhập lý do hủy đơn hàng"
              visible={showCancelModal}
              onOk={handleCancelBill}
              onCancel={() => setShowCancelModal(false)}
              confirmLoading={cancelLoading}
            >
              <Input.TextArea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Nhập lý do hủy..."
                rows={4}
              />
            </Modal>
          </div>
          <div
            style={{
              padding: "25px",
              marginLeft: "20px",
              marginRight: "20px",
            }}
          >
            {/* Steps timeline động theo type */}
            <Steps
              current={(() => {
                const steps = getBillSteps();
                // For ONLINE with cancelled, highlight up to status 4 if present
                if (listBill.type === "ONLINE") {
                  const hasCancelled = listBillHistory.some(
                    (h) => h.status === 4
                  );
                  if (hasCancelled) {
                    // If status is 4, highlight "Đã hủy"
                    const idx = steps.findIndex((s) => s.status === 4);
                    return idx === -1 ? 0 : idx;
                  }
                }
                // Otherwise, highlight up to current status
                const idx = steps.findIndex(
                  (s) => s.status === listBill?.status
                );
                return idx === -1 ? 0 : idx;
              })()}
              items={getBillSteps().map((step, idx) => ({
                title: step.title,
                description: step.description,
                status:
                  listBill?.status > step.status
                    ? "finish"
                    : listBill?.status === step.status
                    ? "process"
                    : "wait",
              }))}
            />
          </div>
        </div>
      </div>

      {/* Bill */}
      <div className={styles.Container}>
        <div className={styles.BillInf}>
          <h3>Thông tin đơn hàng</h3>

          <div className={styles.ContentContainer}>
            <div>
              <label>Mã hóa đơn : </label>
              <span>{listBill?.code}</span>
            </div>

            <div>
              <label>Tên khách hàng : </label>
              <span>{listBill?.customerName}</span>
            </div>

            <div>
              <label>Trạng thái : </label>
              <Tag
                style={{
                  fontSize: "13px", // Tăng kích thước chữ
                  padding: "5px 10px", // Tăng kích thước padding
                }}
                color={(() => {
                  switch (listBill?.status) {
                    case 0:
                      return "orange";
                    case 1:
                      return "blue";
                    case 2:
                      return "cyan";
                    case 3:
                      return "green";
                    case 4:
                      return "red";
                    default:
                      return "default";
                  }
                })()}
              >
                {(() => {
                  switch (listBill?.status) {
                    case 0:
                      return "Chờ xác nhận";
                    case 1:
                      return "Đã hoàn thành";
                    case 2:
                      return "Đang giao hàng";
                    case 3:
                      return "Đã giao hàng thành công";
                    case 4:
                      return "Đã hủy";
                    default:
                      return "Trạng thái không xác định";
                  }
                })()}
              </Tag>
            </div>
          </div>
          <div className={styles.ContentContainer}>
            <div>
              <label>Số điện thoại người nhận : </label>
              <span>{listBill?.phoneNumber ?? "--"}</span>
            </div>

            <div>
              <label>Loại: </label>
              <span>
                {listBill?.type === "OFFLINE" ? (
                  <Tag
                    color="gold"
                    style={{
                      fontSize: "13px", // Tăng kích thước chữ
                      padding: "5px 10px", // Tăng kích thước padding
                    }}
                  >
                    Tại quầy
                  </Tag>
                ) : listBill?.type === "ONLINE" ? (
                  <Tag
                    color="blue"
                    style={{
                      fontSize: "13px", // Tăng kích thước chữ
                      padding: "5px 10px", // Tăng kích thước padding
                    }}
                  >
                    Bán online
                  </Tag>
                ) : (
                  "--"
                )}
              </span>
            </div>

            <div>
              <label>Tên người nhận : </label>
              <span>{listBill?.recipient ?? "--"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction */}
      <div className={styles.Container}>
        <div className={styles.PaymentHistory}>
          <h3>Lịch sử thanh toán</h3>

          <div>
            <Table
              columns={columns}
              dataSource={transaction}
              pagination={false}
            />
          </div>
        </div>
      </div>

      {/* BillDetail */}
      <div className={styles.Container}>
        <h3>Danh sách sản phẩm</h3>
        <div className={styles.BillDetailContainer}>
          <div className={styles.BillDetail}>
            {listBillDetails && listBillDetails.length > 0 ? (
              listBillDetails.map((item) => (
                <div key={item.id} className={styles.BillDetailRow}>
                  {/* Image Column */}
                  <div className={styles.BillDetailImg}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <img
                        src={item.urlImg}
                        alt={item.productName || "Bill Detail"}
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          borderRadius: "10px",
                        }}
                      />
                    </div>
                  </div>
                  {/* Details Column */}
                  <div className={styles.BillDetailItems}>
                    <p>
                      <strong>Tên sản phẩm:</strong> {item.productName}
                    </p>
                    <p>
                      <strong>Giá:</strong>{" "}
                      {item.price ? item.price.toLocaleString() : "N/A"} VND
                    </p>
                    <p>
                      <strong>Size:</strong> {item.size || "N/A"}
                    </p>
                    <p>
                      <strong>Màu sắc:</strong> {item.color || "N/A"}
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
                          }}
                        />
                        {item.quantity || "N/A"}
                        <PlusOutlined
                          style={{
                            margin: "5px",
                            fontSize: "10px",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  {/* Total Price Column */}
                  <div className={styles.BillDetailTotal}>
                    <div>
                      {item.price && item.quantity
                        ? (item.price * item.quantity).toLocaleString()
                        : "N/A"}{" "}
                      VND
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>Không có chi tiết nào để hiển thị</p>
            )}
          </div>
        </div>
      </div>

      {/* Thanhf tieenf */}
      <div className={styles.Container}>
        <div className={styles.ToltalBillDetails}>
          <div
            style={{
              width: "280px",
            }}
          >
            {/* Total Item Price */}
            <div
              style={{
                marginTop: "5px",
                marginBottom: "5px",
              }}
            >
              <div className={styles.ToltalBillDetailsItems}>
                <span>Tổng tiền hàng:</span>{" "}
                {calculateTotalPrice().toLocaleString() ?? "--"} VND
              </div>
            </div>

            {/* Discount */}
            <div
              style={{
                marginTop: "5px",
                marginBottom: "5px",
              }}
            >
              <div className={styles.ToltalBillDetailsItems}>
                <span>Giảm giá:</span>
                {discount.toLocaleString() ?? "--"} VND
              </div>
            </div>

            <div
              style={{
                fontSize: "12px",
                margin: "10px",
                fontStyle: "italic",
              }}
            >
              Miễn phí vận chuyển với đơn hàng có tổng tiền trên 1.000.000 VND
            </div>

            {/* Shipping Fee */}
            <div
              style={{
                marginTop: "5px",
                marginRight: "5px",
              }}
            >
              <div className={styles.ToltalBillDetailsItems}>
                <span>Phí vận chuyển:</span>
                {shippingFee.toLocaleString() ?? "--"} VND
              </div>
            </div>

            {/* Final Total */}

            <div className={styles.ToltalBillDetailsItems}>
              <div
                style={{
                  fontWeight: "bold",
                  marginRight: "5px",
                  marginTop: "10px",
                }}
              >
                <strong>Tổng tiền thanh toán: </strong>
              </div>

              <div
                style={{
                  margin: "10px",
                  color: "red",
                  fontWeight: "bold",
                }}
              >
                {calculateTotalPrice().toLocaleString() ?? "--"} VND
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal cập nhật trạng thái */}
      <ModalUpdateStatusBill
        open={showModal}
        onCancel={() => setShowModal(false)}
        onOk={handleUpdateStatus}
        billId={billId}
        billCode={listBill?.code}
        currentStatus={listBill?.status}
        loading={modalLoading}
      />

      {/* Modal nhập lí do hủy đơn */}
      <Modal
        open={showCancelModal}
        title="Nhập lý do hủy đơn hàng"
        onCancel={() => setShowCancelModal(false)}
        onOk={handleCancelBill}
        confirmLoading={cancelLoading}
        okText="Xác nhận hủy"
        cancelText="Đóng"
      >
        <Input.TextArea
          rows={4}
          placeholder="Nhập lý do hủy đơn hàng..."
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default BillDetailManagement;
