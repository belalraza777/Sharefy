import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext.jsx';
import Skeleton from '../../components/Skeleton/Skeleton';

const OAuthSuccess = () => {
    const navigate = useNavigate();
    const { refreshUser } = useAuth();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Cookies are already set by backend, just fetch user data
                await refreshUser();
                navigate('/', { replace: true });
            } catch (error) {
                console.error('OAuth refresh failed:', error);
                navigate('/login', { replace: true });
            }
        };
        fetchUser();
    }, [navigate, refreshUser]);

    return (
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
            <Skeleton variant="circle" width="50px" height="50px" />
            <p style={{ marginTop: '1rem' }}>Completing login...</p>
        </div>
    );
};

export default OAuthSuccess;
