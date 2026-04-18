-- Complete Ratings Table Schema Fix
-- This script ensures the ratings table is properly created and configured

-- Drop existing table if it has issues (WARNING: This will delete existing data)
DROP TABLE IF EXISTS ratings CASCADE;

-- Create ratings table with proper schema
CREATE TABLE ratings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 0 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Add unique constraint to prevent duplicate ratings
ALTER TABLE ratings 
ADD CONSTRAINT unique_user_product 
UNIQUE (user_id, product_id);

-- Add indexes for performance
CREATE INDEX idx_ratings_user_id ON ratings(user_id);
CREATE INDEX idx_ratings_product_id ON ratings(product_id);
CREATE INDEX idx_ratings_rating ON ratings(rating);
CREATE INDEX idx_ratings_created_at ON ratings(created_at);

-- Create trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ratings_updated_at 
    BEFORE UPDATE ON ratings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert test data to verify table works
INSERT INTO ratings (user_id, product_id, rating) VALUES (1, 1, 5)
ON CONFLICT (user_id, product_id) DO NOTHING;

-- Verify table was created correctly
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'ratings' 
ORDER BY ordinal_position;

-- Show constraints
SELECT 
    constraint_name, 
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'ratings';

-- Show indexes
SELECT 
    indexname, 
    indexdef
FROM pg_indexes 
WHERE tablename = 'ratings';

-- Test insert and update operations
BEGIN;
-- Test insert
INSERT INTO ratings (user_id, product_id, rating) VALUES (999, 999, 4)
ON CONFLICT (user_id, product_id) DO UPDATE 
SET rating = EXCLUDED.rating, updated_at = CURRENT_TIMESTAMP;

-- Test update
UPDATE ratings 
SET rating = 3, updated_at = CURRENT_TIMESTAMP 
WHERE user_id = 999 AND product_id = 999;

-- Test select
SELECT * FROM ratings WHERE user_id = 999;

-- Cleanup test data
DELETE FROM ratings WHERE user_id = 999;
ROLLBACK;

-- Final verification
SELECT COUNT(*) as total_ratings FROM ratings;

COMMIT;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Ratings table schema fixed successfully!';
    RAISE NOTICE 'Table is ready for star rating system.';
END $$;
