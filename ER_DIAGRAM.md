# MealBasket ER Diagram

## Entity-Relationship Diagram

```mermaid
erDiagram
    %% User Entity
    User {
        long id PK
        string name
        string email UK
        string password
        double weeklyBudget
    }

    %% Vendor Entity
    Vendor {
        long id PK
        string name
        string email UK
        string password
        string shopName
        string businessType
        string phone
        string address
        datetime createdAt
        double monthlyRevenueGoal
    }

    %% Admin Entity
    Admin {
        long id PK
        string name
        string email UK
        string password
    }

    %% Product Entity
    Product {
        long id PK
        string name
        double price
        text description
        text image
        string category
        int stock
        double rating
        int totalRatings
        int reviewCount
        long vendor_id FK
    }

    %% Order Entity
    Order {
        long id PK
        int quantity
        date date
        double amount
        long user_id FK
        long vendor_id FK
        double totalAmount
        string status
        string paymentStatus
        string paymentMethod
        string deliveryAddress
        string phone
        string notes
        datetime createdAt
        datetime updatedAt
        long product_id FK
    }

    %% OrderItem Entity
    OrderItem {
        long id PK
        long order_id FK
        long product_id FK
        int quantity
        double price
    }

    %% Cart Entity
    Cart {
        long id PK
        long user_id FK
        long product_id FK
        int quantity
        string itemType
        string ingredientName
        string ingredientQuantity
        datetime createdAt
        datetime updatedAt
    }

    %% Favorite Entity
    Favorite {
        long id PK
        long user_id FK
        long product_id FK
        datetime createdAt
    }

    %% MealPlan Entity
    MealPlan {
        long id PK
        long user_id FK
        string planName
        date planDate
        string mealType
        int calories
        text ingredients
        text instructions
        double estimatedCost
        string aiRecommendation
        boolean isRecommended
    }

    %% ProductReview Entity
    ProductReview {
        long id PK
        long user_id FK
        long product_id FK
        double rating
        text reviewText
        datetime createdAt
        datetime updatedAt
    }

    %% ProductRating Entity
    ProductRating {
        long id PK
        long user_id FK
        long product_id FK
        double rating
        datetime createdAt
        datetime updatedAt
    }

    %% Payment Entity
    Payment {
        long id PK
        long user_id FK
        long order_id FK
        string paymentGateway
        string transactionId UK
        string productCode
        double amount
        string currency
        string status
        string paymentRequestId
        text gatewayResponse
        datetime createdAt
        datetime updatedAt
        datetime verifiedAt
        string failureReason
        string signature
    }

    %% Promotion Entity
    Promotion {
        long id PK
        string title
        text description
        string couponCode UK
        string discountType
        double discountValue
        double minOrderAmount
        date startDate
        date expiryDate
        boolean isActive
        datetime createdAt
        long vendor_id FK
    }

    %% Recipe Entity
    Recipe {
        long id PK
        string name
        string category
        text ingredients
        text cookingInstructions
        int cookingTime
        text nutritionalValue
        boolean isActive
        datetime createdAt
        datetime updatedAt
        long vendor_id FK
    }

    %% StockAlert Entity
    StockAlert {
        long id PK
        long vendor_id FK
        long product_id FK
        int currentStock
        int minimumThreshold
        int maximumThreshold
        string alertType
        string alertMessage
        boolean isActive
        datetime alertTime
        int predictedStock
        date predictionDate
        double predictionConfidence
    }

    %% SystemPerformance Entity
    SystemPerformance {
        long id PK
        string metricType
        double metricValue
        string metricUnit
        datetime recordedTime
        text description
        double thresholdValue
        string status
        string entityType
        long entityId
    }

    %% Message Entity
    Message {
        long id PK
        string name
        string email
        text content
        boolean read
    }

    %% Relationships
    User ||--o{ Order : "places"
    User ||--o{ Cart : "has"
    User ||--o{ Favorite : "saves"
    User ||--o{ MealPlan : "creates"
    User ||--o{ ProductReview : "writes"
    User ||--o{ ProductRating : "rates"
    User ||--o{ Payment : "makes"

    Vendor ||--o{ Product : "sells"
    Vendor ||--o{ Promotion : "offers"
    Vendor ||--o{ Recipe : "provides"
    Vendor ||--o{ StockAlert : "receives"

    Product }o--|| Vendor : "belongs to"
    Product ||--o{ OrderItem : "included in"
    Product ||--o{ Cart : "added to"
    Product ||--o{ Favorite : "favorited by"
    Product ||--o{ ProductReview : "reviewed by"
    Product ||--o{ ProductRating : "rated by"
    Product ||--o{ StockAlert : "tracked for"
    Product ||--o{ Order : "ordered"
    Product }o--o{ MealPlan : "part of"

    Order }o--|| User : "placed by"
    Order }o--|| Vendor : "fulfilled by"
    Order }o--|| Product : "contains"
    Order ||--o{ OrderItem : "has"
    Order ||--o{ Payment : "has"

    OrderItem }o--|| Order : "belongs to"
    OrderItem }o--|| Product : "references"

    Cart }o--|| User : "belongs to"
    Cart }o--|| Product : "references"

    Favorite }o--|| User : "belongs to"
    Favorite }o--|| Product : "references"

    MealPlan }o--|| User : "belongs to"
    MealPlan }o--o{ Product : "includes"

    ProductReview }o--|| User : "written by"
    ProductReview }o--|| Product : "for"

    ProductRating }o--|| User : "rated by"
    ProductRating }o--|| Product : "for"

    Payment }o--|| User : "made by"
    Payment }o--|| Order : "for"

    Promotion }o--|| Vendor : "created by"

    Recipe }o--|| Vendor : "created by"

    StockAlert }o--|| Vendor : "for"
    StockAlert }o--|| Product : "for"
```

