package com.web.jewelry.business.client.payment.request;
import lombok.Data;
import java.util.List;

@Data
public class ClientPaymentRequest {
	private String fullName;
	private String phone;
	private String province;
	private String ward;
	private String address;
	private String notes;
	private String paymentMethod; // "cash" hoặc "now"
	private Long amount; // tổng tiền
	private Long shippingFee;
	private Long discount;
	private List<Item> items;

	@Data
	public static class Item {
		private String productDetailId;
		private Integer quantity;
		private Double price;
	}
}
