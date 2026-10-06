package com.web.jewelry.business.admin.billManagement.impl;

import com.web.jewelry.business.admin.billManagement.service.BillManagementService;
import com.web.jewelry.config.security.UserDetailsImpl;
import com.web.jewelry.dto.billManagement.BillResponse;
import com.web.jewelry.dto.billManagement.FindBillDTO;
import com.web.jewelry.dto.billManagement.ListBillDTO;
import com.web.jewelry.entity.BillDetailEntity;
import com.web.jewelry.entity.BillEntity;
import com.web.jewelry.entity.BillHistoryEntity;
import com.web.jewelry.entity.CustomerEntity;
import com.web.jewelry.entity.EmployeeEntity;
import com.web.jewelry.repository.BillDetailRepository;
import com.web.jewelry.repository.BillHistoryRepository;
import com.web.jewelry.repository.BillRepository;
import com.web.jewelry.repository.CustomerRepository;
import com.web.jewelry.repository.EmployeeRepository;
import com.web.jewelry.repository.ProductDetailRepository;
import com.web.jewelry.repository.ProductRepository;
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
import java.io.ByteArrayOutputStream;
import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.util.Locale;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@AllArgsConstructor
@Validated
public class BillManagementServiceImpl implements BillManagementService {

    private final BillHistoryRepository billHistoryRepository;
    private final BillRepository billRepository;
    private final BillDetailRepository billDetailRepository; // Thêm repository cho bill_details
    private final CustomerRepository customerRepository;     // Thêm repository cho customers
    private final EmployeeRepository employeeRepository;
    private final ProductDetailRepository productDetailRepository;
    private final ProductRepository productRepository;
    private final ModelMapper modelMapper;


    // Hàm sinh mã hóa đơn
    private String generateBillCode(String maxCode) {
        if (maxCode == null) {
            return "HD001"; // Mã đầu tiên
        }
        // Lấy số từ mã hiện tại và tăng lên 1
        int nextNumber = Integer.parseInt(maxCode.substring(2)) + 1;
        return String.format("HD%03d", nextNumber); // Định dạng HD001, HD002, ...
    }

    @Override
    public String createBill(BillEntity bill) {
        // Lấy mã hóa đơn lớn nhất hiện tại
        String maxCode = billRepository.findMaxBillCode();

        // Tạo mã hóa đơn mới
        String newCode = generateBillCode(maxCode);
        bill.setCode(newCode);
        bill.setStatus(0);
        bill.setDeleteFlag(0);
        bill.setTotalAmount(0.0);
        bill.setType("OFFLINE");


        // Lưu hóa đơn vào cơ sở dữ liệu
        BillEntity savedBill = billRepository.save(bill);

        // Tạo bản ghi BillHistoryEntity
        BillHistoryEntity billHistory = new BillHistoryEntity();
        billHistory.setBillId(savedBill.getId()); // Lấy ID của hóa đơn vừa lưu
        billHistory.setStatus(0); // Trạng thái = 0
        billHistory.setNote("Tạo đơn hàng thành công");


        // Lưu lịch sử hóa đơn vào cơ sở dữ liệu
        billHistoryRepository.save(billHistory);

        // Trả về thông báo thành công cùng mã hóa đơn
        return "Tạo hóa đơn thành công với mã: " + savedBill.getCode();
    }

    @Override
    public Page<ListBillDTO> getBillResponse(FindBillDTO req) {
        Pageable pageable = PageRequest.of(req.getPage(), req.getSize());

        System.out.println(req);
        Page<BillResponse> pageResponse = billRepository.getBillResponse(pageable, req);

        // Map
        Page<ListBillDTO> pageDTO = pageResponse.map(billResponse ->
                modelMapper.map(billResponse, ListBillDTO.class)
        );

        return pageDTO;
    }

    @Override
    public Optional<ListBillDTO> getInfoBill(String id) {
        return billRepository.getInfoBill(id) // Sử dụng query tùy chỉnh
                .map(billResponse -> modelMapper.map(billResponse, ListBillDTO.class));
    }

    @Override
    public List<BillEntity> getBillWithStatus(Integer status,Integer deleteFlag, String type) {
        return billRepository.findByStatusAndDeleteFlag(status, deleteFlag, type);
    }

    @Override
    public List<BillEntity> getBillAvailable(Integer status, Integer deleteFlag, String type) {
        return billRepository.findByStatusAndDeleteFlag(status, deleteFlag, type);
    }

