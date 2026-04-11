-- Add weeklyBudget column to users table
ALTER TABLE users ADD COLUMN weeklyBudget DECIMAL(10,2);

-- Add comment to describe the column
COMMENT ON COLUMN users.weeklyBudget IS 'Weekly budget for meal planning in rupees';
