package com.web.jewelry.business.admin.transactionManagement.service;

import com.web.jewelry.dto.transactionManagement.CreateTransactionDTO;
import com.web.jewelry.dto.transactionManagement.ListTransactionDTO;

import java.util.List;

public interface TransactionService {
    List<ListTransactionDTO> getTransaction (String id);

    String createTransaction (CreateTransactionDTO request);

    String updateDeleteFlag(String id);

    String deleteTransaction(String id);

}
