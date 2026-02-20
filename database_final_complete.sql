-- Complete Database Export with Schema + Data + Functions + Triggers
-- Generated: 2026-02-19T01:04:38.299Z
-- Project: https://rfszagckgghcygkomybc.supabase.co
-- Purpose: Full import to another Supabase instance including all database objects

-- CREATE TABLE: admin_users
CREATE TABLE admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    last_login TIMESTAMPTZ
);

-- CREATE TABLE: admin_balance_updates
CREATE TABLE admin_balance_updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    available DECIMAL(20,8) DEFAULT 0,
    locked DECIMAL(20,8) DEFAULT 0,
    amount DECIMAL(20,8) DEFAULT 0,
    usd_value DECIMAL(20,8) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    processed BOOLEAN DEFAULT false
);

-- CREATE TABLE: user_balances
CREATE TABLE user_balances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    amount DECIMAL(20,8) DEFAULT 0,
    usd_value DECIMAL(20,8) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, currency)
);

-- CREATE TABLE: wallet_balances
CREATE TABLE wallet_balances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    available DECIMAL(20,8) DEFAULT 0,
    locked DECIMAL(20,8) DEFAULT 0,
    total DECIMAL(20,8) GENERATED ALWAYS AS (available + locked) STORED,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, currency)
);

-- CREATE TABLE: investment_tiers
CREATE TABLE investment_tiers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    min_amount DECIMAL(20,8) NOT NULL,
    max_amount DECIMAL(20,8),
    daily_roi DECIMAL(5,4) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- CREATE TABLE: daily_autogrowth_log
CREATE TABLE daily_autogrowth_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    tier_id INTEGER REFERENCES investment_tiers(id),
    balance_before DECIMAL(20,8) NOT NULL,
    growth_amount DECIMAL(20,8) NOT NULL,
    growth_rate DECIMAL(5,4) NOT NULL,
    balance_after DECIMAL(20,8) NOT NULL,
    growth_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    processed BOOLEAN DEFAULT false
);

-- CREATE TABLE: notifications
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    type VARCHAR(50) DEFAULT 'system',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- CREATE TABLE: profiles
CREATE TABLE profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(255),
    phone VARCHAR(20),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- CREATE TABLE: deposits
CREATE TABLE deposits (
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

-- CREATE TABLE: withdrawals
CREATE TABLE withdrawals (
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

-- CREATE TABLE: kyc_documents
CREATE TABLE kyc_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    file_url TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    reviewed_at TIMESTAMPTZ,
    reviewer_id UUID
);

-- CREATE TABLE: support_tickets
CREATE TABLE support_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open',
    priority VARCHAR(20) DEFAULT 'medium',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID
);

-- CREATE TABLE: signal_details
CREATE TABLE signal_details (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    signal_id UUID NOT NULL,
    signal_type VARCHAR(50) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    action VARCHAR(20) NOT NULL,
    price DECIMAL(20,8) NOT NULL,
    quantity DECIMAL(20,8) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- CREATE TABLE: trading_signals
CREATE TABLE trading_signals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    string_id VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(20,8) NOT NULL,
    category VARCHAR(50),
    risk_level VARCHAR(20),
    type VARCHAR(50),
    access_duration INTEGER,
    features JSONB DEFAULT '{}',
    strategy TEXT,
    performance DECIMAL(5,4),
    requirements TEXT,
    purchase_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,4),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);


-- AUTH TABLES (Supabase System Tables)
-- Note: These are Supabase auth system tables and may need special handling

-- auth.users table structure (Supabase manages this table)
-- Columns: id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, recovery_token, email_change_token_new, email_change, last_sign_in_at, created_at, updated_at, phone, phone_confirmed_at, banned_until, is_sso_user, sso_provider_id, sso_provider_user_id, new_email

-- auth.refresh_tokens table structure (Supabase manages this table)
-- Columns: id, instance_id, user_id, refresh_token, revoked, created_at, expires_at, parent, status

-- Sample auth.users data (if needed for migration)
-- INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at, last_sign_in_at) VALUES ('uuid-here', 'email@example.com', '2026-02-18T00:00:00Z', '2026-02-18T00:00:00Z', '2026-02-18T00:00:00Z', '2026-02-18T00:00:00Z');


-- FUNCTIONS AND TRIGGERS

-- FUNCTION: calculate_daily_autogrowth
CREATE OR REPLACE FUNCTION calculate_daily_autogrowth()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_date DATE := CURRENT_DATE;
    tier_record RECORD;
    user_balance RECORD;
    growth_amount DECIMAL(20,8);
    new_balance DECIMAL(20,8);
BEGIN
    -- Process each user who has balances
    FOR user_balance IN 
        SELECT DISTINCT 
            ub.user_id,
            ub.currency,
            ub.amount as balance_amount,
            COALESCE(wb.total, ub.amount) as total_balance
        FROM user_balances ub
        LEFT JOIN wallet_balances wb ON ub.user_id = wb.user_id AND ub.currency = wb.currency
        WHERE ub.amount > 0 OR wb.total > 0
    LOOP
        -- Skip if already processed today
        IF EXISTS (
            SELECT 1 FROM daily_autogrowth_log 
            WHERE user_id = user_balance.user_id 
                AND currency = user_balance.currency 
                AND growth_date = current_date
        ) THEN
            CONTINUE;
        END IF;
        
        -- Determine tier based on total balance
        SELECT it.id, it.daily_roi INTO tier_record
        FROM investment_tiers it
        WHERE user_balance.total_balance >= it.min_amount
                AND (it.max_amount IS NULL OR user_balance.total_balance <= it.max_amount)
                AND it.is_active = true
            ORDER BY it.min_amount DESC
            LIMIT 1;
        
        -- Skip if no tier found
        IF tier_record.id IS NULL THEN
            CONTINUE;
        END IF;
        
        -- Calculate growth amount
        growth_amount := user_balance.total_balance * (tier_record.daily_roi / 100.0);
        new_balance := user_balance.total_balance + growth_amount;
        
        -- Update user balance
        UPDATE user_balances 
        SET 
            amount = new_balance,
            usd_value = new_balance,
            updated_at = NOW()
        WHERE user_id = user_balance.user_id 
            AND currency = user_balance.currency;
        
        -- Update wallet balance if exists
        UPDATE wallet_balances 
        SET 
            available = new_balance,
            updated_at = NOW()
        WHERE user_id = user_balance.user_id 
            AND currency = user_balance.currency;
        
        -- Log the autogrowth
        INSERT INTO daily_autogrowth_log (
            user_id, currency, tier_id, balance_before, 
            growth_amount, growth_rate, balance_after, growth_date
        ) VALUES (
            user_balance.user_id, 
            user_balance.currency, 
            tier_record.id, 
            user_balance.total_balance, 
            growth_amount, 
            tier_record.daily_roi, 
            new_balance, 
            current_date
        );
        
        -- Create notification for user
        INSERT INTO notifications (
            user_id, type, title, message, is_read, created_at
        ) VALUES (
            user_balance.user_id,
            'system',
            'Daily Growth Applied',
            'Your balance grew by ' || growth_amount || ' today (' || (tier_record.daily_roi * 100) || '% growth rate). New balance: ' || new_balance,
            false,
            NOW()
        );
        
    END LOOP;
