package com.web.jewelry.business.client.order.web;

import com.web.jewelry.business.client.order.request.CancelOrderRequest;
import com.web.jewelry.business.client.order.response.ClientOrderDetailResponse;
import com.web.jewelry.business.client.order.service.ClientOrderService;
import com.web.jewelry.dto.billManagement.BillResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/client/orders")
@RequiredArgsConstructor
public class ClientOrderController {

	private final ClientOrderService clientOrderService;

	/**
	 * Lấy danh sách đơn hàng của khách hàng hiện tại đang đăng nhập
	 */
	@GetMapping
	public ResponseEntity<List<BillResponse>> getCurrentCustomerOrders() {
		List<BillResponse> bills = clientOrderService.getCurrentCustomerBills();
		return ResponseEntity.ok(bills);
	}

	/**
	 * Lấy chi tiết đơn hàng của khách hàng hiện tại (bao gồm timeline, bill detail,
	 * sản phẩm, tổng tiền, ...)
	 */
	@GetMapping("/{billId}")
	public ResponseEntity<ClientOrderDetailResponse> getOrderDetail(@PathVariable String billId) {
		var detail = clientOrderService.getOrderDetailById(billId);
		return ResponseEntity.ok(detail);
	}

	@PutMapping("/{billId}/cancel")
	public ResponseEntity<String> cancelOrder(
			@PathVariable String billId,
			@RequestBody(required = false) CancelOrderRequest request) {
		String reason = request != null ? request.getReason() : null;
		clientOrderService.cancelOrder(billId, reason);
		return ResponseEntity.ok("Hủy đơn hàng thành công");
	}

	/**
	 * Tải xuống hóa đơn PDF cho đơn hàng
	 */
	@GetMapping("/{billId}/pdf")
	public ResponseEntity<byte[]> downloadOrderPDF(@PathVariable String billId) {
		try {
			byte[] pdfContent = clientOrderService.generateOrderPDF(billId);

			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_PDF);
			headers.setContentDispositionFormData("attachment", "invoice_" + billId + ".pdf");
			headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

			return ResponseEntity.ok()
					.headers(headers)
					.body(pdfContent);
		} catch (Exception e) {
			return ResponseEntity.internalServerError().build();
		}
	}
}
