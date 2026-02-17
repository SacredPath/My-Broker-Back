-- Create notifications table if it doesn't exist (for storing actual notifications)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'trade', 'kyc', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grant permissions
GRANT ALL ON notifications TO service_role;
GRANT ALL ON notifications TO authenticated;

-- Create notification sending function that uses existing notification_settings
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
    -- Get user notification preferences from existing notification_settings table
    SELECT 
        CASE p_type 
            WHEN 'deposit' THEN ns.email_deposits
            WHEN 'withdrawal' THEN ns.email_withdrawals
            WHEN 'trade' THEN ns.email_trades
            WHEN 'kyc' THEN ns.email_kyc
            WHEN 'system' THEN ns.email_system
            ELSE true
        END as email_enabled,
        CASE p_type 
            WHEN 'deposit' THEN ns.push_deposits
            WHEN 'withdrawal' THEN ns.push_withdrawals
            WHEN 'trade' THEN ns.push_trades
            WHEN 'kyc' THEN ns.push_kyc
            WHEN 'system' THEN ns.push_system
            ELSE true
        END as push_enabled
    INTO email_enabled, push_enabled
    FROM notification_settings ns 
    WHERE ns.user_id = p_user_id;
    
    -- Use defaults if no settings found
    IF email_enabled IS NULL THEN
        email_enabled := true;
        push_enabled := true;
    END IF;
    
    -- Create notification record
    INSERT INTO notifications (user_id, type, title, message)
    VALUES (p_user_id, p_type, p_title, p_message)
    RETURNING id INTO notification_id;
    
    -- Here you would integrate with your email/push service
    -- For now, we just log that notifications should be sent
    IF email_enabled THEN
        RAISE LOG 'Email notification should be sent to user %: % - %', p_user_id, p_title, p_message;
    END IF;
    
    IF push_enabled THEN
        RAISE LOG 'Push notification should be sent to user %: % - %', p_user_id, p_title, p_message;
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