END;
$$;

-- FUNCTION: trigger_daily_autogrowth
CREATE OR REPLACE FUNCTION trigger_daily_autogrowth()
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    users_processed INTEGER,
    total_growth DECIMAL(20,8)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    users_count INTEGER;
    total_growth_amount DECIMAL(20,8);
BEGIN
    -- Calculate autogrowth
    PERFORM calculate_daily_autogrowth();
    
    -- Get results
    SELECT COUNT(*), COALESCE(SUM(growth_amount), 0) 
    INTO users_count, total_growth_amount
    FROM daily_autogrowth_log 
    WHERE growth_date = CURRENT_DATE AND processed = FALSE;
    
    -- Mark as processed
    UPDATE daily_autogrowth_log 
    SET processed = TRUE 
    WHERE growth_date = CURRENT_DATE;
    
    success := true;
    message := 'Daily autogrowth processed for ' || users_count || ' users with total growth of ' || total_growth_amount;
    users_processed := users_count;
    total_growth := total_growth_amount;
    
    RETURN NEXT;
END;
$$;

-- FUNCTION: process_admin_balance_updates
CREATE OR REPLACE FUNCTION process_admin_balance_updates()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Process wallet balance updates separately
    INSERT INTO wallet_balances (user_id, currency, available, locked, created_at, updated_at)
    SELECT 
        abu.user_id,
        abu.currency,
        abu.available,
        abu.locked,
        NOW(),
        NOW()
    FROM admin_balance_updates abu
    WHERE abu.processed = FALSE
      AND (abu.available != 0 OR abu.locked != 0)
    ON CONFLICT (user_id, currency) DO UPDATE SET
        available = EXCLUDED.available,
        locked = EXCLUDED.locked,
        updated_at = NOW();
    
    -- Process user balance updates separately
    INSERT INTO user_balances (user_id, currency, amount, usd_value, created_at, updated_at)
    SELECT 
        abu.user_id,
        abu.currency,
        abu.amount,
        abu.usd_value,
        NOW(),
        NOW()
    FROM admin_balance_updates abu
    WHERE abu.processed = FALSE
      AND (abu.amount != 0 OR abu.usd_value != 0)
      -- Exclude records that were already processed for wallet balances
      AND NOT (abu.available != 0 OR abu.locked != 0)
    ON CONFLICT (user_id, currency) DO UPDATE SET
        amount = EXCLUDED.amount,
        usd_value = EXCLUDED.usd_value,
        updated_at = NOW();
    
    -- Mark all as processed
    UPDATE admin_balance_updates 
    SET processed = TRUE 
    WHERE processed = FALSE;
END;
$$;

-- DATA: admin_users
-- Records: 4
INSERT INTO admin_users (id, user_id, email, full_name, role, permissions, is_active, created_at, updated_at, last_login) VALUES ('caf28c47-758a-4d15-b458-1da6db806b0b', 'aef319f1-3825-497e-af26-62fcf1b0a0a8', 'admin@PALANTIR.online', 'ADMIN STAFF', 'admin', '{"dashboard": true, "users": true, "trading": true}', true, '2026-02-12T16:06:55.576+00:00', '2026-02-12T16:06:57.379345+00:00', NULL);
INSERT INTO admin_users (id, user_id, email, full_name, role, permissions, is_active, created_at, updated_at, last_login) VALUES ('707883d7-9a93-4a14-af51-6c559de578d8', '41c9b06e-678d-4d64-9eff-403c3f5d08f2', 'shelly@gmail.com', 'Shelly Mcclenny', 'admin', '{"dashboard": true, "users": true, "trading": true}', true, '2026-02-12T16:08:20.633+00:00', '2026-02-12T16:08:22.091339+00:00', NULL);
INSERT INTO admin_users (id, user_id, email, full_name, role, permissions, is_active, created_at, updated_at, last_login) VALUES ('43a54987-9f0e-4b61-a914-f783733f982e', 'ee521ecd-89c7-45c6-acaa-3add556362ed', 'adamsandler@gmail.com', 'adam sandler', 'admin', '{"dashboard":true,"users":true,"trading":true}', true, '2026-02-18T12:12:30.45+00:00', '2026-02-18T12:12:32.43696+00:00', NULL);
INSERT INTO admin_users (id, user_id, email, full_name, role, permissions, is_active, created_at, updated_at, last_login) VALUES ('c74d06f0-131f-4380-97ff-ad8d30774de3', 'bdc47df8-98e1-4bdb-b378-a833ad8ac59d', 'jsnre@gmail.com', '25  Savage', 'admin', '{"dashboard":true,"users":true,"trading":true}', true, '2026-02-18T17:24:29.877+00:00', '2026-02-18T17:24:25.21987+00:00', NULL);

