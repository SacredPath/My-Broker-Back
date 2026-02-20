-- Create missing tables for dashboard functionality
-- Execute this SQL in your Supabase SQL Editor

-- Create deposit_requests table (alias for deposits)
CREATE TABLE IF NOT EXISTS deposit_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    amount DECIMAL(20,8) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    method VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    transaction_hash VARCHAR(255),
    wallet_address VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    processed_at TIMESTAMPTZ
);

-- Create withdrawal_requests table (alias for withdrawals)
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    amount DECIMAL(20,8) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    method VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    wallet_address VARCHAR(255),
    transaction_hash VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    processed_at TIMESTAMPTZ
);

-- Create positions table for trading positions
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

-- Create signals table for trading signals
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

-- Create audit_log table for system audit trail
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

-- Enable Row Level Security (RLS) for all new tables
ALTER TABLE deposit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Create policies for service role access
CREATE POLICY "Service role can access all deposit_requests" ON deposit_requests
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can access all withdrawal_requests" ON withdrawal_requests
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can access all positions" ON positions
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can access all signals" ON signals
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can access all audit_log" ON audit_log
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Grant permissions
GRANT ALL ON deposit_requests TO service_role;
GRANT ALL ON withdrawal_requests TO service_role;
GRANT ALL ON positions TO service_role;
GRANT ALL ON signals TO service_role;
GRANT ALL ON audit_log TO service_role;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_deposit_requests_status ON deposit_requests(status);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_user_id ON deposit_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_positions_user_id ON positions(user_id);
CREATE INDEX IF NOT EXISTS idx_signals_user_id ON signals(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);

-- Insert some sample data for testing
INSERT INTO deposit_requests (user_id, amount, currency, method, status) 
SELECT 
    user_id, 
    1000.00, 
    'USD', 
    'bank', 
    'pending'
FROM profiles 
LIMIT 3
ON CONFLICT DO NOTHING;

INSERT INTO withdrawal_requests (user_id, amount, currency, method, status) 
SELECT 
    user_id, 
    500.00, 
    'USD', 
    'crypto', 
    'pending'
FROM profiles 
LIMIT 2
ON CONFLICT DO NOTHING;

INSERT INTO positions (user_id, symbol, quantity, entry_price, current_price)
SELECT 
    user_id,
    'BTC',
    0.1,
    45000.00,
    46000.00
FROM profiles 
LIMIT 2
ON CONFLICT DO NOTHING;

INSERT INTO signals (user_id, signal_id, symbol, action, price, target_price, is_active)
SELECT 
    user_id,
    gen_random_uuid(),
    'ETH',
    'BUY',
    3200.00,
    3500.00,
    true
FROM profiles 
LIMIT 3
ON CONFLICT DO NOTHING;

-- Create sample audit log entries
INSERT INTO audit_log (actor_user_id, actor_role, action, target_user_id, reason, created_at)
VALUES
    (gen_random_uuid(), 'admin', 'LOGIN', null, 'Admin login successful', now()),
    (gen_random_uuid(), 'admin', 'USER_UPDATE', gen_random_uuid(), 'Updated user profile', now()),
    (gen_random_uuid(), 'admin', 'DEPOSIT_APPROVE', gen_random_uuid(), 'Approved deposit request', now())
ON CONFLICT DO NOTHING;

-- Output confirmation
SELECT 'Missing tables created successfully!' as status;
