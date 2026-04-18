# Spring Security Rating Implementation

## Current Issue
You're using localStorage for userId, but want to use Spring Security with JWT authentication.

## Solution: Spring Security + JWT Implementation

### Step 1: Update RatingController for Spring Security

```java
@RestController
@RequestMapping("/api/ratings")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class RatingController {

    @Autowired
    private RatingRepo ratingRepo;
    
    @Autowired
    private UserRepo userRepo;

    // Save rating with Spring Security authentication
    @PostMapping("/rate")
    @Transactional
    public ResponseEntity<Map<String, Object>> saveRating(
            @RequestBody RatingRequest ratingRequest,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            logger.info("=== RATING SUBMISSION WITH SPRING SECURITY ===");
            logger.info("UserDetails: {}", userDetails.getUsername());
            
            // Extract user from JWT token
            String email = userDetails.getUsername();
            User user = userRepo.findByEmail(email);
            
            if (user == null) {
                logger.error("User not found for email: {}", email);
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.notFound().build();
            }

            // Create rating with authenticated user
            Rating rating = new Rating();
            rating.setUser(user);
            rating.setProductId(ratingRequest.getProductId());
            rating.setRating(ratingRequest.getRating());

            logger.info("Saving rating - User: {}, Product: {}, Rating: {}", 
                       user.getId(), ratingRequest.getProductId(), ratingRequest.getRating());

            // Check if rating already exists
            Optional<Rating> existingRating = ratingRepo.findByUserAndProduct(user, 
                productRepo.findById(ratingRequest.getProductId()).orElse(null));
            
            if (existingRating.isPresent()) {
                // Update existing rating
                Rating ratingToUpdate = existingRating.get();
                ratingToUpdate.setRating(ratingRequest.getRating());
                Rating savedRating = ratingRepo.save(ratingToUpdate);
                
                response.put("success", true);
                response.put("message", "Rating updated successfully");
                response.put("action", "updated");
                response.put("ratingId", savedRating.getId());
            } else {
                // Create new rating
                Rating savedRating = ratingRepo.save(rating);
                
                response.put("success", true);
                response.put("message", "Rating submitted successfully");
                response.put("action", "created");
                response.put("ratingId", savedRating.getId());
            }

            // Get updated statistics
            Product product = productRepo.findById(ratingRequest.getProductId()).orElse(null);
            if (product != null) {
                Double avgRating = ratingRepo.getAverageRatingForProduct(product);
                Long ratingCount = ratingRepo.getRatingCountForProduct(product);
                
                response.put("averageRating", avgRating != null ? avgRating : 0.0);
                response.put("ratingCount", ratingCount != null ? ratingCount : 0L);
            }
            
            response.put("userRating", ratingRequest.getRating());
            response.put("userId", user.getId());
            response.put("productId", ratingRequest.getProductId());
            
            logger.info("Rating operation completed successfully - User: {}, Product: {}, Rating: {}", 
                       user.getId(), ratingRequest.getProductId(), ratingRequest.getRating());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error processing rating request", e);
            response.put("success", false);
            response.put("message", "Error processing rating: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Get current user's ratings
    @GetMapping("/my-ratings")
    public ResponseEntity<List<Rating>> getMyRatings(@AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        User user = userRepo.findByEmail(email);
        
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        List<Rating> ratings = ratingRepo.findByUser(user);
        return ResponseEntity.ok(ratings);
    }

    // Get current user's rating for specific product
    @GetMapping("/my-rating/product/{productId}")
    public ResponseEntity<Rating> getMyProductRating(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String email = userDetails.getUsername();
        User user = userRepo.findByEmail(email);
        Product product = productRepo.findById(productId).orElse(null);
        
        if (user == null || product == null) {
            return ResponseEntity.notFound().build();
        }

        Optional<Rating> rating = ratingRepo.findByUserAndProduct(user, product);
        return rating.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.ok(null));
    }
}

// Rating Request DTO
class RatingRequest {
    private Long productId;
    private Integer rating;
    
    // Getters and setters
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
}
```

### Step 2: Update Frontend to Use JWT

