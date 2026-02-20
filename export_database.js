// Database Export Script
const SUPABASE_URL = 'https://rfszagckgghcysgkomybc.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmc3phZ2NrZ2doY3lna29teWJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTQ2MDE1NCwiZXhwIjoyMDg3MDM2MTU0fQ.5SltnkVX-Nl4744lTo_Z0Y58SSwQjXQCqnrCNi_uZuY';

async function exportDatabase() {
    console.log('Starting database export...');
    
    // First, get all tables in the database
    const tablesResponse = await fetch(`${SUPABASE_URL}/rest/v1/tables?select=table_name&schema=eq.public`, {
        headers: {
            'apikey': SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
        }
    });
    
    let tables = [];
    if (tablesResponse.ok) {
        const tablesData = await tablesResponse.json();
        tables = tablesData.map(t => t.table_name);
        console.log('Found tables:', tables);
    } else {
        // Fallback to hardcoded list if API call fails
        tables = [
            'admin_users',
            'admin_balance_updates',
            'user_balances', 
            'wallet_balances',
            'investment_tiers',
            'daily_autogrowth_log',
            'notifications',
            'profiles',
            'deposits',
            'withdrawals',
            'kyc_documents',
            'support_tickets',
            'signal_details',  // Add signal details table
            'trading_signals',
            'user_trades',
            'market_data',
            'audit_logs',
            'api_keys',
            'user_sessions',
            'system_settings'
        ];
    }
    
    let exportSQL = '-- Database Export\n';
    exportSQL += `-- Generated: ${new Date().toISOString()}\n`;
    exportSQL += `-- Project: ${SUPABASE_URL}\n`;
    exportSQL += `-- Tables: ${tables.length}\n\n`;
    
    for (const table of tables) {
        console.log(`Exporting table: ${table}`);
        
        try {
            // Get table structure and data
            const dataResponse = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*&limit=10000`, {
                headers: {
                    'apikey': SERVICE_ROLE_KEY,
                    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
                }
            });
            
            if (dataResponse.ok) {
                const tableData = await dataResponse.json();
                
                if (tableData.length > 0) {
                    const columns = Object.keys(tableData[0]);
                    exportSQL += `-- Table: ${table}\n`;
                    exportSQL += `-- Columns: ${columns.join(', ')}\n`;
                    exportSQL += `-- Records: ${tableData.length}\n`;
                    
                    // Generate INSERT statements
                    for (const record of tableData) {
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
                } else if (dataResponse.status === 404) {
                    exportSQL += `-- Table: ${table}\n`;
                    exportSQL += `-- Records: 0 (table does not exist)\n\n`;
                } else if (dataResponse.status === 403) {
                    exportSQL += `-- Table: ${table}\n`;
                    exportSQL += `-- Records: 0 (no service role access)\n\n`;
                } else {
                    console.error(`Failed to fetch ${table}:`, dataResponse.status);
                    exportSQL += `-- Table: ${table}\n`;
                    exportSQL += `-- Error: Failed to fetch data (Status: ${dataResponse.status})\n`;
                    
                    // Add signal_details table structure manually for 404 errors
                    if (table === 'signal_details' && dataResponse.status === 404) {
                        exportSQL += `-- Signal Details Table Structure\n`;
                        exportSQL += `-- Columns: id, user_id, signal_id, signal_type, symbol, action, price, quantity, timestamp, created_at\n`;
                        exportSQL += `-- Note: Service role key doesn't have access to this table\n`;
                        exportSQL += `-- Add manual INSERT statements if needed:\n`;
                        exportSQL += `-- INSERT INTO signal_details (id, user_id, signal_id, signal_type, symbol, action, price, quantity, timestamp, created_at) VALUES ('00000000-0000-0000-000000000001', '00000000-0000-0000-000000000001', 'sample-signal-uuid', 'BUY', 'BTC', 'MARKET', '45000.00', '0.001', '2026-02-18T16:00:00Z', NOW());\n\n`;
                    } else {
                        exportSQL += `\n`;
                    }
                }
            } else {
                console.error(`Failed to fetch ${table}:`, dataResponse.status);
                exportSQL += `-- Table: ${table}\n`;
                exportSQL += `-- Error: Failed to fetch data (Status: ${dataResponse.status})\n`;
                
                // Add signal_details table structure manually for 404 errors
                if (table === 'signal_details' && dataResponse.status === 404) {
                    exportSQL += `-- Signal Details Table Structure\n`;
                    exportSQL += `-- Columns: id, user_id, signal_id, signal_type, symbol, action, price, quantity, timestamp, created_at\n`;
                    exportSQL += `-- Note: Service role key doesn't have access to this table\n`;
                    exportSQL += `-- Add manual INSERT statements if needed:\n`;
                    exportSQL += `-- INSERT INTO signal_details (id, user_id, signal_id, signal_type, symbol, action, price, quantity, timestamp, created_at) VALUES ('00000000-0000-0000-000000000001', '00000000-0000-0000-000000000001', 'sample-signal-uuid', 'BUY', 'BTC', 'MARKET', '45000.00', '0.001', '2026-02-18T16:00:00Z', NOW());\n\n`;
                } else {
                    exportSQL += `\n`;
                }
            }
        } catch (error) {
            console.error(`Error exporting ${table}:`, error);
            exportSQL += `-- Table: ${table}\n`;
            exportSQL += `-- Error: ${error.message}\n\n`;
        }
    }
    
    // Save to file using Node.js filesystem
    const fs = require('fs');
    fs.writeFileSync('database_export_complete.sql', exportSQL);
    
    console.log('Complete database export finished! Saved to database_export_complete.sql');
    console.log(`Exported ${tables.length} tables`);
}

// Run export
exportDatabase();
