package com.web.jewelry.business.client.order.impl;

import com.web.jewelry.business.client.order.service.ClientOrderService;
import com.web.jewelry.business.client.order.response.ClientOrderDetailResponse;
import com.web.jewelry.dto.billManagement.BillResponse;
import com.web.jewelry.repository.BillRepository;
import com.web.jewelry.repository.BillDetailRepository;
import com.web.jewelry.repository.BillHistoryRepository;
import com.web.jewelry.repository.ProductDetailRepository;
import com.web.jewelry.repository.ProductRepository;
import com.web.jewelry.repository.CustomerRepository;
import com.web.jewelry.business.common.service.service.CommonService;
import com.web.jewelry.entity.BillDetailEntity;
import com.web.jewelry.entity.BillHistoryEntity;
import com.web.jewelry.entity.ProductDetailEntity;
import com.web.jewelry.entity.CustomerEntity;
import com.web.jewelry.entity.BillEntity;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.element.Cell;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j

public class ClientOrderServiceImpl implements ClientOrderService {

    private final BillRepository billRepository;
    private final BillDetailRepository billDetailRepository;
    private final BillHistoryRepository billHistoryRepository;
    private final ProductDetailRepository productDetailRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final CommonService commonService;

    @Override
    public List<BillResponse> getCurrentCustomerBills() {
        CustomerEntity customer = commonService.getCurrentCustomer();
        if (customer == null) {
            return Collections.emptyList();
        }
        return billRepository.findAllByCustomerIdOrderByCreatedDateDesc(customer.getId());
    }

    @Override
    public ClientOrderDetailResponse getOrderDetailById(String billId) {
        ClientOrderDetailResponse response = new ClientOrderDetailResponse();
        BillResponse bill = billRepository.getInfoBill(billId).orElse(null);
        response.setBill(bill);

        List<BillDetailEntity> billDetails = billDetailRepository.findByBillIdAndDeleteFlag(billId, 0);
        response.setBillDetails(billDetails);

        List<BillHistoryEntity> timeline = billHistoryRepository.findByBillIdOrderByCreatedDateAsc(billId);
        response.setTimeline(timeline);

        List<ProductDetailEntity> productDetails = billDetails.stream()
                .map(bd -> productDetailRepository.findById(bd.getProductDetailId()).orElse(null))
                .filter(Objects::nonNull)
                .toList();
        response.setProductDetails(productDetails);

        BillEntity billEntity = billRepository.findById(billId).orElse(null);
        if (billEntity != null) {
            response.setTotalAmount(billEntity.getTotalAmount());
            response.setFinalAmount(billEntity.getFinalAmount());
        } else if (bill != null) {
            response.setTotalAmount(bill.getTotalAmount());
        }
        return response;
    }

    @Override
    public void cancelOrder(String billId, String reason) {
        CustomerEntity customer = commonService.getCurrentCustomer();
        if (customer == null) {
            throw new IllegalStateException("Không tìm thấy thông tin khách hàng hiện tại");
        }

        Optional<BillEntity> billOptional = billRepository.findById(billId);
        if (billOptional.isEmpty()) {
            throw new IllegalArgumentException("Không tìm thấy đơn hàng");
        }

        BillEntity billEntity = billOptional.get();
        if (!Objects.equals(billEntity.getCustomerId(), customer.getId())) {
            throw new IllegalArgumentException("Đơn hàng không thuộc sở hữu của bạn");
        }

        Integer currentStatus = billEntity.getStatus();
        if (Objects.equals(currentStatus, 4)) {
            throw new IllegalStateException("Đơn hàng đã được hủy trước đó");
        }

        if (currentStatus != null && currentStatus >= 2) {
            throw new IllegalStateException("Đơn hàng đã được xử lý, không thể hủy");
        }

        // Hoàn lại số lượng sản phẩm vào kho
        List<BillDetailEntity> billDetails = billDetailRepository.findByBillIdAndDeleteFlag(billId, 0);
        for (BillDetailEntity billDetail : billDetails) {
            Optional<ProductDetailEntity> productDetailOptional = productDetailRepository
                    .findById(billDetail.getProductDetailId());
            if (productDetailOptional.isPresent()) {
                ProductDetailEntity productDetail = productDetailOptional.get();
                Integer currentQuantity = Math
                        .toIntExact(productDetail.getQuantity() != null ? productDetail.getQuantity() : 0);
                Integer returnQuantity = billDetail.getQuantity() != null ? billDetail.getQuantity() : 0;
                productDetail.setQuantity((long) (currentQuantity + returnQuantity));
                productDetailRepository.save(productDetail);
                log.info("Hoàn lại {} sản phẩm {} vào kho", returnQuantity, productDetail.getId());
            }
        }

        billEntity.setStatus(4);
        billRepository.save(billEntity);

        BillHistoryEntity history = new BillHistoryEntity();
        history.setBillId(billId);
        history.setStatus(4);
        history.setNote(reason != null && !reason.trim().isEmpty() ? reason.trim() : "Khách hàng đã hủy đơn hàng");
        billHistoryRepository.save(history);
    }

