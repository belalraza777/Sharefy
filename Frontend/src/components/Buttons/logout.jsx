import { useAuth } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';

export default function LogoutButton() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { handleLogout } = useAuth();

    const logoutFunction = async () => {
        try {
            setLoading(true);
            const res = await handleLogout();
            if (!res.success) {
                toast.error(res.message || 'Logout failed');
                return;
            }
            toast.success('Logged out successfully');
            navigate('/login');
        } catch (err) {
            toast.error(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={logoutFunction}
            className="btn btn-primary"
        >
            {loading && <div className="loading-spinner"></div>}
            {loading ? 'Logging out...' : 'Logout'}
        </button>
    );
};