-- DATA: admin_balance_updates
-- Records: 37
INSERT INTO admin_balance_updates (id, user_id, currency, available, locked, amount, usd_value, created_at, updated_at, processed) VALUES ('371c3ce4-cd53-4eab-9608-20d1e7fc252c', '8c974284-3ca1-4184-83bc-7c17480d8e55', 'USD', 0, 0, 0, 0, '2026-02-14T10:26:57.485929+00:00', '2026-02-14T10:26:57.485929+00:00', true);
INSERT INTO admin_balance_updates (id, user_id, currency, available, locked, amount, usd_value, created_at, updated_at, processed) VALUES ('43550e1e-a744-4301-bd55-68d94c6b177d', '8c974284-3ca1-4184-83bc-7c17480d8e55', 'USD', 0, 0, 500, 500, '2026-02-14T10:49:43.590232+00:00', '2026-02-14T10:49:43.590232+00:00', true);
INSERT INTO admin_balance_updates (id, user_id, currency, available, locked, amount, usd_value, created_at, updated_at, processed) VALUES ('4ce35a39-6aec-46b0-b7d8-e540cb28f948', '8c974284-3ca1-4184-83bc-7c17480d8e55', 'USD', 0, 0, 0, 0, '2026-02-14T10:49:44.405721+00:00', '2026-02-14T10:49:44.405721+00:00', true);
INSERT INTO admin_balance_updates (id, user_id, currency, available, locked, amount, usd_value, created_at, updated_at, processed) VALUES ('5f4701f2-dd50-4531-ad74-4479e1d67db5', '5261222f-07e1-4c61-a7e6-9d5919c96f73', 'USD', 0, 0, 200, 200, '2026-02-14T10:52:12.6048+00:00', '2026-02-14T10:52:12.6048+00:00', true);
INSERT INTO admin_balance_updates (id, user_id, currency, available, locked, amount, usd_value, created_at, updated_at, processed) VALUES ('04dd48a7-7ba5-40e3-89a8-026cf14896d7', '5261222f-07e1-4c61-a7e6-9d5919c96f73', 'USD', 0, 0, 0, 0, '2026-02-14T10:52:13.763672+00:00', '2026-02-14T10:52:13.763672+00:00', true);
INSERT INTO admin_balance_updates (id, user_id, currency, available, locked, amount, usd_value, created_at, updated_at, processed) VALUES ('614bd8b1-a66b-4962-ba4d-0b6b88ce364a', '5261222f-07e1-4c61-a7e6-9d5919c96f73', 'USD', 0, 0, 0, 0, '2026-02-14T10:54:00.850947+00:00', '2026-02-14T10:54:00.850947+00:00', true);
INSERT INTO admin_balance_updates (id, user_id, currency, available, locked, amount, usd_value, created_at, updated_at, processed) VALUES ('1d839422-332a-401e-8650-f7a016b36d57', '5261222f-07e1-4c61-a7e6-9d5919c96f73', 'USD', 200, 0, 0, 0, '2026-02-14T10:54:01.759505+00:00', '2026-02-14T10:54:01.759505+00:00', true);
INSERT INTO admin_balance_updates (id, user_id, currency, available, locked, amount, usd_value, created_at, updated_at, processed) VALUES ('1425fc03-7823-44aa-8aa1-5643dfd6faad', '5261222f-07e1-4c61-a7e6-9d5919c96f73', 'USD', 0, 0, 0, 0, '2026-02-14T11:47:26.801845+00:00', '2026-02-14T11:47:26.801845+00:00', true);
INSERT INTO admin_balance_updates (id, user_id, currency, available, locked, amount, usd_value, created_at, updated_at, processed) VALUES ('77b71d7a-78da-4697-81f8-06b57266fe05', '5261222f-07e1-4c61-a7e6-9d5919c96f73', 'USD', 20000, 0, 0, 0, '2026-02-14T11:47:28.006562+00:00', '2026-02-14T11:47:28.006562+00:00', true);
INSERT INTO admin_balance_updates (id, user_id, currency, available, locked, amount, usd_value, created_at, updated_at, processed) VALUES ('976b5fa2-b27f-49b4-b83a-281f32cbbea3', 'c9cf0fff-53d0-49b4-90e3-75d85cbbc357', 'USD', 10378, 0, 0, 0, '2026-02-14T19:52:27.034192+00:00', '2026-02-14T19:52:27.034192+00:00', true);
INSERT INTO admin_balance_updates (id, user_id, currency, available, locked, amount, usd_value, created_at, updated_at, processed) VALUES ('6037db20-b703-485a-b4b7-a37a5adb846b', 'c9cf0fff-53d0-49b4-90e3-75d85cbbc357', 'USD', 0, 0, 100000, 100000, '2026-02-14T19:57:53.024926+00:00', '2026-02-14T19:57:53.024926+00:00', true);
INSERT INTO admin_balance_updates (id, user_id, currency, available, locked, amount, usd_value, created_at, updated_at, processed) VALUES ('48b26459-81b6-4986-9216-3b026d617b5b', 'c9cf0fff-53d0-49b4-90e3-75d85cbbc357', 'USD', 10036, 0, 0, 0, '2026-02-14T19:57:58.352085+00:00', '2026-02-14T19:57:58.352085+00:00', true);
INSERT INTO admin_balance_updates (id, user_id, currency, available, locked, amount, usd_value, created_at, updated_at, processed) VALUES ('de5f268d-25ca-465a-bdcb-2a295eb2efd1', 'c9cf0fff-53d0-49b4-90e3-75d85cbbc357', 'USD', 0, 0, 1000000, 0, '2026-02-15T02:02:04.095416+00:00', '2026-02-15T02:02:04.095416+00:00', true);
INSERT INTO admin_balance_updates (id, user_id, currency, available, locked, amount, usd_value, created_at, updated_at, processed) VALUES ('d8193e20-3c80-4289-bda9-fcb90f88c0a0', 'c9cf0fff-53d0-49b4-90e3-75d85cbbc357', 'USD', 0, 0, 0, 0, '2026-02-15T02:02:05.606733+00:00', '2026-02-15T02:02:05.606733+00:00', true);
INSERT INTO admin_balance_updates (id, user_id, currency, available, locked, amount, usd_value, created_at, updated_at, processed) VALUES ('7a3515bf-693f-431d-84b2-02bf0d2fdf11', 'e2ae0986-8b81-4df7-871f-8330ee9f8a85', 'USD', 1000, 1000, 0, 0, '2026-02-17T15:36:15.464509+00:00', '2026-02-17T15:36:15.464509+00:00', true);
INSERT INTO admin_balance_updates (id, user_id, currency, available, locked, amount, usd_value, created_at, updated_at, processed) VALUES ('3b7c3fc2-e4ba-478b-b825-89b667d8ffcc', 'e2ae0986-8b81-4df7-871f-8330ee9f8a85', 'USD', 0, 0, 0, 0, '2026-02-17T15:41:10.285143+00:00', '2026-02-17T15:41:10.285143+00:00', true);
INSERT INTO admin_balance_updates (id, user_id, currency, available, locked, amount, usd_value, created_at, updated_at, processed) VALUES ('7c6c9b03-114b-491d-8f78-d115bd606226', 'e2ae0986-8b81-4df7-871f-8330ee9f8a85', 'USD', 500, 500, 0, 0, '2026-02-17T15:41:11.190774+00:00', '2026-02-17T15:41:11.190774+00:00', true);
INSERT INTO admin_balance_updates (id, user_id, currency, available, locked, amount, usd_value, created_at, updated_at, processed) VALUES ('1a88ac5e-a9ea-4b00-8885-a610e7e55e70', 'e2ae0986-8b81-4df7-871f-8330ee9f8a85', 'USD', 0, 0, 500, 500, '2026-02-17T15:43:16.468991+00:00', '2026-02-17T15:43:16.468991+00:00', true);
INSERT INTO admin_balance_updates (id, user_id, currency, available, locked, amount, usd_value, created_at, updated_at, processed) VALUES ('b11e19ef-db7e-4862-96d2-5bdb947d12d0', 'e2ae0986-8b81-4df7-871f-8330ee9f8a85', 'USD', 500, 500, 0, 0, '2026-02-17T15:43:17.281709+00:00', '2026-02-17T15:43:17.281709+00:00', true);
INSERT INTO admin_balance_updates (id, user_id, currency, available, locked, amount, usd_value, created_at, updated_at, processed) VALUES ('a3fc0b08-fc46-4ded-a08e-6f18bbcebcb6', 'c9cf0fff-53d0-49b4-90e3-75d85cbbc357', 'USD', 0, 0, 70000467, 70068899, '2026-02-17T16:14:31.302107+00:00', '2026-02-17T16:14:31.302107+00:00', true);
INSERT INTO admin_balance_updates (id, user_id, currency, available, locked, amount, usd_value, created_at, updated_at, processed) VALUES ('b69d6c1b-6ece-44bd-9568-f3f4e23c0498', 'c9cf0fff-53d0-49b4-90e3-75d85cbbc357', 'USD', 0, 0, 0, 0, '2026-02-17T16:14:33.336544+00:00', '2026-02-17T16:14:33.336544+00:00', true);
INSERT INTO admin_balance_updates (id, user_id, currency, available, locked, amount, usd_value, created_at, updated_at, processed) VALUES ('a57912e7-7a73-4cb9-823f-7d6f0d978d88', 'e2ae0986-8b81-4df7-871f-8330ee9f8a85', 'USD', 0, 0, 999.99, 999.99, '2026-02-17T17:25:05.201995+00:00', '2026-02-17T17:25:05.201995+00:00', true);
INSERT INTO admin_balance_updates (id, user_id, currency, available, locked, amount, usd_value, created_at, updated_at, processed) VALUES ('e5dde78b-6249-4962-aa1e-18a9e6379811', 'e2ae0986-8b81-4df7-871f-8330ee9f8a85', 'USD', 500, 500, 0, 0, '2026-02-17T17:25:06.626074+00:00', '2026-02-17T17:25:06.626074+00:00', true);
INSERT INTO admin_balance_updates (id, user_id, currency, available, locked, amount, usd_value, created_at, updated_at, processed) VALUES ('1ee501ab-f6bf-4df2-8e22-932eae08e62b', 'e2ae0986-8b81-4df7-871f-8330ee9f8a85', 'USD', 0, 0, 300, 300, '2026-02-17T18:05:59.387362+00:00', '2026-02-17T18:05:59.387362+00:00', true);
INSERT INTO admin_balance_updates (id, user_id, currency, available, locked, amount, usd_value, created_at, updated_at, processed) VALUES ('083de486-197c-410f-a201-34c06db65096', 'e2ae0986-8b81-4df7-871f-8330ee9f8a85', 'USD', 0, 0, 0, 0, '2026-02-17T18:06:00.166822+00:00', '2026-02-17T18:06:00.166822+00:00', true);
INSERT INTO admin_balance_updates (id, user_id, currency, available, locked, amount, usd_value, created_at, updated_at, processed) VALUES ('6af3a369-5d93-4c6a-be74-8616f8b6c140', 'e2ae0986-8b81-4df7-871f-8330ee9f8a85', 'USD', 0, 0, 200, 0, '2026-02-18T06:33:23.85845+00:00', '2026-02-18T06:33:23.85845+00:00', true);
INSERT INTO admin_balance_updates (id, user_id, currency, available, locked, amount, usd_value, created_at, updated_at, processed) VALUES ('76a0dc8a-ad1f-43bb-9c99-f7f4934e5090', 'e2ae0986-8b81-4df7-871f-8330ee9f8a85', 'USD', 200, 0, 0, 0, '2026-02-18T06:33:25.32125+00:00', '2026-02-18T06:33:25.32125+00:00', true);
INSERT INTO admin_balance_updates (id, user_id, currency, available, locked, amount, usd_value, created_at, updated_at, processed) VALUES ('1add9fd3-94de-4a43-bdd1-f977d3e07fa3', 'e2ae0986-8b81-4df7-871f-8330ee9f8a85', 'USD', 0, 0, 900, 900, '2026-02-18T06:47:55.642942+00:00', '2026-02-18T06:47:55.642942+00:00', true);
INSERT INTO admin_balance_updates (id, user_id, currency, available, locked, amount, usd_value, created_at, updated_at, processed) VALUES ('aae8923c-e860-4d33-9bf3-c59463f8ac65', 'e2ae0986-8b81-4df7-871f-8330ee9f8a85', 'USD', 0, 0, 900, 900, '2026-02-18T06:48:08.529864+00:00', '2026-02-18T06:48:08.529864+00:00', true);
INSERT INTO admin_balance_updates (id, user_id, currency, available, locked, amount, usd_value, created_at, updated_at, processed) VALUES ('c66778e0-fd74-40ce-ae21-82edc99bad9e', '8c974284-3ca1-4184-83bc-7c17480d8e55', 'USD', 0, 0, 0, 0, '2026-02-18T06:53:25.450787+00:00', '2026-02-18T06:53:25.450787+00:00', true);
INSERT INTO admin_balance_updates (id, user_id, currency, available, locked, amount, usd_value, created_at, updated_at, processed) VALUES ('237c191e-5254-4309-95f5-075a8c3c04c5', '8c974284-3ca1-4184-83bc-7c17480d8e55', 'USD', 0, 0, 500, 500, '2026-02-18T08:36:30.115571+00:00', '2026-02-18T08:36:30.115571+00:00', true);
INSERT INTO admin_balance_updates (id, user_id, currency, available, locked, amount, usd_value, created_at, updated_at, processed) VALUES ('72c26cc0-8094-4655-a12a-39482c7c214c', '8c974284-3ca1-4184-83bc-7c17480d8e55', 'USD', 0, 0, 500, 500, '2026-02-18T08:40:37.511257+00:00', '2026-02-18T08:40:37.511257+00:00', true);
INSERT INTO admin_balance_updates (id, user_id, currency, available, locked, amount, usd_value, created_at, updated_at, processed) VALUES ('d3286647-713b-42c4-a437-ca74b1b20fa8', '8c974284-3ca1-4184-83bc-7c17480d8e55', 'USD', 0, 0, 600, 600, '2026-02-18T08:41:46.733791+00:00', '2026-02-18T08:41:46.733791+00:00', true);
INSERT INTO admin_balance_updates (id, user_id, currency, available, locked, amount, usd_value, created_at, updated_at, processed) VALUES ('1b107a95-b0e7-49bc-8bd2-3739f5c99ed4', '8c974284-3ca1-4184-83bc-7c17480d8e55', 'USD', 0, 0, 400, 400, '2026-02-18T08:50:39.424327+00:00', '2026-02-18T08:50:39.424327+00:00', true);
INSERT INTO admin_balance_updates (id, user_id, currency, available, locked, amount, usd_value, created_at, updated_at, processed) VALUES ('a29573bf-4c96-4096-ba36-8146c91f6024', '8c974284-3ca1-4184-83bc-7c17480d8e55', 'USD', 200, 200, 0, 0, '2026-02-18T08:50:40.40474+00:00', '2026-02-18T08:50:40.40474+00:00', true);
INSERT INTO admin_balance_updates (id, user_id, currency, available, locked, amount, usd_value, created_at, updated_at, processed) VALUES ('9a49cf0e-1b93-4505-a0b5-8ace0a744d17', 'e2ae0986-8b81-4df7-871f-8330ee9f8a85', 'USD', 0, 0, 3000, 3000, '2026-02-18T08:51:18.231947+00:00', '2026-02-18T08:51:18.231947+00:00', true);
INSERT INTO admin_balance_updates (id, user_id, currency, available, locked, amount, usd_value, created_at, updated_at, processed) VALUES ('316f2878-7572-439b-9760-2a5cac656bb3', 'e2ae0986-8b81-4df7-871f-8330ee9f8a85', 'USD', 1300, 1700, 0, 0, '2026-02-18T08:51:19.188672+00:00', '2026-02-18T08:51:19.188672+00:00', true);

