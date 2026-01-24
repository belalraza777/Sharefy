import { useState } from 'react';
import { useAuth } from '../../context/authContext';
import './ResetPasswordForm.css';
import { toast } from 'sonner';

export default function ResetPasswordForm() {
    const { handleResetPassword } = useAuth();

    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
    });
    const [loading, setLoading] = useState(false);

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
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h1>Reset Password</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="oldPassword">Old Password</label>
                    <input
                        type="password"
                        className="form-control"
                        id="oldPassword"
                        name="oldPassword"
                        value={formData.oldPassword}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor="newPassword">New Password</label>
                    <input
                        type="password"
                        className="form-control"
                        id="newPassword"
                        name="newPassword"
                        minLength={6}
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                    />

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}

                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </div>
            </form>
        </div>
    );
}
