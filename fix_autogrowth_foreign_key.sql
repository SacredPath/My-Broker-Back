-- Fix foreign key reference for autogrowth system
-- Remove the foreign key constraint since profiles table doesn't have unique constraint on user_id

-- Drop the table if it exists and recreate without foreign key
DROP TABLE IF EXISTS daily_autogrowth_log;

-- Recreate without foreign key constraint
CREATE TABLE daily_autogrowth_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    tier_id INTEGER REFERENCES investment_tiers(id),
    balance_before DECIMAL(20,8) NOT NULL,
    growth_amount DECIMAL(20,8) NOT NULL,
    growth_rate DECIMAL(10,4) NOT NULL,
    balance_after DECIMAL(20,8) NOT NULL,
    growth_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed BOOLEAN DEFAULT FALSE
);

-- Grant permissions
GRANT ALL ON daily_autogrowth_log TO service_role;
GRANT ALL ON daily_autogrowth_log TO authenticated;

-- The rest of the functions should work without the foreign key constraint
