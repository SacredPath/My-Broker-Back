/**
 * Balance Management Integration
 * Handles fetching balance data from separate wallet tables
 */

class BalanceManager {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Get user balance data from wallet tables
     */
    async getUserBalances(userId) {
        console.log('BalanceManager: Fetching balances for user:', userId);
        
        // Check cache first
        const cached = this.cache.get(userId);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            console.log('BalanceManager: Using cached data for user:', userId);
            return cached.data;
        }

        try {
            // Fetch from user_balances table
            console.log('BalanceManager: Fetching user_balances...');
            const { data: userBalances, error: userBalancesError } = await window.API.request('user_balances?user_id=eq.' + userId);
            console.log('BalanceManager: user_balances result:', { data: userBalances, error: userBalancesError });
            
            // Fetch from wallet_balances table  
            console.log('BalanceManager: Fetching wallet_balances...');
            const { data: walletBalances, error: walletBalancesError } = await window.API.request('wallet_balances?user_id=eq.' + userId);
            console.log('BalanceManager: wallet_balances result:', { data: walletBalances, error: walletBalancesError });

            if (userBalancesError || walletBalancesError) {
                console.error('BalanceManager: Error fetching balance data:', userBalancesError || walletBalancesError);
                return { wallets: {}, totalBalance: 0, error: userBalancesError || walletBalancesError };
            }

            // Combine balance data
            const wallets = {};
            let totalBalance = 0;

            // Process user_balances
            if (userBalances && userBalances.length > 0) {
                userBalances.forEach(balance => {
                    const currency = balance.currency || 'USD';
                    wallets[currency] = {
                        balance: balance.amount || 0,
                        usd_value: balance.usd_value || 0,
                        type: 'user_balance',
                        last_updated: balance.updated_at
                    };
                    totalBalance += parseFloat(balance.amount || 0);
                });
            }

            // Process wallet_balances
            if (walletBalances && walletBalances.length > 0) {
                walletBalances.forEach(wallet => {
                    const currency = wallet.currency || 'USD';
                    // If wallet already exists from user_balances, merge the data
                    if (wallets[currency]) {
                        wallets[currency].available = wallet.available || 0;
                        wallets[currency].locked = wallet.locked || 0;
                        wallets[currency].total = wallet.total || 0;
                        wallets[currency].type = 'combined';
                    } else {
                        wallets[currency] = {
                            balance: wallet.total || wallet.available || 0,
                            available: wallet.available || 0,
                            locked: wallet.locked || 0,
                            total: wallet.total || 0,
                            type: 'wallet_balance',
                            last_updated: wallet.updated_at
                        };
                        totalBalance += parseFloat(wallet.total || wallet.available || 0);
                    }
                });
            }

            console.log('BalanceManager: Combined wallet data:', { wallets, totalBalance });

            // Cache the result
            this.cache.set(userId, {
                data: { wallets, totalBalance },
                timestamp: Date.now()
            });

            return { wallets, totalBalance };
        } catch (error) {
            console.error('BalanceManager: Error in getUserBalances:', error);
            return { wallets: {}, totalBalance: 0, error: error.message };
        }
    }

    /**
     * Get formatted balance text for display
     */
    getBalanceText(wallets) {
        const totalBalance = Object.values(wallets || {}).reduce((sum, wallet) => sum + wallet.balance, 0);
        return totalBalance > 0 ? `$${totalBalance.toLocaleString()}` : '$0';
    }

    /**
     * Clear cache for a specific user
     */
    clearUserCache(userId) {
        this.cache.delete(userId);
    }

    /**
     * Clear all cache
     */
    clearAllCache() {
        this.cache.clear();
    }
}

// Create global instance
window.balanceManager = new BalanceManager();
