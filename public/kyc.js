/**
 * KYC Verification Management Controller
 * Handles KYC verification with database integration and RBAC permissions
 */

class KYCManager {
    constructor() {
        this.currentUser = null;
        this.userPermissions = null;
        this.kycApplications = [];
        this.filteredKYC = [];
        this.currentPage = 1;
        this.pageSize = 20;
        this.filters = {
            search: '',
            status: '',
            type: '',
            dateRange: ''
        };
        this.currentKYC = null;
        this.init();
    }

    async init() {
        console.log('KYC Manager initializing...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupPage());
        } else {
            this.setupPage();
        }
    }

    async setupPage() {
        try {
            // Check RBAC permissions first
            await this.checkRBAC();
            
            // Load user data
            await this.loadUserData();
            
            // Setup UI
            this.renderUserInfo();
            this.setupNavigation();
            this.setupEventListeners();
            
            // Load KYC data
            await this.loadKYCApplications();
            await this.loadKYCStats();
            
            console.log('KYC Manager setup complete');
        } catch (error) {
            console.error('Error setting up KYC page:', error);
            if (error.message === 'Access denied') {
                this.redirectToLogin();
            } else if (window.Notify) {
                window.Notify.error('Failed to load KYC page');
            }
        }
    }

    async checkRBAC() {
        try {
            // For now, assume authenticated user has access
            // In production, decode JWT and check permissions
            this.userPermissions = {
                role: 'admin',
                permissions: {
                    kyc: { view: true, approve: true, reject: true }
                }
            };

            return true;
        } catch (error) {
            console.error('RBAC check failed:', error);
            throw new Error('Access denied');
        }
    }

    async loadUserData() {
        try {
            // Get current admin user from session
            const token = sessionStorage.getItem('adminToken');
            const email = sessionStorage.getItem('adminEmail');
            
            if (!token || !email) {
                throw new Error('User not authenticated');
            }

            this.currentUser = {
                email: email,
                token: token
            };
        } catch (error) {
            console.error('Failed to load user data:', error);
            throw error;
        }
    }

    renderUserInfo() {
        if (!this.currentUser) return;

        // Update user avatar
        const avatar = document.getElementById('user-avatar');
        if (avatar) {
            const initials = this.currentUser.email?.charAt(0).toUpperCase() || 'A';
            avatar.textContent = initials;
        }

        // Update user name
        const userName = document.getElementById('user-name');
        if (userName) {
            userName.textContent = this.currentUser.email;
        }

        // Update user role
        const userRole = document.getElementById('user-role');
        if (userRole) {
            userRole.textContent = this.userPermissions?.role || 'Admin';
        }

        // Show admin section for superadmin
        const adminSection = document.getElementById('admin-section');
        if (adminSection && this.userPermissions?.role === 'superadmin') {
            adminSection.style.display = 'block';
        }
    }

