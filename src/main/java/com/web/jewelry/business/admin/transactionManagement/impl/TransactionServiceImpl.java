package com.web.jewelry.business.admin.transactionManagement.impl;

import com.web.jewelry.business.admin.transactionManagement.service.TransactionService;
import com.web.jewelry.dto.transactionManagement.CreateTransactionDTO;
import com.web.jewelry.dto.transactionManagement.ListTransactionDTO;
import com.web.jewelry.dto.transactionManagement.TransactionResponse;
import com.web.jewelry.entity.TransactionEntity;
import com.web.jewelry.repository.TransactionRepository;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
@Valid
public class TransactionServiceImpl  implements TransactionService {
    private final TransactionRepository transactionRepository;
    private final ModelMapper modelMapper;


    @Override
    public List<ListTransactionDTO> getTransaction(String id) {
        List<TransactionResponse> listResponse = transactionRepository.getTransaction(id);
        return listResponse.stream()
                .map(response -> modelMapper.map(response, ListTransactionDTO.class))
                .toList();
    }

    @Override
    public String createTransaction(CreateTransactionDTO request) {
        // Kiểm tra đầu vào
        if (request.getPayments() == null || request.getPayments().isEmpty()) {
            throw new IllegalArgumentException("Danh sách thanh toán không được để trống.");
        }

        double totalAmount = request.getPayments().stream()
                .mapToDouble(CreateTransactionDTO.PaymentDetail::getMoney)
                .sum();

        if (totalAmount <= 0) {
            throw new IllegalArgumentException("Số tiền thanh toán phải lớn hơn 0.");
        }

        // Lặp qua từng phương thức thanh toán và tạo giao dịch
        for (CreateTransactionDTO.PaymentDetail payment : request.getPayments()) {
            if (payment.getMoney() == null || payment.getMoney() <= 0) {
                throw new IllegalArgumentException("Số tiền của từng phương thức phải lớn hơn 0.");
            }

            if (payment.getType() == null || (payment.getType() != 0 && payment.getType() != 1)) {
                throw new IllegalArgumentException("Loại phương thức thanh toán không hợp lệ (0: Tiền mặt, 1: Chuyển khoản).");
            }

            // Tạo TransactionEntity
            TransactionEntity transaction = new TransactionEntity();
            transaction.setBillId(request.getBillId());
            transaction.setMoney(payment.getMoney());
            transaction.setTypeTransaction(payment.getType() == 0 ? 0 : 1);
            // Gán status dựa trên type: 0 (Tiền mặt), 1 (Chuyển khoản)
            transaction.setStatus(1);

            // Lưu vào database
            transactionRepository.save(transaction);

            // Log thông tin
            if (payment.getType() == 0) {
                System.out.println("Giao dịch tiền mặt: " + payment.getMoney() + ", Status: 0");
            } else if (payment.getType() == 1) {
                System.out.println("Giao dịch chuyển khoản: " + payment.getMoney() + ", Status: 1");
            }
        }

        return "Tạo giao dịch thành công cho hóa đơn " + request.getBillId();
    }

    @Override
    public String updateDeleteFlag(String id) {
        TransactionEntity transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction không tồn tại với id: " + id));
        transaction.setStatus(transaction.getStatus() == 0 ? 1 : 0);
        transactionRepository.save(transaction);
        return "Cập nhật trạng thái thành công cho giao dịch có id: " + id;
    }

    @Override
    public String deleteTransaction(String id) {
        TransactionEntity transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction không tồn tại với id: " + id));
        transactionRepository.delete(transaction);
        return "Xóa giao dịch thành công";
    }


}
