-- Final Complete Database Schema Fix - Execute in Supabase SQL Editor
-- This script creates tables first, then inserts data to avoid dependency errors

-- 1. Add missing columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS country VARCHAR(2),
ADD COLUMN IF NOT EXISTS kyc_status VARCHAR(20) DEFAULT 'not_submitted',
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_frozen BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS freeze_reason TEXT,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- 2. Add missing columns to deposits table  
ALTER TABLE deposits 
ADD COLUMN IF NOT EXISTS method VARCHAR(50),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS transaction_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(255),
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;

-- 3. Add missing columns to withdrawals table
ALTER TABLE withdrawals 
ADD COLUMN IF NOT EXISTS method VARCHAR(50),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending', 
ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(255),
ADD COLUMN IF NOT EXISTS transaction_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;

-- 4. Create missing deposit_requests table (alias for deposits)
CREATE TABLE IF NOT EXISTS deposit_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    amount DECIMAL(20,8) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    method VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    transaction_hash VARCHAR(255),
    wallet_address VARCHAR(255),
    rejection_reason TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    processed_at TIMESTAMPTZ
);

-- 5. Create missing withdrawal_requests table (alias for withdrawals)
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    amount DECIMAL(20,8) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    method VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    wallet_address VARCHAR(255),
    transaction_hash VARCHAR(255),
    rejection_reason TEXT,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    processed_at TIMESTAMPTZ
);

-- 6. Create missing positions table
CREATE TABLE IF NOT EXISTS positions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    quantity DECIMAL(20,8) NOT NULL,
    entry_price DECIMAL(20,8) NOT NULL,
    current_price DECIMAL(20,8),
    unrealized_pnl DECIMAL(20,8) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Create missing signals table
CREATE TABLE IF NOT EXISTS signals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    signal_id UUID NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    action VARCHAR(20) NOT NULL,
    price DECIMAL(20,8),
    target_price DECIMAL(20,8),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Create missing audit_log table (if needed for audit trail)
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    actor_user_id UUID,
    actor_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    target_user_id UUID,
    reason TEXT,
    before JSONB,
    after JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Enable Row Level Security (RLS) for all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- 10. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles(country);
CREATE INDEX IF NOT EXISTS idx_profiles_kyc_status ON profiles(kyc_status);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status);
CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_status ON deposit_requests(status);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_user_id ON deposit_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_positions_user_id ON positions(user_id);
CREATE INDEX IF NOT EXISTS idx_signals_user_id ON signals(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);

-- 11. Create policies for service role access
DROP POLICY IF EXISTS "Service role can access all profiles" ON profiles;
CREATE POLICY "Service role can access all profiles" ON profiles
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

DROP POLICY IF EXISTS "Service role can access all deposits" ON deposits;
CREATE POLICY "Service role can access all deposits" ON deposits
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

DROP POLICY IF EXISTS "Service role can access all withdrawals" ON withdrawals;
CREATE POLICY "Service role can access all withdrawals" ON withdrawals
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

DROP POLICY IF EXISTS "Service role can access all deposit_requests" ON deposit_requests;
CREATE POLICY "Service role can access all deposit_requests" ON deposit_requests
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

DROP POLICY IF EXISTS "Service role can access all withdrawal_requests" ON withdrawal_requests;
CREATE POLICY "Service role can access all withdrawal_requests" ON withdrawal_requests
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

DROP POLICY IF EXISTS "Service role can access all positions" ON positions;
CREATE POLICY "Service role can access all positions" ON positions
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

DROP POLICY IF EXISTS "Service role can access all signals" ON signals;
CREATE POLICY "Service role can access all signals" ON signals
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

DROP POLICY IF EXISTS "Service role can access all audit_log" ON audit_log;
CREATE POLICY "Service role can access all audit_log" ON audit_log
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- 12. Grant permissions
GRANT ALL ON profiles TO service_role;
GRANT ALL ON deposits TO service_role;
GRANT ALL ON withdrawals TO service_role;
GRANT ALL ON deposit_requests TO service_role;
GRANT ALL ON withdrawal_requests TO service_role;
GRANT ALL ON positions TO service_role;
GRANT ALL ON signals TO service_role;
GRANT ALL ON audit_log TO service_role;

-- 13. Insert sample data for testing (only after tables are created)
INSERT INTO deposit_requests (user_id, amount, currency, method, status) 
SELECT 
    user_id, 
    1000.00, 
    'USD', 
    'bank', 
    'pending'
ON CONFLICT DO NOTHING;

INSERT INTO withdrawal_requests (user_id, amount, currency, method, status) 
SELECT 
    user_id,
    500.00, 
    'USD', 
    'crypto', 
    'pending'
ON CONFLICT DO NOTHING;

-- Output confirmation
SELECT 'Final database schema fix completed successfully!' as status;
