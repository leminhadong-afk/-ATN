import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Typography,
  Space,
  Button,
  Tag,
  Switch,
  Rate,
  Modal,
  Input,
  message,
  Avatar,
  Image,
  Select,
  Row,
  Col,
} from "antd";
import { MessageOutlined, UserOutlined, StarFilled, EditOutlined, ReloadOutlined } from "@ant-design/icons";
import { AdminReviewApi } from "../../api/admin/review/AdminReviewApi";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState(null);

  // Reply Modal State
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchReviews = async (currentPage = page, currentSize = pageSize, status = statusFilter) => {
    setLoading(true);
    try {
      const params = {
        page: currentPage - 1,
        size: currentSize,
      };
      if (status !== null && status !== undefined) {
        params.status = status;
      }
      const res = await AdminReviewApi.getAllReviews(params);
      if (res && res.data) {
        setReviews(res.data.content || []);
        setTotal(res.data.totalElements || 0);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách đánh giá:", error);
      message.error("Không thể tải danh sách đánh giá.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1, pageSize, statusFilter);
  }, []);

  const handleStatusFilterChange = (val) => {
    setStatusFilter(val);
    setPage(1);
    fetchReviews(1, pageSize, val);
  };

  const handleToggleStatus = async (record, checked) => {
    const newStatus = checked ? 1 : 0;
    try {
      await AdminReviewApi.toggleReviewStatus(record.id, newStatus);
      message.success(`Đã ${checked ? "hiển thị" : "ẩn"} đánh giá thành công!`);
      fetchReviews(page, pageSize, statusFilter);
    } catch (error) {
      message.error("Không thể thay đổi trạng thái đánh giá.");
    }
  };

  const openReplyModal = (record) => {
    setSelectedReview(record);
    setReplyText(record.reply || "");
    setReplyModalOpen(true);
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      message.warning("Vui lòng nhập nội dung phản hồi!");
      return;
    }
    setSubmittingReply(true);
    try {
      await AdminReviewApi.replyReview(selectedReview.id, { reply: replyText.trim() });
      message.success("Đã phản hồi đánh giá thành công!");
      setReplyModalOpen(false);
      setSelectedReview(null);
      setReplyText("");
      fetchReviews(page, pageSize, statusFilter);
    } catch (error) {
      message.error("Không thể gửi phản hồi. Vui lòng thử lại.");
    } finally {
      setSubmittingReply(false);
    }
  };

  const columns = [
    {
      title: "Khách hàng",
      key: "customer",
      width: 180,
      render: (_, record) => (
        <Space size={10}>
          <Avatar src={record.customerAvatar} icon={<UserOutlined />} style={{ backgroundColor: "#1890ff" }} />
          <div>
            <div style={{ fontWeight: 600 }}>{record.customerName || "Khách hàng"}</div>
            <Text type="secondary" style={{ fontSize: 11 }}>#{record.customerId ? record.customerId.substring(0, 8) : "N/A"}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Sản phẩm & Đơn hàng",
      key: "product",
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, color: "#1890ff" }}>{record.productName || "Sản phẩm trang sức"}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>Đơn hàng: #{record.billId || "N/A"}</Text>
        </div>
      ),
    },
    {
      title: "Đánh giá",
      key: "star",
      width: 130,
      render: (_, record) => (
        <div>
          <Rate disabled value={record.star} style={{ fontSize: 14, color: "#fadb14" }} />
          <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 2 }}>
            {record.createdDate ? dayjs(record.createdDate).format("DD/MM/YYYY HH:mm") : ""}
          </div>
        </div>
      ),
    },
    {
      title: "Nội dung & Phản hồi",
      key: "comment",
      render: (_, record) => {
        const imageList = record.images ? record.images.split(",").map((i) => i.trim()).filter(Boolean) : [];
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 14 }}>{record.comment}</div>
            {imageList.length > 0 && (
              <div style={{ display: "flex", gap: 6 }}>
                <Image.PreviewGroup>
                  {imageList.map((img, idx) => (
                    <Image key={idx} src={img} width={48} height={48} style={{ objectFit: "cover", borderRadius: 6 }} />
                  ))}
                </Image.PreviewGroup>
              </div>
            )}

            {record.reply && (
              <div style={{ background: "#e6f7ff", padding: "8px 12px", borderRadius: 6, borderLeft: "3px solid #1890ff" }}>
                <Text strong style={{ color: "#1890ff", fontSize: 12 }}>
                  Phản hồi từ Admin ({record.replyDate ? dayjs(record.replyDate).format("DD/MM/YYYY") : ""}):
                </Text>
                <div style={{ fontSize: 13, color: "#595959" }}>{record.reply}</div>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Space direction="vertical" size={4} align="center">
          <Switch
            checked={record.status === 1}
            onChange={(checked) => handleToggleStatus(record, checked)}
            checkedChildren="Hiện"
            unCheckedChildren="Ẩn"
          />
          <Tag color={record.status === 1 ? "success" : "default"}>
            {record.status === 1 ? "Hiển thị" : "Đã ẩn"}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 110,
      align: "center",
      render: (_, record) => (
        <Button
          type="primary"
          ghost
          icon={<EditOutlined />}
          size="small"
          onClick={() => openReplyModal(record)}
        >
          {record.reply ? "Sửa TL" : "Trả lời"}
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              <MessageOutlined style={{ marginRight: 10, color: "#1890ff" }} />
              Quản Lý Đánh Giá Sản Phẩm
            </Title>
          </Col>
          <Col>
            <Space>
              <Select
                placeholder="Lọc theo trạng thái"
                allowClear
                style={{ width: 180 }}
                value={statusFilter}
                onChange={handleStatusFilterChange}
              >
                <Option value={1}>Đang hiển thị</Option>
                <Option value={0}>Đã ẩn</Option>
              </Select>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => fetchReviews(page, pageSize, statusFilter)}
              >
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={reviews}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            onChange: (p, sz) => {
              setPage(p);
              setPageSize(sz);
              fetchReviews(p, sz, statusFilter);
            },
          }}
        />
      </Card>

      {/* Admin Reply Modal */}
      <Modal
        title="Phản hồi đánh giá của khách hàng"
        open={replyModalOpen}
        onCancel={() => setReplyModalOpen(false)}
        onOk={handleSendReply}
        confirmLoading={submittingReply}
        okText="Gửi phản hồi"
        cancelText="Hủy"
      >
        {selectedReview && (
          <div style={{ marginBottom: 16, padding: 12, background: "#fafafa", borderRadius: 8 }}>
            <div>
              <Text strong>{selectedReview.customerName}</Text> -{" "}
              <Rate disabled value={selectedReview.star} style={{ fontSize: 13, color: "#fadb14" }} />
            </div>
            <div style={{ marginTop: 6, fontStyle: "italic", color: "#595959" }}>
              "{selectedReview.comment}"
            </div>
          </div>
        )}

        <Text strong style={{ display: "block", marginBottom: 8 }}>
          Nội dung phản hồi của Cửa hàng:
        </Text>
        <TextArea
          rows={4}
          placeholder="Nhập nội dung phản hồi cảm ơn hoặc giải đáp thắc mắc khách hàng..."
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          maxLength={1000}
          showCount
        />
      </Modal>
    </div>
  );
};

export default ReviewManagement;
