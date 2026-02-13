// KYC Verification Management JavaScript
class KYCManager {
    constructor() {
        this.kycApplications = [];
        this.currentKYC = null;
        this.init();
    }

    async init() {
        console.log('KYC Manager initializing...');
        await this.loadKYCData();
        await this.loadKYCStats();
        this.setupEventListeners();
        console.log('KYC Manager initialized');
    }

    async loadKYCData() {
        try {
            // Mock KYC data - replace with actual API call
            this.kycApplications = [
                {
                    id: 'KYC001',
                    userId: 'USR001',
                    name: 'John Doe',
                    email: 'john.doe@example.com',
                    type: 'individual',
                    status: 'pending',
                    submitted: '2024-02-13 10:30:00',
                    documents: [
                        { type: 'passport', name: 'passport.jpg', url: '#', verified: false },
                        { type: 'proof_of_address', name: 'utility_bill.pdf', url: '#', verified: false }
                    ],
                    notes: ''
                },
                {
                    id: 'KYC002',
                    userId: 'USR002',
                    name: 'Jane Smith',
                    email: 'jane.smith@example.com',
                    type: 'individual',
                    status: 'verified',
                    submitted: '2024-02-12 15:45:00',
                    documents: [
                        { type: 'passport', name: 'passport.jpg', url: '#', verified: true },
                        { type: 'proof_of_address', name: 'bank_statement.pdf', url: '#', verified: true }
                    ],
                    notes: 'All documents verified successfully'
                },
                {
                    id: 'KYC003',
                    userId: 'USR003',
                    name: 'Acme Corp',
                    email: 'contact@acme.com',
                    type: 'business',
                    status: 'review',
                    submitted: '2024-02-13 09:15:00',
                    documents: [
                        { type: 'business_registration', name: 'certificate.pdf', url: '#', verified: true },
                        { type: 'tax_id', name: 'tax_document.pdf', url: '#', verified: false }
                    ],
                    notes: 'Business registration verified, tax ID under review'
                },
                {
                    id: 'KYC004',
                    userId: 'USR004',
                    name: 'Bob Wilson',
                    email: 'bob.wilson@example.com',
                    type: 'individual',
                    status: 'rejected',
                    submitted: '2024-02-11 14:20:00',
                    documents: [
                        { type: 'passport', name: 'passport.jpg', url: '#', verified: false }
                    ],
                    notes: 'Document quality too low, please resubmit'
                }
            ];

            this.renderKYCTable();
        } catch (error) {
            console.error('Error loading KYC data:', error);
        }
    }

    async loadKYCStats() {
        try {
            const stats = {
                pending: this.kycApplications.filter(kyc => kyc.status === 'pending').length,
                verified: this.kycApplications.filter(kyc => kyc.status === 'verified').length,
                rejected: this.kycApplications.filter(kyc => kyc.status === 'rejected').length,
                total: this.kycApplications.length
            };

            document.getElementById('pending-kyc').textContent = stats.pending;
            document.getElementById('verified-kyc').textContent = stats.verified;
            document.getElementById('rejected-kyc').textContent = stats.rejected;
            document.getElementById('total-kyc').textContent = stats.total;

            // Update change indicators (mock data)
            document.getElementById('pending-change').textContent = `+${stats.pending} today`;
            document.getElementById('verified-change').textContent = `+${Math.floor(stats.verified * 0.3)} today`;
            document.getElementById('rejected-change').textContent = `+${Math.floor(stats.rejected * 0.2)} today`;
            document.getElementById('total-change').textContent = `+${Math.floor(stats.total * 0.4)} today`;

            // Update total count
            document.getElementById('total-count').textContent = `${stats.total} Total`;
        } catch (error) {
            console.error('Error loading KYC stats:', error);
        }
    }

