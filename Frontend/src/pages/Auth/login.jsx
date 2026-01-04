import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { toast } from 'sonner';
import './login.css';
import logo from '../../assets/logo.png';

const LoginPage = () => {
    // Form state
    const [formData, setFormData] = useState({ email: '', password: '', otp: '' });
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);

    // Import auth functions
    const { handleLogin, handleRequestOtp, handleVerifyOtp } = useAuth();
    const navigate = useNavigate();

    // Handle login with email/password
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await handleLogin({ email: formData.email, password: formData.password });
        if (result.success) {
            toast.success('Logged in successfully');
            navigate('/'); // redirect on success
        } else {
            toast.error(result.message || 'Invalid email or password');
        }
        setLoading(false);
    };

    // Request OTP for email login
    const handleRequestOtpClick = async () => {
        if (!formData.email) {
            toast.error('Please enter your email address');
            return;
        }
        setLoading(true);

        const result = await handleRequestOtp(formData.email);
        if (result.success) {
            setOtpSent(true);
            toast.success('An OTP has been sent to your email address.');
        } else {
            toast.error(result.message || 'Failed to send OTP');
        }
        setLoading(false);
    };

    // Verify OTP and login
    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await handleVerifyOtp({ email: formData.email, otp: formData.otp });
        if (result.success) {
            toast.success('Logged in successfully');
            navigate('/'); // redirect on success
        } else {
            toast.error(result.message || 'Invalid OTP. Please try again.');
        }
        setLoading(false);
    };

    // Handle form input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

return (
    <div className="login-container">
        <div className="login-card">
            <div className="login-header">
                <div className="login-logo">
            <img src={logo} alt="Sharefy Logo" className="brand-logo" />
                </div>
                <h2 className="login-title">Login to your account</h2>
                <p className="login-subtitle">Welcome back! Please enter your details.</p>
            </div>

            {otpSent ? (
                <form onSubmit={handleOtpSubmit} className="login-form">
                    <div className="form-group">
                        <label className="form-label">Enter OTP</label>
                        <input
                            type="text"
                            name="otp"
                            placeholder="Enter the OTP sent to your email"
                            value={formData.otp}
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="login-btn btn-primary"
                    >
                        {loading && <div className="loading-spinner"></div>}
                        {loading ? 'Verifying...' : 'Login with OTP'}
                    </button>
                    
                    <div className="otp-actions">
                        <button
                            type="button"
                            onClick={() => setOtpSent(false)}
                            className="login-btn btn-outline"
                        >
                            Back to Email/Password
                        </button>
                    </div>
                </form>
            ) : (
                <>
                    <a
                        href={`${import.meta.env.VITE_API_URL}/auth/google`}
                        className="login-btn btn-google"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Sign in with Google
                    </a>

                    <div className="divider">Or</div>

                    <form onSubmit={handlePasswordSubmit} className="login-form">
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="form-input"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="login-btn btn-primary"
                        >
                            {loading && <div className="loading-spinner"></div>}
                            {loading ? 'Logging in...' : 'Sign In'}
                        </button>

                        <button
                            type="button"
                            onClick={handleRequestOtpClick}
                            disabled={loading}
                            className="login-btn btn-secondary"
                        >
                            {loading && <div className="loading-spinner"></div>}
                            {loading ? 'Sending OTP...' : 'Login with OTP'}
                        </button>

                        <div className="login-footer">
                            <Link to="/signup" className="signup-link">
                                Don't have an account? Sign Up
                            </Link>
                        </div>
                    </form>
                </>
            )}
        </div>
    </div>
);

};

export default LoginPage;
