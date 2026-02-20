/**
 * Settings Management JavaScript
 * Handles all settings page functionality
 */
class BackofficeSettings {
    constructor() {
        this.settings = {
            general: {
                siteName: 'PALANTIR Trading Platform',
                siteUrl: 'https://trading.example.com',
                adminEmail: 'admin@trading.example.com',
                maintenanceMode: false,
                debugMode: false
            },
            trading: {
                minDeposit: 100,
                maxDeposit: 10000,
                minWithdrawal: 50,
                maxWithdrawal: 5000,
                tradingEnabled: true,
                autoApproveDeposits: false,
                autoApproveWithdrawals: false
            },
            kyc: {
                kycRequired: true,
                kycAutoApprove: false,
                documentTypes: ['passport', 'id_card', 'driving_license'],
                maxFileSize: 5242880, // 5MB
                allowedFormats: ['jpg', 'jpeg', 'png', 'pdf']
            },
            notifications: {
                emailNotifications: true,
                smsNotifications: false,
                pushNotifications: true,
                depositAlerts: true,
                withdrawalAlerts: true,
                kycAlerts: true,
                securityAlerts: true
            },
            paymentMethods: {
                ach: {
                    enabled: false,
                    bankName: '',
                    accountNumber: '',
                    routingNumber: '',
                    instructions: '',
                    minAmount: 100,
                    maxAmount: 100000,
                    feePercentage: 0,
                    fixedFee: 25,
                    processingTimeHours: 72
                },
                paypal: {
                    enabled: false,
                    email: '',
                    businessName: '',
                    instructions: '',
                    minAmount: 50,
                    maxAmount: 10000,
                    feePercentage: 2.9,
                    fixedFee: 0.30,
                    processingTimeHours: 24
                },
                crypto: {
                    btc: {
                        enabled: false,
                        address: '',
                        instructions: '',
                        minAmount: 0.0001,
                        maxAmount: 10,
                        feePercentage: 0.1,
                        fixedFee: 0.0005,
                        processingTimeHours: 60
                    },
                    usdt: {
                        enabled: false,
                        address: '',
                        instructions: '',
                        minAmount: 10,
                        maxAmount: 50000,
                        feePercentage: 0,
                        fixedFee: 1,
                        processingTimeHours: 30
                    }
                }
            },
            security: {
                sessionTimeout: 3600, // 1 hour
                maxLoginAttempts: 5,
                lockoutDuration: 900, // 15 minutes
                twoFactorAuth: false,
                ipWhitelist: false,
                allowedIPs: []
            }
        };
        
        this.init();
    }

    init() {
        this.loadSettingsFromStorage();
        this.setupEventListeners();
        this.updateUI();
        this.loadUserInfo();
    }

