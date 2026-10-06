package com.web.jewelry.business.admin.billDetailManagement.ipml;

import com.web.jewelry.business.admin.billDetailManagement.request.UpdateStatusBillDTO;
import com.web.jewelry.business.admin.billDetailManagement.service.BillDetailService;
import com.web.jewelry.dto.billDetailManagement.BillDetailResponse;
import com.web.jewelry.dto.billDetailManagement.CreateBillDetailDTO;
import com.web.jewelry.dto.billDetailManagement.ListBillDetailDTO;
import com.web.jewelry.dto.billDetailManagement.SoldProductSummaryDTO;
import com.web.jewelry.dto.billDetailManagement.SoldProductSummaryResponse;
import com.web.jewelry.entity.BillDetailEntity;
import com.web.jewelry.entity.ProductDetailEntity;
import com.web.jewelry.repository.BillDetailRepository;
import com.web.jewelry.repository.ProductDetailRepository;
import com.web.jewelry.entity.BillHistoryEntity;
import com.web.jewelry.repository.BillRepository;
import com.web.jewelry.repository.BillHistoryRepository;
import com.web.jewelry.entity.TransactionEntity;
import com.web.jewelry.repository.TransactionRepository;
import java.util.Date;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
@Validated
public class BillDetailsImpl implements BillDetailService {
    private final ModelMapper modelMapper;
    private final BillDetailRepository billDetailRepository;
    private final ProductDetailRepository productDetailRepository;
    private final BillRepository billRepository;
    private final BillHistoryRepository billHistoryRepository;

    private final TransactionRepository transactionRepository;

    @Override
    public List<ListBillDetailDTO> getBillDetails(String id, Integer deleteFlag) {
        // Fetch the list of responses from the repository
        List<BillDetailResponse> listResponse = billDetailRepository.getBillDetail(id, deleteFlag);

        List<ListBillDetailDTO> result = listResponse.stream()
                .map(response -> modelMapper.map(response, ListBillDetailDTO.class))
                .toList();

        return result;
    }

    @Override
    public String createBillDetail(CreateBillDetailDTO request) {

        // Tìm ProductDetailEntity để kiểm tra số lượng trong kho
        Optional<ProductDetailEntity> productDetailOpt = productDetailRepository.findById(request.getProductDetailId());

        if (!productDetailOpt.isPresent()) {
            throw new RuntimeException("Sản phẩm không tồn tại!");
        }

        ProductDetailEntity productDetail = productDetailOpt.get();

        // Tìm BillDetailEntity theo billId và productDetailId
        Optional<BillDetailEntity> existingBillDetailOpt = billDetailRepository.findByBillIdAndProductDetailId(
                request.getBillId(), request.getProductDetailId());

        if (existingBillDetailOpt.isPresent()) {
            // Nếu BillDetailEntity đã tồn tại, cộng dồn số lượng
            BillDetailEntity existingBillDetail = existingBillDetailOpt.get();
            int totalQuantity = existingBillDetail.getQuantity() + request.getQuantity();

            // Kiểm tra
            if (productDetail.getQuantity() < 0) {
                throw new RuntimeException("Số lượng sản phẩm trong kho không đủ!");
            }

            // Cập nhật số lượng trong BillDetailEntity
            existingBillDetail.setQuantity(totalQuantity);
            billDetailRepository.save(existingBillDetail);

            // Cập nhật tồn kho (số lượng trong kho phải giảm đi theo số lượng mới)
            productDetail.setQuantity(productDetail.getQuantity() - request.getQuantity());
            productDetailRepository.save(productDetail);

            return "Cập nhật hóa đơn chi tiết thành công!";
        } else {
            // Nếu BillDetailEntity chưa tồn tại, tạo mới
            if (request.getQuantity() > productDetail.getQuantity()) {
                throw new RuntimeException("Số lượng sản phẩm trong kho không đủ!");
            }

            BillDetailEntity newBillDetail = new BillDetailEntity();
            newBillDetail.setBillId(request.getBillId());
            newBillDetail.setProductDetailId(request.getProductDetailId());
            newBillDetail.setQuantity(request.getQuantity());
            newBillDetail.setPrice(request.getPrice());
            newBillDetail.setDeleteFlag(0);

            billDetailRepository.save(newBillDetail);

            // Cập nhật tồn kho
            productDetail.setQuantity(productDetail.getQuantity() - request.getQuantity());
            productDetailRepository.save(productDetail);

            // Cập nhật total_amount trong bill
//            Double totalAmount = billDetailRepository.findByBillId(request.getBillId()).stream()
//                    .mapToDouble(detail -> detail.getPrice() * detail.getQuantity())
//                    .sum();
//            bill.setTotalAmount(totalAmount);
//            billRepository.save(bill);

            return "Tạo hóa đơn chi tiết thành công!";
        }
    }




