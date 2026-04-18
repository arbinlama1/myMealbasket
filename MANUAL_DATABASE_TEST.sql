-- Manual Database Test for Rating Storage
-- Run this manually in PostgreSQL to verify database is working

-- Step 1: Check if database exists
SELECT 'Database connection test: ' || current_database();

-- Step 2: Drop and recreate ratings table
DROP TABLE IF EXISTS ratings CASCADE;

CREATE TABLE ratings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 0 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Add constraints
ALTER TABLE ratings ADD CONSTRAINT unique_user_product UNIQUE (user_id, product_id);

-- Step 4: Add indexes
CREATE INDEX idx_ratings_user_id ON ratings(user_id);
CREATE INDEX idx_ratings_product_id ON ratings(product_id);

-- Step 5: Test insert operation
INSERT INTO ratings (user_id, product_id, rating) VALUES (1, 1, 5)
ON CONFLICT (user_id, product_id) DO NOTHING;

-- Step 6: Verify insert worked
SELECT 'Test insert result: ' || COUNT(*) FROM ratings WHERE user_id = 1 AND product_id = 1;

-- Step 7: Test update operation
INSERT INTO ratings (user_id, product_id, rating) VALUES (1, 1, 4)
ON CONFLICT (user_id, product_id) DO UPDATE 
SET rating = EXCLUDED.rating, updated_at = CURRENT_TIMESTAMP;

-- Step 8: Verify update worked
SELECT 'Test update result: ' || rating FROM ratings WHERE user_id = 1 AND product_id = 1;

-- Step 9: Show table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'ratings' 
ORDER BY ordinal_position;

-- Step 10: Show constraints
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'ratings';

-- Step 11: Clean up test data
DELETE FROM ratings WHERE user_id = 1 AND product_id = 1;

-- Step 12: Final verification
SELECT 'Final table status: ' || COUNT(*) || ' records in ratings table' FROM ratings;

-- Step 13: Success message
DO $$
BEGIN
    RAISE NOTICE '=== DATABASE TEST COMPLETE ===';
    RAISE NOTICE 'If you see this message, the database is working correctly!';
    RAISE NOTICE 'The ratings table is ready for the star rating system.';
    RAISE NOTICE 'Now start Spring Boot and test the API endpoints.';
END $$;
