-- Rating table for storing user ratings (1-5 stars)
CREATE TABLE ratings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    UNIQUE KEY unique_user_product (user_id, product_id)
);

-- User behavior table for tracking browsing behavior
CREATE TABLE user_behavior (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    product_id BIGINT NULL,
    action_type VARCHAR(50) NOT NULL, -- VIEW, CLICK, ADD_TO_CART, SEARCH, CATEGORY_BROWSE
    category VARCHAR(100) NULL, -- For category browsing without specific product
    search_query VARCHAR(255) NULL, -- For search actions
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    session_id VARCHAR(100) NULL,
    duration_seconds INT NULL, -- Time spent on page/product
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Indexes for better performance
CREATE INDEX idx_ratings_user_id ON ratings(user_id);
CREATE INDEX idx_ratings_product_id ON ratings(product_id);
CREATE INDEX idx_ratings_rating ON ratings(rating);
CREATE INDEX idx_user_behavior_user_id ON user_behavior(user_id);
CREATE INDEX idx_user_behavior_product_id ON user_behavior(product_id);
CREATE INDEX idx_user_behavior_action_type ON user_behavior(action_type);
CREATE INDEX idx_user_behavior_timestamp ON user_behavior(timestamp);
CREATE INDEX idx_user_behavior_category ON user_behavior(category);

-- Add rating_count and average_rating columns to products table (optional for performance)
ALTER TABLE products ADD COLUMN rating_count INT DEFAULT 0;
ALTER TABLE products ADD COLUMN average_rating DECIMAL(3,2) DEFAULT 0.00;

-- Create triggers to update product rating statistics
DELIMITER //
CREATE TRIGGER update_product_rating_stats_after_insert
AFTER INSERT ON ratings
FOR EACH ROW
BEGIN
    UPDATE products 
    SET rating_count = (
        SELECT COUNT(*) FROM ratings WHERE product_id = NEW.product_id
    ),
    average_rating = (
        SELECT COALESCE(AVG(rating), 0) FROM ratings WHERE product_id = NEW.product_id
    )
    WHERE id = NEW.product_id;
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER update_product_rating_stats_after_update
AFTER UPDATE ON ratings
FOR EACH ROW
BEGIN
    UPDATE products 
    SET rating_count = (
        SELECT COUNT(*) FROM ratings WHERE product_id = NEW.product_id
    ),
    average_rating = (
        SELECT COALESCE(AVG(rating), 0) FROM ratings WHERE product_id = NEW.product_id
    )
    WHERE id = NEW.product_id;
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER update_product_rating_stats_after_delete
AFTER DELETE ON ratings
FOR EACH ROW
BEGIN
    UPDATE products 
    SET rating_count = (
        SELECT COUNT(*) FROM ratings WHERE product_id = OLD.product_id
    ),
    average_rating = (
        SELECT COALESCE(AVG(rating), 0) FROM ratings WHERE product_id = OLD.product_id
    )
    WHERE id = OLD.product_id;
END//
DELIMITER ;
