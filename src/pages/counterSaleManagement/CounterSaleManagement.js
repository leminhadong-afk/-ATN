import React, { useEffect, useState } from "react";
import styles from "./CounterSaleManagement.module.css";
import {
  Avatar,
  Button,
  message,
  Modal,
  Select,
  Switch,
  Tabs,
  Tag,
  Spin,
  Empty,
} from "antd";
import {
  DollarOutlined,
  MinusOutlined,
  PlusOutlined,
  QrcodeOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  FileTextOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { BillManagementApi } from "../../api/admin/billManagement/BillManagementApi";
import ModalAddProduct from "./modalAddProduct/ModalAddProduct";
import { BillDetailsManagementApi } from "../../api/admin/billDetailsManagement/BillDetailsManagementApi";
import ModalAddCustomer from "./modalAddCustomer/ModalAddCustomer";
import { CustomerManagementApi } from "../../api/admin/customerManagement/CustomerManagementApi";
import debounce from "lodash.debounce";
import ModalPayment from "./modalPayment/ModalPayment";
import { useNavigate } from "react-router";

const { Option } = Select;

const CounterSaleManagement = () => {
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenCustomer, setIsModalOpenCustomer] = useState(false);
  const [isModalOpenPayment, setIsModalOpenPayment] = useState(false);

  const navigate = useNavigate();

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [billId, setBillId] = useState();
  const [billDetails, setBillDetails] = useState([]); // State lưu trữ danh sách sản phẩm trong hóa đơn
  // const [billDetailsId, setBillDetailsId] = useState([]);
  const [loading, setLoading] = useState(false); // State để quản lý trạng thái loading
  // const [quantityProductDetail, setQuantityProductDetail] = useState();

  const [discount, getDiscount] = useState(0);
  const [shippingFee, getShippingFee] = useState(0);

  const [searchResults, setSearchResults] = useState([]); // State để lưu kết quả tìm kiếm
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const handleProductsSelected = (products) => {
    setSelectedProducts(products); // Cập nhật danh sách sản phẩm đã chọn
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleOpenModalCustomer = () => {
    setIsModalOpenCustomer(true);
  };

  const handleOpenModalPayment = () => {
    setIsModalOpenPayment(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleModalCloseCustomer = () => {
    setIsModalOpenCustomer(false);
  };

  const handleModalClosePayment = () => {
    setIsModalOpenPayment(false);
  };

  // Hàm tải PDF hóa đơn
  const downloadBillPDF = async (billId) => {
    try {
      const response = await BillManagementApi.generatePDF(billId);

      // Tạo URL từ blob
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      // Tạo link tải xuống
      const link = document.createElement("a");
      link.href = url;
      link.download = `hoa_don_${billId}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Dọn dẹp
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success("Tải PDF hóa đơn thành công!");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      message.error("Không thể tải PDF hóa đơn!");
    }
  };

  // Gọi API khi trang được tải để lấy các bill có status = 0
  useEffect(() => {
    const fetchBills = async () => {
      try {
        // Gọi API để lấy hóa đơn với status = 0
        const response = await BillManagementApi.getBillWithStatus(); // Gọi API với status = 0
        const bills = response.data; // Giả sử response trả về dữ liệu dưới dạng { data: [...] }

        if (bills && bills.length > 0) {
          const newTabs = bills.map((bill, index) => {
            return {
              key: `order-${index + 1}`,
              id: bill.id,
              label: `Đơn hàng ${index + 1} - ${bill.code}`, // Sử dụng mã hóa đơn cho tiêu đề tab
              content: (
                <div className={styles.ContentContainer}>
                  <h2>
                    Đơn hàng {index + 1} - {bill.code}{" "}
                  </h2>
                  <div>
                    {/* <Button icon={<QrcodeOutlined />}>Quét QR sản phẩm</Button> */}
                    <Button
                      icon={<PlusOutlined />}
                      className={styles.ButtonAdd}
                      onClick={handleOpenModal}
                    >
                      Thêm sản phẩm
                    </Button>
                  </div>
                </div>
              ),
            };
          });

          setTabs(newTabs);
          setActiveTab(newTabs[0]?.key); // Set tab đầu tiên làm active
          setBillId(newTabs[0]?.id); // Đặt billId của tab đầu tiên
        } else {
          message.info("Hiện tại đang không có đơn hàng nào chờ");
        }
      } catch (error) {
        message.error("Lấy danh sách hóa đơn thất bại. Vui lòng thử lại.");
      }
    };

    fetchBills(); // Gọi hàm lấy danh sách hóa đơn khi trang được tải
  }, []);

  // Khi người dùng nhấp vào một tab, cập nhật active tab và log id
  const handleTabChange = (key) => {
    setActiveTab(key); // Cập nhật tab đang hoạt động
    const currentTab = tabs.find((tab) => tab.key === key); // Tìm tab theo key
    if (currentTab) {
      setBillId(currentTab.id); // Cập nhật billId
      console.log("ID của tab hiện tại:", currentTab.id); // Log ra id của tab
    }
  };

  // Hàm thêm tab mới khi tạo hóa đơn thành công
  const handleAddTab = async () => {
    console.log("haudshdsuhhaudshdsuh");

    if (tabs.length >= 5) {
      message.warning("Chỉ được tạo tối đa 5 đơn hàng!");
      return;
    }

    try {
      // Gọi API để tạo hóa đơn mới
      const billResponse = await BillManagementApi.create({});
      const { code, id } = billResponse.data; // Giả sử API trả về id và code

      // Gọi lại API để lấy các bill có status = 0
      const billsResponse = await BillManagementApi.getBillWithStatus(0);
      const bills = billsResponse.data;

      console.log(billsResponse.data);

      // Tạo tab mới với mã hóa đơn vừa tạo
      const newTabs = bills.map((bill, index) => {
        return {
          key: `order-${index + 1}`,
          id: bill.id, // Thêm id từ dữ liệu bill
          label: `Đơn hàng ${index + 1} - ${bill.code}`, // Sử dụng mã hóa đơn cho tiêu đề tab
          content: (
            <div className={styles.ContentContainer}>
              <h2>Sản phẩm</h2>
              <div>
                {/* <Button icon={<QrcodeOutlined />}>Quét QR sản phẩm</Button> */}
                <Button
                  icon={<PlusOutlined />}
                  className={styles.ButtonAdd}
                  onClick={handleOpenModal}
                >
                  Thêm sản phẩm
                </Button>
              </div>
            </div>
          ),
        };
      });

      setTabs(newTabs); // Cập nhật lại danh sách các tab
      setActiveTab(newTabs[0]?.key); // Set tab đầu tiên làm active
      setBillId(newTabs[0]?.id); // Cập nhật billId cho tab mới
    } catch (error) {
      message.error("Tạo đơn hàng thất bại. Vui lòng thử lại.");
    }
  };

  const handleCompleteBill = async () => {
    if (!billId) {
      // message.error("Vui lòng chọn một đơn hàng!");
      return;
    }
    if (billDetails.length === 0) {
      // message.error("Hóa đơn chưa có sản phẩm!");
      return;
    }
    try {
      const totalAmount = calculateTotalPrice() + shippingFee - discount;
      const billUpdateData = {
        id: billId,
        totalAmount: totalAmount,
        customerId: selectedCustomer?.id || null,
        employeeId: "4f21e504-3b11-4b6b-90ac-37c814acb6f6", // Thay bằng giá trị thực tế nếu có
        status: 1,
        address: selectedCustomer?.address || "Khách lẻ",
        phoneNumber: selectedCustomer?.phoneNumber || "N/A",
        recipient: selectedCustomer?.name || "Khách lẻ",
        datePayment: new Date().toISOString(),
        billDetails: billDetails.map((detail) => ({
          id: detail.id,
          productDetailId: detail.productDetailId,
          quantity: detail.quantity,
          price: detail.price,
          deleteFlag: detail.deleteFlag || 0,
        })),
      };

      console.log("Sending bill update data:", billUpdateData); // Debug dữ liệu gửi đi

      const response = await BillManagementApi.update(billUpdateData);
      console.log("API response:", response); // Debug phản hồi từ API
      console.log("ddsdsdsd 11111:", response.data);
      console.log("ddsdsdsd 2222222222:", response.data.success);

      // Kiểm tra phản hồi từ API
      if (response.data) {
        if (
          typeof response.data === "string" &&
          response.data.includes("thành công")
        ) {
          // Thành công
          const filteredTabs = tabs.filter((tab) => tab.key !== activeTab);
          setTabs(filteredTabs);
          setActiveTab(filteredTabs.length > 0 ? filteredTabs[0].key : "");
          setBillId(filteredTabs.length > 0 ? filteredTabs[0].id : null);
          setBillDetails([]);
          setSelectedCustomer(null);
          message.success("Hoàn tất hóa đơn thành công!");

          // Tự động tải PDF sau khi thanh toán thành công
          await downloadBillPDF(billId);

          await getBillDetails();
        } else if (response.data.success === false) {
          // Backend trả về lỗi
          message.error(response.data.message || "Hoàn tất hóa đơn thất bại!");
        } else {
          // Phản hồi không có success (chuỗi hoặc định dạng khác)
          message.success(response.data || "Hoàn tất hóa đơn thành công!");
        }
      } else {
        // Nếu response.data không tồn tại (API trả về không đúng định dạng)
        message.success("Hoàn tất hóa đơn thành công!");
      }
    } catch (error) {
      console.error("Error completing bill:", error.response || error);
      message.error(
        error.response?.data?.message || "Hoàn tất hóa đơn thất bại!"
      );
    }
  };

  // Hàm xử lý thêm hoặc xóa tab
  const handleTabEdit = (targetKey, action) => {
    if (action === "add") {
      handleAddTab(); // Gọi hàm thêm tab khi nhấp vào icon dấu cộng
    } else if (action === "remove") {
      handleRemoveTab(targetKey); // Gọi hàm xóa tab
    }
  };

  const handleRemoveTab = async (targetKey) => {
    // Tìm tab bị xóa dựa trên targetKey
    const removedTab = tabs.find((tab) => tab.key === targetKey);

    if (removedTab) {
      // Sử dụng Modal.confirm để xác nhận xóa
      Modal.confirm({
        title: "Bạn có chắc chắn muốn xóa đơn hàng này?",
        content: `${removedTab.label} sẽ bị xóa hoàn toàn, số lượng sản phẩm sẽ được trả lại kho.`,
        okText: "Xóa",
        cancelText: "Hủy",
        onOk: async () => {
          console.log("Removing Bill with ID:", removedTab.id);

          try {
            // Bước 1: Lấy danh sách chi tiết hóa đơn của bill
            const billDetailsResponse =
              await BillDetailsManagementApi.infoBillDetails(removedTab.id);
            const billDetailsToDelete = billDetailsResponse.data || [];

            // Bước 2: Xóa từng chi tiết hóa đơn để trả lại số lượng sản phẩm trong kho
            if (billDetailsToDelete.length > 0) {
              await Promise.all(
                billDetailsToDelete.map(async (product) => {
                  await BillDetailsManagementApi.updateDeleteFlag(product.id);
                })
              );
              console.log(
                "Đã xóa tất cả chi tiết hóa đơn và trả lại số lượng trong kho."
              );
            } else {
              console.log("Không có chi tiết hóa đơn nào để xóa.");
            }

            // Bước 3: Đánh dấu bill là đã xóa
            const response = await BillManagementApi.updateDeleteFlag(
              removedTab.id
            );
            console.log("API Response (Bill Deletion):", response);

            // Bước 4: Cập nhật lại danh sách tabs
            const filteredTabs = tabs.filter((tab) => tab.key !== targetKey);
            setTabs(filteredTabs);

            // Xử lý chuyển tab active và billId
            if (activeTab === targetKey && filteredTabs.length > 0) {
              setActiveTab(filteredTabs[filteredTabs.length - 1].key);
              setBillId(filteredTabs[filteredTabs.length - 1].id);
            } else if (filteredTabs.length === 0) {
              setActiveTab(""); // Không còn tab nào
              setBillId(null); // Reset billId
              setBillDetails([]); // Reset danh sách chi tiết hóa đơn
            }

            message.success(
              "Xóa đơn hàng thành công, số lượng sản phẩm đã được trả lại kho!"
            );
          } catch (error) {
            console.error("Error removing bill and details:", error);
            message.error("Xóa đơn hàng thất bại. Vui lòng thử lại.");
          }
        },
        onCancel() {
          console.log("Hủy bỏ xóa đơn hàng");
        },
      });
    }
  };

  // const columns = [
  //   { title: "Tên sản phẩm", dataIndex: "productName", key: "productName" },
  //   { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
  //   { title: "Giá", dataIndex: "price", key: "price" },
  //   {
  //     title: "Thao tác",
  //     key: "action",
  //     render: (_, record) => (
  //       <Button
  //         onClick={() => {
  //           setTabs((prevTabs) =>
  //             prevTabs.map((t) =>
  //               t.key === activeTab
  //                 ? {
  //                     ...t,
  //                     products: t.products.filter(
  //                       (p) => p.productDetailId !== record.productDetailId
  //                     ),
  //                   }
  //                 : t
  //             )
  //           );
  //         }}
  //       >
  //         Xóa
  //       </Button>
  //     ),
  //   },
  // ];

  const getBillDetails = async () => {
    setLoading(true); // Bật trạng thái loading khi bắt đầu gọi API
    console.log("parma truyenf vao");
    console.log(billId);

    try {
      const response = await BillDetailsManagementApi.infoBillDetails(billId); // Gọi API để lấy chi tiết hóa đơn
      const { data } = response; // Giả sử API trả về dữ liệu trong trường 'data'

      // Cập nhật dữ liệu vào state
      setBillDetails(data);
      console.log("bill details");

      console.log(data);
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết hóa đơn:", error);
      message.error("Lấy chi tiết hóa đơn thất bại!");
    } finally {
      setLoading(false); // Tắt trạng thái loading khi kết thúc
    }
  };

  useEffect(() => {
    if (billId) {
      getBillDetails(); // Gọi API khi `billId` thay đổi
    }
    // Không gọi handleCompleteBill() ở đây vì nó chỉ nên được gọi khi user click button "Tạo hóa đơn"
  }, [billId]); // Gọi lại khi `billId` thay đổi

  const handleDeleteBillDetails = (product) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa chi tiết hóa đơn này?",
      content: "Hành động này sẽ không thể phục hồi.",
      okText: "Xóa",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          // Gọi API để xóa chi tiết hóa đơn
          const response = await BillDetailsManagementApi.updateDeleteFlag(
            product.id
          );
          console.log("API Response:", response);

          // Hiển thị thông báo thành công
          message.success("Xóa chi tiết hóa đơn thành công!");

          // Load lại danh sách dữ liệu sau khi xóa
          getBillDetails(); // Hàm để lấy lại dữ liệu chi tiết hóa đơn
        } catch (error) {
          console.error("Error deleting bill details:", error);
          message.error("Xóa chi tiết hóa đơn thất bại!");
        }
      },
      onCancel() {
        // Thực hiện khi người dùng hủy bỏ
        console.log("Hủy xóa");
      },
    });
  };

  const handleQuantityChange = async (product, change) => {
    // Lấy số lượng hiện tại từ state hoặc từ product
    const currentDetail = billDetails.find(
      (detail) => detail.productDetailId === product.productDetailId
    );

    const currentQuantity = currentDetail
      ? currentDetail.quantity
      : product.quantity;

    const newQuantity = currentQuantity + change; // Số lượng mới, chỉ tăng hoặc giảm 1

    // Kiểm tra số lượng hợp lệ
    if (newQuantity < 1) {
      message.warning("Số lượng không thể nhỏ hơn 1.");
      return;
    }

    // Không cho phép tăng nếu số lượng trong kho đã bằng 0
    if (change > 0 && product.productDetailQuantity === 0) {
      message.warning("Số lượng sản phẩm trong kho hiện không đủ.");
      return;
    }

    // Thông tin cần gửi tới backend
    const param = {
      productDetailId: product.productDetailId,
      quantity: change, // Chỉ gửi sự thay đổi (+1 hoặc -1)
      billId: billId,
    };

    console.log("Sending to backend:", param);

    try {
      // Gọi API cập nhật số lượng
      await BillDetailsManagementApi.create(param);

      // Hiển thị thông báo thành công
      message.success("Cập nhật số lượng thành công!");

      // Gọi lại hàm `getBillDetails` để làm mới dữ liệu
      await getBillDetails();
    } catch (error) {
      console.error("Lỗi khi cập nhật số lượng:", error);

      // Kiểm tra lỗi và hiển thị modal nếu lỗi là "Số lượng sản phẩm trong kho không đủ"
      if (
        error.response &&
        error.response.data &&
        error.response.data.message === "Số lượng sản phẩm trong kho không đủ!"
      ) {
        Modal.error({
          title: "Lỗi cập nhật số lượng",
          content:
            "Hiện số lượng sản phẩm này trong kho không đủ, vui lòng chọn sản phẩm khác!",
        });
      } else {
        message.error("Cập nhật số lượng thất bại!");
      }
    } finally {
      // Luôn gọi lại `getBillDetails` để đảm bảo dữ liệu được làm mới
      await getBillDetails();
    }
  };

  const fetchAllCustomers = async () => {
    try {
      setLoading(true);
      const response = await CustomerManagementApi.search(); // API lấy toàn bộ khách hàng
      const customers = Array.isArray(response.data.content)
        ? response.data.content
        : [];
      console.log(customers);

      setSearchResults(customers); // Lưu danh sách vào state
    } catch (error) {
      console.error("Error fetching customer list:", error);
      message.error("Lỗi khi lấy danh sách khách hàng.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = debounce(async (value) => {
    try {
      setLoading(true);
      console.log("Searching for:", value); // Log giá trị tìm kiếm

      // Gọi API với tham số tìm kiếm
      const filter = { searchTerm: value }; // Chuyển value thành tham số tìm kiếm
      const response = await CustomerManagementApi.search(filter); // Gọi API tìm kiếm

      // Kiểm tra dữ liệu trả về
      if (response && response.data && response.data.content) {
        const customers = Array.isArray(response.data.content)
          ? response.data.content
          : [];
        setSearchResults(customers); // Cập nhật state với kết quả tìm kiếm
      } else {
        setSearchResults([]); // Nếu không có dữ liệu, gán mảng rỗng
      }
    } catch (error) {
      console.error("Error fetching customer list:", error);
      message.error("Lỗi khi lấy danh sách khách hàng.");
    } finally {
      setLoading(false);
    }
  }, 500); // Debounce sau 500ms

  const handleFocus = async () => {
    if (searchResults.length === 0) {
      await fetchAllCustomers(); // Lấy danh sách khách hàng khi người dùng focus vào ô
    }
  };

  // Khi người dùng chọn một khách hàng
  const handleSelectCustomer = (customerId) => {
    const customer = searchResults.find((c) => c.id === customerId);
    setSelectedCustomer(customer); // Lưu khách hàng đã chọn vào state
  };

  // Khi xóa khách hàng đã chọn
  const handleDeselectCustomer = () => {
    setSelectedCustomer(null); // Xóa khách hàng đã chọn
  };

  // Calculate the total payment from the list of bill details
  const calculateTotalPrice = () => {
    return billDetails.reduce((total, item) => {
      if (item.price && item.quantity) {
        return total + item.price * item.quantity;
      }
      return total;
    }, 0);
  };

  return (
    <div className={styles.Container}>
      <div className={styles.HeaderContainer}>
        <h1>Bán hàng</h1>
        <Button
          icon={<PlusOutlined />}
          className={styles.ButtonAdd}
          onClick={handleAddTab}
        // disabled={tabs.length >= 5}
        >
          Tạo đơn hàng
        </Button>
      </div>

      <div className={styles.TabsContainer}>
        {tabs.length === 0 ? (
          <div className={styles.NoOrdersMessage}>
            Hiện chưa có đơn hàng nào cả!
          </div>
        ) : (
          <Tabs
            type="editable-card" // Hiển thị icon dấu cộng và xóa
            activeKey={activeTab}
            onChange={handleTabChange} // Chuyển đổi tab
            onEdit={handleTabEdit} // Thêm hoặc xóa tab
            items={tabs.map((tab) => ({
              label: tab.label,
              // id: tab.id,
              key: tab.key,
              children: (
                <div className={styles.POSLayout}>
                  {/* Left Side: Product Selection & Cart */}
                  <div className={styles.CartSection}>
                    <div className={styles.SectionHeader}>
                      <h3 className={styles.CartTitle}>
                        <ShoppingCartOutlined style={{ marginRight: "10px" }} />
                        Giỏ hàng - {tab.label}
                      </h3>
                      <Button
                        icon={<PlusOutlined />}
                        className={styles.ButtonAdd}
                        onClick={handleOpenModal}
                      >
                        Thêm sản phẩm
                      </Button>
                    </div>

                    <div className={styles.ProductList}>
                      {loading ? (
                        <div className={styles.LoadingState}>
                          <Spin size="large" />
                          <p>Đang cập nhật giỏ hàng...</p>
                        </div>
                      ) : billDetails?.length === 0 ? (
                        <div className={styles.EmptyCart}>
                          <Empty description="Giỏ hàng trống" />
                        </div>
                      ) : (
                        (billDetails || []).map((product) => (
                          <div
                            key={product.productDetailId}
                            className={styles.CartItem}
                          >
                            <div className={styles.CartItemImg}>
                              <img
                                src={product.urlImg}
                                alt={product.productName}
                              />
                            </div>

                            <div className={styles.CartItemInfo}>
                              <h4 className={styles.ProductName}>{product.productName}</h4>
                              <div className={styles.ProductSpecs}>
                                <Tag color="blue">{product.size || "N/A"}</Tag>
                                <Tag color="cyan">{product.color || "N/A"}</Tag>
                              </div>
                              <div className={styles.ProductPrice}>
                                {product.price?.toLocaleString()} VND
                              </div>
                            </div>

                            <div className={styles.CartItemActions}>
                              <div className={styles.QuantityControl}>
                                <Button
                                  size="small"
                                  shape="circle"
                                  icon={<MinusOutlined />}
                                  onClick={() => handleQuantityChange(product, -1)}
                                />
                                <span className={styles.QuantityValue}>
                                  {product.quantity || 1}
                                </span>
                                <Button
                                  size="small"
                                  shape="circle"
                                  icon={<PlusOutlined />}
                                  onClick={() => handleQuantityChange(product, 1)}
                                />
                              </div>
                              <div className={styles.ItemTotal}>
                                {(product.price * product.quantity).toLocaleString()} VND
                              </div>
                              <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                className={styles.RemoveItem}
                                onClick={() => handleDeleteBillDetails(product)}
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right Side: Customer & Checkout */}
                  <div className={styles.CheckoutSidebar}>
                    {/* Customer Info Card */}
                    <div className={styles.SidebarCard}>
                      <div className={styles.CardHeader}>
                        <h4><UserOutlined /> Khách hàng</h4>
                        {!selectedCustomer && (
                          <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={handleOpenModalCustomer}
                            className={styles.MiniAddBtn}
                          />
                        )}
                      </div>

                      <div className={styles.CustomerSearch}>
                        {selectedCustomer ? (
                          <div className={styles.SelectedCustomerInfo}>
                            <Avatar
                              src={selectedCustomer.avatar || "https://i.pravatar.cc/150"}
                              size={48}
                              className={styles.CustomerAvatar}
                            />
                            <div className={styles.CustomerDetails}>
                              <div className={styles.CustomerName}>{selectedCustomer.name}</div>
                              <div className={styles.CustomerPhone}>{selectedCustomer.phoneNumber}</div>
                              <Button
                                type="link"
                                danger
                                size="small"
                                onClick={handleDeselectCustomer}
                                style={{ padding: 0 }}
                              >
                                Thay đổi
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Select
                            showSearch
                            placeholder="Tìm nhanh khách hàng..."
                            className={styles.CustomerSelect}
                            onSearch={handleSearch}
                            onFocus={fetchAllCustomers}
                            loading={loading}
                            onChange={handleSelectCustomer}
                            filterOption={(input, option) =>
                              option?.label?.toLowerCase().includes(input.toLowerCase())
                            }
                          >
                            {searchResults.map((customer) => (
                              <Option
                                key={customer.id}
                                value={customer.id}
                                label={`${customer.name} - ${customer.phoneNumber}`}
                              >
                                <div className={styles.SelectOptionItem}>
                                  <Avatar src={customer.avatar} size="small" />
                                  <span>{customer.name} - {customer.phoneNumber}</span>
                                </div>
                              </Option>
                            ))}
                          </Select>
                        )}
                      </div>

                      {!selectedCustomer && (
                        <div className={styles.RetailGuest}>
                          <Tag color="default">Khách vãng lai (Lẻ)</Tag>
                          <div className={styles.DeliverySwitch}>
                            <span>Giao hàng: </span>
                            <Switch size="small" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Payment Summary Card */}
                    <div className={styles.SidebarCard}>
                      <div className={styles.CardHeader}>
                        <h4><FileTextOutlined /> Tóm tắt đơn hàng</h4>
                      </div>

                      <div className={styles.OrderSummaryTable}>
                        <div className={styles.SummaryRow}>
                          <span>Tổng tiền hàng</span>
                          <span>{calculateTotalPrice().toLocaleString()} VND</span>
                        </div>
                        <div className={styles.SummaryRow}>
                          <span>Giảm giá</span>
                          <span className={styles.DiscountValue}>-{discount.toLocaleString()} VND</span>
                        </div>
                        <div className={styles.SummaryRow}>
                          <span>Phí vận chuyển</span>
                          <span>{shippingFee.toLocaleString()} VND</span>
                        </div>
                        <div className={`${styles.SummaryRow} ${styles.TotalRow}`}>
                          <span>Tổng thanh toán</span>
                          <span className={styles.FinalAmount}>
                            {(calculateTotalPrice() - discount + shippingFee).toLocaleString()} VND
                          </span>
                        </div>
                      </div>

                      <div className={styles.PaymentMethodBox}>
                        <div className={styles.MethodTitle}>Phương thức thanh toán</div>
                        <Button
                          block
                          className={styles.PaymentMethodBtn}
                          onClick={handleOpenModalPayment}
                          icon={<DollarOutlined />}
                        >
                          Tiền mặt & Chuyển khoản
                        </Button>
                      </div>

                      <Button
                        type="primary"
                        block
                        size="large"
                        className={styles.CheckoutBtn}
                        onClick={handleCompleteBill}
                      >
                        XÁC NHẬN HÓA ĐƠN
                      </Button>
                    </div>
                  </div>
                </div>
              ),
            }))}
          />
        )}
      </div>

      <ModalAddProduct
        isModalOpen={isModalOpen}
        handleCancel={handleModalClose}
        billIdSelected={billId}
        getBillDetails={getBillDetails}
        onProductsSelected={(selectedProducts) => {
          setTabs((prevTabs) =>
            prevTabs.map((tab) =>
              tab.key === activeTab
                ? {
                  ...tab,
                  products: [...(tab.products || []), ...selectedProducts],
                }
                : tab
            )
          );
        }}
      />

      <ModalAddCustomer
        isModalOpenCustomer={isModalOpenCustomer}
        handleCancelCustomer={handleModalCloseCustomer}
      />

      <ModalPayment
        isModalOpenPayment={isModalOpenPayment}
        handleCancelPayment={handleModalClosePayment}
        calculateTotalPrice={calculateTotalPrice}
        billId={billId}
      />
    </div>
  );
};

export default CounterSaleManagement;
