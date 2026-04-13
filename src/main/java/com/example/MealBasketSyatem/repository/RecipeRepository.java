package com.example.MealBasketSyatem.repository;

import com.example.MealBasketSyatem.entity.Recipe;
import com.example.MealBasketSyatem.entity.RecipeCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    
    // Find recipes by vendor
    List<Recipe> findByVendorIdAndIsActiveTrue(Long vendorId);
    
    // Find recipes by vendor (including inactive)
    List<Recipe> findByVendorId(Long vendorId);
    
    // Find recipes by category
    List<Recipe> findByCategoryAndIsActiveTrue(RecipeCategory category);
    
    // Find recipes by vendor and category
    List<Recipe> findByVendorIdAndCategoryAndIsActiveTrue(Long vendorId, RecipeCategory category);
    
    // Search recipes by name
    @Query("SELECT r FROM Recipe r WHERE r.vendor.id = :vendorId AND r.isActive = true AND " +
           "(LOWER(r.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(r.ingredients) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<Recipe> searchRecipes(@Param("vendorId") Long vendorId, @Param("searchTerm") String searchTerm);
    
    // Count active recipes by vendor
    @Query("SELECT COUNT(r) FROM Recipe r WHERE r.vendor.id = :vendorId AND r.isActive = true")
    Long countActiveRecipesByVendor(@Param("vendorId") Long vendorId);
    
    // Find all active recipes
    List<Recipe> findByIsActiveTrue();
    
    // Find recipe by vendor and name (for duplicate checking)
    @Query("SELECT r FROM Recipe r WHERE r.vendor.id = :vendorId AND r.name = :name AND r.isActive = true")
    Recipe findByVendorIdAndName(@Param("vendorId") Long vendorId, @Param("name") String name);
}
