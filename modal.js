/**
 * Reusable Modal System
 * Provides consistent modal dialogs for alerts, confirmations, and notifications
 */
class Modal {
    constructor() {
        this.modalContainer = null;
        this.init();
    }

    init() {
        // Create modal container if it doesn't exist
        if (!document.getElementById('modal-container')) {
            this.modalContainer = document.createElement('div');
            this.modalContainer.id = 'modal-container';
            this.modalContainer.innerHTML = `
                <div class="modal-overlay" id="modal-overlay">
                    <div class="modal-dialog" id="modal-dialog">
                        <div class="modal-header" id="modal-header">
                            <h3 class="modal-title" id="modal-title"></h3>
                            <button class="modal-close" id="modal-close" onclick="window.modal.close()">&times;</button>
                        </div>
                        <div class="modal-body" id="modal-body"></div>
                        <div class="modal-footer" id="modal-footer"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(this.modalContainer);
        } else {
            this.modalContainer = document.getElementById('modal-container');
        }

        // Add styles
        this.addStyles();
    }

    addStyles() {
        if (document.getElementById('modal-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'modal-styles';
        styles.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s ease, visibility 0.3s ease;
            }

            .modal-overlay.active {
                opacity: 1;
                visibility: visible;
            }

            .modal-dialog {
                background: var(--dark-bg, #1F2937);
                border: 1px solid var(--border-color, #4B5563);
                border-radius: 12px;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow: hidden;
                transform: scale(0.8);
                transition: transform 0.3s ease;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            }

            .modal-overlay.active .modal-dialog {
                transform: scale(1);
            }

            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 24px;
                border-bottom: 1px solid var(--border-color, #4B5563);
            }

            .modal-title {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
                color: var(--text-primary, #F9FAFB);
            }

            .modal-close {
                background: none;
                border: none;
                font-size: 24px;
                color: var(--text-secondary, #D1D5DB);
                cursor: pointer;
                padding: 0;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 6px;
                transition: background-color 0.2s ease;
            }

            .modal-close:hover {
                background: var(--light-bg, #374151);
                color: var(--text-primary, #F9FAFB);
            }

            .modal-body {
                padding: 24px;
                color: var(--text-secondary, #D1D5DB);
                line-height: 1.6;
                max-height: 60vh;
                overflow-y: auto;
            }

            .modal-footer {
                padding: 16px 24px;
                border-top: 1px solid var(--border-color, #4B5563);
                display: flex;
                gap: 12px;
                justify-content: flex-end;
            }

            .modal-btn {
                padding: 8px 16px;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .modal-btn-primary {
                background: var(--primary-color, #4F46E5);
                color: white;
            }

            .modal-btn-primary:hover {
                background: var(--primary-dark, #4338CA);
            }

            .modal-btn-secondary {
                background: var(--light-bg, #374151);
                color: var(--text-primary, #F9FAFB);
                border: 1px solid var(--border-color, #4B5563);
            }

            .modal-btn-secondary:hover {
                background: var(--border-color, #4B5563);
            }

            .modal-btn-danger {
                background: var(--danger-color, #EF4444);
                color: white;
            }

            .modal-btn-danger:hover {
                background: #DC2626;
            }

            .modal-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 48px;
                height: 48px;
                border-radius: 50%;
                margin: 0 auto 16px;
            }

            .modal-icon.success {
                background: rgba(16, 185, 129, 0.1);
                color: var(--success-color, #10B981);
            }

            .modal-icon.error {
                background: rgba(239, 68, 68, 0.1);
                color: var(--danger-color, #EF4444);
            }

            .modal-icon.warning {
                background: rgba(245, 158, 11, 0.1);
                color: var(--warning-color, #F59E0B);
            }

            .modal-icon.info {
                background: rgba(59, 130, 246, 0.1);
                color: var(--info-color, #3B82F6);
            }

            @media (max-width: 640px) {
                .modal-dialog {
                    width: 95%;
                    margin: 20px;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    show(options = {}) {
        const {
            title = 'Notification',
            message = '',
            type = 'info',
            buttons = [{ text: 'OK', type: 'primary', action: () => this.close() }],
            icon = null
        } = options;

        // Update modal content
        document.getElementById('modal-title').textContent = title;
        
        let bodyContent = '';
        if (icon) {
            bodyContent += `<div class="modal-icon ${type}">${icon}</div>`;
        }
        bodyContent += `<div>${message}</div>`;
        document.getElementById('modal-body').innerHTML = bodyContent;

        // Update buttons
        const footer = document.getElementById('modal-footer');
        footer.innerHTML = '';
        buttons.forEach(button => {
            const btn = document.createElement('button');
            btn.className = `modal-btn modal-btn-${button.type || 'secondary'}`;
            btn.textContent = button.text;
            btn.onclick = () => {
                if (button.action) button.action();
                else this.close();
            };
            footer.appendChild(btn);
        });

        // Show modal
        this.modalContainer.querySelector('.modal-overlay').classList.add('active');
        
        // Add keyboard support
        document.addEventListener('keydown', this.handleKeydown);
    }

    close() {
        this.modalContainer.querySelector('.modal-overlay').classList.remove('active');
        document.removeEventListener('keydown', this.handleKeydown);
    }

    handleKeydown = (e) => {
        if (e.key === 'Escape') {
            this.close();
        }
    }

    // Convenience methods
    alert(message, title = 'Alert') {
        this.show({
            title,
            message,
            type: 'info',
            icon: 'ℹ️'
        });
    }

    success(message, title = 'Success') {
        this.show({
            title,
            message,
            type: 'success',
            icon: '✓'
        });
    }

    error(message, title = 'Error') {
        this.show({
            title,
            message,
            type: 'error',
            icon: '✕'
        });
    }

    warning(message, title = 'Warning') {
        this.show({
            title,
            message,
            type: 'warning',
            icon: '⚠'
        });
    }

    info(message, title = 'Information') {
        this.show({
            title,
            message,
            type: 'info',
            icon: 'ℹ️'
        });
    }

    confirm(message, onConfirm, onCancel = null, title = 'Confirm Action') {
        this.show({
            title,
            message,
            type: 'warning',
            icon: '⚠',
            buttons: [
                { text: 'Cancel', type: 'secondary', action: () => {
                    if (onCancel) onCancel();
                    this.close();
                }},
                { text: 'Confirm', type: 'danger', action: () => {
                    if (onConfirm) onConfirm();
                    this.close();
                }}
            ]
        });
    }
}

// Initialize global modal instance
window.modal = new Modal();

// Replace global alert function
window.alert = (message, title = 'Alert') => {
    window.modal.alert(message, title);
};
