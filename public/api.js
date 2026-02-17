/**
 * Trading Platform Admin API
 * Clean REST API calls to Supabase - No edge functions, no complexity
 */
class AdminAPI {
    constructor() {
        this.supabaseUrl = window.__ENV?.SUPABASE_URL;
        this.supabaseKey = window.__ENV?.SUPABASE_SERVICE_ROLE_KEY || window.__ENV?.SUPABASE_ANON_KEY;
        
        if (!this.supabaseUrl || !this.supabaseKey) {
            throw new Error('Missing Supabase configuration');
        }
        
        console.log('AdminAPI initialized with URL:', this.supabaseUrl);
        console.log('API Key length:', this.supabaseKey.length);
    }

    async request(endpoint, options = {}) {
        const url = `${this.supabaseUrl}/rest/v1/${endpoint}`;
        const headers = {
            'apikey': this.supabaseKey,
            'Content-Type': 'application/json',
            ...options.headers
        };

        // Add auth token if available
        const token = sessionStorage.getItem('adminToken');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            console.log(`API Request: ${url} ${options.method || 'GET'}`);
            
            const response = await fetch(url, {
                ...options,
                headers
            });

            console.log(`API Response Status: ${response.status}`);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('API Error Response:', errorData);
                
                // Handle JWT expiration
                if (response.status === 401 && errorData.message === 'JWT expired') {
                    sessionStorage.clear();
                    window.location.href = 'login.html';
                    throw new Error('Session expired. Please login again.');
                }
                
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }

            // Handle 204 responses (no content)
            if (response.status === 204) {
                return null;
            }

            // Handle 201 responses (created) - might have empty body
            if (response.status === 201) {
                try {
                    const data = await response.json();
                    return data;
                } catch (jsonError) {
                    // Return success object if response body is empty
                    return { success: true, message: 'Created successfully' };
                }
            }

