-- Admin Query: Easy Update Examples for User Deposit Methods
-- Use these queries to quickly update deposit methods that users see

-- 1. Enable/Disable ACH Deposits for Users
UPDATE deposit_methods 
SET is_active = true, updated_at = NOW()
WHERE method_type = 'ach' AND currency = 'USD';

-- 2. Update ACH Bank Details (Change these values)
UPDATE deposit_methods 
SET 
    bank_name = 'Your Bank Name',
    account_number = '123456789',
    routing_number = '021000021',
    instructions = 'Please transfer funds to the account above. Reference your user ID.',
    min_amount = 100,
    max_amount = 50000,
    fee_percentage = 0,
    fixed_fee = 25,
    processing_time_hours = 72,
    is_active = true,
    updated_at = NOW()
WHERE method_type = 'ach' AND currency = 'USD';

-- 3. Update PayPal Settings (Change these values)
UPDATE deposit_methods 
SET 
    paypal_email = 'payments@yourcompany.com',
    paypal_business_name = 'Your Company Inc',
    instructions = 'Send PayPal payment to the email above. Include your user ID in notes.',
    min_amount = 50,
    max_amount = 10000,
    fee_percentage = 2.9,
    fixed_fee = 0.30,
    processing_time_hours = 24,
    is_active = true,
    updated_at = NOW()
WHERE method_type = 'paypal';

-- 4. Update Bitcoin Wallet (Change these values)
UPDATE deposit_methods 
SET 
    address = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    instructions = 'Send Bitcoin to the address above. Minimum confirmation: 3 blocks.',
    min_amount = 0.0001,
    max_amount = 10,
    fee_percentage = 0.1,
    fixed_fee = 0.0005,
    processing_time_hours = 60,
    is_active = true,
    updated_at = NOW()
WHERE method_type = 'crypto' AND currency = 'BTC';

-- 5. Update USDT TRC20 Wallet (Change these values)
UPDATE deposit_methods 
SET 
    address = 'TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    instructions = 'Send USDT (TRC20 only) to the address above. Do not send other networks.',
    min_amount = 10,
    max_amount = 50000,
    fee_percentage = 0,
    fixed_fee = 1,
    processing_time_hours = 30,
    is_active = true,
    updated_at = NOW()
WHERE method_type = 'crypto' AND currency = 'USDT';

-- 6. Quick Toggle: Disable All Deposits (Maintenance Mode)
UPDATE deposit_methods 
SET is_active = false, updated_at = NOW();

-- 7. Quick Toggle: Enable All Deposits
UPDATE deposit_methods 
SET is_active = true, updated_at = NOW();
