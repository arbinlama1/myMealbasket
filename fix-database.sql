-- Fix database foreign key constraint issues
-- This script will clean up orphaned products and ensure data consistency

-- Connect to your PostgreSQL database and run this script

-- Step 1: Delete all products that reference non-existent vendors
DELETE FROM products WHERE vendor_id NOT IN (SELECT id FROM vendors);

-- Step 2: Check what vendors exist
SELECT 'Existing vendors:' as info;
SELECT id, name, email FROM vendors;

-- Step 3: Check what products exist after cleanup
SELECT 'Existing products after cleanup:' as info;
SELECT id, name, vendor_id FROM products;

-- Step 4: Create a test vendor if none exists
INSERT INTO vendors (name, email, password, shop_name, business_type, phone, address) 
SELECT 'Test Vendor', 'vendor@test.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKVjzieMwkOmANgNOgKQNNBDvAGK', 'Test Shop', 'Electronic', '1234567890', 'Test Address'
WHERE NOT EXISTS (SELECT 1 FROM vendors WHERE email = 'vendor@test.com');

-- Step 5: Show final state
SELECT 'Final vendors:' as info;
SELECT id, name, email FROM vendors;

SELECT 'Final products:' as info;
SELECT id, name, vendor_id FROM products;

-- Step 6: Reset sequences if needed
-- This ensures new IDs start from the correct number
SELECT setval('vendors_id_seq', (SELECT COALESCE(MAX(id), 1) FROM vendors));
SELECT setval('products_id_seq', (SELECT COALESCE(MAX(id), 1) FROM products));

SELECT 'Database fix complete!' as result;