    @Override
    public String updateDeleteFlag(String id) {
        // Tìm hóa đơn theo ID
        Optional<BillEntity> existingBill = billRepository.findBillById(id);

        // Kiểm tra nếu hóa đơn không tồn tại
        if (!existingBill.isPresent()) {
            throw new RuntimeException("Hóa đơn không tồn tại");
        }

        // Lấy hóa đơn và cập nhật deleteFlag thành 1
        BillEntity billEntity = existingBill.get();
        billEntity.setDeleteFlag(1);

        // Lưu thay đổi vào cơ sở dữ liệu
        billRepository.save(billEntity);

        return "Cập nhật cờ deleteFlag thành công!";
    }

    @Override
    public String updateBill(BillEntity bill, List<BillDetailEntity> billDetails) {
        Optional<BillEntity> existingBillOpt = billRepository.findById(bill.getId());
        if (!existingBillOpt.isPresent()) {
            throw new RuntimeException("Hóa đơn không tồn tại");
        }

        BillEntity updatedBill = existingBillOpt.get();
        updatedBill.setTotalAmount(bill.getTotalAmount());
        updatedBill.setCustomerId(bill.getCustomerId()); // Có thể là null cho "Khách lẻ"
        updatedBill.setStatus(bill.getStatus());
        updatedBill.setAddress(bill.getAddress());
        updatedBill.setPhoneNumber(bill.getPhoneNumber());
        updatedBill.setRecipient(bill.getRecipient());
        updatedBill.setDatePayment(bill.getDatePayment());
        UserDetailsImpl currentUser = (UserDetailsImpl) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        String employeeId = currentUser.getId(); // hoặc getEmployeeId()

        updatedBill.setEmployeeId(employeeId);

        billRepository.save(updatedBill);

        if (billDetails != null && !billDetails.isEmpty()) {
            for (BillDetailEntity detail : billDetails) {
                detail.setBillId(updatedBill.getId());
                Optional<BillDetailEntity> existingDetailOpt = billDetailRepository.findById(detail.getId());
                if (existingDetailOpt.isPresent()) {
                    BillDetailEntity existingDetail = existingDetailOpt.get();
                    existingDetail.setQuantity(detail.getQuantity());
                    existingDetail.setPrice(detail.getPrice());
                    existingDetail.setDeleteFlag(detail.getDeleteFlag());
                    billDetailRepository.save(existingDetail);
                } else {
                    billDetailRepository.save(detail);
                }
            }
        } else {
            List<BillDetailEntity> existingDetails = billDetailRepository.findByBillId(updatedBill.getId());
            if (existingDetails.isEmpty()) {
                throw new RuntimeException("Hóa đơn không có chi tiết sản phẩm!");
            }
        }

        BillHistoryEntity history = new BillHistoryEntity();
        history.setBillId(updatedBill.getId());
        history.setStatus(bill.getStatus());
        history.setNote("Hoàn tất thanh toán");
        billHistoryRepository.save(history);

        // Xử lý khách hàng (nếu có)
        if (bill.getCustomerId() != null) {
            Optional<CustomerEntity> customerOpt = customerRepository.findById(bill.getCustomerId());
            if (!customerOpt.isPresent()) {
                throw new RuntimeException("Khách hàng không tồn tại");
            }
            CustomerEntity customer = customerOpt.get();
            customer.setPhoneNumber(bill.getPhoneNumber() != null ? bill.getPhoneNumber() : customer.getPhoneNumber());
            customer.setAddress(bill.getAddress() != null ? bill.getAddress() : customer.getAddress());
            customerRepository.save(customer);
        } else {
            // Nếu customerId là null, không cần cập nhật bảng customers
            // Có thể ghi log hoặc xử lý thêm nếu cần
        }

        return "Cập nhật hóa đơn và các bảng liên quan thành công!";
    }

    @Override
    public Map<String, Object> adminCancelBill(String billId, String note) {
        Map<String, Object> result = new java.util.HashMap<>();
        Optional<BillEntity> billOpt = billRepository.findById(billId);
        if (!billOpt.isPresent()) {
            result.put("success", false);
            result.put("message", "Không tìm thấy đơn hàng.");
            return result;
        }
        BillEntity bill = billOpt.get();
        if (bill.getStatus() == 0 || bill.getStatus() == 2) {
            bill.setStatus(4); // 4: Đã hủy
            billRepository.save(bill);

            BillHistoryEntity history = new BillHistoryEntity();
            history.setBillId(bill.getId());
            history.setStatus(4);
            history.setNote(note != null ? note : "Admin đã hủy đơn hàng.");
            billHistoryRepository.save(history);

            result.put("success", true);
            result.put("message", "Đã hủy đơn hàng thành công.");
        } else {
            result.put("success", false);
            result.put("message", "Chỉ có thể hủy đơn hàng ở trạng thái chờ xác nhận hoặc đã xác nhận.");
        }
        return result;
    }

