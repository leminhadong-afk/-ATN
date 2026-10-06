import { Modal, Button, InputNumber, Typography, Empty, Row, Col, Progress, Tag, Input, Checkbox, DatePicker, Select, Divider } from "antd";
import React from "react";

const { Text, Title } = Typography;
const { TextArea } = Input;

const productNameFromId = (id) => `Sản phẩm #${id}`; // placeholder

const money = (v) => (v || 0).toLocaleString() + " đ";

const CartModal = ({ visible, onClose, items, onChangeQty, onRemove, onCheckout }) => {
  const subtotal = items.reduce((sum, it) => sum + (it.price || 0) * (it.qty || 1), 0);
  const shipFreeThreshold = 500000; // dummy threshold
  const freePercent = Math.min(100, Math.round((subtotal / shipFreeThreshold) * 100));

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Title level={4} style={{ margin: 0 }}>Giỏ hàng</Title>
          <div style={{ flex: 1 }} />
          <div style={{ minWidth: 200 }}>
            <Progress percent={freePercent} showInfo={false} strokeColor="#52c41a" />
            <div style={{ fontSize: 12, color: '#666' }}>{freePercent >= 100 ? 'Chúc mừng! Đơn hàng đủ điều kiện Freeship 🎉' : `Mua thêm ${(shipFreeThreshold - subtotal).toLocaleString()} đ để được Freeship`}</div>
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={900}
      footer={null}
    >
      {items.length === 0 ? (
        <Empty description="Giỏ hàng trống" />
      ) : (
        <Row gutter={[16, 16]}>
          <Col xs={24} md={16}>
            {/* Voucher bar */}
            <div style={{ background: '#fff7e6', border: '1px solid #ffe58f', padding: 12, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <Tag color="orange" style={{ margin: 0 }}>EGAFREESHIP</Tag>
              <Text style={{ flex: 1 }}>Áp dụng mã freeship cho đơn hàng của bạn</Text>
              <Button size="small">Sao chép</Button>
            </div>

            {/* Items */}
            {items.map((item) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                {item.image ? (
                  <img src={item.image} alt={item.name} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid #f0f0f0' }} />
                ) : (
                  <div style={{ width: 64, height: 64, background: '#f5f5f5', borderRadius: 8 }} />
                )}
                <div style={{ flex: 1 }}>
                  <Text strong>{item.name || productNameFromId(item.id)}</Text>
                  <div style={{ marginTop: 4, color: '#999', fontSize: 12 }}>Phân loại: Mặc định</div>
                </div>
                <div style={{ minWidth: 120, textAlign: 'right' }}>
                  <Text>{money(item.price)}</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Button size="small" onClick={() => onChangeQty(item.id, Math.max(1, (item.qty || 1) - 1))}>-</Button>
                  <InputNumber min={1} value={item.qty || 1} onChange={(v) => onChangeQty(item.id, v || 1)} size="small" />
                  <Button size="small" onClick={() => onChangeQty(item.id, (item.qty || 1) + 1)}>+</Button>
                </div>
                <div style={{ minWidth: 130, textAlign: 'right' }}>
                  <Text strong style={{ color: '#ff4d4f' }}>{money((item.price || 0) * (item.qty || 1))}</Text>
                </div>
                <Button type="text" danger onClick={() => onRemove(item.id)}>X</Button>
              </div>
            ))}

            {/* Order note */}
            <div style={{ marginTop: 12 }}>
              <Text strong>Ghi chú đơn hàng</Text>
              <TextArea rows={3} placeholder="Nhập ghi chú cho đơn hàng..." style={{ marginTop: 8 }} />
            </div>
          </Col>

          {/* Summary column */}
          <Col xs={24} md={8}>
            <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16, background: '#fff' }}>
              <div style={{ marginBottom: 12 }}>
                <Text strong>HẸN GIỜ NHẬN HÀNG</Text>
                <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
                  <DatePicker style={{ width: '100%' }} placeholder="Ngày nhận hàng" />
                  <Select style={{ width: '100%' }} placeholder="Chọn thời gian">
                    <Select.Option value="morning">Buổi sáng</Select.Option>
                    <Select.Option value="afternoon">Buổi chiều</Select.Option>
                    <Select.Option value="evening">Buổi tối</Select.Option>
                  </Select>
                  <Checkbox>Xuất hóa đơn công ty</Checkbox>
                </div>
              </div>

              <Divider style={{ margin: '12px 0' }} />

              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Tạm tính</Text>
                  <Text>{money(subtotal)}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Giảm giá</Text>
                  <Text>- 0 đ</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>Mã giảm giá</Text>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Input size="small" placeholder="Nhập mã" />
                    <Button size="small">Áp dụng</Button>
                  </div>
                </div>
              </div>

              <Divider style={{ margin: '12px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text strong>TỔNG CỘNG</Text>
                <Text strong style={{ color: '#ff4d4f', fontSize: 16 }}>{money(subtotal)}</Text>
              </div>
              <Button type="primary" block size="large" onClick={onCheckout} disabled={!items.length}>Thanh Toán</Button>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 10, opacity: .7 }}>
                <img alt="visa" src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" style={{ height: 16 }} />
                <img alt="mc" src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" style={{ height: 16 }} />
              </div>
            </div>
          </Col>
        </Row>
      )}
    </Modal>
  );
};

export default CartModal;


