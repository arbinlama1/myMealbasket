-- PostgreSQL schema for rating system

-- Rating table for storing user ratings (1-5 stars)
CREATE TABLE IF NOT EXISTS ratings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 0 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT unique_user_product UNIQUE (user_id, product_id)
);

-- User behavior table for tracking browsing behavior
CREATE TABLE IF NOT EXISTS user_behavior (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT,
    action_type VARCHAR(50) NOT NULL, -- VIEW, CLICK, ADD_TO_CART, SEARCH, CATEGORY_BROWSE
    category VARCHAR(100), -- For category browsing without specific product
    search_query VARCHAR(255), -- For search actions
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    session_id VARCHAR(100),
    duration_seconds INTEGER -- Time spent on page/product
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_product_id ON ratings(product_id);
CREATE INDEX IF NOT EXISTS idx_ratings_rating ON ratings(rating);
CREATE INDEX IF NOT EXISTS idx_user_behavior_user_id ON user_behavior(user_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_product_id ON user_behavior(product_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_action_type ON user_behavior(action_type);
CREATE INDEX IF NOT EXISTS idx_user_behavior_timestamp ON user_behavior(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_behavior_category ON user_behavior(category);

-- Add rating_count and average_rating columns to products table (optional for performance)
ALTER TABLE products ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.00;

-- Create functions for triggers
CREATE OR REPLACE FUNCTION update_product_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products 
    SET rating_count = (
        SELECT COUNT(*) FROM ratings WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    ),
    average_rating = (
        SELECT COALESCE(AVG(rating), 0) FROM ratings WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    )
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS update_product_rating_stats_trigger ON ratings;
CREATE TRIGGER update_product_rating_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_product_rating_stats();

-- Insert sample data for testing (optional)
INSERT INTO ratings (user_id, product_id, rating) VALUES 
(1, 1, 5),
(1, 2, 4),
(2, 1, 3)
ON CONFLICT (user_id, product_id) DO UPDATE SET 
    rating = EXCLUDED.rating,
    updated_at = CURRENT_TIMESTAMP;
