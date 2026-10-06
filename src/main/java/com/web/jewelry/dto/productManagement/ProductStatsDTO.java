package com.web.jewelry.dto.productManagement;

public class ProductStatsDTO {
    private long totalProducts;    // Tổng số sản phẩm (dựa trên ProductEntity)
    private long soldProducts;     // Số sản phẩm đã bán (dựa trên BillDetailEntity)
    private long remainingProducts; // Số sản phẩm còn lại (dựa trên ProductDetailEntity)

    public ProductStatsDTO(long totalProducts, long soldProducts, long remainingProducts) {
        this.totalProducts = totalProducts;
        this.soldProducts = soldProducts;
        this.remainingProducts = remainingProducts;
    }

    // Getters và Setters
    public long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public long getSoldProducts() {
        return soldProducts;
    }

    public void setSoldProducts(long soldProducts) {
        this.soldProducts = soldProducts;
    }

    public long getRemainingProducts() {
        return remainingProducts;
    }

    public void setRemainingProducts(long remainingProducts) {
        this.remainingProducts = remainingProducts;
    }
}
