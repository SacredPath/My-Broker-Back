/**
 * Load Settings from Database
 * This script loads current payment method settings from the database
 * and updates the UI with actual values
 */

// Function to load ACH settings from database
async function loadACHSettingsFromDB() {
    try {
        console.log('Loading ACH settings from database...');
        
        // Query the deposit_methods table for ACH method
        const supabaseUrl = window.AdminAPI.supabaseUrl;
        const supabaseKey = window.AdminAPI.supabaseKey;
        const authToken = sessionStorage.getItem('adminToken');
        
        const response = await fetch(`${supabaseUrl}/rest/v1/deposit_methods?method_type=eq.ach&currency=eq.USD&select=*`, {
            method: 'GET',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load ACH settings');
        }

        const result = await response.json();
        
        if (result && result.length > 0) {
            const achSettings = result[0];
            
            // Update the form fields
            document.getElementById('ach-bank-name').value = achSettings.bank_name || '';
            document.getElementById('ach-account-name').value = achSettings.account_name || '';
            document.getElementById('ach-account-number').value = achSettings.account_number || '';
            document.getElementById('ach-routing-number').value = achSettings.routing_number || '';
            document.getElementById('ach-instructions').value = achSettings.instructions || '';
            document.getElementById('ach-min-amount').value = achSettings.min_amount || 100;
            document.getElementById('ach-max-amount').value = achSettings.max_amount || 100000;
            document.getElementById('ach-fee-percentage').value = achSettings.fee_percentage || 0;
            document.getElementById('ach-fixed-fee').value = achSettings.fixed_fee || 25;
            document.getElementById('ach-processing-time').value = achSettings.processing_time_hours || 72;
            document.getElementById('enable-ach-deposits').checked = achSettings.is_active || false;
            
            // Update the settings object
            if (window.backofficeSettings) {
                window.backofficeSettings.settings.paymentMethods.ach.bankName = achSettings.bank_name || '';
                window.backofficeSettings.settings.paymentMethods.ach.accountName = achSettings.account_name || '';
                window.backofficeSettings.settings.paymentMethods.ach.accountNumber = achSettings.account_number || '';
                window.backofficeSettings.settings.paymentMethods.ach.routingNumber = achSettings.routing_number || '';
                window.backofficeSettings.settings.paymentMethods.ach.instructions = achSettings.instructions || '';
                window.backofficeSettings.settings.paymentMethods.ach.minAmount = parseFloat(achSettings.min_amount) || 100;
                window.backofficeSettings.settings.paymentMethods.ach.maxAmount = parseFloat(achSettings.max_amount) || 100000;
                window.backofficeSettings.settings.paymentMethods.ach.feePercentage = parseFloat(achSettings.fee_percentage) || 0;
                window.backofficeSettings.settings.paymentMethods.ach.fixedFee = parseFloat(achSettings.fixed_fee) || 25;
                window.backofficeSettings.settings.paymentMethods.ach.processingTimeHours = parseInt(achSettings.processing_time_hours) || 72;
                window.backofficeSettings.settings.paymentMethods.ach.enabled = achSettings.is_active || false;
            }
            
            console.log('ACH settings loaded from database:', achSettings);
        } else {
            console.log('No ACH settings found in database');
        }
        
    } catch (error) {
        console.error('Error loading ACH settings:', error);
    }
}

// Function to load PayPal settings from database
async function loadPayPalSettingsFromDB() {
    try {
        console.log('Loading PayPal settings from database...');
        
        const supabaseUrl = window.AdminAPI.supabaseUrl;
        const supabaseKey = window.AdminAPI.supabaseKey;
        const authToken = sessionStorage.getItem('adminToken');
        
        const response = await fetch(`${supabaseUrl}/rest/v1/deposit_methods?method_type=eq.paypal&select=*`, {
            method: 'GET',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load PayPal settings');
        }

        const result = await response.json();
        
        if (result && result.length > 0) {
            const paypalSettings = result[0];
            
            // Update the form fields
            document.getElementById('paypal-email').value = paypalSettings.paypal_email || '';
            document.getElementById('paypal-business-name').value = paypalSettings.paypal_business_name || '';
            document.getElementById('paypal-instructions').value = paypalSettings.instructions || '';
            document.getElementById('paypal-min-amount').value = paypalSettings.min_amount || 50;
            document.getElementById('paypal-max-amount').value = paypalSettings.max_amount || 10000;
            document.getElementById('paypal-fee-percentage').value = paypalSettings.fee_percentage || 2.9;
            document.getElementById('paypal-fixed-fee').value = paypalSettings.fixed_fee || 0.30;
            document.getElementById('paypal-processing-time').value = paypalSettings.processing_time_hours || 24;
            document.getElementById('enable-paypal-deposits').checked = paypalSettings.is_active || false;
            
            // Update the settings object
            if (window.backofficeSettings) {
                window.backofficeSettings.settings.paymentMethods.paypal.email = paypalSettings.paypal_email || '';
                window.backofficeSettings.settings.paymentMethods.paypal.businessName = paypalSettings.paypal_business_name || '';
                window.backofficeSettings.settings.paymentMethods.paypal.instructions = paypalSettings.instructions || '';
                window.backofficeSettings.settings.paymentMethods.paypal.minAmount = parseFloat(paypalSettings.min_amount) || 50;
                window.backofficeSettings.settings.paymentMethods.paypal.maxAmount = parseFloat(paypalSettings.max_amount) || 10000;
                window.backofficeSettings.settings.paymentMethods.paypal.feePercentage = parseFloat(paypalSettings.fee_percentage) || 2.9;
                window.backofficeSettings.settings.paymentMethods.paypal.fixedFee = parseFloat(paypalSettings.fixed_fee) || 0.30;
                window.backofficeSettings.settings.paymentMethods.paypal.processingTimeHours = parseInt(paypalSettings.processing_time_hours) || 24;
                window.backofficeSettings.settings.paymentMethods.paypal.enabled = paypalSettings.is_active || false;
            }
            
            console.log('PayPal settings loaded from database:', paypalSettings);
        } else {
            console.log('No PayPal settings found in database');
        }
        
    } catch (error) {
        console.error('Error loading PayPal settings:', error);
    }
}

// Function to load Bitcoin settings from database
async function loadBitcoinSettingsFromDB() {
    try {
        console.log('Loading Bitcoin settings from database...');
        
        const supabaseUrl = window.AdminAPI.supabaseUrl;
        const supabaseKey = window.AdminAPI.supabaseKey;
        const authToken = sessionStorage.getItem('adminToken');
        
        const response = await fetch(`${supabaseUrl}/rest/v1/deposit_methods?method_type=eq.crypto&currency=eq.BTC&select=*`, {
            method: 'GET',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load Bitcoin settings');
        }

        const result = await response.json();
        
        if (result && result.length > 0) {
            const btcSettings = result[0];
            
            // Update the form fields
            document.getElementById('btc-address').value = btcSettings.address || '';
            document.getElementById('btc-instructions').value = btcSettings.instructions || '';
            document.getElementById('btc-min-amount').value = btcSettings.min_amount || 0.0001;
            document.getElementById('btc-max-amount').value = btcSettings.max_amount || 10;
            document.getElementById('btc-fee-percentage').value = btcSettings.fee_percentage || 0.1;
            document.getElementById('btc-fixed-fee').value = btcSettings.fixed_fee || 0.0005;
            document.getElementById('btc-processing-time').value = btcSettings.processing_time_hours || 60;
            document.getElementById('enable-btc-deposits').checked = btcSettings.is_active || false;
            
            // Update the settings object
            if (window.backofficeSettings) {
                window.backofficeSettings.settings.paymentMethods.crypto.btc.address = btcSettings.address || '';
                window.backofficeSettings.settings.paymentMethods.crypto.btc.instructions = btcSettings.instructions || '';
                window.backofficeSettings.settings.paymentMethods.crypto.btc.minAmount = parseFloat(btcSettings.min_amount) || 0.0001;
                window.backofficeSettings.settings.paymentMethods.crypto.btc.maxAmount = parseFloat(btcSettings.max_amount) || 10;
                window.backofficeSettings.settings.paymentMethods.crypto.btc.feePercentage = parseFloat(btcSettings.fee_percentage) || 0.1;
                window.backofficeSettings.settings.paymentMethods.crypto.btc.fixedFee = parseFloat(btcSettings.fixed_fee) || 0.0005;
                window.backofficeSettings.settings.paymentMethods.crypto.btc.processingTimeHours = parseInt(btcSettings.processing_time_hours) || 60;
                window.backofficeSettings.settings.paymentMethods.crypto.btc.enabled = btcSettings.is_active || false;
            }
            
            console.log('Bitcoin settings loaded from database:', btcSettings);
        } else {
            console.log('No Bitcoin settings found in database');
        }
        
    } catch (error) {
        console.error('Error loading Bitcoin settings:', error);
    }
}

// Function to load USDT settings from database
async function loadUSDTSettingsFromDB() {
    try {
        console.log('Loading USDT settings from database...');
        
        const supabaseUrl = window.AdminAPI.supabaseUrl;
        const supabaseKey = window.AdminAPI.supabaseKey;
        const authToken = sessionStorage.getItem('adminToken');
        
        const response = await fetch(`${supabaseUrl}/rest/v1/deposit_methods?method_type=eq.crypto&currency=eq.USDT&select=*`, {
            method: 'GET',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load USDT settings');
        }

        const result = await response.json();
        
        if (result && result.length > 0) {
            const usdtSettings = result[0];
            
            // Update the form fields
            document.getElementById('usdt-address').value = usdtSettings.address || '';
            document.getElementById('usdt-instructions').value = usdtSettings.instructions || '';
            document.getElementById('usdt-min-amount').value = usdtSettings.min_amount || 10;
            document.getElementById('usdt-max-amount').value = usdtSettings.max_amount || 50000;
            document.getElementById('usdt-fee-percentage').value = usdtSettings.fee_percentage || 0;
            document.getElementById('usdt-fixed-fee').value = usdtSettings.fixed_fee || 1;
            document.getElementById('usdt-processing-time').value = usdtSettings.processing_time_hours || 30;
            document.getElementById('enable-usdt-deposits').checked = usdtSettings.is_active || false;
            
            // Update the settings object
            if (window.backofficeSettings) {
                window.backofficeSettings.settings.paymentMethods.crypto.usdt.address = usdtSettings.address || '';
                window.backofficeSettings.settings.paymentMethods.crypto.usdt.instructions = usdtSettings.instructions || '';
                window.backofficeSettings.settings.paymentMethods.crypto.usdt.minAmount = parseFloat(usdtSettings.min_amount) || 10;
                window.backofficeSettings.settings.paymentMethods.crypto.usdt.maxAmount = parseFloat(usdtSettings.max_amount) || 50000;
                window.backofficeSettings.settings.paymentMethods.crypto.usdt.feePercentage = parseFloat(usdtSettings.fee_percentage) || 0;
                window.backofficeSettings.settings.paymentMethods.crypto.usdt.fixedFee = parseFloat(usdtSettings.fixed_fee) || 1;
                window.backofficeSettings.settings.paymentMethods.crypto.usdt.processingTimeHours = parseInt(usdtSettings.processing_time_hours) || 30;
                window.backofficeSettings.settings.paymentMethods.crypto.usdt.enabled = usdtSettings.is_active || false;
            }
            
            console.log('USDT settings loaded from database:', usdtSettings);
        } else {
            console.log('No USDT settings found in database');
        }
        
    } catch (error) {
        console.error('Error loading USDT settings:', error);
    }
}

// Load all settings from database
async function loadAllSettingsFromDB() {
    console.log('Loading all payment method settings from database...');
    
    try {
        await Promise.all([
            loadACHSettingsFromDB(),
            loadPayPalSettingsFromDB(),
            loadBitcoinSettingsFromDB(),
            loadUSDTSettingsFromDB()
        ]);
        
        console.log('All settings loaded from database successfully');
        
        // Update last updated timestamp
        const lastUpdatedElement = document.getElementById('last-updated');
        if (lastUpdatedElement) {
            const now = new Date();
            lastUpdatedElement.textContent = `Last updated: ${now.toLocaleString()}`;
        }
        
    } catch (error) {
        console.error('Error loading settings from database:', error);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Add load from database button to settings page
    const loadButton = document.createElement('button');
    loadButton.textContent = 'Load Settings from Database';
    loadButton.className = 'btn btn-primary';
    loadButton.style.margin = '10px';
    loadButton.onclick = loadAllSettingsFromDB;
    
    // Insert button before the Save All Changes button
    const saveButton = document.getElementById('save-all-btn');
    if (saveButton) {
        saveButton.parentNode.insertBefore(loadButton, saveButton);
    }
});