```javascript
// Update RatingContext.js for JWT authentication
export const RatingProvider = ({ children }) => {
  const [userRatings, setUserRatings] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Load current user from JWT
  const getCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found - user not authenticated');
        return null;
      }

      // Decode JWT or get user info from backend
      const response = await fetch('http://localhost:8081/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const user = await response.json();
        console.log('Current user from JWT:', user);
        setCurrentUser(user);
        return user;
      } else {
        console.error('Failed to get current user');
        return null;
      }
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  };

  // Load user ratings using JWT
  const loadUserRatings = async () => {
    const user = await getCurrentUser();
    
    if (!user) {
      console.log('No authenticated user - cannot load ratings');
      setUserRatings({});
      return;
    }

    try {
      setLoading(true);
      console.log('Loading ratings for authenticated user:', user.email);
      
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8081/api/ratings/my-ratings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response && response.ok) {
        const data = await response.json();
        console.log('User ratings from JWT:', data);
        
        if (Array.isArray(data)) {
          const ratingsMap = {};
          data.forEach(rating => {
            const productId = rating.product?.id || rating.productId;
            if (productId) {
              ratingsMap[productId] = rating.rating;
            }
          });
          
          setUserRatings(ratingsMap);
          console.log('Loaded ratings from JWT authentication:', ratingsMap);
        }
      }
    } catch (error) {
      console.error('Error loading ratings with JWT:', error);
      setUserRatings({});
    } finally {
      setLoading(false);
    }
  };

  // Submit rating using JWT
  const submitRating = async (productId, rating) => {
    const user = await getCurrentUser();
    const token = localStorage.getItem('token');
    
    if (!user || !token) {
      console.error('Cannot submit rating - user not authenticated');
      return { success: false, message: 'Please login to rate products' };
    }

    try {
      console.log('Submitting rating with JWT authentication');
      console.log('User:', user.email);
      console.log('Product:', productId);
      console.log('Rating:', rating);

      const response = await fetch('http://localhost:8081/api/ratings/rate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: productId,
          rating: rating
        })
      });

      if (response && response.ok) {
        const result = await response.json();
        console.log('Rating submission result:', result);
        
        if (result && result.success) {
          // Update local state
          setUserRatings(prev => ({
            ...prev,
            [productId]: rating
          }));
          
          // Refresh ratings from server
          await loadUserRatings();
          
          return { success: true, action: result.action, message: result.message };
        } else {
          return { success: false, message: result.message };
        }
      } else {
        return { success: false, message: 'Failed to submit rating' };
      }
    } catch (error) {
      console.error('Error submitting rating with JWT:', error);
      return { success: false, message: error.message };
    }
  };

  // Get user rating for specific product
  const getUserRating = (productId) => {
    return userRatings[productId] || null;
  };

  return (
    <RatingContext.Provider value={{
      userRatings,
      loading,
      currentUser,
      submitRating,
      getUserRating,
      loadUserRatings,
      getCurrentUser
    }}>
      {children}
    </RatingContext.Provider>
  );
};
```

### Step 3: Update StarRating Component

```javascript
// Update StarRating.js to use JWT
const StarRating = ({ productId }) => {
  const { submitRating, getUserRating, currentUser } = useRating();
  
  const handleStarClick = async (starValue) => {
    if (!currentUser) {
      alert('Please login to rate products');
      return;
    }

    const result = await submitRating(productId, starValue);
    if (result.success) {
      console.log('Rating submitted successfully with JWT:', result);
      // Show success message
    } else {
      alert('Failed to submit rating: ' + result.message);
    }
  };

  // Rest of component remains the same
};
```

### Step 4: Spring Security Configuration

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/health").permitAll()
                .anyRequest().authenticated()
            )
            .exceptionHandling().authenticationEntryPoint(jwtAuthenticationEntryPoint)
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);

        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
```

## Benefits of JWT Approach

1. **No localStorage userId** - User info from JWT token
2. **Secure authentication** - Spring Security handles it
3. **Automatic user extraction** - @AuthenticationPrincipal
4. **No manual userId management** - Framework handles it
5. **Better security** - Token-based authentication

## Implementation Steps

1. **Implement Spring Security** with JWT
2. **Update RatingController** to use @AuthenticationPrincipal
3. **Update frontend** to use JWT tokens
4. **Remove localStorage userId** dependency
5. **Test authentication flow**

This eliminates the userId NULL issue completely!