-- DATA: user_balances
-- Records: 5
INSERT INTO user_balances (id, user_id, currency, amount, usd_value, created_at, updated_at) VALUES ('6048c582-c71d-450c-983e-8931672b4852', 'c9cf0fff-53d0-49b4-90e3-75d85cbbc357', 'USD', 0, 0, '2026-02-14T19:52:20.663+00:00', '2026-02-17T16:14:33.74042+00:00');
INSERT INTO user_balances (id, user_id, currency, amount, usd_value, created_at, updated_at) VALUES ('752dfe30-170e-461f-a061-810f1645427e', '5261222f-07e1-4c61-a7e6-9d5919c96f73', 'USD', 20007.14, 20007.14, '2026-02-14T06:14:09.422+00:00', '2026-02-18T12:22:22.272614+00:00');
INSERT INTO user_balances (id, user_id, currency, amount, usd_value, created_at, updated_at) VALUES ('d6525562-6c99-4cf6-b0b9-9242e582adbd', '560e27b0-5808-4301-ad19-91d33ff1491a', 'USD', 20007.14, 20007.14, '2026-02-14T06:11:34.749+00:00', '2026-02-18T12:22:22.272614+00:00');
INSERT INTO user_balances (id, user_id, currency, amount, usd_value, created_at, updated_at) VALUES ('810db0dc-5ced-405d-8633-62c1608579e4', '8c974284-3ca1-4184-83bc-7c17480d8e55', 'USD', 400.4, 400.4, '2026-02-14T06:15:56.958+00:00', '2026-02-18T12:22:22.272614+00:00');
INSERT INTO user_balances (id, user_id, currency, amount, usd_value, created_at, updated_at) VALUES ('663a1268-f1c0-4c19-afc1-66adff1bf802', 'e2ae0986-8b81-4df7-871f-8330ee9f8a85', 'USD', 3001.929, 3001.929, '2026-02-17T15:36:13.19+00:00', '2026-02-18T12:22:22.272614+00:00');

