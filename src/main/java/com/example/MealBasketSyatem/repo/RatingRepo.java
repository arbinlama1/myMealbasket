package com.example.MealBasketSyatem.repo;

import com.example.MealBasketSyatem.entity.Rating;
import com.example.MealBasketSyatem.entity.User;
import com.example.MealBasketSyatem.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RatingRepo extends JpaRepository<Rating, Long> {

    Optional<Rating> findByUserAndProduct(User user, Product product);

    List<Rating> findByUser(User user);

    List<Rating> findByProduct(Product product);

    @Query("SELECT AVG(r.rating) FROM Rating r WHERE r.product = :product")
    Double getAverageRatingForProduct(@Param("product") Product product);

    @Query("SELECT COUNT(r) FROM Rating r WHERE r.product = :product")
    Long getRatingCountForProduct(@Param("product") Product product);

    @Query("SELECT r.product.id, AVG(r.rating) as avgRating FROM Rating r GROUP BY r.product.id HAVING AVG(r.rating) >= :minRating")
    List<Object[]> findProductsWithAverageRatingAbove(@Param("minRating") Double minRating);

    @Query("SELECT r FROM Rating r WHERE r.user.id = :userId AND r.rating >= :minRating")
    List<Rating> findHighlyRatedProductsByUser(@Param("userId") Long userId, @Param("minRating") Integer minRating);

    @Query("SELECT r.user.id, COUNT(r) as ratingCount FROM Rating r WHERE r.rating >= :minRating GROUP BY r.user.id HAVING COUNT(r) >= :minRatings")
    List<Object[]> findActiveUsersWithMinRatings(@Param("minRating") Integer minRating, @Param("minRatings") Integer minRatings);

    @Query("SELECT r.product, AVG(r.rating) as avgRating FROM Rating r WHERE r.user.id IN :userIds GROUP BY r.product")
    List<Object[]> findProductsRatedBySimilarUsers(@Param("userIds") List<Long> userIds);

    @Query("SELECT r FROM Rating r WHERE r.product.category = :category AND r.rating >= :minRating")
    List<Rating> findHighlyRatedProductsByCategory(@Param("category") String category, @Param("minRating") Integer minRating);

    @Query("SELECT DISTINCT r.product FROM Rating r WHERE r.user.id != :userId AND r.product.id NOT IN " +
           "(SELECT r2.product.id FROM Rating r2 WHERE r2.user.id = :userId)")
    List<Product> findProductsNotRatedByUser(@Param("userId") Long userId);

    @Query("SELECT r.product, AVG(r.rating) as avgRating FROM Rating r GROUP BY r.product.id ORDER BY avgRating DESC")
    List<Object[]> findAllProductsOrderedByAverageRating();

    @Query("SELECT r.rating, COUNT(r) FROM Rating r WHERE r.product = :product GROUP BY r.rating ORDER BY r.rating")
    List<Object[]> getRatingDistributionForProduct(@Param("product") Product product);
}
