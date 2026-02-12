import { useState, useEffect } from 'react';
import { useAuth } from '../../context/authContext';
import './ResetPasswordForm.css';
import { toast } from 'sonner';

export default function ResetPasswordForm({ isOpen, onClose }) {
    const { handleResetPassword } = useAuth();

    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
    });
    const [loading, setLoading] = useState(false);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData({ oldPassword: '', newPassword: '' });
        }
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && !loading) onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
        }
        return () => {
            document.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose, loading]);
    function handleChange(e) {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await handleResetPassword(formData);
            if (!response.success) {
                toast.error(response.message);
                return;
            }
            toast.success(response.message || "Password reset successful!");
            setFormData({ oldPassword: '', newPassword: '' });
            onClose();
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="reset-password-overlay" onClick={onClose}>
            <div className="reset-password-modal" onClick={(e) => e.stopPropagation()}>
                <div className="reset-password-modal-header">
                    <h2>Reset Password</h2>
                    <button className="reset-password-close-btn" onClick={onClose} aria-label="Close">
                        &times;
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="oldPassword">Current Password</label>
                        <input
                            type="password"
                            id="oldPassword"
                            name="oldPassword"
                            placeholder="Enter current password"
                            value={formData.oldPassword}
                            onChange={handleChange}
                            required
                            autoFocus
                        />

                        <label htmlFor="newPassword">New Password</label>
                        <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            placeholder="Enter new password (min 6 chars)"
                            minLength={6}
                            value={formData.newPassword}
                            onChange={handleChange}
                            required
                        />

                        <div className="reset-password-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? "Resetting..." : "Reset Password"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
