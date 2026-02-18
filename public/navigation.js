/**
 * Shared Navigation Component
 * Provides consistent navigation across all admin pages
 */
class AdminNavigation {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.adminEmail = sessionStorage.getItem('adminEmail') || 'Admin';
        this.init();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop().replace('.html', '');
        return page || 'dashboard';
    }

    init() {
        // Don't render navigation on login and register pages
        if (this.shouldSkipNavigation()) {
            return;
        }
        
        this.renderNavigation();
        this.setupEventListeners();
    }

    shouldSkipNavigation() {
        const page = this.getCurrentPage();
        return page === 'login' || page === 'register';
    }

    renderNavigation() {
        const navHtml = `
            <style>
                .nav-container {
                    position: sticky;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 60px;
                    background: var(--dark-bg, #1f2937);
                    border-bottom: 1px solid var(--border-color, #374151);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    padding: 0 20px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }

                .nav-logo {
                    font-size: 18px;
                    font-weight: 600;
                    color: white;
                    margin-right: auto;
                }

                .nav-menu {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .nav-toggle {
                    display: none;
                    background: none;
                    border: none;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    padding: 5px;
                    border-radius: 4px;
                    transition: background 0.2s ease;
                }

                .nav-toggle:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                .nav-dropdown {
                    position: relative;
                }

                .nav-dropdown-toggle {
                    background: none;
                    border: none;
                    color: white;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: background 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .nav-dropdown-toggle:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                .nav-dropdown-menu {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    background: var(--dark-bg, #1f2937);
                    border: 1px solid var(--border-color, #374151);
                    border-radius: 8px;
                    min-width: 200px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(-10px);
                    transition: all 0.3s ease;
                    margin-top: 5px;
                }

                .nav-dropdown.active .nav-dropdown-menu {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }

                .nav-dropdown-menu a {
                    display: block;
                    padding: 12px 16px;
                    color: white;
                    text-decoration: none;
                    font-size: 14px;
                    transition: background 0.2s ease;
                    border-radius: 6px;
                    margin: 2px;
                }

                .nav-dropdown-menu a:hover,
                .nav-dropdown-menu a.active {
                    background: var(--primary-color, #667eea);
                }

                .nav-dropdown-menu a:first-child {
                    margin-top: 8px;
                }

                .nav-dropdown-menu a:last-child {
                    margin-bottom: 8px;
                }

                .nav-user {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-left: 20px;
                }

                .nav-user-info {
                    text-align: right;
                    color: white;
                }

                .nav-user-name {
                    font-size: 14px;
                    font-weight: 500;
                }

                .nav-user-email {
                    font-size: 12px;
                    opacity: 0.8;
                }

                .nav-logout {
                    background: var(--danger-color, #ef4444);
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: background 0.2s ease;
                }

                .nav-logout:hover {
                    background: #dc2626;
                }

                /* Mobile Styles */
                @media (max-width: 768px) {
                    .nav-container {
                        padding: 0 15px;
                    }

                    .nav-logo {
                        font-size: 16px;
                    }

                    .nav-menu {
                        gap: 10px;
                    }

                    .nav-toggle {
                        display: block;
                    }

                    .nav-dropdown-menu {
                        position: fixed;
                        top: 60px;
                        left: 0;
                        right: 0;
                        width: 100%;
                        border-radius: 0;
                        border-left: none;
                        border-right: none;
                        margin-top: 0;
                        max-height: calc(100vh - 60px);
                        overflow-y: auto;
                    }

                    .nav-user {
                        margin-left: auto;
                    }

                    .nav-user-info {
                        display: none;
                    }
                }

                @media (max-width: 480px) {
                    .nav-container {
                        padding: 0 10px;
                    }

                    .nav-logo {
                        font-size: 14px;
                    }

                    .nav-dropdown-toggle {
                        padding: 6px 12px;
                        font-size: 12px;
                    }

                    .nav-logout {
                        padding: 4px 8px;
                        font-size: 11px;
                    }
                }

                @media (max-width: 320px) {
                    .nav-container {
                        padding: 0 5px;
                    }

                    .nav-logo {
                        font-size: 12px;
                    }

                    .nav-dropdown-toggle {
                        padding: 4px 8px;
                        font-size: 10px;
                    }

                    .nav-logout {
                        padding: 2px 4px;
                        font-size: 9px;
                    }
                }
            </style>

            <div class="nav-container">
                <div class="nav-logo">Admin Panel</div>
                
                <div class="nav-menu">
                    <!-- Main Navigation Dropdown -->
                    <div class="nav-dropdown" id="main-nav-dropdown">
                        <button class="nav-dropdown-toggle" onclick="toggleDropdown('main-nav-dropdown')">
                            Menu
                            <span style="font-size: 12px;">▼</span>
                        </button>
                        <div class="nav-dropdown-menu">
                            <a href="dashboard.html" data-page="dashboard">Dashboard</a>
                            <a href="users.html" data-page="users">User Management</a>
                            <a href="balance-management.html" data-page="balance-management">Balance Management</a>
                            <a href="autogrowth-management.html" data-page="autogrowth-management">Autogrowth Management</a>
                            <a href="deposits.html" data-page="deposits">Deposits</a>
                            <a href="withdrawals.html" data-page="withdrawals">Withdrawals</a>
                            <a href="kyc.html" data-page="kyc">KYC</a>
                            <a href="notifications.html" data-page="notifications">Notifications</a>
                            <a href="support.html" data-page="support">Support</a>
                            <a href="settings.html" data-page="settings">Settings</a>
                        </div>
                    </div>

                    <!-- User Dropdown -->
                    <div class="nav-dropdown" id="user-dropdown">
                        <button class="nav-dropdown-toggle" onclick="toggleDropdown('user-dropdown')">
                            Account
                            <span style="font-size: 12px;">▼</span>
                        </button>
                        <div class="nav-dropdown-menu">
                            <div style="padding: 12px 16px; border-bottom: 1px solid var(--border-color, #374151); margin-bottom: 8px;">
                                <div class="nav-user-info">
                                    <div class="nav-user-name">${this.adminEmail}</div>
                                    <div class="nav-user-email">Administrator</div>
                                </div>
                            </div>
                            <a href="#" onclick="logout()">Logout</a>
                        </div>
                    </div>
                </div>

                <!-- Mobile Menu Toggle -->
                <button class="nav-toggle" onclick="toggleMobileMenu()">☰</button>
            </div>
        `;

        // Insert navigation at the beginning of body
        const body = document.body;
        body.insertAdjacentHTML('afterbegin', navHtml);

        // Set active state
        this.setActivePage();
    }

    setActivePage() {
        const navLinks = document.querySelectorAll('.nav-dropdown-menu a');
        navLinks.forEach(link => {
            const page = link.getAttribute('data-page');
            if (page === this.currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    toggleDropdown(dropdownId) {
        const dropdown = document.getElementById(dropdownId);
        if (dropdown) {
            dropdown.classList.toggle('active');
            
            // Close other dropdowns
            document.querySelectorAll('.nav-dropdown').forEach(other => {
                if (other.id !== dropdownId) {
                    other.classList.remove('active');
                }
            });
        }
    }

    toggleMobileMenu() {
        const mainDropdown = document.getElementById('main-nav-dropdown');
        if (mainDropdown) {
            mainDropdown.classList.toggle('active');
        }
    }

    setupEventListeners() {
        // Handle navigation clicks
        document.querySelectorAll('.nav-dropdown-menu a').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href !== '#') {
                    // Check authentication before navigation
                    if (!this.checkAuthentication()) {
                        e.preventDefault();
                        return;
                    }
                }
                
                // Close dropdowns after navigation
                document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
            });
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-dropdown')) {
                document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
            }
        });
    }

    checkAuthentication() {
        const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
        const adminEmail = sessionStorage.getItem('adminEmail');
        
        if (!isLoggedIn || !adminEmail) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    updateAdminEmail(email) {
        this.adminEmail = email;
        const emailElement = document.getElementById('admin-email');
        if (emailElement) {
            emailElement.textContent = email;
        }
    }

    static init() {
        // Initialize navigation when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.adminNavigation = new AdminNavigation();
            });
        } else {
            window.adminNavigation = new AdminNavigation();
        }
    }
}

// Auto-initialize navigation
AdminNavigation.init();

// Global wrapper functions for backward compatibility
function toggleDropdown(dropdownId) {
    if (window.adminNavigation) {
        window.adminNavigation.toggleDropdown(dropdownId);
    }
}

function toggleMobileMenu() {
    if (window.adminNavigation) {
        window.adminNavigation.toggleMobileMenu();
    }
}
