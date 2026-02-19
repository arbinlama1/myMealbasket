-- Add missing columns to products table if they don't exist
DO $$
BEGIN
    -- Add image column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='products' AND column_name='image'
    ) THEN
        ALTER TABLE products ADD COLUMN image VARCHAR(500);
    END IF;
    
    -- Add category column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='products' AND column_name='category'
    ) THEN
        ALTER TABLE products ADD COLUMN category VARCHAR(100);
    END IF;
END $$;
