-- Create admin bypass table for deposit methods
CREATE TABLE IF NOT EXISTS admin_deposit_method_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    method_id UUID,
    name TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    min_amount DECIMAL DEFAULT 0,
    max_amount DECIMAL DEFAULT 999999,
    fee_percentage DECIMAL DEFAULT 0,
    fee_fixed DECIMAL DEFAULT 0,
    processing_time_hours INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    processed BOOLEAN DEFAULT FALSE
);

-- Grant admin access to bypass table
GRANT ALL ON admin_deposit_method_updates TO service_role;
GRANT ALL ON admin_deposit_method_updates TO authenticated;

-- Function to process admin deposit method updates
CREATE OR REPLACE FUNCTION process_admin_deposit_method_updates()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Process new deposit methods
    INSERT INTO deposit_methods (id, name, description, is_active, min_amount, max_amount, fee_percentage, fee_fixed, processing_time_hours, created_at, updated_at)
    SELECT 
        COALESCE(admu.method_id, gen_random_uuid()),
        admu.name,
        admu.description,
        admu.is_active,
        admu.min_amount,
        admu.max_amount,
        admu.fee_percentage,
        admu.fee_fixed,
        admu.processing_time_hours,
        admu.created_at,
        admu.updated_at
    FROM admin_deposit_method_updates admu
    WHERE admu.processed = FALSE
        AND admu.method_id IS NULL
    ON CONFLICT (id) DO NOTHING;
    
    -- Update existing deposit methods
    UPDATE deposit_methods dm
    SET 
        name = admu.name,
        description = admu.description,
        is_active = admu.is_active,
        min_amount = admu.min_amount,
        max_amount = admu.max_amount,
        fee_percentage = admu.fee_percentage,
        fee_fixed = admu.fee_fixed,
        processing_time_hours = admu.processing_time_hours,
        updated_at = NOW()
    FROM admin_deposit_method_updates admu
    WHERE dm.id = admu.method_id 
        AND admu.processed = FALSE;
    
    -- Mark as processed
    UPDATE admin_deposit_method_updates 
    SET processed = TRUE 
    WHERE processed = FALSE;
END;
$$;
