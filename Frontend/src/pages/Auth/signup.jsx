import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../api/authApi';
import { toast } from 'sonner';
import './signup.css';

const SignupPage = () => {
  // State for form data
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  // State for loading indicator
  const [loading, setLoading] = useState(false);
  // Hook for navigation
  const navigate = useNavigate();

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    const { fullName, username, email, password } = formData;
    // Call the register API
    const result = await register({ fullName, username, email, password });
    if (result.success) {
      toast.success('Account created successfully!');
      // Navigate to login page on successful registration
      navigate('/login');
    } else {
      // Set error message on failure
      toast.error(result.message || 'Signup failed');
    }
    setLoading(false);
  };

  // State for password strength
  const [passwordStrength, setPasswordStrength] = useState('');

  // Calculate password strength based on length
  const calculatePasswordStrength = (password) => {
    if (password.length === 0) return '';
    if (password.length < 6) return 'weak';
    if (password.length < 10) return 'medium';
    return 'strong';
  };

  // Handle password input changes and update strength
  const handlePasswordChange = (e) => {
    handleChange(e);
    setPasswordStrength(calculatePasswordStrength(e.target.value));
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <div className="signup-logo">
            <i className="fas fa-robot"></i>
            <span>SocialAI</span>
          </div>
          <h2 className="signup-title">Create your account</h2>
          <p className="signup-subtitle">Join our community today</p>
        </div>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Enter your full name"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Choose a username"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handlePasswordChange}
              required
              className="form-input"
              placeholder="Create a password"
            />
            {/* Display password strength indicator */}
            {passwordStrength && (
              <div className="password-strength">
                <div>Password strength: {passwordStrength}</div>
                <div className="strength-bar">
                  <div className={`strength-fill strength-${passwordStrength}`}></div>
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Confirm your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="signup-btn"
          >
            {/* Show loading spinner when loading */}
            {loading && <div className="loading-spinner"></div>}
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="signup-footer">
          <p>Already have an account?{' '}
            <Link to="/login" className="login-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// Export the SignupPage component
export default SignupPage;