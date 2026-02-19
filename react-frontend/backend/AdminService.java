package com.mealbasket.service;

import com.mealbasket.model.User;
import com.mealbasket.model.Product;
import com.mealbasket.repository.UserRepository;
import com.mealbasket.repository.ProductRepository;
import com.mealbasket.dto.DashboardStatsDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    /**
     * Get all users from the database
     */
    public List<User> getAllUsers() {
        System.out.println("AdminService: Fetching all users from database");
        List<User> users = userRepository.findAll();
        
        // Add vendor-specific information for vendors
        users = users.stream().map(user -> {
            if ("VENDOR".equals(user.getRole())) {
                // Get product count for this vendor
                List<Product> vendorProducts = productRepository.findByVendorId(user.getId());
                user.setProductCount(vendorProducts.size());
                user.setIsConnected(vendorProducts.size() > 0);
                user.setLastActivity(vendorProducts.size() > 0 ? "Active" : "No products yet");
            } else if ("USER".equals(user.getRole())) {
                user.setIsConnected(true);
                user.setLastActivity("Active");
            } else if ("ADMIN".equals(user.getRole())) {
                user.setIsConnected(true);
                user.setLastActivity("Managing System");
            }
            return user;
        }).collect(Collectors.toList());
        
        System.out.println("AdminService: Found " + users.size() + " users");
        return users;
    }

    /**
     * Get all vendors specifically
     */
    public List<User> getAllVendors() {
        System.out.println("AdminService: Fetching all vendors from database");
        List<User> vendors = userRepository.findByRole("VENDOR");
        
        // Add vendor-specific information
        vendors = vendors.stream().map(vendor -> {
            List<Product> vendorProducts = productRepository.findByVendorId(vendor.getId());
            vendor.setProductCount(vendorProducts.size());
            vendor.setIsConnected(vendorProducts.size() > 0);
            vendor.setLastActivity(vendorProducts.size() > 0 ? "Active" : "No products yet");
            return vendor;
        }).collect(Collectors.toList());
        
        System.out.println("AdminService: Found " + vendors.size() + " vendors");
        return vendors;
    }

    /**
     * Get dashboard statistics
     */
    public DashboardStatsDTO getDashboardStats() {
        System.out.println("AdminService: Calculating dashboard statistics");
        
        List<User> allUsers = userRepository.findAll();
        List<User> vendors = userRepository.findByRole("VENDOR");
        List<User> regularUsers = userRepository.findByRole("USER");
        List<User> admins = userRepository.findByRole("ADMIN");
        List<Product> allProducts = productRepository.findAll();
        
        // Count connected users and active vendors
        long connectedUsers = allUsers.stream()
            .filter(User::getIsConnected)
            .count();
        
        long activeVendors = vendors.stream()
            .filter(User::getIsConnected)
            .count();
        
        // Calculate total revenue (sum of all product prices)
        double totalRevenue = allProducts.stream()
            .mapToDouble(product -> product.getPrice() != null ? product.getPrice() : 0.0)
            .sum();
        
        DashboardStatsDTO stats = new DashboardStatsDTO();
        stats.setTotalUsers(allUsers.size());
        stats.setTotalVendors(vendors.size());
        stats.setTotalRegularUsers(regularUsers.size());
        stats.setTotalAdmins(admins.size());
        stats.setTotalProducts(allProducts.size());
        stats.setTotalOrders(0); // Will be implemented when orders are added
        stats.setTotalRevenue(totalRevenue);
        stats.setConnectedUsers((int) connectedUsers);
        stats.setActiveVendors((int) activeVendors);
        
        System.out.println("AdminService: Statistics calculated - Users: " + stats.getTotalUsers() + 
                          ", Vendors: " + stats.getTotalVendors() + 
                          ", Products: " + stats.getTotalProducts());
        
        return stats;
    }

    /**
     * Get all products from all vendors
     */
    public List<Product> getAllProducts() {
        System.out.println("AdminService: Fetching all products from database");
        List<Product> products = productRepository.findAll();
        
        // Add vendor information to each product
        products = products.stream().map(product -> {
            if (product.getVendorId() != null) {
                User vendor = userRepository.findById(product.getVendorId()).orElse(null);
                if (vendor != null) {
                    product.setVendorName(vendor.getBusinessName() != null ? 
                                       vendor.getBusinessName() : vendor.getName());
                }
            }
            return product;
        }).collect(Collectors.toList());
        
        System.out.println("AdminService: Found " + products.size() + " products");
        return products;
    }

    /**
     * Delete a user by ID
     */
    public boolean deleteUser(Long userId) {
        System.out.println("AdminService: Deleting user with ID: " + userId);
        
        try {
            if (userRepository.existsById(userId)) {
                // First, delete all products associated with this user if they're a vendor
                User user = userRepository.findById(userId).orElse(null);
                if (user != null && "VENDOR".equals(user.getRole())) {
                    List<Product> vendorProducts = productRepository.findByVendorId(userId);
                    productRepository.deleteAll(vendorProducts);
                    System.out.println("AdminService: Deleted " + vendorProducts.size() + " products for vendor " + userId);
                }
                
                // Delete the user
                userRepository.deleteById(userId);
                System.out.println("AdminService: Successfully deleted user " + userId);
                return true;
            } else {
                System.out.println("AdminService: User " + userId + " not found");
                return false;
            }
        } catch (Exception e) {
            System.err.println("AdminService: Error deleting user " + userId + ": " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Update user role
     */
    public User updateUserRole(Long userId, String newRole) {
        System.out.println("AdminService: Updating role for user " + userId + " to " + newRole);
        
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                // Validate role
                if (!"USER".equals(newRole) && !"VENDOR".equals(newRole) && !"ADMIN".equals(newRole)) {
                    System.out.println("AdminService: Invalid role: " + newRole);
                    return null;
                }
                
                String oldRole = user.getRole();
                user.setRole(newRole);
                
                // Reset connection status based on new role
                if ("VENDOR".equals(newRole)) {
                    List<Product> vendorProducts = productRepository.findByVendorId(userId);
                    user.setProductCount(vendorProducts.size());
                    user.setIsConnected(vendorProducts.size() > 0);
                    user.setLastActivity(vendorProducts.size() > 0 ? "Active" : "No products yet");
                } else if ("USER".equals(newRole)) {
                    user.setIsConnected(true);
                    user.setLastActivity("Active");
                } else if ("ADMIN".equals(newRole)) {
                    user.setIsConnected(true);
                    user.setLastActivity("Managing System");
                }
                
                userRepository.save(user);
                System.out.println("AdminService: Successfully updated role for user " + userId + 
                                  " from " + oldRole + " to " + newRole);
                return user;
            } else {
                System.out.println("AdminService: User " + userId + " not found");
                return null;
            }
        } catch (Exception e) {
            System.err.println("AdminService: Error updating user role: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
}
