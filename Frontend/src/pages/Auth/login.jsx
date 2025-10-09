import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { toast } from 'sonner';
import './login.css';

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

    // Updated JSX structure for your LoginPage component
return (
    <div className="login-container">
        <div className="login-card">
            <div className="login-header">
                <div className="login-logo">
                    <i className="fas fa-robot"></i>
                    <span>SocialAI</span>
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
            )}
        </div>
    </div>
);

};

export default LoginPage;