    setupNavigation() {
        // Add active state to current page
        const currentPath = window.location.pathname;
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href === currentPath || (currentPath.includes('kyc') && href.includes('kyc'))) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value;
                this.applyFilters();
            });
        }

        // Filter selects
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filters.status = e.target.value;
                this.applyFilters();
            });
        }

        const typeFilter = document.getElementById('type-filter');
        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                this.filters.type = e.target.value;
                this.applyFilters();
            });
        }

        const dateFilter = document.getElementById('date-filter');
        if (dateFilter) {
            dateFilter.addEventListener('change', (e) => {
                this.filters.dateRange = e.target.value;
                this.applyFilters();
            });
        }
    }

    async loadKYCApplications() {
        try {
            let query = 'kyc_applications?order=created_at.desc';
            
            // Apply filters to query
            if (this.filters.status) {
                query += `&status=eq.${this.filters.status}`;
            }
            
            if (this.filters.type) {
                query += `&application_type=eq.${this.filters.type}`;
            }

            // Apply date range filter
            if (this.filters.dateRange) {
                const now = new Date();
                let startDate;
                
                switch(this.filters.dateRange) {
                    case 'today':
                        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        break;
                    case 'week':
                        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        break;
                    case 'month':
                        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                        break;
                }
                
                if (startDate) {
                    query += `&created_at=gte.${startDate.toISOString()}`;
                }
            }

            const { data, error } = await window.API.request(query);
            
            if (error) {
                throw error;
            }

            this.kycApplications = data || [];
            this.filteredKYC = [...this.kycApplications];
            
            // Apply client-side search filter
            if (this.filters.search) {
                this.applySearchFilter();
            }
            
            this.renderKYCTable();
        } catch (error) {
            console.error('Error loading KYC applications:', error);
            if (window.Notify) {
                window.Notify.error('Failed to load KYC applications');
            }
            // Show empty state
            this.renderEmptyState();
        }
    }

    async loadKYCStats() {
        try {
            // Get stats from database
            const { data: pendingData, error: pendingError } = await window.API.request('kyc_applications?status=eq.pending');
            const { data: verifiedData, error: verifiedError } = await window.API.request('kyc_applications?status=eq.verified');
            const { data: rejectedData, error: rejectedError } = await window.API.request('kyc_applications?status=eq.rejected');

            if (pendingError || verifiedError || rejectedError) {
                throw new Error('Failed to load KYC stats');
            }

            const stats = {
                pending: pendingData?.length || 0,
                verified: verifiedData?.length || 0,
                rejected: rejectedData?.length || 0,
                total: this.kycApplications.length
            };

            document.getElementById('pending-kyc').textContent = stats.pending;
            document.getElementById('verified-kyc').textContent = stats.verified;
            document.getElementById('rejected-kyc').textContent = stats.rejected;
            document.getElementById('total-kyc').textContent = stats.total;

            // Update change indicators (mock for now - would need historical data)
            document.getElementById('pending-change').textContent = `+${Math.floor(stats.pending * 0.1)} today`;
            document.getElementById('verified-change').textContent = `+${Math.floor(stats.verified * 0.05)} today`;
            document.getElementById('rejected-change').textContent = `+${Math.floor(stats.rejected * 0.1)} today`;
            document.getElementById('total-change').textContent = `+${Math.floor(stats.total * 0.08)} today`;

            // Update total count
            document.getElementById('total-count').textContent = `${stats.total} Total`;
        } catch (error) {
            console.error('Error loading KYC stats:', error);
        }
    }

    applyFilters() {
        this.loadKYCApplications();
    }

    applySearchFilter() {
        const searchTerm = this.filters.search.toLowerCase();
        
        this.filteredKYC = this.kycApplications.filter(kyc => {
            // Search in user email, application ID, and user name (if available)
            return kyc.user_email?.toLowerCase().includes(searchTerm) ||
                   kyc.id?.toLowerCase().includes(searchTerm) ||
                   kyc.user_name?.toLowerCase().includes(searchTerm);
        });
    }

    renderKYCTable() {
        const tbody = document.getElementById('kyc-tbody');
        tbody.innerHTML = '';

        if (this.filteredKYC.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px;">No KYC applications found</td></tr>';
            return;
        }

        this.filteredKYC.forEach(kyc => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="user-info">
                        <div class="user-avatar">${this.getUserInitials(kyc)}</div>
                        <div class="user-details">
                            <div class="user-name">${kyc.user_name || 'Unknown User'}</div>
                            <div class="user-email">${kyc.user_email || 'No email'}</div>
                        </div>
                    </div>
                </td>
                <td>${kyc.id}</td>
                <td>${this.formatType(kyc.application_type)}</td>
                <td>
                    <div class="kyc-documents">
                        ${this.renderDocumentThumbnails(kyc)}
                        <a href="#" class="doc-link" onclick="reviewKYC('${kyc.id}'); return false;">View All</a>
                    </div>
                </td>
                <td>${this.formatDate(kyc.created_at)}</td>
                <td>${this.getStatusBadge(kyc.status)}</td>
                <td>
                    <div class="actions">
                        <button class="btn btn-sm btn-primary" onclick="reviewKYC('${kyc.id}')">Review</button>
                        ${kyc.status === 'pending' ? `<button class="btn btn-sm btn-success" onclick="quickApprove('${kyc.id}')">Approve</button>` : ''}
                        ${kyc.status === 'pending' ? `<button class="btn btn-sm btn-danger" onclick="quickReject('${kyc.id}')">Reject</button>` : ''}
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });

        document.getElementById('total-count').textContent = `${this.filteredKYC.length} Total`;
    }

    renderEmptyState() {
        const tbody = document.getElementById('kyc-tbody');
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px;">No KYC applications found</td></tr>';
    }

    getUserInitials(kyc) {
        if (kyc.user_name) {
            return kyc.user_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        }
        if (kyc.user_email) {
            return kyc.user_email.charAt(0).toUpperCase();
        }
        return 'U';
    }

    renderDocumentThumbnails(kyc) {
        // Mock document rendering - in production, this would use actual document data
        const docCount = kyc.document_count || 2;
        let thumbnails = '';
        
        for (let i = 0; i < Math.min(docCount, 3); i++) {
            thumbnails += `<div class="doc-thumbnail" title="Document ${i + 1}">📄</div>`;
        }
        
        return thumbnails;
    }

    formatType(type) {
        const types = {
            'individual': 'Individual',
            'business': 'Business'
        };
        return types[type] || type;
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString();
    }

    getStatusBadge(status) {
        const badges = {
            'pending': '<span class="badge badge-warning">Pending</span>',
            'verified': '<span class="badge badge-success">Verified</span>',
            'rejected': '<span class="badge badge-danger">Rejected</span>',
            'review': '<span class="badge badge-info">Under Review</span>'
        };
        return badges[status] || '<span class="badge badge-secondary">Unknown</span>';
    }

    async updateKYCStatus(kycId, status, notes = '') {
        try {
            const { data, error } = await window.API.request(`kyc_applications?id=eq.${kycId}`, {
                method: 'PATCH',
                body: {
                    status: status,
                    admin_notes: notes,
                    reviewed_at: new Date().toISOString(),
                    reviewed_by: this.currentUser.email
                }
            });

            if (error) {
                throw error;
            }

            // Update local data
            const kyc = this.kycApplications.find(k => k.id === kycId);
            if (kyc) {
                kyc.status = status;
                kyc.admin_notes = notes;
                kyc.reviewed_at = new Date().toISOString();
                kyc.reviewed_by = this.currentUser.email;
            }

            await this.loadKYCApplications();
            await this.loadKYCStats();

            if (window.Notify) {
                window.Notify.success(`KYC application ${status} successfully`);
            }

        } catch (error) {
            console.error('Error updating KYC status:', error);
            if (window.Notify) {
                window.Notify.error('Failed to update KYC status');
            }
        }
    }

    async refreshKYCList() {
        await this.loadKYCApplications();
        await this.loadKYCStats();
    }

    exportKYCData() {
        // Export functionality
        const csv = this.convertToCSV(this.filteredKYC);
        this.downloadCSV(csv, 'kyc-applications.csv');
    }

    convertToCSV(data) {
        const headers = ['ID', 'User Name', 'User Email', 'Type', 'Status', 'Submitted Date', 'Reviewed Date', 'Reviewed By'];
        const rows = data.map(kyc => [
            kyc.id,
            kyc.user_name || '',
            kyc.user_email || '',
            kyc.application_type || '',
            kyc.status || '',
            kyc.created_at || '',
            kyc.reviewed_at || '',
            kyc.reviewed_by || ''
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    redirectToLogin() {
        sessionStorage.clear();
        window.location.href = 'login.html';
    }
}

// Global functions for onclick handlers
let kycManager;

async function reviewKYC(kycId) {
    try {
        const { data, error } = await window.API.request(`kyc_applications?id=eq.${kycId}`);
        
        if (error) {
            throw error;
        }

        const kyc = data[0];
        if (!kyc) {
            throw new Error('KYC application not found');
        }

        kycManager.currentKYC = kyc;
        
        const modalBody = document.getElementById('kyc-modal-body');
        modalBody.innerHTML = `
            <div class="form-group">
                <label class="form-label">Application ID</label>
                <input type="text" class="form-control" value="${kyc.id}" readonly>
            </div>
            <div class="form-group">
                <label class="form-label">Applicant Information</label>
                <div style="padding: 15px; background: var(--light-bg); border-radius: 6px;">
                    <div><strong>Name:</strong> ${kyc.user_name || 'Not provided'}</div>
                    <div><strong>Email:</strong> ${kyc.user_email || 'Not provided'}</div>
                    <div><strong>Type:</strong> ${kycManager.formatType(kyc.application_type)}</div>
                    <div><strong>Submitted:</strong> ${kycManager.formatDate(kyc.created_at)}</div>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Documents</label>
                <div class="document-preview">
                    <div class="doc-thumbnail" style="width: 60px; height: 60px; margin: 0 auto 10px;">
                        📄
                    </div>
                    <div><strong>Identity Document</strong></div>
                    <div class="document-info">Status: ${kyc.status === 'verified' ? '✅ Verified' : '⏳ Pending Review'}</div>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Review Notes</label>
                <textarea class="form-control" id="review-notes" placeholder="Add your review notes here...">${kyc.admin_notes || ''}</textarea>
            </div>
        `;

        document.getElementById('kyc-modal').classList.add('active');
    } catch (error) {
        console.error('Error loading KYC details:', error);
        if (window.Notify) {
            window.Notify.error('Failed to load KYC details');
        }
    }
}

function viewDocuments(kycId) {
    reviewKYC(kycId);
}

async function quickApprove(kycId) {
    if (confirm('Are you sure you want to approve this KYC application?')) {
        await kycManager.updateKYCStatus(kycId, 'verified', 'Approved via quick action');
    }
}

async function quickReject(kycId) {
    const reason = prompt('Please provide rejection reason:');
    if (reason) {
        await kycManager.updateKYCStatus(kycId, 'rejected', reason);
    }
}

async function approveKYC() {
    if (kycManager.currentKYC) {
        const notes = document.getElementById('review-notes').value;
        await kycManager.updateKYCStatus(kycManager.currentKYC.id, 'verified', notes || 'Approved');
        closeModal('kyc-modal');
    }
}

async function rejectKYC() {
    if (kycManager.currentKYC) {
        const notes = document.getElementById('review-notes').value;
        if (!notes) {
            alert('Please provide rejection notes');
            return;
        }
        await kycManager.updateKYCStatus(kycManager.currentKYC.id, 'rejected', notes);
        closeModal('kyc-modal');
    }
}

async function requestMoreInfo() {
    if (kycManager.currentKYC) {
        const notes = document.getElementById('review-notes').value;
        if (!notes) {
            alert('Please specify what additional information is needed');
            return;
        }
        await kycManager.updateKYCStatus(kycManager.currentKYC.id, 'review', notes);
        closeModal('kyc-modal');
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function filterKYC() {
    kycManager.applyFilters();
}

function refreshKYCList() {
    kycManager.refreshKYCList();
}

function exportKYCData() {
    kycManager.exportKYCData();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    kycManager = new KYCManager();
});
