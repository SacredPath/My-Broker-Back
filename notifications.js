/**
 * Notification Service
 * Handles sending and managing user notifications
 */

class NotificationService {
    constructor(supabaseUrl, supabaseKey) {
        this.supabaseUrl = supabaseUrl;
        this.supabaseKey = supabaseKey;
    }

    /**
     * Send a notification to a user
     */
    async sendNotification(userId, type, title, message) {
        try {
            const response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/send_notification`, {
                method: 'POST',
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    p_user_id: userId,
                    p_type: type,
                    p_title: title,
                    p_message: message
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to send notification');
            }

            const result = await response.json();
            console.log('Notification sent:', result);
            return result;

        } catch (error) {
            console.error('Error sending notification:', error);
            throw error;
        }
    }

    /**
     * Get user notifications
     */
    async getUserNotifications(userId, limit = 50, offset = 0) {
        try {
            const response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/get_user_notifications`, {
                method: 'POST',
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    p_user_id: userId,
                    p_limit: limit,
                    p_offset: offset
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to get notifications');
            }

            const notifications = await response.json();
            return notifications;

        } catch (error) {
            console.error('Error getting notifications:', error);
            throw error;
        }
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId, userId) {
        try {
            const response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/mark_notification_read`, {
                method: 'POST',
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    p_notification_id: notificationId,
                    p_user_id: userId
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to mark notification as read');
            }

            const result = await response.json();
            return result;

        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    /**
     * Mark all notifications as read for user
     */
    async markAllAsRead(userId) {
        try {
            const response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/mark_all_notifications_read`, {
                method: 'POST',
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    p_user_id: userId
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to mark all notifications as read');
            }

            const result = await response.json();
            return result;

        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }

    /**
     * Send deposit notification
     */
    async sendDepositNotification(userId, amount, currency, status) {
        const title = `Deposit ${status.charAt(0).toUpperCase() + status.slice(1)}`;
        const message = `Your ${currency} deposit of ${amount} has been ${status}.`;
        return this.sendNotification(userId, 'deposit', title, message);
    }

    /**
     * Send withdrawal notification
     */
    async sendWithdrawalNotification(userId, amount, currency, status) {
        const title = `Withdrawal ${status.charAt(0).toUpperCase() + status.slice(1)}`;
        const message = `Your ${currency} withdrawal of ${amount} has been ${status}.`;
        return this.sendNotification(userId, 'withdrawal', title, message);
    }

    /**
     * Send trade notification
     */
    async sendTradeNotification(userId, pair, action, amount, price) {
        const title = `Trade ${action.charAt(0).toUpperCase() + action.slice(1)}`;
        const message = `Your ${action} order for ${amount} ${pair} at ${price} has been executed.`;
        return this.sendNotification(userId, 'trade', title, message);
    }

    /**
     * Send KYC notification
     */
    async sendKycNotification(userId, status) {
        const title = `KYC Status Update`;
        const message = `Your KYC verification has been ${status}.`;
        return this.sendNotification(userId, 'kyc', title, message);
    }

    /**
     * Send system notification
     */
    async sendSystemNotification(userId, title, message) {
        return this.sendNotification(userId, 'system', title, message);
    }

    /**
     * Get unread notification count for user
     */
    async getUnreadCount(userId) {
        try {
            const response = await fetch(`${this.supabaseUrl}/rest/v1/notifications?user_id=eq.${userId}&is_read=eq.false&select=count`, {
                method: 'GET',
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'count=exact'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get unread count');
            }

            const count = parseInt(response.headers.get('content-range')?.split('/')[1] || '0');
            return count;

        } catch (error) {
            console.error('Error getting unread count:', error);
            return 0;
        }
    }
}

// Initialize global notification service
window.NotificationService = NotificationService;

// Auto-initialize with AdminAPI if available
if (window.AdminAPI) {
    window.notificationService = new NotificationService(
        window.AdminAPI.supabaseUrl,
        window.AdminAPI.supabaseKey
    );
}
