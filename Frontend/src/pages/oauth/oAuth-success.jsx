import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext.jsx';
import Skeleton from '../../components/Skeleton/Skeleton';
import './oAuth-success.css';

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
        <div className="oauth-success-container">
            <Skeleton variant="circle" width="50px" height="50px" />
            <p>Completing login...</p>
        </div>
    );
};

export default OAuthSuccess;