-- DATA: wallet_balances
-- Records: 3
INSERT INTO wallet_balances (id, user_id, currency, available, locked, total, created_at, updated_at) VALUES ('3d3b4b3c-b53c-4d2e-947b-ede272a88b03', '5261222f-07e1-4c61-a7e6-9d5919c96f73', 'USD', 20007.14, 0, 20007.14, '2026-02-14T09:14:41.265958+00:00', '2026-02-18T12:22:22.272614+00:00');
INSERT INTO wallet_balances (id, user_id, currency, available, locked, total, created_at, updated_at) VALUES ('c8ec33cc-9dd4-432e-864d-01323ec6393e', '8c974284-3ca1-4184-83bc-7c17480d8e55', 'USD', 400.4, 200, 600.4, '2026-02-14T09:26:22.180259+00:00', '2026-02-18T12:22:22.272614+00:00');
INSERT INTO wallet_balances (id, user_id, currency, available, locked, total, created_at, updated_at) VALUES ('ac38ee86-f675-4f49-82bb-775037ab9cdf', 'e2ae0986-8b81-4df7-871f-8330ee9f8a85', 'USD', 3001.929, 1700, 4701.929, '2026-02-18T08:51:19.496203+00:00', '2026-02-18T12:22:22.272614+00:00');

-- DATA: investment_tiers
-- Records: 5
INSERT INTO investment_tiers (id, name, description, min_amount, max_amount, investment_period_days, daily_roi, sort_order, is_active, features, allocation_mix, created_at, updated_at) VALUES (1, 'Tier 1', 'Entry-level investment tier with competitive returns.', 150, 1000, 3, 0.1, 1, true, 'Basic trading signals,Email support,Daily ROI payouts', '[object Object]', '2026-02-11T14:50:56.444202+00:00', '2026-02-12T08:27:15.673485+00:00');
INSERT INTO investment_tiers (id, name, description, min_amount, max_amount, investment_period_days, daily_roi, sort_order, is_active, features, allocation_mix, created_at, updated_at) VALUES (2, 'Tier 2', 'Intermediate tier with enhanced returns and features.', 1000.01, 10000, 7, 0.0643, 2, true, 'Advanced trading signals,Priority support,Daily ROI payouts,Portfolio analytics', '[object Object]', '2026-02-11T14:50:56.444202+00:00', '2026-02-12T08:27:15.673485+00:00');
INSERT INTO investment_tiers (id, name, description, min_amount, max_amount, investment_period_days, daily_roi, sort_order, is_active, features, allocation_mix, created_at, updated_at) VALUES (3, 'Tier 3', 'Advanced tier for serious investors.', 10000.01, 20000, 14, 0.0357, 3, true, 'Premium trading signals,24/7 support,Daily ROI payouts,Advanced analytics,Risk management tools', '[object Object]', '2026-02-11T14:50:56.444202+00:00', '2026-02-12T08:27:15.673485+00:00');
INSERT INTO investment_tiers (id, name, description, min_amount, max_amount, investment_period_days, daily_roi, sort_order, is_active, features, allocation_mix, created_at, updated_at) VALUES (4, 'Tier 4', 'Professional tier with high returns.', 20000.01, 50000, 30, 0.0333, 4, true, 'VIP trading signals,Dedicated account manager,Daily ROI payouts,Custom analytics,API access,Lower fees', '[object Object]', '2026-02-11T14:50:56.444202+00:00', '2026-02-12T08:27:15.673485+00:00');
INSERT INTO investment_tiers (id, name, description, min_amount, max_amount, investment_period_days, daily_roi, sort_order, is_active, features, allocation_mix, created_at, updated_at) VALUES (5, 'Tier 5', 'Elite tier for maximum returns and exclusive benefits.', 50000.01, 10000000, 60, 0.0333, 5, true, 'Exclusive signals,Personal advisor,Daily ROI payouts,Custom strategies,Priority API,Zero fees,Exclusive events', '[object Object]', '2026-02-11T14:50:56.444202+00:00', '2026-02-12T08:27:15.673485+00:00');

-- DATA: daily_autogrowth_log
-- Records: 4
INSERT INTO daily_autogrowth_log (id, user_id, currency, tier_id, balance_before, growth_amount, growth_rate, balance_after, growth_date, created_at, processed) VALUES ('c046cbac-6f7d-47f4-a822-989d28667abb', '5261222f-07e1-4c61-a7e6-9d5919c96f73', 'USD', 3, 20000, 7.14, 0.0357, 20007.14, '2026-02-18', '2026-02-18T12:22:22.272614+00:00', true);
INSERT INTO daily_autogrowth_log (id, user_id, currency, tier_id, balance_before, growth_amount, growth_rate, balance_after, growth_date, created_at, processed) VALUES ('fbdc1589-b744-4dbb-8850-b1e1c16a4369', '560e27b0-5808-4301-ad19-91d33ff1491a', 'USD', 3, 20000, 7.14, 0.0357, 20007.14, '2026-02-18', '2026-02-18T12:22:22.272614+00:00', true);
INSERT INTO daily_autogrowth_log (id, user_id, currency, tier_id, balance_before, growth_amount, growth_rate, balance_after, growth_date, created_at, processed) VALUES ('6a24998f-712a-41c9-9421-0c1697363874', '8c974284-3ca1-4184-83bc-7c17480d8e55', 'USD', 1, 400, 0.4, 0.1, 400.4, '2026-02-18', '2026-02-18T12:22:22.272614+00:00', true);
INSERT INTO daily_autogrowth_log (id, user_id, currency, tier_id, balance_before, growth_amount, growth_rate, balance_after, growth_date, created_at, processed) VALUES ('dda30289-52ce-447e-b121-d340ba01c009', 'e2ae0986-8b81-4df7-871f-8330ee9f8a85', 'USD', 2, 3000, 1.929, 0.0643, 3001.929, '2026-02-18', '2026-02-18T12:22:22.272614+00:00', true);

