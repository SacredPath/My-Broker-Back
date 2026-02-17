-- Create notifications table for storing user notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'trade', 'kyc', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_email_sent BOOLEAN DEFAULT FALSE,
    is_push_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notification delivery logs
CREATE TABLE IF NOT EXISTS notification_delivery_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL REFERENCES notifications(id),
    delivery_type TEXT NOT NULL CHECK (delivery_type IN ('email', 'push')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grant permissions
GRANT ALL ON notifications TO service_role;
GRANT ALL ON notifications TO authenticated;
GRANT ALL ON notification_delivery_logs TO service_role;
GRANT ALL ON notification_delivery_logs TO authenticated;

-- Create notification sending function
CREATE OR REPLACE FUNCTION send_notification(
    p_user_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    notification_id UUID;
    email_enabled BOOLEAN;
    push_enabled BOOLEAN;
BEGIN
    -- Get user notification preferences
    SELECT 
        CASE p_type 
            WHEN 'deposit' THEN email_deposits
            WHEN 'withdrawal' THEN email_withdrawals
            WHEN 'trade' THEN email_trades
            WHEN 'kyc' THEN email_kyc
            WHEN 'system' THEN email_system
            ELSE true
        END as email_enabled,
        CASE p_type 
            WHEN 'deposit' THEN push_deposits
            WHEN 'withdrawal' THEN push_withdrawals
            WHEN 'trade' THEN push_trades
            WHEN 'kyc' THEN push_kyc
            WHEN 'system' THEN push_system
            ELSE true
        END as push_enabled
    INTO email_enabled, push_enabled
    FROM notification_settings 
    WHERE user_id = p_user_id;
    
    -- Use defaults if no settings found
    IF email_enabled IS NULL THEN
        email_enabled := true;
        push_enabled := true;
    END IF;
    
    -- Create notification record
    INSERT INTO notifications (user_id, type, title, message, is_email_sent, is_push_sent)
    VALUES (p_user_id, p_type, p_title, p_message, NOT email_enabled, NOT push_enabled)
    RETURNING id INTO notification_id;
    
    -- Queue email delivery if enabled
    IF email_enabled THEN
        INSERT INTO notification_delivery_logs (notification_id, delivery_type, status)
        VALUES (notification_id, 'email', 'pending');
    END IF;
    
    -- Queue push delivery if enabled
    IF push_enabled THEN
        INSERT INTO notification_delivery_logs (notification_id, delivery_type, status)
        VALUES (notification_id, 'push', 'pending');
    END IF;
    
    RETURN notification_id;
END;
$$;

-- Create function to get user notifications
CREATE OR REPLACE FUNCTION get_user_notifications(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    type TEXT,
    title TEXT,
    message TEXT,
    is_read BOOLEAN,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id,
        n.type,
        n.title,
        n.message,
        n.is_read,
        n.created_at
    FROM notifications n
    WHERE n.user_id = p_user_id
    ORDER BY n.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- Create function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(
    p_notification_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE notifications 
    SET is_read = TRUE, updated_at = NOW()
    WHERE id = p_notification_id AND user_id = p_user_id;
    
    RETURN FOUND;
END;
$$;

-- Create function to mark all notifications as read for user
CREATE OR REPLACE FUNCTION mark_all_notifications_read(
    p_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE notifications 
    SET is_read = TRUE, updated_at = NOW()
    WHERE user_id = p_user_id AND is_read = FALSE;
    
    RETURN ROW_COUNT;
END;
$$;
