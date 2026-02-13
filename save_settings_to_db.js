/**
 * Save Settings to Database
 * This script saves payment method settings from settings page to the actual database
 */

// Function to save ACH settings to database
async function saveACHSettingsToDB() {
    try {
        const settings = window.backofficeSettings.settings.paymentMethods.ach;
        
        // Use Supabase REST API to find and update the record
        const supabaseUrl = window.__ENV?.SUPABASE_URL || 'https://ubycoeyutauzjgxbozcm.supabase.co';
        const supabaseKey = window.__ENV?.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cH6R8';
        const authToken = sessionStorage.getItem('adminToken');
        
        if (!authToken) {
            console.warn('No auth token found, skipping database save');
            return { success: false, message: 'Not authenticated' };
        }
        
        // First, find the ACH record
        const findResponse = await fetch(`${supabaseUrl}/rest/v1/deposit_methods?method_type=eq.ach&currency=eq.USD&select=*`, {
            method: 'GET',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            }
        });

        if (!findResponse.ok) {
            const errorText = await findResponse.text();
            throw new Error(`Failed to find ACH settings: ${findResponse.status} ${errorText}`);
        }

        let existingRecords;
        try {
            existingRecords = await findResponse.json();
        } catch (jsonError) {
            console.warn('Failed to parse JSON response, using empty array:', jsonError);
            existingRecords = [];
        }
        
        if (existingRecords.length === 0) {
            // Insert new ACH record if it doesn't exist
            const insertResponse = await fetch(`${supabaseUrl}/rest/v1/deposit_methods`, {
                method: 'POST',
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    method_type: 'ach',
                    currency: 'USD',
                    bank_name: settings.bankName || 'Default Bank',
                    account_number: settings.accountNumber || '0000000000',
                    routing_number: settings.routingNumber || '000000000',
                    instructions: settings.instructions || 'Default ACH instructions',
                    min_amount: settings.minAmount || 100,
                    max_amount: settings.maxAmount || 100000,
                    fee_percentage: settings.feePercentage || 0,
                    fixed_fee: settings.fixedFee || 25,
                    processing_time_hours: settings.processingTimeHours || 72,
                    is_active: settings.enabled || false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
            });

            if (!insertResponse.ok) {
                const errorText = await insertResponse.text();
                throw new Error(`Failed to create ACH settings: ${insertResponse.status} ${errorText}`);
            }

            const result = await insertResponse.json();
            console.log('ACH settings created in database:', result);
            return result;
        }
        
        // Update existing record
        const achRecord = existingRecords[0];
        const updateResponse = await fetch(`${supabaseUrl}/rest/v1/deposit_methods?id=eq.${achRecord.id}`, {
            method: 'PATCH',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                bank_name: settings.bankName,
                account_number: settings.accountNumber,
                routing_number: settings.routingNumber,
                instructions: settings.instructions,
                min_amount: settings.minAmount,
                max_amount: settings.maxAmount,
                fee_percentage: settings.feePercentage,
                fixed_fee: settings.fixedFee,
                processing_time_hours: settings.processingTimeHours,
                is_active: settings.enabled,
                updated_at: new Date().toISOString()
            })
        });

        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            throw new Error(`Failed to update ACH settings: ${updateResponse.status} ${errorText}`);
        }

        const result = await updateResponse.json();
        console.log('ACH settings updated in database:', result);
        return result;

    } catch (error) {
        console.error('Error saving ACH settings to database:', error);
        throw error;
    }
}

