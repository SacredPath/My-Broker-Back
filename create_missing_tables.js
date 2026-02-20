// Script to create missing tables for dashboard functionality
const SUPABASE_URL = 'https://rfszagckgghcygkomybc.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTQ2MDE4MjU0fQ.5SltnkVX-Nl4744lTo_Z0Y58SSwQjXQCqnrCNi_uZuY';

async function createMissingTables() {
    console.log('Creating missing tables for dashboard functionality...');
    
    // Tables that need to be created based on API errors
    const tablesToCreate = [
        {
            name: 'deposit_requests',
            sql: `
                CREATE TABLE deposit_requests (
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
            `
        },
        {
            name: 'withdrawal_requests', 
            sql: `
                CREATE TABLE withdrawal_requests (
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
            `
        },
        {
            name: 'positions',
            sql: `
                CREATE TABLE positions (
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
            `
        },
        {
            name: 'signals',
            sql: `
                CREATE TABLE signals (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    user_id UUID NOT NULL,
                    signal_id UUID NOT NULL,
                    symbol VARCHAR(10) NOT NULL,
                    action VARCHAR(20) NOT NULL,
                    price DECIMAL(20,8),
                    target_price DECIMAL(20,8),
                    created_at TIMESTAMPTZ DEFAULT now()
                );
            `
        },
        {
            name: 'audit_log',
            sql: `
                CREATE TABLE audit_log (
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
            `
        }
    ];

    // Execute each table creation
    for (const table of tablesToCreate) {
        try {
            console.log(`Creating table: ${table.name}`);
            
            const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
                method: 'POST',
                headers: {
                    'apikey': SERVICE_ROLE_KEY,
                    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    query: table.sql
                })
            });

            if (response.ok) {
                console.log(`✅ Table ${table.name} created successfully`);
            } else {
                const error = await response.json();
                console.error(`❌ Failed to create table ${table.name}:`, error);
            }
        } catch (error) {
            console.error(`❌ Error creating table ${table.name}:`, error);
        }
    }

    console.log('Missing tables creation completed!');
}

// Run the function
createMissingTables();
