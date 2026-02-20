// Complete Database Export including Auth Tables
const SUPABASE_URL = 'https://rfszagckgghcysgkomybc.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmc3phZ2NrZ2doY3lna29teWJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTQ2MDE1NCwiZXhwIjoyMDg3MDM2MTU0fQ.5SltnkVX-Nl4744lTo_Z0Y58SSwQjXQCqnrCNi_uZuY';

async function exportWithAuth() {
    console.log('Creating complete database export including auth tables...');
    
    let exportSQL = '-- Complete Database Export with Schema + Data + Auth\n';
    exportSQL += `-- Generated: ${new Date().toISOString()}\n`;
    exportSQL += `-- Project: ${SUPABASE_URL}\n`;
    exportSQL += `-- Purpose: Full import to another Supabase instance including auth\n\n`;
    
    // Public table schemas
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
    
    // Add CREATE TABLE statements for public tables
    for (const [tableName, schema] of Object.entries(tableSchemas)) {
        exportSQL += `-- CREATE TABLE: ${tableName}\n`;
        exportSQL += schema + '\n\n';
    }
    
    // Add auth table schemas (these are Supabase system tables)
    exportSQL += `-- AUTH TABLES (Supabase System Tables)\n`;
    exportSQL += `-- Note: These are Supabase auth system tables and may need special handling\n\n`;
    
    exportSQL += `-- auth.users table structure (Supabase manages this table)\n`;
    exportSQL += `-- Columns: id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, recovery_token, email_change_token_new, email_change, last_sign_in_at, created_at, updated_at, phone, phone_confirmed_at, banned_until, is_sso_user, sso_provider_id, sso_provider_user_id, new_email\n\n`;
    
    exportSQL += `-- auth.refresh_tokens table structure (Supabase manages this table)\n`;
    exportSQL += `-- Columns: id, instance_id, user_id, refresh_token, revoked, created_at, expires_at, parent, status\n\n`;
    
    // Export data for public tables
    const publicTables = Object.keys(tableSchemas);
    
    for (const table of publicTables) {
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
    
    // Try to export auth users data
    console.log('Exporting auth.users data...');
    try {
        const authUsersResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
            headers: {
                'apikey': SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
            }
        });
        
        if (authUsersResponse.ok) {
            const authUsers = await authUsersResponse.json();
            exportSQL += `-- DATA: auth.users\n`;
            exportSQL += `-- Records: ${Array.isArray(authUsers) ? authUsers.length : 0}\n`;
            exportSQL += `-- Note: Auth users may need to be created via Supabase Auth API\n`;
            
            // Handle if authUsers is an object or array
            const usersArray = Array.isArray(authUsers) ? authUsers : authUsers ? [authUsers] : [];
            
            for (const user of usersArray) {
                const columns = ['id', 'email', 'email_confirmed_at', 'created_at', 'updated_at', 'last_sign_in_at'];
                const values = [
                    `'${user.id}'`,
                    `'${(user.email || '').replace(/'/g, "''")}'`,
                    user.email_confirmed_at ? `'${user.email_confirmed_at}'` : 'NULL',
                    `'${user.created_at}'`,
                    `'${user.updated_at}'`,
                    user.last_sign_in_at ? `'${user.last_sign_in_at}'` : 'NULL'
                ].join(', ');
                
                exportSQL += `INSERT INTO auth.users (${columns.join(', ')}) VALUES (${values});\n`;
            }
            exportSQL += '\n';
        } else {
            console.error('Failed to fetch auth users:', authUsersResponse.status);
            exportSQL += `-- DATA: auth.users\n`;
            exportSQL += `-- Error: Failed to fetch auth users (Status: ${authUsersResponse.status})\n`;
            exportSQL += `-- Note: Auth users may need to be exported via Supabase dashboard or CLI\n\n`;
        }
    } catch (error) {
        console.error('Error exporting auth users:', error);
        exportSQL += `-- DATA: auth.users\n`;
        exportSQL += `-- Error: ${error.message}\n`;
        exportSQL += `-- Note: Auth users may need to be exported via Supabase dashboard or CLI\n\n`;
    }
    
    // Save to file
    const fs = require('fs');
    fs.writeFileSync('database_complete_with_auth.sql', exportSQL);
    
    console.log('Complete database export with auth finished! Saved to database_complete_with_auth.sql');
    console.log(`Exported ${publicTables.length} public tables + auth tables`);
}

// Run export
exportWithAuth();
