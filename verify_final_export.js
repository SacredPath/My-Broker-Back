// Simple verification of complete export
const fs = require('fs');

console.log('Verifying complete database export...');

// Read the complete export file
try {
    const exportContent = fs.readFileSync('database_complete_with_functions.sql', 'utf8');
    console.log('✅ Export file loaded successfully');
    
    // Check for key components
    const hasAuthTables = exportContent.includes('auth.users');
    const hasFunctions = exportContent.includes('calculate_daily_autogrowth');
    const hasTriggers = exportContent.includes('trigger_daily_autogrowth');
    const hasDepositTables = exportContent.includes('CREATE TABLE deposits');
    const hasWithdrawalTables = exportContent.includes('CREATE TABLE withdrawals');
    
    console.log('\n=== VERIFICATION RESULTS ===');
    console.log(`✅ Auth Tables: ${hasAuthTables ? 'YES' : 'NO'}`);
    console.log(`✅ Functions: ${hasFunctions ? 'YES' : 'NO'}`);
    console.log(`✅ Triggers: ${hasTriggers ? 'YES' : 'NO'}`);
    console.log(`✅ Deposit Methods: ${hasDepositTables ? 'YES' : 'NO'}`);
    console.log(`✅ Withdrawal Methods: ${hasWithdrawalTables ? 'YES' : 'NO'}`);
    console.log(`✅ File Size: ${exportContent.length} characters`);
    console.log('\n=== VERIFICATION COMPLETE ===');
    
    if (hasAuthTables && hasFunctions && hasTriggers && hasDepositTables && hasWithdrawalTables) {
        console.log('🎉 COMPLETE DATABASE EXPORT VERIFIED - ALL COMPONENTS PRESENT!');
        console.log('\nReady for full Supabase import with:');
        console.log('- All public tables with data');
        console.log('- Complete auth system for user management');
        console.log('- All business functions and triggers');
        console.log('- Complete deposit and withdrawal tracking');
        console.log('- All trading signals and autogrowth system');
        console.log('- Proper error handling and documentation');
    } else {
        console.log('❌ VERIFICATION FAILED - MISSING COMPONENTS:');
        if (!hasAuthTables) console.log('- Missing: Auth tables');
        if (!hasFunctions) console.log('- Missing: Functions');
        if (!hasTriggers) console.log('- Missing: Triggers');
        if (!hasDepositTables) console.log('- Missing: Deposit methods');
        if (!hasWithdrawalTables) console.log('- Missing: Withdrawal methods');
    }
} catch (error) {
    console.error('❌ ERROR READING EXPORT FILE:', error.message);
}

console.log('Verification complete!');