## Relationship Summary

### Core User Flow
- **User** → **Cart** → **Order** → **OrderItem** → **Product**
- **User** → **Payment** → **Order**

### Vendor Flow
- **Vendor** → **Product** → **OrderItem** → **Order**
- **Vendor** → **Promotion** (discounts)
- **Vendor** → **Recipe** (meal suggestions)
- **Vendor** → **StockAlert** (inventory management)

### Product Relationships
- **Product** belongs to **Vendor**
- **Product** reviewed by **User** (ProductReview, ProductRating)
- **Product** favorited by **User** (Favorite)
- **Product** part of **MealPlan** (many-to-many)

### Meal Planning
- **User** creates **MealPlan**
- **MealPlan** includes multiple **Products**
- **MealPlan** has AI recommendations

### Inventory Management
- **Vendor** receives **StockAlert** for low/out of stock **Products**
- **StockAlert** includes predictions for future stock needs

### System Monitoring
- **SystemPerformance** tracks metrics (response time, error rate, etc.)
- Independent entity for monitoring purposes

### Communication
- **Message** for contact form submissions
- **Admin** for system administration

## Key Constraints

1. **Unique Constraints:**
   - User.email
   - Vendor.email
   - Admin.email
   - Payment.transactionId
   - Promotion.couponCode
   - ProductReview (user_id, product_id)
   - ProductRating (user_id, product_id)

2. **Foreign Keys:**
   - Product.vendor_id → Vendor.id
   - Order.user_id → User.id
   - Order.vendor_id → Vendor.id
   - Order.product_id → Product.id (legacy)
   - OrderItem.order_id → Order.id
   - OrderItem.product_id → Product.id
   - Cart.user_id → User.id
   - Cart.product_id → Product.id
   - Favorite.user_id → User.id
   - Favorite.product_id → Product.id
   - MealPlan.user_id → User.id
   - ProductReview.user_id → User.id
   - ProductReview.product_id → Product.id
   - ProductRating.user_id → User.id
   - ProductRating.product_id → Product.id
   - Payment.user_id → User.id
   - Payment.order_id → Order.id
   - Promotion.vendor_id → Vendor.id
   - Recipe.vendor_id → Vendor.id
   - StockAlert.vendor_id → Vendor.id
   - StockAlert.product_id → Product.id

3. **Many-to-Many:**
   - MealPlan ↔ Product (via meal_plan_products junction table)