    @Override
    public String updateDeleteFlag(String id) {
        // Tìm hóa đơn theo ID
        Optional<BillDetailEntity> existingBillDetails = billDetailRepository.findById(id);

        // Kiểm tra nếu hóa đơn không tồn tại
        if (!existingBillDetails.isPresent()) {
            throw new RuntimeException("Hóa đơn không tồn tại");
        }

        // Lấy hóa đơn và cập nhật deleteFlag thành 1
        BillDetailEntity billDetailsEntity = existingBillDetails.get();
        int quantityToRestore = billDetailsEntity.getQuantity();  // Lấy số lượng của BillDetail để cộng lại vào kho

        // Tìm ProductDetailEntity liên quan
        Optional<ProductDetailEntity> productDetailOpt = productDetailRepository.findById(billDetailsEntity.getProductDetailId());
        if (!productDetailOpt.isPresent()) {
            throw new RuntimeException("Sản phẩm không tồn tại");
        }

        ProductDetailEntity productDetail = productDetailOpt.get();

        // Cập nhật lại số lượng trong kho
        productDetail.setQuantity(productDetail.getQuantity() + quantityToRestore);
        productDetailRepository.save(productDetail);

        // Cập nhật cờ deleteFlag của BillDetail
        billDetailsEntity.setDeleteFlag(1);
        billDetailRepository.save(billDetailsEntity);

        return "Cập nhật cờ deleteFlag và phục hồi tồn kho thành công!";
    }

    @Override
    public String updateBillStatusAndHistory(UpdateStatusBillDTO dto) {
        // Cập nhật status cho BillEntity
        var billOpt = billRepository.findById(dto.getBillId());
        if (!billOpt.isPresent()) {
            throw new RuntimeException("Không tìm thấy hóa đơn!");
        }
        var bill = billOpt.get();

        Integer oldStatus = bill.getStatus();
        bill.setStatus(dto.getStatus());
        billRepository.save(bill);

        // Nếu chuyển trạng thái từ 2 -> 3 (Đã giao hàng thành công)
        if (oldStatus != null && oldStatus == 2 && dto.getStatus() == 3) {
            // Kiểm tra đã có transaction cho bill này chưa
            boolean hasTransaction = transactionRepository.findAll().stream()
                .anyMatch(t -> bill.getId().equals(t.getBillId()));
            if (!hasTransaction) {
                // Tạo transaction mới (COD)
                TransactionEntity transaction = new TransactionEntity();
                transaction.setBillId(bill.getId());
                transaction.setMoney(bill.getFinalAmount() != null ? bill.getFinalAmount() : bill.getTotalAmount());
                transaction.setStatus(1); // Đã thanh toán
                transaction.setTypeTransaction(0); // Tiền mặt
                transaction.setTypeMethod(1); // Online (giao hàng)
                transactionRepository.save(transaction);
            }
        }

        // Tạo bản ghi BillHistoryEntity
        BillHistoryEntity history = new BillHistoryEntity();
        history.setBillId(dto.getBillId());
        history.setStatus(dto.getStatus());
        history.setNote(dto.getNotes());
        history.setCreatedDate(new Date().getTime());
        billHistoryRepository.save(history);

        return "Cập nhật trạng thái hóa đơn và lưu lịch sử thành công!";
    }

    @Override
    public List<SoldProductSummaryDTO> getAllSoldProducts(Long startDate, Long endDate) {
        // Fetch the list of sold products summary from the repository
        List<SoldProductSummaryResponse> listResponse = billDetailRepository.getAllSoldProducts(startDate, endDate);

        List<SoldProductSummaryDTO> result = listResponse.stream()
                .map(response -> {
                    SoldProductSummaryDTO dto = new SoldProductSummaryDTO();
                    dto.setId(response.getId());
                    dto.setUrlImg(response.getUrlImg());
                    dto.setProductName(response.getProductName());
                    dto.setProductCode(response.getProductCode());
                    dto.setPrice(response.getPrice());
                    dto.setColor(response.getColor());
                    dto.setSize(response.getSize());
                    dto.setQuantity(response.getQuantity());
                    dto.setTotalBills(response.getTotalBills());
                    dto.setCreatedDate(response.getCreatedDate());
                    return dto;
                })
                .toList();

        return result;
    }
}