-- DATA: notifications
-- Records: 7
INSERT INTO notifications (id, user_id, title, message, type, is_read, is_archived, created_at, read_at, archived_at, created_by, metadata) VALUES ('5a4e8587-3842-42fc-9485-5bd7c9d10045', '29425569-a981-471d-8817-17293c88b9b9', 'good boy', 'hguhkkmk', 'system', false, false, '2026-02-17T17:41:28.589+00:00', NULL, NULL, NULL, '[object Object]');
INSERT INTO notifications (id, user_id, title, message, type, is_read, is_archived, created_at, read_at, archived_at, created_by, metadata) VALUES ('a5e8562f-4abb-4c65-9018-f408fe715388', 'e2ae0986-8b81-4df7-871f-8330ee9f8a85', 'thank you', 'my madam is back', 'system', true, false, '2026-02-17T17:43:31.604+00:00', '2026-02-18T06:31:44.531+00:00', NULL, NULL, '[object Object]');
INSERT INTO notifications (id, user_id, title, message, type, is_read, is_archived, created_at, read_at, archived_at, created_by, metadata) VALUES ('9153360f-8e8d-4609-89b3-3c9dccda83e8', 'e2ae0986-8b81-4df7-871f-8330ee9f8a85', 'dan allah', 'yfyufy', 'system', true, false, '2026-02-17T18:03:38.934+00:00', '2026-02-18T06:32:00.635+00:00', NULL, NULL, '[object Object]');
INSERT INTO notifications (id, user_id, title, message, type, is_read, is_archived, created_at, read_at, archived_at, created_by, metadata) VALUES ('09d27118-f5c3-4ac1-a396-d24e5c97b50d', '5261222f-07e1-4c61-a7e6-9d5919c96f73', 'Daily Growth Applied', 'Your balance grew by 7.14000000 today (3.57000000% growth rate). New balance: 20007.14000000', 'system', false, false, '2026-02-18T12:22:22.272614+00:00', NULL, NULL, NULL, '[object Object]');
INSERT INTO notifications (id, user_id, title, message, type, is_read, is_archived, created_at, read_at, archived_at, created_by, metadata) VALUES ('8e63fdca-649a-49ef-8038-3982c3cb51f7', '560e27b0-5808-4301-ad19-91d33ff1491a', 'Daily Growth Applied', 'Your balance grew by 7.14000000 today (3.57000000% growth rate). New balance: 20007.14000000', 'system', false, false, '2026-02-18T12:22:22.272614+00:00', NULL, NULL, NULL, '[object Object]');
INSERT INTO notifications (id, user_id, title, message, type, is_read, is_archived, created_at, read_at, archived_at, created_by, metadata) VALUES ('bf59d497-2584-40de-a534-65e4af326230', '8c974284-3ca1-4184-83bc-7c17480d8e55', 'Daily Growth Applied', 'Your balance grew by 0.40000000 today (10.00000000% growth rate). New balance: 400.40000000', 'system', false, false, '2026-02-18T12:22:22.272614+00:00', NULL, NULL, NULL, '[object Object]');
INSERT INTO notifications (id, user_id, title, message, type, is_read, is_archived, created_at, read_at, archived_at, created_by, metadata) VALUES ('ce3c0369-6956-41dd-8815-ddc25c5b0ac4', 'e2ae0986-8b81-4df7-871f-8330ee9f8a85', 'Daily Growth Applied', 'Your balance grew by 1.92900000 today (6.43000000% growth rate). New balance: 3001.92900000', 'system', false, false, '2026-02-18T12:22:22.272614+00:00', NULL, NULL, NULL, '[object Object]');