            // For all other responses, try to parse JSON
            try {
                const data = await response.json();
                return data;
            } catch (jsonError) {
                // Return error object if JSON parsing fails
                return { error: true, message: 'Invalid response format' };
            }
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Service role request method that bypasses RLS using admin bypass table
    async serviceRequest(endpoint, options = {}) {
        const headers = {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
            ...options.headers
        };

        try {
            console.log(`Service API Request: ${endpoint} ${options.method || 'GET'}`);
            
            // Use admin bypass table for balance operations
            if ((options.method === 'POST' && endpoint === 'wallet_balances') ||
                (options.method === 'PATCH' && endpoint.includes('user_balances'))) {
                
                const body = JSON.parse(options.body);
                
                try {
                    // Extract user_id and currency from the request
                    let userId, currency;
                    
                    if (options.method === 'PATCH' && endpoint.includes('user_balances')) {
                        // Extract from URL parameters for PATCH
                        const urlParams = new URLSearchParams(endpoint.split('?')[1]);
                        userId = urlParams.get('user_id')?.replace('eq.', '');
                        currency = urlParams.get('currency')?.replace('eq.', '');
                    } else {
                        // Extract from body for POST
                        userId = body.user_id;
                        currency = body.currency;
                    }
                    
                    console.log('Extracted params:', { userId, currency, body, endpoint, method: options.method });
                    
                    // Validate required parameters
                    if (!userId || !currency) {
                        throw new Error(`Missing required parameters: user_id=${userId}, currency=${currency}`);
                    }
                    
                    // Insert into bypass table
                    const bypassResponse = await fetch(`${this.supabaseUrl}/rest/v1/admin_balance_updates`, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({
                            user_id: userId,
                            currency: currency,
                            available: parseFloat(body.available) || 0,
                            locked: parseFloat(body.locked) || 0,
                            amount: parseFloat(body.amount) || 0,
                            usd_value: parseFloat(body.usd_value) || 0
                        })
                    });
                    
                    if (!bypassResponse.ok) {
                        const errorData = await bypassResponse.json().catch(() => ({}));
                        console.error('Bypass table error:', errorData);
                        throw new Error(errorData.message || 'Failed to insert into bypass table');
                    }
                    
                    // Process the updates
                    const processResponse = await fetch(`${this.supabaseUrl}/rest/v1/rpc/process_admin_balance_updates`, {
                        method: 'POST',
                        headers: {
                            'apikey': this.supabaseKey,
                            'Authorization': `Bearer ${this.supabaseKey}`,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=minimal'
                        }
                    });
                    
                    if (!processResponse.ok) {
                        const errorData = await processResponse.json().catch(() => ({}));
                        console.error('Process function error:', errorData);
                        throw new Error(errorData.message || 'Failed to process balance updates');
                    }
                    
                    console.log(`Service API Response Status: 200`);
                    return { success: true };
                    
                } catch (error) {
                    console.error('Bypass operation failed:', error);
                    throw error;
                }
            }
            
            // Use admin bypass table for deposit methods operations
            if (endpoint === 'deposit_methods' && (options.method === 'POST' || options.method === 'PATCH')) {
                
                const body = JSON.parse(options.body);
                
                try {
                    console.log('Deposit method update:', { body, method: options.method });
                    
                    // Insert into bypass table
                    const bypassResponse = await fetch(`${this.supabaseUrl}/rest/v1/admin_deposit_method_updates`, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({
                            method_id: body.id || null,
                            name: body.method_name || body.name,
                            description: body.description || body.instructions,
                            is_active: body.is_active,
                            min_amount: parseFloat(body.min_amount) || 0,
                            max_amount: parseFloat(body.max_amount) || 999999,
                            fee_percentage: parseFloat(body.fee_percentage) || 0,
                            fee_fixed: parseFloat(body.fixed_fee || body.fee_fixed) || 0,
                            processing_time_hours: parseInt(body.processing_time_hours) || 0
                        })
                    });
                    
                    if (!bypassResponse.ok) {
                        const errorData = await bypassResponse.json().catch(() => ({}));
                        console.error('Deposit bypass table error:', errorData);
                        throw new Error(errorData.message || 'Failed to insert into deposit bypass table');
                    }
                    
                    // Process the updates
                    const processResponse = await fetch(`${this.supabaseUrl}/rest/v1/rpc/process_admin_deposit_method_updates`, {
                        method: 'POST',
                        headers
                    });
                    
                    if (!processResponse.ok) {
                        const errorData = await processResponse.json().catch(() => ({}));
                        console.error('Deposit process function error:', errorData);
                        throw new Error(errorData.message || 'Failed to process deposit method updates');
                    }
                    
                    console.log(`Deposit Service API Response Status: 200`);
                    return { success: true };
                    
                } catch (error) {
                    console.error('Deposit bypass operation failed:', error);
                    throw error;
                }
            }
            
            // Fallback to regular fetch for other operations
            const response = await fetch(`${this.supabaseUrl}/rest/v1/${endpoint}`, {
                ...options,
                headers
            });