// Function to save PayPal settings to database
async function savePayPalSettingsToDB() {
    try {
        const settings = window.backofficeSettings.settings.paymentMethods.paypal;
        
        const supabaseUrl = window.AdminAPI.supabaseUrl;
        const supabaseKey = window.AdminAPI.supabaseKey;
        const authToken = sessionStorage.getItem('adminToken');
        
        // First check if PayPal settings already exist
        const checkResponse = await fetch(`${supabaseUrl}/rest/v1/deposit_methods?method_type=eq.paypal`, {
            method: 'GET',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (!checkResponse.ok) {
            throw new Error('Failed to check existing PayPal settings');
        }
        
        const existingRecords = await checkResponse.json();
        
        let response;
        if (existingRecords.length === 0) {
            // Create new record
            response = await fetch(`${supabaseUrl}/rest/v1/deposit_methods`, {
                method: 'POST',
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    method_type: 'paypal',
                    paypal_email: settings.email,
                    paypal_business_name: settings.businessName,
                    instructions: settings.instructions,
                    min_amount: settings.minAmount,
                    max_amount: settings.maxAmount,
                    fee_percentage: settings.feePercentage,
                    fixed_fee: settings.fixedFee,
                    processing_time_hours: settings.processingTimeHours,
                    is_active: settings.enabled,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
            });
        } else {
            // Update existing record
            const paypalRecord = existingRecords[0];
            response = await fetch(`${supabaseUrl}/rest/v1/deposit_methods?id=eq.${paypalRecord.id}`, {
                method: 'PATCH',
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    paypal_email: settings.email,
                    paypal_business_name: settings.businessName,
                    instructions: settings.instructions,
                    min_amount: settings.minAmount,
                    max_amount: settings.maxAmount,
                    fee_percentage: settings.feePercentage,
                    fixed_fee: settings.fixedFee,
                    processing_time_hours: settings.processingTimeHours,
                    is_active: settings.enabled,
                    updated_at: new Date().toISOString()
                })
            });
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to update PayPal settings: ${response.status} ${errorText}`);
        }

        const result = await response.json();
        console.log('PayPal settings updated in database:', result);
        return result;

    } catch (error) {
        console.error('Error saving PayPal settings to database:', error);
        throw error;
    }
}

// Function to save Bitcoin settings to database
async function saveBitcoinSettingsToDB() {
    try {
        const settings = window.backofficeSettings.settings.paymentMethods.crypto.btc;
        
        const supabaseUrl = window.AdminAPI.supabaseUrl;
        const supabaseKey = window.AdminAPI.supabaseKey;
        const authToken = sessionStorage.getItem('adminToken');
        
        // First check if Bitcoin settings already exist
        const checkResponse = await fetch(`${supabaseUrl}/rest/v1/deposit_methods?method_type=eq.crypto&currency=eq.BTC`, {
            method: 'GET',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (!checkResponse.ok) {
            throw new Error('Failed to check existing Bitcoin settings');
        }
        
        const existingRecords = await checkResponse.json();
        
        let response;
        if (existingRecords.length === 0) {
            // Create new record
            response = await fetch(`${supabaseUrl}/rest/v1/deposit_methods`, {
                method: 'POST',
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    method_type: 'crypto',
                    currency: 'BTC',
                    address: settings.address,
                    instructions: settings.instructions,
                    min_amount: settings.minAmount,
                    max_amount: settings.maxAmount,
                    fee_percentage: settings.feePercentage,
                    fixed_fee: settings.fixedFee,
                    processing_time_hours: settings.processingTimeHours,
                    is_active: settings.enabled,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
            });
        } else {
            // Update existing record
            const btcRecord = existingRecords[0];
            response = await fetch(`${supabaseUrl}/rest/v1/deposit_methods?id=eq.${btcRecord.id}`, {
                method: 'PATCH',
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    address: settings.address,
                    instructions: settings.instructions,
                    min_amount: settings.minAmount,
                    max_amount: settings.maxAmount,
                    fee_percentage: settings.feePercentage,
                    fixed_fee: settings.fixedFee,
                    processing_time_hours: settings.processingTimeHours,
                    is_active: settings.enabled,
                    updated_at: new Date().toISOString()
                })
            });
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to update Bitcoin settings: ${response.status} ${errorText}`);
        }

        const result = await response.json();
        console.log('Bitcoin settings updated in database:', result);
        return result;

    } catch (error) {
        console.error('Error saving Bitcoin settings to database:', error);
        throw error;
    }
}

