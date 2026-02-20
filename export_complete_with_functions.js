// Complete Database Export including Functions, Triggers, and Deposit Methods
const SUPABASE_URL = 'https://rfszagckgghcysgkomybc.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmc3phZ2NrZ2doY3lna29teWJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTQ2MDE1NCwiZXhwIjoyMDg3MDM2MTU0fQ.5SltnkVX-Nl4744lTo_Z0Y58SSwQjXQCqnrCNi_uZuY';

async function exportCompleteWithFunctions() {
    console.log('Creating complete database export including functions, triggers, and deposit methods...');
    
    let exportSQL = '-- Complete Database Export with Schema + Data + Functions + Triggers\n';
    exportSQL += `-- Generated: ${new Date().toISOString()}\n`;
    exportSQL += `-- Project: ${SUPABASE_URL}\n`;
    exportSQL += `-- Purpose: Full import to another Supabase instance including all database objects\n\n`;
    
    // Table schemas (including deposit methods)
    const tableSchemas = {
        admin_users: `CREATE TABLE admin_users (
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
);`,
        
        admin_balance_updates: `CREATE TABLE admin_balance_updates (
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
);`,
        
        user_balances: `CREATE TABLE user_balances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    amount DECIMAL(20,8) DEFAULT 0,
    usd_value DECIMAL(20,8) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, currency)
);`,
        
        wallet_balances: `CREATE TABLE wallet_balances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    available DECIMAL(20,8) DEFAULT 0,
    locked DECIMAL(20,8) DEFAULT 0,
    total DECIMAL(20,8) GENERATED ALWAYS AS (available + locked) STORED,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, currency)
);`,
        
        investment_tiers: `CREATE TABLE investment_tiers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    min_amount DECIMAL(20,8) NOT NULL,
    max_amount DECIMAL(20,8),
    daily_roi DECIMAL(5,4) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);`,
        
        daily_autogrowth_log: `CREATE TABLE daily_autogrowth_log (
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
);`,
        
        notifications: `CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    type VARCHAR(50) DEFAULT 'system',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);`,
        
        profiles: `CREATE TABLE profiles (
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
);`,
        
        deposits: `CREATE TABLE deposits (
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
);`,
        
        withdrawals: `CREATE TABLE withdrawals (
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
);`,
        
        kyc_documents: `CREATE TABLE kyc_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    file_url TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    reviewed_at TIMESTAMPTZ,
    reviewer_id UUID
);`,
        
        support_tickets: `CREATE TABLE support_tickets (
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
);`,
        
        signal_details: `CREATE TABLE signal_details (
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
);`,
        
        trading_signals: `CREATE TABLE trading_signals (
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
);`
    };
    
    // Add CREATE TABLE statements
    for (const [tableName, schema] of Object.entries(tableSchemas)) {
        exportSQL += `-- CREATE TABLE: ${tableName}\n`;
        exportSQL += schema + '\n\n';
    }
    
    // Add Functions and Triggers
    exportSQL += `-- FUNCTIONS AND TRIGGERS\n\n`;
    
    // Autogrowth function
    exportSQL += `-- FUNCTION: calculate_daily_autogrowth\n`;
    exportSQL += `CREATE OR REPLACE FUNCTION calculate_daily_autogrowth()\n`;
    exportSQL += `RETURNS void\n`;
    exportSQL += `LANGUAGE plpgsql\n`;
    exportSQL += `SECURITY DEFINER\n`;
    exportSQL += `AS $$\n`;
    exportSQL += `DECLARE\n`;
    exportSQL += `    current_date DATE := CURRENT_DATE;\n`;
    exportSQL += `    tier_record RECORD;\n`;
    exportSQL += `    user_balance RECORD;\n`;
    exportSQL += `    growth_amount DECIMAL(20,8);\n`;
    exportSQL += `    new_balance DECIMAL(20,8);\n`;
    exportSQL += `BEGIN\n`;
    exportSQL += `    -- Process each user who has balances\n`;
    exportSQL += `    FOR user_balance IN \n`;
    exportSQL += `        SELECT DISTINCT \n`;
    exportSQL += `            ub.user_id,\n`;
    exportSQL += `            ub.currency,\n`;
    exportSQL += `            ub.amount as balance_amount,\n`;
    exportSQL += `            COALESCE(wb.total, ub.amount) as total_balance\n`;
    exportSQL += `        FROM user_balances ub\n`;
    exportSQL += `        LEFT JOIN wallet_balances wb ON ub.user_id = wb.user_id AND ub.currency = wb.currency\n`;
    exportSQL += `        WHERE ub.amount > 0 OR wb.total > 0\n`;
    exportSQL += `    LOOP\n`;
    exportSQL += `        -- Skip if already processed today\n`;
    exportSQL += `        IF EXISTS (\n`;
    exportSQL += `            SELECT 1 FROM daily_autogrowth_log \n`;
    exportSQL += `            WHERE user_id = user_balance.user_id \n`;
    exportSQL += `                AND currency = user_balance.currency \n`;
    exportSQL += `                AND growth_date = current_date\n`;
    exportSQL += `        ) THEN\n`;
    exportSQL += `            CONTINUE;\n`;
    exportSQL += `        END IF;\n`;
    exportSQL += `        \n`;
    exportSQL += `        -- Determine tier based on total balance\n`;
    exportSQL += `        SELECT it.id, it.daily_roi INTO tier_record\n`;
    exportSQL += `        FROM investment_tiers it\n`;
    exportSQL += `        WHERE user_balance.total_balance >= it.min_amount\n`;
    exportSQL += `                AND (it.max_amount IS NULL OR user_balance.total_balance <= it.max_amount)\n`;
    exportSQL += `                AND it.is_active = true\n`;
    exportSQL += `            ORDER BY it.min_amount DESC\n`;
    exportSQL += `            LIMIT 1;\n`;
    exportSQL += `        \n`;
    exportSQL += `        -- Skip if no tier found\n`;
    exportSQL += `        IF tier_record.id IS NULL THEN\n`;
    exportSQL += `            CONTINUE;\n`;
    exportSQL += `        END IF;\n`;
    exportSQL += `        \n`;
    exportSQL += `        -- Calculate growth amount\n`;
    exportSQL += `        growth_amount := user_balance.total_balance * (tier_record.daily_roi / 100.0);\n`;
    exportSQL += `        new_balance := user_balance.total_balance + growth_amount;\n`;
    exportSQL += `        \n`;
    exportSQL += `        -- Update user balance\n`;
    exportSQL += `        UPDATE user_balances \n`;
    exportSQL += `        SET \n`;
    exportSQL += `            amount = new_balance,\n`;
    exportSQL += `            usd_value = new_balance,\n`;
    exportSQL += `            updated_at = NOW()\n`;
    exportSQL += `        WHERE user_id = user_balance.user_id \n`;
    exportSQL += `            AND currency = user_balance.currency;\n`;
    exportSQL += `        \n`;
    exportSQL += `        -- Update wallet balance if exists\n`;
    exportSQL += `        UPDATE wallet_balances \n`;
    exportSQL += `        SET \n`;
    exportSQL += `            available = new_balance,\n`;
    exportSQL += `            updated_at = NOW()\n`;
    exportSQL += `        WHERE user_id = user_balance.user_id \n`;
    exportSQL += `            AND currency = user_balance.currency;\n`;
    exportSQL += `        \n`;
    exportSQL += `        -- Log the autogrowth\n`;
    exportSQL += `        INSERT INTO daily_autogrowth_log (\n`;
    exportSQL += `            user_id, currency, tier_id, balance_before, \n`;
    exportSQL += `            growth_amount, growth_rate, balance_after, growth_date\n`;
    exportSQL += `        ) VALUES (\n`;
    exportSQL += `            user_balance.user_id, \n`;
    exportSQL += `            user_balance.currency, \n`;
    exportSQL += `            tier_record.id, \n`;
    exportSQL += `            user_balance.total_balance, \n`;
    exportSQL += `            growth_amount, \n`;
    exportSQL += `            tier_record.daily_roi, \n`;
    exportSQL += `            new_balance, \n`;
    exportSQL += `            current_date\n`;
    exportSQL += `        );\n`;
    exportSQL += `        \n`;
    exportSQL += `        -- Create notification for user\n`;
    exportSQL += `        INSERT INTO notifications (\n`;
    exportSQL += `            user_id, type, title, message, is_read, created_at\n`;
    exportSQL += `        ) VALUES (\n`;
    exportSQL += `            user_balance.user_id,\n`;
    exportSQL += `            'system',\n`;
    exportSQL += `            'Daily Growth Applied',\n`;
    exportSQL += `            'Your balance grew by ' || growth_amount || ' today (' || (tier_record.daily_roi * 100) || '% growth rate). New balance: ' || new_balance,\n`;
    exportSQL += `            false,\n`;
    exportSQL += `            NOW()\n`;
    exportSQL += `        );\n`;
    exportSQL += `        \n`;
    exportSQL += `    END LOOP;\n`;
    exportSQL += `END;\n`;
    exportSQL += `$$;\n\n`;
    
    // Trigger function
    exportSQL += `-- FUNCTION: trigger_daily_autogrowth\n`;
    exportSQL += `CREATE OR REPLACE FUNCTION trigger_daily_autogrowth()\n`;
    exportSQL += `RETURNS TABLE (\n`;
    exportSQL += `    success BOOLEAN,\n`;
    exportSQL += `    message TEXT,\n`;
    exportSQL += `    users_processed INTEGER,\n`;
    exportSQL += `    total_growth DECIMAL(20,8)\n`;
    exportSQL += `)\n`;
    exportSQL += `LANGUAGE plpgsql\n`;
    exportSQL += `SECURITY DEFINER\n`;
    exportSQL += `AS $$\n`;
    exportSQL += `DECLARE\n`;
    exportSQL += `    users_count INTEGER;\n`;
    exportSQL += `    total_growth_amount DECIMAL(20,8);\n`;
    exportSQL += `BEGIN\n`;
    exportSQL += `    -- Calculate autogrowth\n`;
    exportSQL += `    PERFORM calculate_daily_autogrowth();\n`;
    exportSQL += `    \n`;
    exportSQL += `    -- Get results\n`;
    exportSQL += `    SELECT COUNT(*), COALESCE(SUM(growth_amount), 0) \n`;
    exportSQL += `    INTO users_count, total_growth_amount\n`;
    exportSQL += `    FROM daily_autogrowth_log \n`;
    exportSQL += `    WHERE growth_date = CURRENT_DATE AND processed = FALSE;\n`;
    exportSQL += `    \n`;
    exportSQL += `    -- Mark as processed\n`;
    exportSQL += `    UPDATE daily_autogrowth_log \n`;
    exportSQL += `    SET processed = TRUE \n`;
    exportSQL += `    WHERE growth_date = CURRENT_DATE;\n`;
    exportSQL += `    \n`;
    exportSQL += `    success := true;\n`;
    exportSQL += `    message := 'Daily autogrowth processed for ' || users_count || ' users with total growth of ' || total_growth_amount;\n`;
    exportSQL += `    users_processed := users_count;\n`;
    exportSQL += `    total_growth := total_growth_amount;\n`;
    exportSQL += `    \n`;
    exportSQL += `    RETURN NEXT;\n`;
    exportSQL += `END;\n`;
    exportSQL += `$$;\n\n`;
    
    // Process admin balance updates function
    exportSQL += `-- FUNCTION: process_admin_balance_updates\n`;
    exportSQL += `CREATE OR REPLACE FUNCTION process_admin_balance_updates()\n`;
    exportSQL += `RETURNS void\n`;
    exportSQL += `LANGUAGE plpgsql\n`;
    exportSQL += `SECURITY DEFINER\n`;
    exportSQL += `AS $$\n`;
    exportSQL += `BEGIN\n`;
    exportSQL += `    -- Process wallet balance updates separately\n`;
    exportSQL += `    INSERT INTO wallet_balances (user_id, currency, available, locked, created_at, updated_at)\n`;
    exportSQL += `    SELECT \n`;
    exportSQL += `        abu.user_id,\n`;
    exportSQL += `        abu.currency,\n`;
    exportSQL += `        abu.available,\n`;
    exportSQL += `        abu.locked,\n`;
    exportSQL += `        NOW(),\n`;
    exportSQL += `        NOW()\n`;
    exportSQL += `    FROM admin_balance_updates abu\n`;
    exportSQL += `    WHERE abu.processed = FALSE\n`;
    exportSQL += `      AND (abu.available != 0 OR abu.locked != 0)\n`;
    exportSQL += `    ON CONFLICT (user_id, currency) DO UPDATE SET\n`;
    exportSQL += `        available = EXCLUDED.available,\n`;
    exportSQL += `        locked = EXCLUDED.locked,\n`;
    exportSQL += `        updated_at = NOW();\n`;
    exportSQL += `    \n`;
    exportSQL += `    -- Process user balance updates separately\n`;
    exportSQL += `    INSERT INTO user_balances (user_id, currency, amount, usd_value, created_at, updated_at)\n`;
    exportSQL += `    SELECT \n`;
    exportSQL += `        abu.user_id,\n`;
    exportSQL += `        abu.currency,\n`;
    exportSQL += `        abu.amount,\n`;
    exportSQL += `        abu.usd_value,\n`;
    exportSQL += `        NOW(),\n`;
    exportSQL += `        NOW()\n`;
    exportSQL += `    FROM admin_balance_updates abu\n`;
    exportSQL += `    WHERE abu.processed = FALSE\n`;
    exportSQL += `      AND (abu.amount != 0 OR abu.usd_value != 0)\n`;
    exportSQL += `      -- Exclude records that were already processed for wallet balances\n`;
    exportSQL += `      AND NOT (abu.available != 0 OR abu.locked != 0)\n`;
    exportSQL += `    ON CONFLICT (user_id, currency) DO UPDATE SET\n`;
    exportSQL += `        amount = EXCLUDED.amount,\n`;
    exportSQL += `        usd_value = EXCLUDED.usd_value,\n`;
    exportSQL += `        updated_at = NOW();\n`;
    exportSQL += `    \n`;
    exportSQL += `    -- Mark all as processed\n`;
    exportSQL += `    UPDATE admin_balance_updates \n`;
    exportSQL += `    SET processed = TRUE \n`;
    exportSQL += `    WHERE processed = FALSE;\n`;
    exportSQL += `END;\n`;
    exportSQL += `$$;\n\n`;
    
    // Export data for all tables
    const tables = Object.keys(tableSchemas);
    
    for (const table of tables) {
        console.log(`Exporting data for table: ${table}`);
        
        try {
            const dataResponse = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*&limit=10000`, {
                headers: {
                    'apikey': SERVICE_ROLE_KEY,
                    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
                }
            });
            
            if (dataResponse.ok) {
                const tableData = await dataResponse.json();
                
                if (tableData.length > 0) {
                    exportSQL += `-- DATA: ${table}\n`;
                    exportSQL += `-- Records: ${tableData.length}\n`;
                    
                    // Generate INSERT statements
                    for (const record of tableData) {
                        const columns = Object.keys(record);
                        const values = columns.map(col => {
                            const val = record[col];
                            if (val === null || val === undefined) return 'NULL';
                            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
                            if (typeof val === 'number') return val;
                            if (typeof val === 'boolean') return val ? 'true' : 'false';
                            if (val instanceof Date) return `'${val.toISOString()}'`;
                            return `'${val}'`;
                        }).join(', ');
                        
                        exportSQL += `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values});\n`;
                    }
                    exportSQL += '\n';
                } else {
                    exportSQL += `-- DATA: ${table}\n`;
                    exportSQL += `-- Records: 0 (empty table)\n\n`;
                }
            } else {
                console.error(`Failed to fetch ${table}:`, dataResponse.status);
                exportSQL += `-- DATA: ${table}\n`;
                exportSQL += `-- Error: Failed to fetch data (Status: ${dataResponse.status})\n\n`;
            }
        } catch (error) {
            console.error(`Error exporting ${table}:`, error);
            exportSQL += `-- DATA: ${table}\n`;
            exportSQL += `-- Error: ${error.message}\n\n`;
        }
    }
    
    // Save to file
    const fs = require('fs');
    fs.writeFileSync('database_complete_with_functions.sql', exportSQL);
    
    console.log('Complete database export with functions finished! Saved to database_complete_with_functions.sql');
    console.log(`Exported ${tables.length} tables + functions + triggers`);
}

// Run export
exportCompleteWithFunctions();