    renderKYCTable() {
        const tbody = document.getElementById('kyc-tbody');
        tbody.innerHTML = '';

        this.kycApplications.forEach(kyc => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="user-info">
                        <div class="user-avatar">${kyc.name.charAt(0)}</div>
                        <div class="user-details">
                            <div class="user-name">${kyc.name}</div>
                            <div class="user-email">${kyc.email}</div>
                        </div>
                    </div>
                </td>
                <td>${kyc.id}</td>
                <td>${this.formatType(kyc.type)}</td>
                <td>
                    <div class="kyc-documents">
                        ${kyc.documents.map(doc => `
                            <div class="doc-thumbnail" title="${doc.name}">
                                ${doc.type === 'passport' ? '📄' : '📋'}
                            </div>
                        `).join('')}
                        <a href="#" class="doc-link" onclick="viewDocuments('${kyc.id}'); return false;">View All</a>
                    </div>
                </td>
                <td>${this.formatDate(kyc.submitted)}</td>
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
    }

    formatType(type) {
        const types = {
            'individual': 'Individual',
            'business': 'Business'
        };
        return types[type] || type;
    }

    formatDate(dateString) {
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

    setupEventListeners() {
        // Search functionality
        document.getElementById('search-input').addEventListener('input', () => this.filterKYC());
        
        // Filter changes
        document.getElementById('status-filter').addEventListener('change', () => this.filterKYC());
        document.getElementById('type-filter').addEventListener('change', () => this.filterKYC());
        document.getElementById('date-filter').addEventListener('change', () => this.filterKYC());
    }

    filterKYC() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const statusFilter = document.getElementById('status-filter').value;
        const typeFilter = document.getElementById('type-filter').value;
        const dateFilter = document.getElementById('date-filter').value;

        let filtered = this.kycApplications.filter(kyc => {
            const matchesSearch = kyc.name.toLowerCase().includes(searchTerm) || 
                                 kyc.email.toLowerCase().includes(searchTerm) || 
                                 kyc.id.toLowerCase().includes(searchTerm);
            const matchesStatus = !statusFilter || kyc.status === statusFilter;
            const matchesType = !typeFilter || kyc.type === typeFilter;
            
            let matchesDate = true;
            if (dateFilter) {
                const kycDate = new Date(kyc.submitted);
                const today = new Date();
                
                switch(dateFilter) {
                    case 'today':
                        matchesDate = kycDate.toDateString() === today.toDateString();
                        break;
                    case 'week':
                        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                        matchesDate = kycDate >= weekAgo;
                        break;
                    case 'month':
                        matchesDate = kycDate.getMonth() === today.getMonth() && 
                                     kycDate.getFullYear() === today.getFullYear();
                        break;
                }
            }

            return matchesSearch && matchesStatus && matchesType && matchesDate;
        });

        this.renderFilteredTable(filtered);
    }

    renderFilteredTable(filtered) {
        const tbody = document.getElementById('kyc-tbody');
        tbody.innerHTML = '';

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px;">No KYC applications found</td></tr>';
            return;
        }

        filtered.forEach(kyc => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="user-info">
                        <div class="user-avatar">${kyc.name.charAt(0)}</div>
                        <div class="user-details">
                            <div class="user-name">${kyc.name}</div>
                            <div class="user-email">${kyc.email}</div>
                        </div>
                    </div>
                </td>
                <td>${kyc.id}</td>
                <td>${this.formatType(kyc.type)}</td>
                <td>
                    <div class="kyc-documents">
                        ${kyc.documents.map(doc => `
                            <div class="doc-thumbnail" title="${doc.name}">
                                ${doc.type === 'passport' ? '📄' : '📋'}
                            </div>
                        `).join('')}
                        <a href="#" class="doc-link" onclick="viewDocuments('${kyc.id}'); return false;">View All</a>
                    </div>
                </td>
                <td>${this.formatDate(kyc.submitted)}</td>
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

        document.getElementById('total-count').textContent = `${filtered.length} Total`;
    }

    async refreshKYCList() {
        await this.loadKYCData();
        await this.loadKYCStats();
    }

    exportKYCData() {
        // Export functionality
        const csv = this.convertToCSV(this.kycApplications);
        this.downloadCSV(csv, 'kyc-applications.csv');
    }

    convertToCSV(data) {
        const headers = ['ID', 'Name', 'Email', 'Type', 'Status', 'Submitted'];
        const rows = data.map(kyc => [
            kyc.id,
            kyc.name,
            kyc.email,
            kyc.type,
            kyc.status,
            kyc.submitted
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
}

// Global functions for onclick handlers
let kycManager;

function reviewKYC(kycId) {
    const kyc = kycManager.kycApplications.find(k => k.id === kycId);
    if (!kyc) return;

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
                <div><strong>Name:</strong> ${kyc.name}</div>
                <div><strong>Email:</strong> ${kyc.email}</div>
                <div><strong>Type:</strong> ${kycManager.formatType(kyc.type)}</div>
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">Documents</label>
            ${kyc.documents.map(doc => `
                <div class="document-preview">
                    <div class="doc-thumbnail" style="width: 60px; height: 60px; margin: 0 auto 10px;">
                        ${doc.type === 'passport' ? '📄' : '📋'}
                    </div>
                    <div><strong>${doc.type.replace('_', ' ').toUpperCase()}</strong></div>
                    <div class="document-info">${doc.name}</div>
                    <div class="document-info">Status: ${doc.verified ? '✅ Verified' : '⏳ Pending'}</div>
                </div>
            `).join('')}
        </div>
        <div class="form-group">
            <label class="form-label">Review Notes</label>
            <textarea class="form-control" id="review-notes" placeholder="Add your review notes here...">${kyc.notes}</textarea>
        </div>
    `;

    document.getElementById('kyc-modal').classList.add('active');
}

function viewDocuments(kycId) {
    reviewKYC(kycId);
}

function quickApprove(kycId) {
    if (confirm('Are you sure you want to approve this KYC application?')) {
        const kyc = kycManager.kycApplications.find(k => k.id === kycId);
        if (kyc) {
            kyc.status = 'verified';
            kyc.notes = 'Approved via quick action';
            kycManager.refreshKYCList();
        }
    }
}

function quickReject(kycId) {
    if (confirm('Are you sure you want to reject this KYC application?')) {
        const kyc = kycManager.kycApplications.find(k => k.id === kycId);
        if (kyc) {
            kyc.status = 'rejected';
            kyc.notes = 'Rejected via quick action';
            kycManager.refreshKYCList();
        }
    }
}

function approveKYC() {
    if (kycManager.currentKYC) {
        const notes = document.getElementById('review-notes').value;
        kycManager.currentKYC.status = 'verified';
        kycManager.currentKYC.notes = notes || 'Approved';
        kycManager.refreshKYCList();
        closeModal('kyc-modal');
    }
}

function rejectKYC() {
    if (kycManager.currentKYC) {
        const notes = document.getElementById('review-notes').value;
        if (!notes) {
            alert('Please provide rejection notes');
            return;
        }
        kycManager.currentKYC.status = 'rejected';
        kycManager.currentKYC.notes = notes;
        kycManager.refreshKYCList();
        closeModal('kyc-modal');
    }
}

function requestMoreInfo() {
    if (kycManager.currentKYC) {
        const notes = document.getElementById('review-notes').value;
        if (!notes) {
            alert('Please specify what additional information is needed');
            return;
        }
        kycManager.currentKYC.status = 'review';
        kycManager.currentKYC.notes = notes;
        kycManager.refreshKYCList();
        closeModal('kyc-modal');
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function filterKYC() {
    kycManager.filterKYC();
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