    @Override
    public byte[] generateBillPDF(String billId) throws Exception {
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

            // Lấy thông tin khách hàng (nếu có)
            CustomerEntity customer = null;
            if (bill.getCustomerId() != null) {
                customer = customerRepository.findById(bill.getCustomerId()).orElse(null);
            }

            // Lấy thông tin nhân viên
            EmployeeEntity employee = null;
            if (bill.getEmployeeId() != null) {
                employee = employeeRepository.findById(bill.getEmployeeId()).orElse(null);
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
            document.add(new Paragraph("Ngay tao: " + (bill.getCreatedDate() != null ? dateFormat.format(bill.getCreatedDate()) : "N/A")).setFontSize(12));
            document.add(new Paragraph("Loai: " + bill.getType()).setFontSize(12));

            // Thông tin nhân viên
            if (employee != null) {
                document.add(new Paragraph("Nhan vien: " + employee.getName()).setFontSize(12));
            }

            // Thông tin khách hàng
            document.add(new Paragraph("\nTHONG TIN KHACH HANG").setBold().setFontSize(14).setMarginTop(10));
            if (customer != null) {
                document.add(new Paragraph("Ten khach hang: " + customer.getName()).setFontSize(12));
                document.add(new Paragraph("So dien thoai: " + (customer.getPhoneNumber() != null ? customer.getPhoneNumber() : "N/A")).setFontSize(12));
                document.add(new Paragraph("Dia chi: " + (customer.getAddress() != null ? customer.getAddress() : "N/A")).setFontSize(12));
            } else {
                document.add(new Paragraph("Khach hang: Khach le").setFontSize(12));
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

            float[] columnWidths = {1, 4, 2, 2, 2};
            Table table = new Table(UnitValue.createPercentArray(columnWidths));
            table.setWidth(UnitValue.createPercentValue(100));

            // Header của bảng
            table.addHeaderCell(new Cell().add(new Paragraph("STT").setBold()).setBackgroundColor(ColorConstants.LIGHT_GRAY).setTextAlignment(TextAlignment.CENTER));
            table.addHeaderCell(new Cell().add(new Paragraph("San pham").setBold()).setBackgroundColor(ColorConstants.LIGHT_GRAY).setTextAlignment(TextAlignment.CENTER));
            table.addHeaderCell(new Cell().add(new Paragraph("Don gia").setBold()).setBackgroundColor(ColorConstants.LIGHT_GRAY).setTextAlignment(TextAlignment.CENTER));
            table.addHeaderCell(new Cell().add(new Paragraph("So luong").setBold()).setBackgroundColor(ColorConstants.LIGHT_GRAY).setTextAlignment(TextAlignment.CENTER));
            table.addHeaderCell(new Cell().add(new Paragraph("Thanh tien").setBold()).setBackgroundColor(ColorConstants.LIGHT_GRAY).setTextAlignment(TextAlignment.CENTER));

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

                table.addCell(new Cell().add(new Paragraph(String.valueOf(stt++))).setTextAlignment(TextAlignment.CENTER));
                table.addCell(new Cell().add(new Paragraph(productName)));
                table.addCell(new Cell().add(new Paragraph(currencyFormat.format(detail.getPrice()))).setTextAlignment(TextAlignment.RIGHT));
                table.addCell(new Cell().add(new Paragraph(String.valueOf(detail.getQuantity()))).setTextAlignment(TextAlignment.CENTER));
                table.addCell(new Cell().add(new Paragraph(currencyFormat.format(lineTotal))).setTextAlignment(TextAlignment.RIGHT));
            }

            document.add(table);

            // Tổng tiền
            document.add(new Paragraph("\n"));
            Table summaryTable = new Table(2);
            summaryTable.setWidth(UnitValue.createPercentValue(50));
            summaryTable.setHorizontalAlignment(com.itextpdf.layout.properties.HorizontalAlignment.RIGHT);

            summaryTable.addCell(new Cell().add(new Paragraph("Tong tien:").setBold()).setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT));
            summaryTable.addCell(new Cell().add(new Paragraph(currencyFormat.format(bill.getTotalAmount() != null ? bill.getTotalAmount() : totalAmount))).setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT));

            if (bill.getDiscountAmount() != null && bill.getDiscountAmount() > 0) {
                summaryTable.addCell(new Cell().add(new Paragraph("Giam gia:").setBold()).setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT));
                summaryTable.addCell(new Cell().add(new Paragraph(currencyFormat.format(bill.getDiscountAmount()))).setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT));
            }

            if (bill.getFinalAmount() != null) {
                summaryTable.addCell(new Cell().add(new Paragraph("Thanh tien:").setBold().setFontSize(14)).setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT));
                summaryTable.addCell(new Cell().add(new Paragraph(currencyFormat.format(bill.getFinalAmount())).setBold().setFontSize(14)).setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT));
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
            e.printStackTrace();
        }
        return null;
    }
}