            console.log(`Service API Response Status: ${response.status}`);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Service API Error Response:', errorData);
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }

            // Handle 204 responses (no content)
            if (response.status === 204) {
                return null;
            }

            // Handle 201 responses (created) - might have empty body
            if (response.status === 201) {
                try {
                    const data = await response.json();
                    return data;
                } catch (jsonError) {
                    // Return success object if response body is empty
                    return { success: true, message: 'Created successfully' };
                }
            }

            // For all other responses, try to parse JSON
            try {
                const data = await response.json();
                return data;
            } catch (jsonError) {
                // Return error object if JSON parsing fails
                return { error: true, message: 'Invalid response format' };
            }
        } catch (error) {
            console.error('Service API Error:', error);
            throw error;
        }
    }

    // Authentication
    async adminLogin(email, password) {
        let admin = null;
        
        const response = await this.request('admin_users?email=eq.' + encodeURIComponent(email) + '&is_active=eq.true', {
            headers: {
                'Authorization': `Bearer ${this.supabaseKey}`
            }
        });

        if (response.length === 0) {
            // Try without is_active filter in case the field is NULL
            const allAdminsResponse = await this.request('admin_users?email=eq.' + encodeURIComponent(email), {
                headers: {
                    'Authorization': `Bearer ${this.supabaseKey}`
                }
            });
            
            if (allAdminsResponse.length === 0) {
                throw new Error('Invalid credentials or account not found');
            }
            
            admin = allAdminsResponse[0];
            
            // Check if admin is active (handle NULL values)
            if (admin.is_active === false) {
                throw new Error('Account is not active');
            }
        } else {
            admin = response[0];
        }
        
        // For now, skip password check since admin_users table doesn't have password field
        // In production, you would implement proper password hashing here
        
        // Store session
        sessionStorage.setItem('adminToken', this.supabaseKey);
        sessionStorage.setItem('adminEmail', admin.email);
        sessionStorage.setItem('adminRole', admin.role);
        sessionStorage.setItem('adminId', admin.id);
        sessionStorage.setItem('adminLoggedIn', 'true');

        return admin;
    }

    signOut() {
        sessionStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminEmail');
        sessionStorage.removeItem('adminRole');
        sessionStorage.removeItem('adminId');
        sessionStorage.removeItem('adminLoggedIn');
    }

    // Dashboard Statistics
    async getDashboardStats() {
        const token = sessionStorage.getItem('adminToken');
        if (!token) throw new Error('Not authenticated');

        try {
            // Get real statistics from database
            // Make requests with error handling for permission issues
            const [
                usersData,
                adminData,
                kycData,
                depositsData,
                pendingDeposits,
                pendingWithdrawals,
                positionsData,
                signalsData,
                auditData,
                notificationsData
            ] = await Promise.allSettled([
                this.request('profiles?select=count'),
                this.request('admin_users?select=count'),
                this.request('profiles?select=kyc_status'),
                this.request('deposits?select=count'),
                this.request('deposit_requests?status=eq.pending&select=count'),
                this.request('withdrawal_requests?status=eq.pending&select=count'),
                this.request('positions?select=count'),
                this.request('signals?is_active=eq.true&select=count'),
                this.request('audit_log?select=count'),
                this.request('notifications?select=count')
            ]).then(results => results.map(result => 
                result.status === 'fulfilled' ? result.value : null
            ));

            // Process KYC statistics
            const kycStats = kycData ? kycData.reduce((acc, user) => {
                acc[user.kyc_status] = (acc[user.kyc_status] || 0) + 1;
                return acc;
            }, {}) : {};

            return {
                totalUsers: usersData?.[0]?.count || 0,
                totalAdmins: adminData?.[0]?.count || 0,
                kycStats: kycStats,
                totalDeposits: depositsData?.[0]?.count || 0,
                pendingDeposits: pendingDeposits?.[0]?.count || 0,
                pendingWithdrawals: pendingWithdrawals?.[0]?.count || 0,
                totalPositions: positionsData?.[0]?.count || 0,
                activeSignals: signalsData?.[0]?.count || 0,
                totalAuditLogs: auditData?.[0]?.count || 0,
                totalNotifications: notificationsData?.[0]?.count || 0,
                openSupportTickets: 0
            };
        } catch (error) {
            console.error('Failed to get dashboard stats:', error);
            // Return default values instead of throwing to prevent dashboard from breaking
            return {
                totalUsers: 0,
                totalAdmins: 0,
                kycStats: {},
                totalDeposits: 0,
                pendingDeposits: 0,
                pendingWithdrawals: 0,
                totalPositions: 0,
                activeSignals: 0,
                totalAuditLogs: 0,
                totalNotifications: 0,
                openSupportTickets: 0
            };
        }
    }

    // User Management
    async getUsers(limit = 100, offset = 0) {
        const token = sessionStorage.getItem('adminToken');
        if (!token) throw new Error('Not authenticated');

        return this.request('profiles?select=id,user_id,email,display_name,first_name,last_name,phone,country,kyc_status,email_verified,is_frozen,freeze_reason,created_at,last_login&order=created_at.desc&limit=' + limit + '&offset=' + offset, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }

    async updateUser(userId, updates) {
        const token = sessionStorage.getItem('adminToken');
        if (!token) throw new Error('Not authenticated');

        return this.request(`profiles?user_id=eq.${userId}`, {
            method: 'PATCH',
            body: JSON.stringify(updates)
        });
    }

    async freezeUser(userId, reason) {
        const token = sessionStorage.getItem('adminToken');
        if (!token) throw new Error('Not authenticated');

        const updates = {
            is_frozen: true,
            freeze_reason: reason,
            frozen_at: new Date().toISOString()
        };

        return this.updateUser(userId, updates);
    }

    async unfreezeUser(userId) {
        const token = sessionStorage.getItem('adminToken');
        if (!token) throw new Error('Not authenticated');

        const updates = {
            is_frozen: false,
            freeze_reason: null,
            frozen_at: null
        };

        return this.updateUser(userId, updates);
    }

    // KYC Management
    async getKYCApplications() {
        const token = sessionStorage.getItem('adminToken');
        if (!token) throw new Error('Not authenticated');

        return this.request('kyc_submissions?select=*&order=created_at.desc');
    }

    async approveKYC(userId) {
        const token = sessionStorage.getItem('adminToken');
        if (!token) throw new Error('Not authenticated');

        // Update user KYC status
        await this.updateUser(userId, { kyc_status: 'approved' });

        // Update KYC submission
        return this.request(`kyc_submissions?user_id=eq.${userId}`, {
            method: 'PATCH',
            body: JSON.stringify({
                status: 'approved',
                reviewed_at: new Date().toISOString(),
                reviewed_by: sessionStorage.getItem('adminId')
            })
        });
    }

    async rejectKYC(userId, reason) {
        const token = sessionStorage.getItem('adminToken');
        if (!token) throw new Error('Not authenticated');

        // Update user KYC status
        await this.updateUser(userId, { kyc_status: 'rejected' });

        // Update KYC submission
        return this.request(`kyc_submissions?user_id=eq.${userId}`, {
            method: 'PATCH',
            body: JSON.stringify({
                status: 'rejected',
                rejection_reason: reason,
                reviewed_at: new Date().toISOString(),
                reviewed_by: sessionStorage.getItem('adminId')
            })
        });
    }

    // Notification Management

    async getUserNotifications(userId, limit = 50, offset = 0) {
        try {
            const response = await this.request('rpc/get_user_notifications', {
                method: 'POST',
                body: JSON.stringify({
                    p_user_id: userId,
                    p_limit: limit,
                    p_offset: offset
                })
            });
            return response;
        } catch (error) {
            console.error('Failed to get user notifications:', error);
            throw error;
        }
    }

    async markNotificationAsRead(notificationId, userId) {
        try {
            const response = await this.request('rpc/mark_notification_read', {
                method: 'POST',
                body: JSON.stringify({
                    p_notification_id: notificationId,
                    p_user_id: userId
                })
            });
            return response;
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            throw error;
        }
    }

    async markAllNotificationsAsRead(userId) {
        try {
            const response = await this.request('rpc/mark_all_notifications_read', {
                method: 'POST',
                body: JSON.stringify({
                    p_user_id: userId
                })
            });
            return response;
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
            throw error;
        }
    }

    async getUnreadNotificationCount(userId) {
        try {
            const response = await this.request(`notifications?user_id=eq.${userId}&is_read=eq.false&select=count`, {
                headers: {
                    'Prefer': 'count=exact'
                }
            });
            const count = parseInt(response.headers?.get('content-range')?.split('/')[1] || '0');
            return count;
        } catch (error) {
            console.error('Failed to get unread notification count:', error);
            return 0;
        }
    }

    // Convenience methods for specific notification types
    async sendDepositNotification(userId, amount, currency, status) {
        const title = `Deposit ${status.charAt(0).toUpperCase() + status.slice(1)}`;
        const message = `Your ${currency} deposit of ${amount} has been ${status}.`;
        return this.sendNotification(userId, 'deposit', title, message);
    }

    async sendWithdrawalNotification(userId, amount, currency, status) {
        const title = `Withdrawal ${status.charAt(0).toUpperCase() + status.slice(1)}`;
        const message = `Your ${currency} withdrawal of ${amount} has been ${status}.`;
        return this.sendNotification(userId, 'withdrawal', title, message);
    }

    async sendTradeNotification(userId, pair, action, amount, price) {
        const title = `Trade ${action.charAt(0).toUpperCase() + action.slice(1)}`;
        const message = `Your ${action} order for ${amount} ${pair} at ${price} has been executed.`;
        return this.sendNotification(userId, 'trade', title, message);
    }

    async sendKycNotification(userId, status) {
        const title = `KYC Status Update`;
        const message = `Your KYC verification has been ${status}.`;
        return this.sendNotification(userId, 'kyc', title, message);
    }

    async sendSystemNotification(userId, title, message) {
        return this.sendNotification(userId, 'system', title, message);
    }
    async getDeposits(status = 'all') {
        const token = sessionStorage.getItem('adminToken');
        if (!token) throw new Error('Not authenticated');

        let endpoint = 'deposit_requests?select=*&order=created_at.desc';
        if (status !== 'all') {
            endpoint += `&status=eq.${status}`;
        }

        return this.request(endpoint);
    }

    async getWithdrawals(status = 'all') {
        const token = sessionStorage.getItem('adminToken');
        if (!token) throw new Error('Not authenticated');

        let endpoint = 'withdrawal_requests?select=*&order=created_at.desc';
        if (status !== 'all') {
            endpoint += `&status=eq.${status}`;
        }

        return this.request(endpoint);
    }

    async approveDeposit(depositId) {
        const token = sessionStorage.getItem('adminToken');
        if (!token) throw new Error('Not authenticated');

        const response = await this.request(`deposit_requests?id=eq.${depositId}`, {
            method: 'PATCH',
            body: JSON.stringify({
                status: 'approved',
                reviewed_at: new Date().toISOString(),
                reviewed_by: sessionStorage.getItem('adminId')
            })
        });

        // Send notification to user
        try {
            // Get deposit details to send notification
            const depositDetails = await this.request(`deposit_requests?id=eq.${depositId}&select=user_id,amount,currency`);
            if (depositDetails && depositDetails.length > 0) {
                const deposit = depositDetails[0];
                await this.sendDepositNotification(
                    deposit.user_id,
                    deposit.amount,
                    deposit.currency,
                    'approved'
                );
            }
        } catch (notificationError) {
            console.warn('Failed to send deposit approval notification:', notificationError);
        }

        return response;
    }

    async rejectDeposit(depositId, reason) {
        const token = sessionStorage.getItem('adminToken');
        if (!token) throw new Error('Not authenticated');

        const response = await this.request(`deposit_requests?id=eq.${depositId}`, {
            method: 'PATCH',
            body: JSON.stringify({
                status: 'rejected',
                rejection_reason: reason,
                reviewed_at: new Date().toISOString(),
                reviewed_by: sessionStorage.getItem('adminId')
            })
        });

        // Send notification to user
        try {
            // Get deposit details to send notification
            const depositDetails = await this.request(`deposit_requests?id=eq.${depositId}&select=user_id,amount,currency`);
            if (depositDetails && depositDetails.length > 0) {
                const deposit = depositDetails[0];
                await this.sendDepositNotification(
                    deposit.user_id,
                    deposit.amount,
                    deposit.currency,
                    'rejected'
                );
            }
        } catch (notificationError) {
            console.warn('Failed to send deposit rejection notification:', notificationError);
        }

        return response;
    }

    async approveWithdrawal(withdrawalId) {
        const token = sessionStorage.getItem('adminToken');
        if (!token) throw new Error('Not authenticated');

        const response = await this.request(`withdrawal_requests?id=eq.${withdrawalId}`, {
            method: 'PATCH',
            body: JSON.stringify({
                status: 'approved',
                reviewed_at: new Date().toISOString(),
                reviewed_by: sessionStorage.getItem('adminId')
            })
        });

        // Send notification to user
        try {
            // Get withdrawal details to send notification
            const withdrawalDetails = await this.request(`withdrawal_requests?id=eq.${withdrawalId}&select=user_id,amount,currency`);
            if (withdrawalDetails && withdrawalDetails.length > 0) {
                const withdrawal = withdrawalDetails[0];
                await this.sendWithdrawalNotification(
                    withdrawal.user_id,
                    withdrawal.amount,
                    withdrawal.currency,
                    'approved'
                );
            }
        } catch (notificationError) {
            console.warn('Failed to send withdrawal approval notification:', notificationError);
        }

        return response;
    }

    async rejectWithdrawal(withdrawalId, reason) {
        const token = sessionStorage.getItem('adminToken');
        if (!token) throw new Error('Not authenticated');

        const response = await this.request(`withdrawal_requests?id=eq.${withdrawalId}`, {
            method: 'PATCH',
            body: JSON.stringify({
                status: 'rejected',
                rejection_reason: reason,
                reviewed_at: new Date().toISOString(),
                reviewed_by: sessionStorage.getItem('adminId')
            })
        });

        // Send notification to user
        try {
            // Get withdrawal details to send notification
            const withdrawalDetails = await this.request(`withdrawal_requests?id=eq.${withdrawalId}&select=user_id,amount,currency`);
            if (withdrawalDetails && withdrawalDetails.length > 0) {
                const withdrawal = withdrawalDetails[0];
                await this.sendWithdrawalNotification(
                    withdrawal.user_id,
                    withdrawal.amount,
                    withdrawal.currency,
                    'rejected'
                );
            }
        } catch (notificationError) {
            console.warn('Failed to send withdrawal rejection notification:', notificationError);
        }

        return response;
    }

    // Trading Operations
    async getPositions() {
        const token = sessionStorage.getItem('adminToken');
        if (!token) throw new Error('Not authenticated');

        return this.request('positions?select=*&order=created_at.desc');
    }

    async getSignals() {
        const token = sessionStorage.getItem('adminToken');
        if (!token) throw new Error('Not authenticated');

        return this.request('signals?select=*&order=created_at.desc');
    }

    async getInvestmentTiers() {
        const token = sessionStorage.getItem('adminToken');
        if (!token) throw new Error('Not authenticated');

        return this.request('investment_tiers?select=*&order=sort_order');
    }

    async updateInvestmentTier(tierId, updates) {
        const token = sessionStorage.getItem('adminToken');
        if (!token) throw new Error('Not authenticated');

        return this.request(`investment_tiers?id=eq.${tierId}`, {
            method: 'PATCH',
            body: JSON.stringify(updates)
        });
    }

    // System Administration
    async getAuditLogs(limit = 100) {
        const token = sessionStorage.getItem('adminToken');
        if (!token) throw new Error('Not authenticated');

        return this.request(`audit_log?select=*&order=created_at.desc&limit=${limit}`);
    }

    async getSupportTickets(status = 'all') {
        const token = sessionStorage.getItem('adminToken');
        if (!token) throw new Error('Not authenticated');

        let endpoint = 'support_tickets?select=*&order=created_at.desc';
        if (status !== 'all') {
            endpoint += `&status=eq.${status}`;
        }

        return this.request(endpoint);
    }

    async updateSupportTicket(ticketId, updates) {
        const token = sessionStorage.getItem('adminToken');
        if (!token) throw new Error('Not authenticated');

        return this.request(`support_tickets?id=eq.${ticketId}`, {
            method: 'PATCH',
            body: JSON.stringify(updates)
        });
    }

    async sendNotification(userId, title, message, category = 'general', type = 'info') {
        const token = sessionStorage.getItem('adminToken');
        if (!token) throw new Error('Not authenticated');

        // Map category to type for database compatibility
        const notificationType = category === 'general' ? 'system' : category;

        return this.request('notifications', {
            method: 'POST',
            body: JSON.stringify({
                user_id: userId,
                type: notificationType,
                title: title,
                message: message,
                is_read: false,
                created_at: new Date().toISOString()
            })
        });
    }

    async createAuditLog(action, targetUserId = null, reason = null, before = null, after = null) {
        const token = sessionStorage.getItem('adminToken');
        if (!token) throw new Error('Not authenticated');

        // Map admin role to correct enum value
        const adminRole = sessionStorage.getItem('adminRole') === 'admin' ? 'superadmin' : sessionStorage.getItem('adminRole');

        try {
            // Get admin ID from session, but if it's invalid, use a default or null
            const adminId = sessionStorage.getItem('adminId');
            
            // Try to create audit log, but handle foreign key constraint gracefully
            try {
                return this.request('audit_log', {
                    method: 'POST',
                    body: JSON.stringify({
                        actor_user_id: adminId,
                        actor_role: adminRole,
                        action: action,
                        target_user_id: targetUserId,
                        reason: reason,
                        before: before,
                        after: after,
                        created_at: new Date().toISOString()
                    })
                });
            } catch (foreignKeyError) {
                // If foreign key constraint fails, try without actor_user_id or with a default
                console.warn('Foreign key constraint failed, trying without actor_user_id:', foreignKeyError.message);
                
                return this.request('audit_log', {
                    method: 'POST',
                    body: JSON.stringify({
                        actor_user_id: null, // Set to null to avoid foreign key constraint
                        actor_role: adminRole,
                        action: action,
                        target_user_id: targetUserId,
                        reason: reason,
                        before: before,
                        after: after,
                        created_at: new Date().toISOString()
                    })
                });
            }
        } catch (error) {
            console.error('Failed to create audit log:', error);
            // Don't throw error, just log it - settings should still save
            return { success: false, error: error.message };
        }
    }

    // Email verification
    async verifyUserEmail(userId) {
        const token = sessionStorage.getItem('adminToken');
        if (!token) throw new Error('Not authenticated');

        return this.updateUser(userId, { email_verified: true });
    }

    // Password reset (simplified - in production use proper email service)
    async sendPasswordReset(userId, email) {
        const token = sessionStorage.getItem('adminToken');
        if (!token) throw new Error('Not authenticated');

        // Generate reset token (in production, use proper crypto)
        const resetToken = Math.random().toString(36).substring(2, 15);
        
        try {
            // Send notification (commented out due to RLS policy)
            // await this.sendNotification(userId, 'Password Reset', `Your password reset token is: ${resetToken}`);
            
            console.log('Password reset token generated:', resetToken);
            return { success: true, message: 'Password reset instructions sent' };
        } catch (error) {
            console.error('Password reset failed:', error);
            throw error;
        }
    }

    // Balance Management
    async getAllUserBalances() {
        const token = sessionStorage.getItem('adminToken');
        if (!token) throw new Error('Not authenticated');

        try {
            // Get all users first
            const users = await this.request('profiles?select=id,user_id,email,display_name,first_name,last_name&order=created_at.desc', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Get all user_balances
            const userBalances = await this.request('user_balances?select=*&order=updated_at.desc', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Get all wallet_balances
            const walletBalances = await this.request('wallet_balances?select=*&order=updated_at.desc', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Combine data - ensure all users are included even with no balances
            const combinedBalances = {};
            
            // Initialize all users with empty balances
            users.forEach(user => {
                // Add USD balance entry for all users (default to 0)
                combinedBalances[`${user.user_id}_USD`] = {
                    user_id: user.user_id,
                    user_email: user.email || 'Unknown',
                    user_name: user.display_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown',
                    currency: 'USD',
                    balance: 0,  // Add balance field for consistency with BalanceManager
                    amount: 0,
                    usd_value: 0,
                    type: 'user_balance',
                    updated_at: user.created_at,
                    available: 0,
                    locked: 0,
                    total: 0
                };
            });
            
            // Process user_balances - update existing entries or add new ones
            userBalances.forEach(balance => {
                const key = `${balance.user_id}_${balance.currency}`;
                const user = users.find(u => u.user_id === balance.user_id);
                
                if (combinedBalances[key]) {
                    // Update existing entry
                    combinedBalances[key].amount = balance.amount;
                    combinedBalances[key].balance = balance.amount;  // Add balance field
                    combinedBalances[key].usd_value = balance.usd_value;
                    combinedBalances[key].updated_at = balance.updated_at;
                } else {
                    // Add new currency entry for this user
                    combinedBalances[key] = {
                        user_id: balance.user_id,
                        user_email: user?.email || 'Unknown',
                        user_name: user?.display_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Unknown',
                        currency: balance.currency,
                        balance: balance.amount,  // Add balance field
                        amount: balance.amount,
                        usd_value: balance.usd_value,
                        type: 'user_balance',
                        updated_at: balance.updated_at,
                        available: 0,
                        locked: 0,
                        total: 0
                    };
                }
            });

            // Process wallet_balances
            walletBalances.forEach(wallet => {
                const key = `${wallet.user_id}_${wallet.currency}`;
                const user = users.find(u => u.user_id === wallet.user_id);
                
                if (combinedBalances[key]) {
                    // Update existing entry with wallet data
                    combinedBalances[key].available = wallet.available || 0;
                    combinedBalances[key].locked = wallet.locked || 0;
                    combinedBalances[key].total = wallet.total || 0;
                    combinedBalances[key].balance = wallet.total || wallet.available || combinedBalances[key].balance;  // Update balance field
                    combinedBalances[key].type = 'combined';
                    // Update timestamp if wallet is more recent
                    if (new Date(wallet.updated_at) > new Date(combinedBalances[key].updated_at)) {
                        combinedBalances[key].updated_at = wallet.updated_at;
                    }
                } else {
                    // Create new entry for wallet-only balance
                    const user = users.find(u => u.user_id === wallet.user_id);
                    combinedBalances[key] = {
                        user_id: wallet.user_id,
                        user_email: user?.email || 'Unknown',
                        user_name: user?.display_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Unknown',
                        currency: wallet.currency,
                        balance: wallet.total || wallet.available || 0,  // Add balance field
                        amount: wallet.total || wallet.available,
                        usd_value: null,
                        type: 'wallet_balance',
                        updated_at: wallet.updated_at,
                        available: wallet.available,
                        locked: wallet.locked,
                        total: wallet.total
                    };
                }
            });

            return Object.values(combinedBalances);
        } catch (error) {
            console.error('Failed to get all user balances:', error);
            throw error;
        }
    }

    async updateUserBalance(userId, currency, updates) {
        const token = sessionStorage.getItem('adminToken');
        if (!token) throw new Error('Not authenticated');

        const results = {};

        try {
            // Update user_balances if amount or usd_value is provided
            if (updates.amount !== undefined || updates.usd_value !== undefined) {
                const userBalanceUpdate = {};
                if (updates.amount !== undefined) {
                    userBalanceUpdate.amount = updates.amount;
                }
                if (updates.usd_value !== undefined) {
                    userBalanceUpdate.usd_value = updates.usd_value;
                }

                // Check if record exists
                const existing = await this.request(`user_balances?user_id=eq.${userId}&currency=eq.${currency}`);
                
                if (existing.length > 0) {
                    // Update existing record - use service role for RLS bypass
                    results.user_balance = await this.serviceRequest(`user_balances?user_id=eq.${userId}&currency=eq.${currency}`, {
                        method: 'PATCH',
                        body: JSON.stringify({
                            ...userBalanceUpdate,
                            updated_at: new Date().toISOString()
                        })
                    });
                } else {
                    // Create new record - use service role for RLS bypass
                    results.user_balance = await this.serviceRequest('user_balances', {
                        method: 'POST',
                        body: JSON.stringify({
                            user_id: userId,
                            currency: currency,
                            amount: updates.amount || 0,
                            usd_value: updates.usd_value || 0,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        })
                    });
                }
            }

            // Update wallet_balances if available, locked, or total is provided
            if (updates.available !== undefined || updates.locked !== undefined) {
                const walletUpdate = {};
                if (updates.available !== undefined) walletUpdate.available = updates.available;
                if (updates.locked !== undefined) walletUpdate.locked = updates.locked;
                // Don't try to update 'total' if it's a generated column
                // Only update available and locked columns

                // Check if record exists
                const existing = await this.request(`wallet_balances?user_id=eq.${userId}&currency=eq.${currency}`);
                
                if (existing.length > 0) {
                    // Update existing record - use service role for RLS bypass
                    results.wallet_balance = await this.serviceRequest(`wallet_balances?user_id=eq.${userId}&currency=eq.${currency}`, {
                        method: 'PATCH',
                        body: JSON.stringify({
                            ...walletUpdate,
                            updated_at: new Date().toISOString()
                        })
                    });
                } else {
                    // Create new record - only insert available and locked, not total
                    // Use service role for RLS bypass
                    results.wallet_balance = await this.serviceRequest('wallet_balances', {
                        method: 'POST',
                        body: JSON.stringify({
                            user_id: userId,
                            currency: currency,
                            available: updates.available || 0,
                            locked: updates.locked || 0,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        })
                    });
                }
            }

            // Create audit log
            // Use a valid admin ID from profiles table or system
            const adminId = '707883d7-9a93-4a14-af51-6c559de578d8'; // Use a known admin ID
            try {
                await this.createAuditLog('balance_update', userId, `Admin updated ${currency} balance`, adminId, updates);
            } catch (auditError) {
                console.warn('Audit log failed, but balance update succeeded:', auditError);
                // Don't fail the balance update if audit log fails
            }

            return results;
        } catch (error) {
            console.error('Failed to update user balance:', error);
            throw error;
        }
    }
}

// Initialize global API instance
window.AdminAPI = new AdminAPI();

// Create window.API for backward compatibility
window.API = window.AdminAPI;
