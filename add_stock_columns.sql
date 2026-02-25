-- Add stock columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS stock INTEGER NOT NULL DEFAULT 0;

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS in_stock BOOLEAN NOT NULL DEFAULT TRUE;

-- Verify the columns were added
\d products;
