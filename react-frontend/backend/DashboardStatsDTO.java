package com.mealbasket.dto;

public class DashboardStatsDTO {
    
    private int totalUsers;
    private int totalVendors;
    private int totalRegularUsers;
    private int totalAdmins;
    private int totalProducts;
    private int totalOrders;
    private double totalRevenue;
    private int connectedUsers;
    private int activeVendors;

    // Constructors
    public DashboardStatsDTO() {}

    public DashboardStatsDTO(int totalUsers, int totalVendors, int totalProducts) {
        this.totalUsers = totalUsers;
        this.totalVendors = totalVendors;
        this.totalProducts = totalProducts;
    }

    // Getters and Setters
    public int getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(int totalUsers) {
        this.totalUsers = totalUsers;
    }

    public int getTotalVendors() {
        return totalVendors;
    }

    public void setTotalVendors(int totalVendors) {
        this.totalVendors = totalVendors;
    }

    public int getTotalRegularUsers() {
        return totalRegularUsers;
    }

    public void setTotalRegularUsers(int totalRegularUsers) {
        this.totalRegularUsers = totalRegularUsers;
    }

    public int getTotalAdmins() {
        return totalAdmins;
    }

    public void setTotalAdmins(int totalAdmins) {
        this.totalAdmins = totalAdmins;
    }

    public int getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(int totalProducts) {
        this.totalProducts = totalProducts;
    }

    public int getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(int totalOrders) {
        this.totalOrders = totalOrders;
    }

    public double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public int getConnectedUsers() {
        return connectedUsers;
    }

    public void setConnectedUsers(int connectedUsers) {
        this.connectedUsers = connectedUsers;
    }

    public int getActiveVendors() {
        return activeVendors;
    }

    public void setActiveVendors(int activeVendors) {
        this.activeVendors = activeVendors;
    }

    @Override
    public String toString() {
        return "DashboardStatsDTO{" +
                "totalUsers=" + totalUsers +
                ", totalVendors=" + totalVendors +
                ", totalRegularUsers=" + totalRegularUsers +
                ", totalAdmins=" + totalAdmins +
                ", totalProducts=" + totalProducts +
                ", totalOrders=" + totalOrders +
                ", totalRevenue=" + totalRevenue +
                ", connectedUsers=" + connectedUsers +
                ", activeVendors=" + activeVendors +
                '}';
    }
}