-- DATA: profiles
-- Records: 11
INSERT INTO profiles (id, user_id, email, display_name, first_name, last_name, phone, country, bio, kyc_status, email_verified, created_at, updated_at, last_login, is_frozen, freeze_reason, frozen_at, kyc_submitted_at, kyc_reviewed_at, kyc_rejection_reason, kyc_documents, date_of_birth, nationality, email_notifications, push_notifications, notification_preferences) VALUES ('8c974284-3ca1-4184-83bc-7c17480d8e55', '8c974284-3ca1-4184-83bc-7c17480d8e55', 'ezekieldavid715@gmail.com', 'david', 'ezekiel', 'david715', '09073283783', 'Nigeria', '', 'not_submitted', false, '2026-02-12T07:31:18.489+00:00', '2026-02-13T11:24:55.486161+00:00', NULL, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, true, '[object Object]');
INSERT INTO profiles (id, user_id, email, display_name, first_name, last_name, phone, country, bio, kyc_status, email_verified, created_at, updated_at, last_login, is_frozen, freeze_reason, frozen_at, kyc_submitted_at, kyc_reviewed_at, kyc_rejection_reason, kyc_documents, date_of_birth, nationality, email_notifications, push_notifications, notification_preferences) VALUES ('29425569-a981-471d-8817-17293c88b9b9', '29425569-a981-471d-8817-17293c88b9b9', 'angela@porn.com', 'angel', 'angela', 'pornstar', '', 'AL', '', 'not_submitted', false, '2026-02-12T06:49:24.67+00:00', '2026-02-13T11:25:00.779914+00:00', NULL, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, true, '[object Object]');
INSERT INTO profiles (id, user_id, email, display_name, first_name, last_name, phone, country, bio, kyc_status, email_verified, created_at, updated_at, last_login, is_frozen, freeze_reason, frozen_at, kyc_submitted_at, kyc_reviewed_at, kyc_rejection_reason, kyc_documents, date_of_birth, nationality, email_notifications, push_notifications, notification_preferences) VALUES ('9e0569da-8387-438a-ba9f-cb73238e505c', '9e0569da-8387-438a-ba9f-cb73238e505c', 'mangala@ahmed.com', 'Mangala Ahmed', NULL, NULL, '', NULL, NULL, 'not_submitted', false, '2026-02-11T08:58:24.473+00:00', '2026-02-13T11:25:32.367948+00:00', NULL, true, 'nothing', '2026-02-13T11:25:31.82+00:00', NULL, NULL, NULL, NULL, NULL, NULL, true, true, '[object Object]');
INSERT INTO profiles (id, user_id, email, display_name, first_name, last_name, phone, country, bio, kyc_status, email_verified, created_at, updated_at, last_login, is_frozen, freeze_reason, frozen_at, kyc_submitted_at, kyc_reviewed_at, kyc_rejection_reason, kyc_documents, date_of_birth, nationality, email_notifications, push_notifications, notification_preferences) VALUES ('560e27b0-5808-4301-ad19-91d33ff1491a', '560e27b0-5808-4301-ad19-91d33ff1491a', 'datlax27@gmail.com', 'Angle ', 'Park', 'Park', '+17072766407', 'JP', '', 'not_submitted', true, '2026-02-06T16:00:35.287656+00:00', '2026-02-13T14:07:34.703509+00:00', NULL, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, true, '[object Object]');
INSERT INTO profiles (id, user_id, email, display_name, first_name, last_name, phone, country, bio, kyc_status, email_verified, created_at, updated_at, last_login, is_frozen, freeze_reason, frozen_at, kyc_submitted_at, kyc_reviewed_at, kyc_rejection_reason, kyc_documents, date_of_birth, nationality, email_notifications, push_notifications, notification_preferences) VALUES ('fa52c9a5-7a80-4ed3-bd92-9804ad35107a', 'fa52c9a5-7a80-4ed3-bd92-9804ad35107a', 'markbirkhoff@gmail.com', 'mark', 'mark', 'Birkhoff', '2345383548', 'DE', '', 'approved', true, '2026-02-11T14:34:57.903+00:00', '2026-02-13T14:08:41.805597+00:00', '2026-02-13T11:48:23.36+00:00', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, true, '[object Object]');
INSERT INTO profiles (id, user_id, email, display_name, first_name, last_name, phone, country, bio, kyc_status, email_verified, created_at, updated_at, last_login, is_frozen, freeze_reason, frozen_at, kyc_submitted_at, kyc_reviewed_at, kyc_rejection_reason, kyc_documents, date_of_birth, nationality, email_notifications, push_notifications, notification_preferences) VALUES ('c9cf0fff-53d0-49b4-90e3-75d85cbbc357', 'c9cf0fff-53d0-49b4-90e3-75d85cbbc357', 'smigodave@gmail.com', 'smigodave', 'Smigo', 'Dave', '', '', NULL, 'not_submitted', false, '2026-02-11T14:50:07.179+00:00', '2026-02-13T16:30:13.538149+00:00', '2026-02-12T18:40:49.135+00:00', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, true, '[object Object]');
INSERT INTO profiles (id, user_id, email, display_name, first_name, last_name, phone, country, bio, kyc_status, email_verified, created_at, updated_at, last_login, is_frozen, freeze_reason, frozen_at, kyc_submitted_at, kyc_reviewed_at, kyc_rejection_reason, kyc_documents, date_of_birth, nationality, email_notifications, push_notifications, notification_preferences) VALUES ('5261222f-07e1-4c61-a7e6-9d5919c96f73', '5261222f-07e1-4c61-a7e6-9d5919c96f73', 'monkeyboy@gmail.com', 'monkeyboy', 'monkey', 'Boy', '+3354687231', 'GB', 'Fuck savage', 'not_submitted', false, '2026-02-11T17:38:12.636+00:00', '2026-02-14T10:55:33.265409+00:00', '2026-02-14T10:55:33.239+00:00', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, true, '[object Object]');
INSERT INTO profiles (id, user_id, email, display_name, first_name, last_name, phone, country, bio, kyc_status, email_verified, created_at, updated_at, last_login, is_frozen, freeze_reason, frozen_at, kyc_submitted_at, kyc_reviewed_at, kyc_rejection_reason, kyc_documents, date_of_birth, nationality, email_notifications, push_notifications, notification_preferences) VALUES ('e2ae0986-8b81-4df7-871f-8330ee9f8a85', 'e2ae0986-8b81-4df7-871f-8330ee9f8a85', 'sarki@mota.com', 'sarki ', 'sarki', 'mota', '', 'Cb', '', 'pending', false, '2026-02-11T08:14:13.847+00:00', '2026-02-17T14:35:33.519848+00:00', '2026-02-17T08:57:55.555+00:00', false, NULL, NULL, '2026-02-17T14:35:32.25+00:00', NULL, NULL, '[object Object]', '1991-02-04', 'DZ', true, true, '[object Object]');
INSERT INTO profiles (id, user_id, email, display_name, first_name, last_name, phone, country, bio, kyc_status, email_verified, created_at, updated_at, last_login, is_frozen, freeze_reason, frozen_at, kyc_submitted_at, kyc_reviewed_at, kyc_rejection_reason, kyc_documents, date_of_birth, nationality, email_notifications, push_notifications, notification_preferences) VALUES ('09d2e26e-7a56-4ee1-8ff8-146c28ba192c', '2d901cff-72e1-4cb2-91cf-ca20286cd952', 'bigweight7@outlook.com', 'Emile Daugherty', 'Emile', 'Daugherty', NULL, NULL, NULL, 'not_submitted', false, '2026-02-18T12:02:33.221+00:00', '2026-02-18T12:02:35.394171+00:00', NULL, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, true, '[object Object]');
INSERT INTO profiles (id, user_id, email, display_name, first_name, last_name, phone, country, bio, kyc_status, email_verified, created_at, updated_at, last_login, is_frozen, freeze_reason, frozen_at, kyc_submitted_at, kyc_reviewed_at, kyc_rejection_reason, kyc_documents, date_of_birth, nationality, email_notifications, push_notifications, notification_preferences) VALUES ('3d3d5181-4880-43f8-9554-8c334f2c00e2', 'ee521ecd-89c7-45c6-acaa-3add556362ed', 'adamsandler@gmail.com', 'adam sandler', 'adam', 'sandler', NULL, NULL, NULL, 'not_submitted', false, '2026-02-18T12:12:29.929+00:00', '2026-02-18T12:12:31.81871+00:00', NULL, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, true, '[object Object]');
INSERT INTO profiles (id, user_id, email, display_name, first_name, last_name, phone, country, bio, kyc_status, email_verified, created_at, updated_at, last_login, is_frozen, freeze_reason, frozen_at, kyc_submitted_at, kyc_reviewed_at, kyc_rejection_reason, kyc_documents, date_of_birth, nationality, email_notifications, push_notifications, notification_preferences) VALUES ('8fab4e57-240e-41c8-bba5-8cd6579aa72b', 'bdc47df8-98e1-4bdb-b378-a833ad8ac59d', 'jsnre@gmail.com', '25  Savage', '25 ', 'Savage', NULL, NULL, NULL, 'not_submitted', false, '2026-02-18T17:24:28.861+00:00', '2026-02-18T17:24:24.634205+00:00', NULL, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, true, '[object Object]');

-- DATA: deposits
-- Records: 0 (empty table)

-- DATA: withdrawals
-- Records: 0 (empty table)

-- DATA: kyc_documents
-- Records: 0 (empty table)

-- DATA: support_tickets
-- Records: 0 (empty table)

-- DATA: signal_details
-- Error: Failed to fetch data (Status: 404)

