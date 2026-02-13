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
        // Check cache first
        const cached = this.cache.get(userId);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        try {
            // Fetch from user_wallets table
            const { data: userWallets, error: walletsError } = await window.API.request('user_wallets?user_id=eq.' + userId);
            
            // Fetch from crypto_wallets table  
            const { data: cryptoWallets, error: cryptoError } = await window.API.request('crypto_wallets?user_id=eq.' + userId);

            if (walletsError || cryptoError) {
                console.error('Error fetching wallet data:', walletsError || cryptoError);
                return { wallets: {}, totalBalance: 0 };
            }

            // Combine wallet data
            const wallets = {};
            let totalBalance = 0;

            // Process user_wallets
            if (userWallets) {
                userWallets.forEach(wallet => {
                    const currency = wallet.currency || 'USD';
                    wallets[currency] = {
                        balance: wallet.balance || 0,
                        available: wallet.available || 0,
                        frozen: wallet.frozen || 0,
                        type: wallet.type || 'fiat',
                        last_updated: wallet.updated_at
                    };
                    totalBalance += wallet.balance || 0;
                });
            }

            // Process crypto_wallets
            if (cryptoWallets) {
                cryptoWallets.forEach(wallet => {
                    const currency = wallet.currency || wallet.symbol || 'BTC';
                    wallets[currency] = {
                        balance: wallet.balance || 0,
                        available: wallet.available || 0,
                        frozen: wallet.frozen || 0,
                        type: 'crypto',
                        address: wallet.address,
                        network: wallet.network,
                        last_updated: wallet.updated_at
                    };
                    totalBalance += wallet.balance || 0;
                });
            }

            // Cache the result
            this.cache.set(userId, {
                data: { wallets, totalBalance },
                timestamp: Date.now()
            });

            return { wallets, totalBalance };
        } catch (error) {
            console.error('Error in getUserBalances:', error);
            return { wallets: {}, totalBalance: 0 };
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