    @Override
    public byte[] generateOrderPDF(String billId) throws Exception {
        try {
            // Lấy thông tin hóa đơn
            Optional<BillEntity> billOpt = billRepository.findById(billId);
            if (!billOpt.isPresent()) {
                throw new RuntimeException("Không tìm thấy hóa đơn");
            }
            BillEntity bill = billOpt.get();

            // Lấy chi tiết hóa đơn
            List<BillDetailEntity> billDetails = billDetailRepository.findByBillIdAndDeleteFlag(billId, 0);
            if (billDetails.isEmpty()) {
                throw new RuntimeException("Hóa đơn không có sản phẩm");
            }

            // Lấy thông tin khách hàng
            CustomerEntity customer = null;
            if (bill.getCustomerId() != null) {
                customer = customerRepository.findById(bill.getCustomerId()).orElse(null);
            }

            // Tạo PDF
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            // Format cho tiền tệ và ngày tháng
            NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
            SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");

            // Header - Tên cửa hàng
            Paragraph header = new Paragraph("ROYAL JEWELRY")
                    .setFontSize(24)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(header);

            Paragraph title = new Paragraph("HOA DON BAN HANG")
                    .setFontSize(18)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20);
            document.add(title);

            // Thông tin hóa đơn
            document.add(new Paragraph("Ma hoa don: " + bill.getCode()).setFontSize(12));
            document.add(new Paragraph(
                    "Ngay tao: " + (bill.getCreatedDate() != null ? dateFormat.format(bill.getCreatedDate()) : "N/A"))
                    .setFontSize(12));
            document.add(new Paragraph("Loai: " + bill.getType()).setFontSize(12));

            // Thông tin khách hàng
            document.add(new Paragraph("\nTHONG TIN KHACH HANG").setBold().setFontSize(14).setMarginTop(10));
            if (customer != null) {
                document.add(new Paragraph("Ten khach hang: " + customer.getName()).setFontSize(12));
                document.add(new Paragraph(
                        "So dien thoai: " + (customer.getPhoneNumber() != null ? customer.getPhoneNumber() : "N/A"))
                        .setFontSize(12));
                document.add(
                        new Paragraph("Dia chi: " + (customer.getAddress() != null ? customer.getAddress() : "N/A"))
                                .setFontSize(12));
            } else {
                if (bill.getRecipient() != null) {
                    document.add(new Paragraph("Nguoi nhan: " + bill.getRecipient()).setFontSize(12));
                }
                if (bill.getPhoneNumber() != null) {
                    document.add(new Paragraph("So dien thoai: " + bill.getPhoneNumber()).setFontSize(12));
                }
                if (bill.getAddress() != null) {
                    document.add(new Paragraph("Dia chi: " + bill.getAddress()).setFontSize(12));
                }
            }

            // Bảng chi tiết sản phẩm
            document.add(new Paragraph("\nCHI TIET SAN PHAM").setBold().setFontSize(14).setMarginTop(20));

            float[] columnWidths = { 1, 4, 2, 2, 2 };
            Table table = new Table(UnitValue.createPercentArray(columnWidths));
            table.setWidth(UnitValue.createPercentValue(100));

            // Header của bảng
            table.addHeaderCell(new Cell().add(new Paragraph("STT").setBold())
                    .setBackgroundColor(ColorConstants.LIGHT_GRAY).setTextAlignment(TextAlignment.CENTER));
            table.addHeaderCell(new Cell().add(new Paragraph("San pham").setBold())
                    .setBackgroundColor(ColorConstants.LIGHT_GRAY).setTextAlignment(TextAlignment.CENTER));
            table.addHeaderCell(new Cell().add(new Paragraph("Don gia").setBold())
                    .setBackgroundColor(ColorConstants.LIGHT_GRAY).setTextAlignment(TextAlignment.CENTER));
            table.addHeaderCell(new Cell().add(new Paragraph("So luong").setBold())
                    .setBackgroundColor(ColorConstants.LIGHT_GRAY).setTextAlignment(TextAlignment.CENTER));
            table.addHeaderCell(new Cell().add(new Paragraph("Thanh tien").setBold())
                    .setBackgroundColor(ColorConstants.LIGHT_GRAY).setTextAlignment(TextAlignment.CENTER));

            // Dữ liệu sản phẩm
            int stt = 1;
            double totalAmount = 0;
            for (BillDetailEntity detail : billDetails) {
                // Lấy thông tin sản phẩm chi tiết
                var productDetail = productDetailRepository.findById(detail.getProductDetailId()).orElse(null);
                String productName = "N/A";

                if (productDetail != null) {
                    var product = productRepository.findById(productDetail.getProductId()).orElse(null);
                    if (product != null) {
                        productName = product.getName();
                    }
                }

                double lineTotal = detail.getPrice() * detail.getQuantity();
                totalAmount += lineTotal;

                table.addCell(
                        new Cell().add(new Paragraph(String.valueOf(stt++))).setTextAlignment(TextAlignment.CENTER));
                table.addCell(new Cell().add(new Paragraph(productName)));
                table.addCell(new Cell().add(new Paragraph(currencyFormat.format(detail.getPrice())))
                        .setTextAlignment(TextAlignment.RIGHT));
                table.addCell(new Cell().add(new Paragraph(String.valueOf(detail.getQuantity())))
                        .setTextAlignment(TextAlignment.CENTER));
                table.addCell(new Cell().add(new Paragraph(currencyFormat.format(lineTotal)))
                        .setTextAlignment(TextAlignment.RIGHT));
            }

            document.add(table);

            // Tổng tiền
            document.add(new Paragraph("\n"));
            Table summaryTable = new Table(2);
            summaryTable.setWidth(UnitValue.createPercentValue(50));
            summaryTable.setHorizontalAlignment(com.itextpdf.layout.properties.HorizontalAlignment.RIGHT);

            summaryTable.addCell(new Cell().add(new Paragraph("Tong tien:").setBold()).setBorder(Border.NO_BORDER)
                    .setTextAlignment(TextAlignment.RIGHT));
            summaryTable.addCell(new Cell()
                    .add(new Paragraph(
                            currencyFormat.format(bill.getTotalAmount() != null ? bill.getTotalAmount() : totalAmount)))
                    .setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT));

            if (bill.getDiscountAmount() != null && bill.getDiscountAmount() > 0) {
                summaryTable.addCell(new Cell().add(new Paragraph("Giam gia:").setBold()).setBorder(Border.NO_BORDER)
                        .setTextAlignment(TextAlignment.RIGHT));
                summaryTable.addCell(new Cell().add(new Paragraph(currencyFormat.format(bill.getDiscountAmount())))
                        .setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT));
            }

            if (bill.getFinalAmount() != null) {
                summaryTable.addCell(new Cell().add(new Paragraph("Thanh tien:").setBold().setFontSize(14))
                        .setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT));
                summaryTable.addCell(new Cell()
                        .add(new Paragraph(currencyFormat.format(bill.getFinalAmount())).setBold().setFontSize(14))
                        .setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT));
            }

            document.add(summaryTable);

            // Footer
            document.add(new Paragraph("\n\nCam on quy khach da mua hang!")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(12)
                    .setItalic()
                    .setMarginTop(30));

            document.add(new Paragraph("Hotline: 0123456789 | Website: royaljewelry.com")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(10));

            document.close();

            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Error generating PDF for order: {}", billId, e);
            throw e;
        }
    }
}