    loadSettingsFromStorage() {
        const stored = localStorage.getItem('backofficeSettings');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                this.settings = { ...this.settings, ...parsed };
            } catch (error) {
                console.error('Failed to load settings from storage:', error);
            }
        }
    }

    setupEventListeners() {
        // General settings
        document.getElementById('site-name')?.addEventListener('input', (e) => {
            this.settings.general.siteName = e.target.value;
        });

        document.getElementById('site-url')?.addEventListener('input', (e) => {
            this.settings.general.siteUrl = e.target.value;
        });

        document.getElementById('admin-email')?.addEventListener('input', (e) => {
            this.settings.general.adminEmail = e.target.value;
        });

        document.getElementById('maintenance-mode')?.addEventListener('change', (e) => {
            this.settings.general.maintenanceMode = e.target.checked;
        });

        document.getElementById('debug-mode')?.addEventListener('change', (e) => {
            this.settings.general.debugMode = e.target.checked;
        });

        // Trading settings
        document.getElementById('min-deposit')?.addEventListener('input', (e) => {
            this.settings.trading.minDeposit = parseFloat(e.target.value) || 0;
        });

        document.getElementById('max-deposit')?.addEventListener('input', (e) => {
            this.settings.trading.maxDeposit = parseFloat(e.target.value) || 0;
        });

        document.getElementById('min-withdrawal')?.addEventListener('input', (e) => {
            this.settings.trading.minWithdrawal = parseFloat(e.target.value) || 0;
        });

        document.getElementById('max-withdrawal')?.addEventListener('input', (e) => {
            this.settings.trading.maxWithdrawal = parseFloat(e.target.value) || 0;
        });

        document.getElementById('trading-enabled')?.addEventListener('change', (e) => {
            this.settings.trading.tradingEnabled = e.target.checked;
        });

        document.getElementById('auto-approve-deposits')?.addEventListener('change', (e) => {
            this.settings.trading.autoApproveDeposits = e.target.checked;
        });

        document.getElementById('auto-approve-withdrawals')?.addEventListener('change', (e) => {
            this.settings.trading.autoApproveWithdrawals = e.target.checked;
        });

        // KYC settings
        document.getElementById('kyc-required')?.addEventListener('change', (e) => {
            this.settings.kyc.kycRequired = e.target.checked;
        });

        document.getElementById('kyc-auto-approve')?.addEventListener('change', (e) => {
            this.settings.kyc.kycAutoApprove = e.target.checked;
        });

        // Notification settings
        document.getElementById('email-notifications')?.addEventListener('change', (e) => {
            this.settings.notifications.emailNotifications = e.target.checked;
        });

        document.getElementById('sms-notifications')?.addEventListener('change', (e) => {
            this.settings.notifications.smsNotifications = e.target.checked;
        });

        document.getElementById('push-notifications')?.addEventListener('change', (e) => {
            this.settings.notifications.pushNotifications = e.target.checked;
        });

        document.getElementById('deposit-alerts')?.addEventListener('change', (e) => {
            this.settings.notifications.depositAlerts = e.target.checked;
        });

        document.getElementById('withdrawal-alerts')?.addEventListener('change', (e) => {
            this.settings.notifications.withdrawalAlerts = e.target.checked;
        });

        document.getElementById('kyc-alerts')?.addEventListener('change', (e) => {
            this.settings.notifications.kycAlerts = e.target.checked;
        });

        document.getElementById('security-alerts')?.addEventListener('change', (e) => {
            this.settings.notifications.securityAlerts = e.target.checked;
        });

        // Security settings
        document.getElementById('session-timeout')?.addEventListener('input', (e) => {
            this.settings.security.sessionTimeout = parseInt(e.target.value) || 3600;
        });

        document.getElementById('max-login-attempts')?.addEventListener('input', (e) => {
            this.settings.security.maxLoginAttempts = parseInt(e.target.value) || 5;
        });

        document.getElementById('lockout-duration')?.addEventListener('input', (e) => {
            this.settings.security.lockoutDuration = parseInt(e.target.value) || 900;
        });

        document.getElementById('two-factor-auth')?.addEventListener('change', (e) => {
            this.settings.security.twoFactorAuth = e.target.checked;
        });

        document.getElementById('ip-whitelist')?.addEventListener('change', (e) => {
            this.settings.security.ipWhitelist = e.target.checked;
        });

        // ACH settings
        document.getElementById('ach-bank-name')?.addEventListener('input', (e) => {
            this.settings.paymentMethods.ach.bankName = e.target.value;
        });

        document.getElementById('ach-account-number')?.addEventListener('input', (e) => {
            this.settings.paymentMethods.ach.accountNumber = e.target.value;
        });

        document.getElementById('ach-routing-number')?.addEventListener('input', (e) => {
            this.settings.paymentMethods.ach.routingNumber = e.target.value;
        });

        document.getElementById('ach-min-amount')?.addEventListener('input', (e) => {
            this.settings.paymentMethods.ach.minAmount = parseFloat(e.target.value) || 0;
        });

        document.getElementById('ach-max-amount')?.addEventListener('input', (e) => {
            this.settings.paymentMethods.ach.maxAmount = parseFloat(e.target.value) || 0;
        });

        document.getElementById('ach-fee-percentage')?.addEventListener('input', (e) => {
            this.settings.paymentMethods.ach.feePercentage = parseFloat(e.target.value) || 0;
        });

        document.getElementById('ach-fixed-fee')?.addEventListener('input', (e) => {
            this.settings.paymentMethods.ach.fixedFee = parseFloat(e.target.value) || 0;
        });

        document.getElementById('ach-processing-time')?.addEventListener('input', (e) => {
            this.settings.paymentMethods.ach.processingTimeHours = parseInt(e.target.value) || 0;
        });

        document.getElementById('ach-instructions')?.addEventListener('input', (e) => {
            this.settings.paymentMethods.ach.instructions = e.target.value;
        });

        document.getElementById('enable-ach-deposits')?.addEventListener('change', (e) => {
            this.settings.paymentMethods.ach.enabled = e.target.checked;
        });

        // PayPal settings
        document.getElementById('paypal-email')?.addEventListener('input', (e) => {
            this.settings.paymentMethods.paypal.email = e.target.value;
        });

        document.getElementById('paypal-business-name')?.addEventListener('input', (e) => {
            this.settings.paymentMethods.paypal.businessName = e.target.value;
        });

        document.getElementById('paypal-min-amount')?.addEventListener('input', (e) => {
            this.settings.paymentMethods.paypal.minAmount = parseFloat(e.target.value) || 0;
        });

        document.getElementById('paypal-max-amount')?.addEventListener('input', (e) => {
            this.settings.paymentMethods.paypal.maxAmount = parseFloat(e.target.value) || 0;
        });

        document.getElementById('paypal-fee-percentage')?.addEventListener('input', (e) => {
            this.settings.paymentMethods.paypal.feePercentage = parseFloat(e.target.value) || 0;
        });

        document.getElementById('paypal-fixed-fee')?.addEventListener('input', (e) => {
            this.settings.paymentMethods.paypal.fixedFee = parseFloat(e.target.value) || 0;
        });

        document.getElementById('paypal-processing-time')?.addEventListener('input', (e) => {
            this.settings.paymentMethods.paypal.processingTimeHours = parseInt(e.target.value) || 0;
        });

        document.getElementById('paypal-instructions')?.addEventListener('input', (e) => {
            this.settings.paymentMethods.paypal.instructions = e.target.value;
        });

        document.getElementById('enable-paypal-deposits')?.addEventListener('change', (e) => {
            this.settings.paymentMethods.paypal.enabled = e.target.checked;
        });

        // Cryptocurrency settings
        document.getElementById('btc-address')?.addEventListener('input', (e) => {
            this.settings.paymentMethods.crypto.btc.address = e.target.value;
        });

        document.getElementById('btc-min-amount')?.addEventListener('input', (e) => {
            this.settings.paymentMethods.crypto.btc.minAmount = parseFloat(e.target.value) || 0;
        });

        document.getElementById('btc-max-amount')?.addEventListener('input', (e) => {
            this.settings.paymentMethods.crypto.btc.maxAmount = parseFloat(e.target.value) || 0;
        });

        document.getElementById('btc-fee-percentage')?.addEventListener('input', (e) => {
            this.settings.paymentMethods.crypto.btc.feePercentage = parseFloat(e.target.value) || 0;
        });

        document.getElementById('btc-fixed-fee')?.addEventListener('input', (e) => {
            this.settings.paymentMethods.crypto.btc.fixedFee = parseFloat(e.target.value) || 0;
        });

        document.getElementById('btc-processing-time')?.addEventListener('input', (e) => {
            this.settings.paymentMethods.crypto.btc.processingTimeHours = parseInt(e.target.value) || 0;
        });

        document.getElementById('btc-instructions')?.addEventListener('input', (e) => {
            this.settings.paymentMethods.crypto.btc.instructions = e.target.value;
        });

        document.getElementById('enable-btc-deposits')?.addEventListener('change', (e) => {
            this.settings.paymentMethods.crypto.btc.enabled = e.target.checked;
        });

        document.getElementById('usdt-address')?.addEventListener('input', (e) => {
            this.settings.paymentMethods.crypto.usdt.address = e.target.value;
        });

        document.getElementById('usdt-min-amount')?.addEventListener('input', (e) => {
            this.settings.paymentMethods.crypto.usdt.minAmount = parseFloat(e.target.value) || 0;
        });

        document.getElementById('usdt-max-amount')?.addEventListener('input', (e) => {
            this.settings.paymentMethods.crypto.usdt.maxAmount = parseFloat(e.target.value) || 0;
        });

        document.getElementById('usdt-fee-percentage')?.addEventListener('input', (e) => {
            this.settings.paymentMethods.crypto.usdt.feePercentage = parseFloat(e.target.value) || 0;
        });

        document.getElementById('usdt-fixed-fee')?.addEventListener('input', (e) => {
            this.settings.paymentMethods.crypto.usdt.fixedFee = parseFloat(e.target.value) || 0;
        });

        document.getElementById('usdt-processing-time')?.addEventListener('input', (e) => {
            this.settings.paymentMethods.crypto.usdt.processingTimeHours = parseInt(e.target.value) || 0;
        });

        document.getElementById('usdt-instructions')?.addEventListener('input', (e) => {
            this.settings.paymentMethods.crypto.usdt.instructions = e.target.value;
        });

        document.getElementById('enable-usdt-deposits')?.addEventListener('change', (e) => {
            this.settings.paymentMethods.crypto.usdt.enabled = e.target.checked;
        });
    }

    updateUI() {
        // Update general settings
        this.setInputValue('site-name', this.settings.general.siteName);
        this.setInputValue('site-url', this.settings.general.siteUrl);
        this.setInputValue('admin-email', this.settings.general.adminEmail);
        this.setCheckboxValue('maintenance-mode', this.settings.general.maintenanceMode);
        this.setCheckboxValue('debug-mode', this.settings.general.debugMode);

        // Update trading settings
        this.setInputValue('min-deposit', this.settings.trading.minDeposit);
        this.setInputValue('max-deposit', this.settings.trading.maxDeposit);
        this.setInputValue('min-withdrawal', this.settings.trading.minWithdrawal);
        this.setInputValue('max-withdrawal', this.settings.trading.maxWithdrawal);
        this.setCheckboxValue('trading-enabled', this.settings.trading.tradingEnabled);
        this.setCheckboxValue('auto-approve-deposits', this.settings.trading.autoApproveDeposits);
        this.setCheckboxValue('auto-approve-withdrawals', this.settings.trading.autoApproveWithdrawals);

        // Update KYC settings
        this.setCheckboxValue('kyc-required', this.settings.kyc.kycRequired);
        this.setCheckboxValue('kyc-auto-approve', this.settings.kyc.kycAutoApprove);

        // Update notification settings
        this.setCheckboxValue('email-notifications', this.settings.notifications.emailNotifications);
        this.setCheckboxValue('sms-notifications', this.settings.notifications.smsNotifications);
        this.setCheckboxValue('push-notifications', this.settings.notifications.pushNotifications);
        this.setCheckboxValue('deposit-alerts', this.settings.notifications.depositAlerts);
        this.setCheckboxValue('withdrawal-alerts', this.settings.notifications.withdrawalAlerts);
        this.setCheckboxValue('kyc-alerts', this.settings.notifications.kycAlerts);
        this.setCheckboxValue('security-alerts', this.settings.notifications.securityAlerts);

        // Update security settings
        this.setInputValue('session-timeout', this.settings.security.sessionTimeout);
        this.setInputValue('max-login-attempts', this.settings.security.maxLoginAttempts);
        this.setInputValue('lockout-duration', this.settings.security.lockoutDuration);
        this.setCheckboxValue('two-factor-auth', this.settings.security.twoFactorAuth);
        this.setCheckboxValue('ip-whitelist', this.settings.security.ipWhitelist);

        // Update payment method settings
        // ACH
        this.setInputValue('ach-bank-name', this.settings.paymentMethods.ach.bankName);
        this.setInputValue('ach-account-number', this.settings.paymentMethods.ach.accountNumber);
        this.setInputValue('ach-routing-number', this.settings.paymentMethods.ach.routingNumber);
        this.setInputValue('ach-min-amount', this.settings.paymentMethods.ach.minAmount);
        this.setInputValue('ach-max-amount', this.settings.paymentMethods.ach.maxAmount);
        this.setInputValue('ach-fee-percentage', this.settings.paymentMethods.ach.feePercentage);
        this.setInputValue('ach-fixed-fee', this.settings.paymentMethods.ach.fixedFee);
        this.setInputValue('ach-processing-time', this.settings.paymentMethods.ach.processingTimeHours);
        this.setInputValue('ach-instructions', this.settings.paymentMethods.ach.instructions);
        this.setCheckboxValue('enable-ach-deposits', this.settings.paymentMethods.ach.enabled);

        // PayPal
        this.setInputValue('paypal-email', this.settings.paymentMethods.paypal.email);
        this.setInputValue('paypal-business-name', this.settings.paymentMethods.paypal.businessName);
        this.setInputValue('paypal-min-amount', this.settings.paymentMethods.paypal.minAmount);
        this.setInputValue('paypal-max-amount', this.settings.paymentMethods.paypal.maxAmount);
        this.setInputValue('paypal-fee-percentage', this.settings.paymentMethods.paypal.feePercentage);
        this.setInputValue('paypal-fixed-fee', this.settings.paymentMethods.paypal.fixedFee);
        this.setInputValue('paypal-processing-time', this.settings.paymentMethods.paypal.processingTimeHours);
        this.setInputValue('paypal-instructions', this.settings.paymentMethods.paypal.instructions);
        this.setCheckboxValue('enable-paypal-deposits', this.settings.paymentMethods.paypal.enabled);

        // Cryptocurrency
        this.setInputValue('btc-address', this.settings.paymentMethods.crypto.btc.address);
        this.setInputValue('btc-min-amount', this.settings.paymentMethods.crypto.btc.minAmount);
        this.setInputValue('btc-max-amount', this.settings.paymentMethods.crypto.btc.maxAmount);
        this.setInputValue('btc-fee-percentage', this.settings.paymentMethods.crypto.btc.feePercentage);
        this.setInputValue('btc-fixed-fee', this.settings.paymentMethods.crypto.btc.fixedFee);
        this.setInputValue('btc-processing-time', this.settings.paymentMethods.crypto.btc.processingTimeHours);
        this.setInputValue('btc-instructions', this.settings.paymentMethods.crypto.btc.instructions);
        this.setCheckboxValue('enable-btc-deposits', this.settings.paymentMethods.crypto.btc.enabled);

        this.setInputValue('usdt-address', this.settings.paymentMethods.crypto.usdt.address);
        this.setInputValue('usdt-min-amount', this.settings.paymentMethods.crypto.usdt.minAmount);
        this.setInputValue('usdt-max-amount', this.settings.paymentMethods.crypto.usdt.maxAmount);
        this.setInputValue('usdt-fee-percentage', this.settings.paymentMethods.crypto.usdt.feePercentage);
        this.setInputValue('usdt-fixed-fee', this.settings.paymentMethods.crypto.usdt.fixedFee);
        this.setInputValue('usdt-processing-time', this.settings.paymentMethods.crypto.usdt.processingTimeHours);
        this.setInputValue('usdt-instructions', this.settings.paymentMethods.crypto.usdt.instructions);
        this.setCheckboxValue('enable-usdt-deposits', this.settings.paymentMethods.crypto.usdt.enabled);
    }

    setInputValue(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
        }
    }

    setCheckboxValue(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.checked = value;
        }
    }

    loadUserInfo() {
        const adminEmail = sessionStorage.getItem('adminEmail');
        const adminRole = sessionStorage.getItem('adminRole');

        if (adminEmail) {
            const userNameElement = document.getElementById('user-name');
            const userRoleElement = document.getElementById('user-role');
            const userAvatarElement = document.getElementById('user-avatar');

            if (userNameElement) {
                userNameElement.textContent = adminEmail;
            }
            if (userRoleElement) {
                userRoleElement.textContent = adminRole ? adminRole.charAt(0).toUpperCase() + adminRole.slice(1) : 'Admin';
            }
            if (userAvatarElement) {
                userAvatarElement.textContent = adminEmail.charAt(0).toUpperCase();
            }
        }
    }

    async saveAllSettings() {
        try {
            // Save to localStorage
            this.saveSettingsToStorage();

            // Temporarily disable audit logging due to foreign key constraint issues
            // TODO: Fix audit log user ID mapping issue
            /*
            try {
                if (window.AdminAPI) {
                    await window.AdminAPI.createAuditLog('settings_updated', null, 'Admin updated system settings');
                }
            } catch (auditError) {
                console.warn('Audit log failed, but settings were saved:', auditError.message);
                // Don't fail the entire save operation just because audit logging fails
            }
            */

            // Show success message
            if (window.modal) {
                window.modal.success('Settings saved successfully!');
            } else {
                alert('Settings saved successfully!');
            }

            // Update last updated timestamp
            const lastUpdatedElement = document.getElementById('last-updated');
            if (lastUpdatedElement) {
                const now = new Date();
                lastUpdatedElement.textContent = `Last updated: ${now.toLocaleString()}`;
            }

        } catch (error) {
            console.error('Failed to save settings:', error);
            if (window.modal) {
                window.modal.error('Failed to save settings: ' + error.message);
            } else {
                alert('Failed to save settings: ' + error.message);
            }
        }
    }

    saveSettingsToStorage() {
        try {
            localStorage.setItem('backofficeSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Failed to save settings to storage:', error);
        }
    }

    resetSettings() {
        if (window.modal) {
            window.modal.confirm('Are you sure you want to reset all settings to default values?', () => {
                this.performReset();
            });
        } else {
            if (confirm('Are you sure you want to reset all settings to default values?')) {
                this.performReset();
            }
        }
    }

    performReset() {
        // Reset to default values
        this.settings = {
            general: {
                siteName: 'PALANTIR Trading Platform',
                siteUrl: 'https://trading.example.com',
                adminEmail: 'admin@trading.example.com',
                maintenanceMode: false,
                debugMode: false
            },
            trading: {
                minDeposit: 100,
                maxDeposit: 10000,
                minWithdrawal: 50,
                maxWithdrawal: 5000,
                tradingEnabled: true,
                autoApproveDeposits: false,
                autoApproveWithdrawals: false
            },
            kyc: {
                kycRequired: true,
                kycAutoApprove: false,
                documentTypes: ['passport', 'id_card', 'driving_license'],
                maxFileSize: 5242880,
                allowedFormats: ['jpg', 'jpeg', 'png', 'pdf']
            },
            notifications: {
                emailNotifications: true,
                smsNotifications: false,
                pushNotifications: true,
                depositAlerts: true,
                withdrawalAlerts: true,
                kycAlerts: true,
                securityAlerts: true
            },
            paymentMethods: {
                ach: {
                    enabled: false,
                    bankName: '',
                    accountNumber: '',
                    routingNumber: '',
                    instructions: '',
                    minAmount: 100,
                    maxAmount: 100000,
                    feePercentage: 0,
                    fixedFee: 25,
                    processingTimeHours: 72
                },
                paypal: {
                    enabled: false,
                    email: '',
                    businessName: '',
                    instructions: '',
                    minAmount: 50,
                    maxAmount: 10000,
                    feePercentage: 2.9,
                    fixedFee: 0.30,
                    processingTimeHours: 24
                },
                crypto: {
                    btc: {
                        enabled: false,
                        address: '',
                        instructions: '',
                        minAmount: 0.0001,
                        maxAmount: 10,
                        feePercentage: 0.1,
                        fixedFee: 0.0005,
                        processingTimeHours: 60
                    },
                    usdt: {
                        enabled: false,
                        address: '',
                        instructions: '',
                        minAmount: 10,
                        maxAmount: 50000,
                        feePercentage: 0,
                        fixedFee: 1,
                        processingTimeHours: 30
                    }
                }
            },
            security: {
                sessionTimeout: 3600,
                maxLoginAttempts: 5,
                lockoutDuration: 900,
                twoFactorAuth: false,
                ipWhitelist: false,
                allowedIPs: []
            }
        };

        // Update UI
        this.updateUI();

        // Save to storage
        this.saveSettingsToStorage();

        // Show success message
        if (window.modal) {
            window.modal.success('Settings reset to default values!');
        } else {
            alert('Settings reset to default values!');
        }
    }

    async logout() {
        if (window.modal) {
            window.modal.confirm('Are you sure you want to logout?', async () => {
                try {
                    // Create audit log
                    if (window.AdminAPI) {
                        await window.AdminAPI.createAuditLog('admin_logout', null, 'Admin logged out');
                    }

                    // Clear session
                    window.AdminAPI.signOut();
                    window.location.href = 'login.html';
                } catch (error) {
                    console.error('Logout error:', error);
                    window.AdminAPI.signOut();
                    window.location.href = 'login.html';
                }
            });
        } else {
            if (confirm('Are you sure you want to logout?')) {
                window.AdminAPI.signOut();
                window.location.href = 'login.html';
            }
        }
    }

    exportSettings() {
        const dataStr = JSON.stringify(this.settings, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `backoffice-settings-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    importSettings(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                this.settings = { ...this.settings, ...imported };
                this.updateUI();
                this.saveSettingsToStorage();
                
                if (window.modal) {
                    window.modal.success('Settings imported successfully!');
                } else {
                    alert('Settings imported successfully!');
                }
            } catch (error) {
                if (window.modal) {
                    window.modal.error('Failed to import settings: Invalid file format');
                } else {
                    alert('Failed to import settings: Invalid file format');
                }
            }
        };
        reader.readAsText(file);
    }
}

// Initialize settings when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.backofficeSettings = new BackofficeSettings();
});
