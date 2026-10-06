import React, { useState } from "react";
import { Modal, Rate, Input, Upload, message, Button, Typography } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { ReviewApi } from "../../../api/client/review/ReviewApi";
import { FileUploadApi } from "../../../api/admin/fileUpload/FileUploadApi";

const { TextArea } = Input;
const { Text, Title } = Typography;

const CreateReviewModal = ({ open, onClose, billId, productId, productDetailId, productName, productImage, onSuccess }) => {
  const [star, setStar] = useState(5);
  const [comment, setComment] = useState("");
  const [fileList, setFileList] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // Upload file qua API Cloudinary tương tự thêm sản phẩm chi tiết
  const uploadImageToCloudinary = async (fileObj) => {
    try {
      const formData = new FormData();
      formData.append("multipartFile", fileObj);
      const response = await FileUploadApi.uploadFileImage(formData);
      return response.data; // Trả về đường dẫn ảnh Cloudinary (e.g. https://res.cloudinary.com/...)
    } catch (error) {
      console.error("Lỗi khi tải ảnh lên hệ thống:", error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!star || star < 1) {
      message.warning("Vui lòng chọn số sao đánh giá!");
      return;
    }
    if (!comment.trim()) {
      message.warning("Vui lòng viết nhận xét của bạn!");
      return;
    }

    setSubmitting(true);
    try {
      // Tải từng hình ảnh lên server/Cloudinary qua FileUploadApi
      const imagePromises = fileList.map(async (f) => {
        if (f.response?.url) return f.response.url;
        if (f.url && !f.url.startsWith("blob:")) return f.url;

        // Trích xuất file gốc và upload
        const rawFile = f.originFileObj || (f instanceof File || f instanceof Blob || f.size ? f : null);
        if (rawFile) {
          const uploadedUrl = await uploadImageToCloudinary(rawFile);
          if (uploadedUrl) return uploadedUrl;
        }

        return null;
      });

      const imagesArray = (await Promise.all(imagePromises)).filter(Boolean);
      const imageUrls = imagesArray.join(",");

      const payload = {
        billId,
        productId,
        productDetailId,
        star,
        comment: comment.trim(),
        images: imageUrls,
      };

      await ReviewApi.createReview(payload);
      message.success("Đánh giá sản phẩm thành công!");
      setStar(5);
      setComment("");
      setFileList([]);
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Lỗi khi gửi đánh giá:", error);
      const errMsg = typeof error?.response?.data === "string" ? error.response.data : "Không thể gửi đánh giá. Vui lòng thử lại.";
      message.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={<Title level={4} style={{ margin: 0 }}>Đánh giá sản phẩm</Title>}
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={submitting}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={submitting}
          onClick={handleSubmit}
          style={{ backgroundColor: "#c59b27", borderColor: "#c59b27" }}
        >
          Gửi đánh giá
        </Button>,
      ]}
    >
      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20, padding: 12, background: "#fafafa", borderRadius: 8 }}>
        {productImage && (
          <img src={productImage} alt={productName} style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8 }} />
        )}
        <div>
          <Text strong>{productName || "Sản phẩm trang sức"}</Text>
          <div style={{ marginTop: 4 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {billId ? `Mã hóa đơn: #${billId}` : "Đánh giá sản phẩm"}
            </Text>
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Text strong style={{ display: "block", marginBottom: 8 }}>
          Chất lượng sản phẩm
        </Text>
        <Rate value={star} onChange={setStar} style={{ fontSize: 28, color: "#fadb14" }} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <Text strong style={{ display: "block", marginBottom: 8 }}>
          Viết nhận xét của bạn
        </Text>
        <TextArea
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Hãy chia sẻ trải nghiệm về chất lượng sản phẩm, độ hoàn thiện, dịch vụ giao hàng..."
          maxLength={1000}
          showCount
        />
      </div>

      <div>
        <Text strong style={{ display: "block", marginBottom: 8 }}>
          Thêm hình ảnh thực tế (Tùy chọn)
        </Text>
        <Upload
          listType="picture-card"
          fileList={fileList}
          onChange={handleUploadChange}
          beforeUpload={() => false}
          maxCount={5}
          accept="image/*"
        >
          {fileList.length < 5 && (
            <div>
              <UploadOutlined />
              <div style={{ marginTop: 8, fontSize: 12 }}>Tải ảnh lên</div>
            </div>
          )}
        </Upload>
      </div>
    </Modal>
  );
};

export default CreateReviewModal;