-- DATA: trading_signals
-- Records: 9
INSERT INTO trading_signals (id, string_id, title, description, price, category, risk_level, type, access_duration, features, strategy, performance, requirements, purchase_count, success_rate, status, created_at, updated_at) VALUES ('864dfda6-cf23-4498-88f0-d513b1f2313f', 'forex_eur_usd_scalp', 'EUR/USD Scalping Pro Signal', 'Professional EUR/USD scalping strategy for intraday trading. Uses advanced technical analysis with 90% win rate on 1-minute timeframes. Perfect for forex traders seeking consistent daily profits.', 650, 'Forex', 'high', 'subscription', '30_days', 'Real-time alerts,Entry/exit points,Risk calculator,Daily performance reports,Market analysis', 'Combines price action analysis with support/resistance levels and volume indicators for optimal entry timing', 'Average monthly return of 15-25% with maximum 2% risk per trade', 'Advanced forex experience, minimum $5000 capital, fast execution required', 156, '90%', 'active', '2026-01-23T06:37:05.133199+00:00', '2026-01-31T06:37:05.133199+00:00');
INSERT INTO trading_signals (id, string_id, title, description, price, category, risk_level, type, access_duration, features, strategy, performance, requirements, purchase_count, success_rate, status, created_at, updated_at) VALUES ('9d0e24c5-d031-4a70-9d2a-046df914a98b', 'forex_gbp_usd_breakout', 'GBP/USD Breakout Strategy', 'High-probability GBP/USD breakout trading signal. Identifies key breakout patterns with 85% success rate. Ideal for capturing major market moves.', 650, 'Forex', 'medium', 'one_time', '90_days', 'Breakout alerts,Target levels,Stop loss guidance,Risk management,Weekly analysis', 'Uses Bollinger Bands and volume analysis to identify genuine breakouts from consolidation zones', 'Average profit of 200-300 pips per trade with controlled risk of 50-100 pips', 'Intermediate forex knowledge, minimum $2000 capital', 89, '85%', 'active', '2026-01-18T06:37:05.133199+00:00', '2026-01-28T06:37:05.133199+00:00');
INSERT INTO trading_signals (id, string_id, title, description, price, category, risk_level, type, access_duration, features, strategy, performance, requirements, purchase_count, success_rate, status, created_at, updated_at) VALUES ('35ff32f2-b241-4723-8ae3-a81157ba4a44', 'forex_usd_jpy_carry', 'USD/JPY Carry Trade Signal', 'Strategic USD/JPY carry trade signal for capturing interest rate differentials. Low-risk approach with steady monthly returns.', 650, 'Forex', 'low', 'subscription', '180_days', 'Interest rate alerts,Entry timing,Risk monitoring,Monthly reports,Economic calendar', 'Exploits interest rate differentials between USD and JPY with fundamental analysis', 'Consistent monthly returns of 8-12% with minimal volatility', 'Basic forex understanding, minimum $1000 capital', 234, '92%', 'active', '2026-01-03T06:37:05.133199+00:00', '2026-01-23T06:37:05.133199+00:00');
INSERT INTO trading_signals (id, string_id, title, description, price, category, risk_level, type, access_duration, features, strategy, performance, requirements, purchase_count, success_rate, status, created_at, updated_at) VALUES ('102e427b-ce85-46c7-99e4-ae177c8f7c93', 'crypto_btc_momentum', 'Bitcoin Momentum Trading Signal', 'Advanced Bitcoin momentum signal using on-chain analysis and market sentiment. Captures major BTC price movements with 80% accuracy.', 1200, 'Crypto', 'high', 'subscription', '30_days', 'On-chain analysis,Market sentiment,Entry/exit alerts,Risk metrics,Technical indicators', 'Combines on-chain data, order flow analysis, and technical indicators for optimal timing', 'Average monthly return of 25-40% during trending markets', 'Crypto experience required, minimum $5000 capital, understanding of blockchain', 178, '80%', 'active', '2026-01-26T06:37:05.133199+00:00', '2026-02-01T06:37:05.133199+00:00');
INSERT INTO trading_signals (id, string_id, title, description, price, category, risk_level, type, access_duration, features, strategy, performance, requirements, purchase_count, success_rate, status, created_at, updated_at) VALUES ('6c70e823-844c-47b1-8043-b6efe86a3f1a', 'crypto_eth_defi', 'Ethereum DeFi Strategy Signal', 'Comprehensive DeFi trading signal for Ethereum ecosystem. Identifies high-yield opportunities in DeFi protocols with risk assessment.', 1200, 'Crypto', 'medium', 'subscription', '60_days', 'DeFi opportunities,Risk assessment,Protocol analysis,Yield farming,Gas optimization', 'Analyzes DeFi protocols, liquidity pools, and yield farming opportunities with fundamental analysis', 'Average monthly yield of 15-25% with impermanent loss protection strategies', 'DeFi experience required, minimum $3000 capital, understanding of smart contracts', 145, '78%', 'active', '2026-01-13T06:37:05.133199+00:00', '2026-01-30T06:37:05.133199+00:00');
INSERT INTO trading_signals (id, string_id, title, description, price, category, risk_level, type, access_duration, features, strategy, performance, requirements, purchase_count, success_rate, status, created_at, updated_at) VALUES ('40097794-3483-4b5b-a712-0fa57e6ef32e', 'crypto_altcoin_breakout', 'Altcoin Breakout Scanner', 'Multi-altcoin breakout signal that identifies promising breakout patterns across 50+ cryptocurrencies. High-risk, high-reward approach.', 1200, 'Crypto', 'high', 'subscription', '30_days', 'Breakout alerts,Portfolio suggestions,Risk analysis,Market scanner,Weekly rankings', 'Uses technical analysis and market sentiment to identify altcoins with breakout potential', 'Potential returns of 100-500% on successful breakouts with diversified risk management', 'Advanced crypto knowledge, minimum $10000 capital, high risk tolerance', 67, '75%', 'active', '2026-01-28T06:37:05.133199+00:00', '2026-02-01T18:37:05.133199+00:00');
INSERT INTO trading_signals (id, string_id, title, description, price, category, risk_level, type, access_duration, features, strategy, performance, requirements, purchase_count, success_rate, status, created_at, updated_at) VALUES ('6e66bb57-7c02-4301-89fa-ea9ddab7a1ea', 'physical_gold_trading', 'Gold Trading Professional Signal', 'Professional gold trading signal for XAU/USD. Uses fundamental analysis and market sentiment for optimal timing.', 3000, 'Physical Assets', 'medium', 'subscription', '90_days', 'Market analysis,Economic indicators,Entry/exit points,Risk management,Weekly reports', 'Combines fundamental analysis of gold market with technical indicators and sentiment analysis', 'Average annual return of 20-30% with inflation hedge benefits', 'Physical assets knowledge, minimum $10000 capital, long-term perspective', 89, '85%', 'active', '2025-12-19T06:37:05.133199+00:00', '2026-01-18T06:37:05.133199+00:00');
INSERT INTO trading_signals (id, string_id, title, description, price, category, risk_level, type, access_duration, features, strategy, performance, requirements, purchase_count, success_rate, status, created_at, updated_at) VALUES ('00a2886b-92dd-4d85-b21e-2be1c0e2c17b', 'physical_oil_trading', 'Crude Oil Trading Signal', 'Professional crude oil trading signal for WTI/Brent. Uses supply/demand analysis and geopolitical factors for trading decisions.', 3000, 'Physical Assets', 'high', 'subscription', '60_days', 'Supply/demand analysis,Geopolitical alerts,Inventory reports,Risk management,Daily market updates', 'Analyzes OPEC decisions, inventory levels, and geopolitical events for oil price prediction', 'Average monthly return of 25-40% during volatile periods with proper hedging', 'Energy market knowledge, minimum $15000 capital, understanding of futures', 56, '82%', 'active', '2026-01-08T06:37:05.133199+00:00', '2026-01-26T06:37:05.133199+00:00');
INSERT INTO trading_signals (id, string_id, title, description, price, category, risk_level, type, access_duration, features, strategy, performance, requirements, purchase_count, success_rate, status, created_at, updated_at) VALUES ('8271eb83-25df-4240-817e-5f873a356aa8', 'physical_real_estate', 'Real Estate Investment Signal', 'Real estate investment signal identifying undervalued properties in major markets. Long-term wealth building approach.', 3000, 'Physical Assets', 'low', 'one_time', '365_days', 'Property analysis,Market trends,Investment guidance,Risk assessment,Monthly reports', 'Uses demographic trends, economic indicators, and property analysis to identify undervalued real estate', 'Expected annual return of 8-12% with property appreciation and rental income', 'Real estate knowledge, minimum $25000 capital, long-term investment horizon', 234, '88%', 'active', '2025-12-04T06:37:05.133199+00:00', '2026-01-13T06:37:05.133199+00:00');

