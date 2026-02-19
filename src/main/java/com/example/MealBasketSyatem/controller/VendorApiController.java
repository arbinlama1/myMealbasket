package com.example.MealBasketSyatem.controller;

import com.example.MealBasketSyatem.dto.ApiResponse;
import com.example.MealBasketSyatem.dto.ProductDTO;
import com.example.MealBasketSyatem.entity.Product;
import com.example.MealBasketSyatem.entity.Vendor;
import com.example.MealBasketSyatem.service.VendorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Vendor API Controller
 */
@RestController
@RequestMapping("/api/vendor")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class VendorApiController {

    @Autowired
    private VendorService vendorService;

    // Get vendor by ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Vendor>> getVendorById(@PathVariable Long id) {
        try {
            Vendor vendor = vendorService.getVendorById(id)
                    .orElseThrow(() -> new RuntimeException("Vendor not found"));
            return ResponseEntity.ok(ApiResponse.success("Vendor retrieved successfully", vendor));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve vendor: " + e.getMessage()));
        }
    }

    // Update vendor by ID
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Vendor>> updateVendor(
            @PathVariable Long id, 
            @RequestBody Vendor vendorData) {
        try {
            Vendor vendor = vendorService.getVendorById(id)
                    .orElseThrow(() -> new RuntimeException("Vendor not found"));
            
            // Update vendor fields
            if (vendorData.getName() != null) {
                vendor.setName(vendorData.getName());
            }
            if (vendorData.getEmail() != null) {
                vendor.setEmail(vendorData.getEmail());
            }
            if (vendorData.getShopName() != null) {
                vendor.setShopName(vendorData.getShopName());
            }
            if (vendorData.getBusinessType() != null) {
                vendor.setBusinessType(vendorData.getBusinessType());
            }
            if (vendorData.getPhone() != null) {
                vendor.setPhone(vendorData.getPhone());
            }
            if (vendorData.getAddress() != null) {
                vendor.setAddress(vendorData.getAddress());
            }
            
            Vendor updatedVendor = vendorService.registerVendor(vendor);
            return ResponseEntity.ok(ApiResponse.success("Vendor updated successfully", updatedVendor));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update vendor: " + e.getMessage()));
        }
    }

    // Get vendor products
    @GetMapping("/{vendorId}/products")
    public ResponseEntity<ApiResponse<List<Product>>> getVendorProducts(@PathVariable Long vendorId) {
        try {
            List<Product> products = vendorService.getProducts(vendorId);
            return ResponseEntity.ok(ApiResponse.success("Vendor products retrieved successfully", products));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve vendor products: " + e.getMessage()));
        }
    }

    // Create product for vendor
    @PostMapping("/{vendorId}/products")
    public ResponseEntity<ApiResponse<Product>> createVendorProduct(
            @PathVariable Long vendorId, 
            @RequestBody ProductDTO productDTO) {
        try {
            System.out.println("Creating product for vendor " + vendorId + ": " + productDTO.getName());
            
            // Get authenticated user from security context
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
                System.err.println("User not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("User not authenticated"));
            }
            
            // Must be a vendor
            boolean isVendor = auth.getAuthorities() != null && auth.getAuthorities().stream()
                    .anyMatch(a -> "ROLE_VENDOR".equals(a.getAuthority()));
            if (!isVendor) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Access denied. Vendor role required."));
            }

            System.out.println("Authenticated vendor: " + auth.getName());
            
            String email = auth.getName();

            // Prefer vendor resolved by authenticated email to avoid ID mismatches
            Vendor vendor = vendorService.findVendorByEmail(email);
            if (vendor == null) {
                // Fallback to vendorId lookup
                vendor = vendorService.getVendorById(vendorId).orElse(null);
            }

            if (vendor == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Vendor account not found. Please register/login again."));
            }
            
            // Create Product entity from DTO
            Product product = new Product();
            product.setName(productDTO.getName());
            product.setPrice(productDTO.getPrice());
            product.setDescription(productDTO.getDescription());
            product.setImage(productDTO.getImage());
            product.setCategory(productDTO.getCategory());
            product.setVendor(vendor);
            
            Product savedProduct = vendorService.addProduct(product);
            
            System.out.println("Product created successfully with ID: " + savedProduct.getId());
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Product created successfully", savedProduct));
        } catch (Exception e) {
            System.err.println("Error creating product: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create product: " + e.getMessage()));
        }
    }

    // Update product for vendor
    @PutMapping("/{vendorId}/products/{productId}")
    public ResponseEntity<ApiResponse<Product>> updateVendorProduct(
            @PathVariable Long vendorId,
            @PathVariable Long productId, 
            @RequestBody Product product) {
        try {
            Vendor vendor = vendorService.getVendorById(vendorId)
                    .orElseThrow(() -> new RuntimeException("Vendor not found"));
            product.setVendor(vendor);
            product.setId(productId);
            vendorService.addProduct(product); // This will update the product
            return ResponseEntity.ok(ApiResponse.success("Product updated successfully", product));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update product: " + e.getMessage()));
        }
    }

    // Delete product for vendor
    @DeleteMapping("/{vendorId}/products/{productId}")
    public ResponseEntity<ApiResponse<Void>> deleteVendorProduct(
            @PathVariable Long vendorId,
            @PathVariable Long productId) {
        try {
            vendorService.getVendorById(vendorId)
                    .orElseThrow(() -> new RuntimeException("Vendor not found"));
            vendorService.deleteProduct(productId);
            return ResponseEntity.ok(ApiResponse.success("Product deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete product: " + e.getMessage()));
        }
    }
}