// Function to save USDT settings to database
async function saveUSDTSettingsToDB() {
    try {
        const settings = window.backofficeSettings.settings.paymentMethods.crypto.usdt;
        
        const supabaseUrl = window.AdminAPI.supabaseUrl;
        const supabaseKey = window.AdminAPI.supabaseKey;
        const authToken = sessionStorage.getItem('adminToken');
        
        // First check if USDT settings already exist
        const checkResponse = await fetch(`${supabaseUrl}/rest/v1/deposit_methods?method_type=eq.crypto&currency=eq.USDT`, {
            method: 'GET',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (!checkResponse.ok) {
            throw new Error('Failed to check existing USDT settings');
        }
        
        const existingRecords = await checkResponse.json();
        
        let response;
        if (existingRecords.length === 0) {
            // Create new record
            response = await fetch(`${supabaseUrl}/rest/v1/deposit_methods`, {
                method: 'POST',
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    method_type: 'crypto',
                    currency: 'USDT',
                    address: settings.address,
                    instructions: settings.instructions,
                    min_amount: settings.minAmount,
                    max_amount: settings.maxAmount,
                    fee_percentage: settings.feePercentage,
                    fixed_fee: settings.fixedFee,
                    processing_time_hours: settings.processingTimeHours,
                    is_active: settings.enabled,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
            });
        } else {
            // Update existing record
            const usdtRecord = existingRecords[0];
            response = await fetch(`${supabaseUrl}/rest/v1/deposit_methods?id=eq.${usdtRecord.id}`, {
                method: 'PATCH',
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    address: settings.address,
                    instructions: settings.instructions,
                    min_amount: settings.minAmount,
                    max_amount: settings.maxAmount,
                    fee_percentage: settings.feePercentage,
                    fixed_fee: settings.fixedFee,
                    processing_time_hours: settings.processingTimeHours,
                    is_active: settings.enabled,
                    updated_at: new Date().toISOString()
                })
            });
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to update USDT settings: ${response.status} ${errorText}`);
        }

        const result = await response.json();
        console.log('USDT settings updated in database:', result);
        return result;

    } catch (error) {
        console.error('Error saving USDT settings to database:', error);
        throw error;
    }
}

// Main function to save all payment method settings to database
async function saveAllPaymentMethodsToDB() {
    try {
        console.log('Saving all payment method settings to database...');
        
        // Save all payment methods in parallel
        const results = await Promise.allSettled([
            saveACHSettingsToDB(),
            savePayPalSettingsToDB(),
            saveBitcoinSettingsToDB(),
            saveUSDTSettingsToDB()
        ]);

        // Check if all saves were successful
        const failedSaves = results.filter(result => result.status === 'rejected');
        if (failedSaves.length > 0) {
            console.error('Some payment methods failed to save:', failedSaves);
            throw new Error('Failed to save some payment method settings');
        }

        console.log('All payment method settings saved to database successfully');
        return { success: true, message: 'All payment method settings saved to database' };

    } catch (error) {
        console.error('Error saving payment methods to database:', error);
        return { success: false, error: error.message };
    }
}

// Function to insert new payment method if it doesn't exist
async function ensurePaymentMethodExists(methodType, currency) {
    try {
        const response = await fetch('/api/deposit-methods', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({
                query: `
                    SELECT COUNT(*) as count 
                    FROM deposit_methods 
                    WHERE method_type = '${methodType}' AND currency = '${currency}'
                `
            })
        });

        if (!response.ok) {
            throw new Error('Failed to check payment method existence');
        }

        const result = await response.json();
        const count = result.data?.[0]?.count || 0;
        
        if (count === 0) {
            // Insert new payment method if it doesn't exist
            await insertPaymentMethod(methodType, currency);
        }
        
        return count > 0;

    } catch (error) {
        console.error('Error checking payment method existence:', error);
        return false;
    }
}

// Function to insert a new payment method
async function insertPaymentMethod(methodType, currency) {
    try {
        let defaultValues = {};
        
        if (methodType === 'ach' && currency === 'USD') {
            defaultValues = {
                bank_name: 'Default Bank',
                account_name: 'Default Account',
                account_number: '0000000000',
                routing_number: '000000000',
                instructions: 'Default ACH instructions',
                min_amount: 100,
                max_amount: 100000,
                fee_percentage: 0,
                fixed_fee: 25,
                processing_time_hours: 72,
                is_active: false
            };
        } else if (methodType === 'paypal' && currency === 'USD') {
            defaultValues = {
                paypal_email: 'paypal@default.com',
                paypal_business_name: 'Default Business',
                instructions: 'Default PayPal instructions',
                min_amount: 50,
                max_amount: 10000,
                fee_percentage: 2.9,
                fixed_fee: 0.30,
                processing_time_hours: 24,
                is_active: false
            };
        } else if (methodType === 'crypto' && currency === 'BTC') {
            defaultValues = {
                address: 'bc1qxy2kgdygjrsqtzq2n0yrfzw9k5l5n3',
                instructions: 'Default Bitcoin instructions',
                min_amount: 0.0001,
                max_amount: 10,
                fee_percentage: 0.1,
                fixed_fee: 0.0005,
                processing_time_hours: 60,
                is_active: false
            };
        } else if (methodType === 'crypto' && currency === 'USDT') {
            defaultValues = {
                address: 'TRX7QW5Y8AGReZM9PZbZQZ8dDgK7Q',
                instructions: 'Default USDT instructions',
                min_amount: 10,
                max_amount: 50000,
                fee_percentage: 0,
                fixed_fee: 1,
                processing_time_hours: 30,
                is_active: false
            };
        }

        const response = await fetch('/api/deposit-methods', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({
                query: `
                    INSERT INTO deposit_methods (
                        method_type, currency, bank_name, account_name, account_number, routing_number,
                        paypal_email, paypal_business_name, address, instructions,
                        min_amount, max_amount, fee_percentage, fixed_fee,
                        processing_time_hours, is_active, created_at, updated_at
                    ) VALUES (
                        '${methodType}', '${currency}', 
                        ${defaultValues.bank_name ? `'${defaultValues.bank_name}'` : 'NULL'}, 
                        ${defaultValues.account_name ? `'${defaultValues.account_name}'` : 'NULL'}, 
                        ${defaultValues.account_number ? `'${defaultValues.account_number}'` : 'NULL'}, 
                        ${defaultValues.routing_number ? `'${defaultValues.routing_number}'` : 'NULL'}, 
                        ${defaultValues.paypal_email ? `'${defaultValues.paypal_email}'` : 'NULL'}, 
                        ${defaultValues.paypal_business_name ? `'${defaultValues.paypal_business_name}'` : 'NULL'}, 
                        ${defaultValues.address ? `'${defaultValues.address}'` : 'NULL'}, 
                        '${defaultValues.instructions}', 
                        ${defaultValues.min_amount}, ${defaultValues.max_amount}, 
                        ${defaultValues.fee_percentage}, ${defaultValues.fixedFee}, 
                        ${defaultValues.processing_time_hours}, 
                        ${defaultValues.is_active}, NOW(), NOW()
                    )
                `
            })
        });

        if (!response.ok) {
            throw new Error('Failed to insert payment method');
        }

        const result = await response.json();
        console.log(`Inserted new ${methodType} ${currency} payment method:`, result);
        return result;

    } catch (error) {
        console.error('Error inserting payment method:', error);
        throw error;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Add save to database button to settings page
    const saveButton = document.querySelector('button[onclick*="saveAllSettings"]');
    if (saveButton) {
        // Clone the original save button
        const originalSaveButton = saveButton.cloneNode(true);
        
        // Create a container for both buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '10px';
        buttonContainer.style.justifyContent = 'center';
        buttonContainer.style.marginTop = '20px';
        
        // Create "Save to Local" button (original functionality)
        const saveLocalButton = document.createElement('button');
        saveLocalButton.textContent = 'Save to Local Storage';
        saveLocalButton.className = 'btn btn-secondary';
        saveLocalButton.onclick = () => {
            if (window.backofficeSettings) {
                window.backofficeSettings.saveAllSettings();
            }
        };
        
        // Create "Save to Database" button (new functionality)
        const saveDBButton = document.createElement('button');
        saveDBButton.textContent = 'Save to Database';
        saveDBButton.className = 'btn btn-primary';
        saveDBButton.onclick = async () => {
            try {
                saveDBButton.disabled = true;
                saveDBButton.textContent = 'Saving...';
                
                const result = await saveAllPaymentMethodsToDB();
                
                if (result.success) {
                    if (window.modal) {
                        window.modal.success('Payment methods saved to database successfully!');
                    } else {
                        alert('Payment methods saved to database successfully!');
                    }
                } else {
                    if (window.modal) {
                        window.modal.error('Failed to save payment methods: ' + result.error);
                    } else {
                        alert('Failed to save payment methods: ' + result.error);
                    }
                }
            } catch (error) {
                if (window.modal) {
                    window.modal.error('Error saving payment methods: ' + error.message);
                } else {
                    alert('Error saving payment methods: ' + error.message);
                }
            } finally {
                saveDBButton.disabled = false;
                saveDBButton.textContent = 'Save to Database';
            }
        };
        
        // Add buttons to container
        buttonContainer.appendChild(saveLocalButton);
        buttonContainer.appendChild(saveDBButton);
        
        // Replace original save button with new container
        saveButton.parentNode.replaceChild(buttonContainer, saveButton);
        
        console.log('Added database save functionality to settings page');
    }
});
