import React, { useState } from 'react';

const BACKEND_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const AUTH_URL = `${BACKEND_BASE}/api/auth`;

function Auth({ onLoginSuccess, showNotification }) {
  // mode: 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    newPassword: '',
    confirmPassword: '',
    fullName: '',
    usernameOrEmail: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(null);
    setSuccessInfo(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessInfo(null);

    try {
      if (mode === 'register') {
        // Register API
        const payload = {
          username: (formData.username || '').trim(),
          email: (formData.email || '').trim(),
          password: (formData.password || '').trim(),
          fullName: (formData.fullName || '').trim()
        };

        const res = await fetch(`${AUTH_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        let data = {};
        try {
          data = await res.json();
        } catch {
          data = { message: 'Unexpected server response.' };
        }

        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Registration failed');
        }

        showNotification('Registration successful! You are now logged in.');
        onLoginSuccess(data);
      } else if (mode === 'forgot') {
        // Reset Password API
        const identifier = (formData.usernameOrEmail || formData.username || formData.email || '').trim();
        if (!identifier) {
          throw new Error('Please enter your username or email address.');
        }
        if (!formData.newPassword || formData.newPassword.trim().length < 4) {
          throw new Error('New password must be at least 4 characters long.');
        }
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('Passwords do not match. Please verify.');
        }

        const payload = {
          usernameOrEmail: identifier,
          username: identifier,
          email: identifier,
          newPassword: formData.newPassword.trim(),
          password: formData.newPassword.trim()
        };

        const res = await fetch(`${AUTH_URL}/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        let data = {};
        try {
          data = await res.json();
        } catch {
          data = { message: 'Unexpected server response.' };
        }

        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Password reset failed');
        }

        setSuccessInfo('Password reset successful! You can now log in.');
        showNotification('Password reset successful! Please log in.');
        setMode('login');
        setFormData((prev) => ({
          ...prev,
          password: '',
          newPassword: '',
          confirmPassword: '',
          usernameOrEmail: identifier
        }));
      } else {
        // Login API
        const identifier = (formData.usernameOrEmail || formData.username || formData.email || '').trim();
        if (!identifier) {
          throw new Error('Please enter your username or email address.');
        }
        if (!formData.password || !formData.password.trim()) {
          throw new Error('Please enter your password.');
        }

        const payload = {
          usernameOrEmail: identifier,
          username: identifier,
          email: identifier,
          password: formData.password.trim()
        };

        const res = await fetch(`${AUTH_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        let data = {};
        try {
          data = await res.json();
        } catch {
          data = { message: 'Unexpected server response.' };
        }

        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Invalid username/email or password.');
        }

        showNotification(`Welcome back, ${data.fullName || data.username}!`);
        onLoginSuccess(data);
      }
    } catch (err) {
      console.error('Auth error:', err);
      const isConnectionRefused =
        err.name === 'TypeError' ||
        (err.message && err.message.toLowerCase().includes('fetch'));
      if (isConnectionRefused) {
        setError(
          'Cannot connect to the backend server (http://localhost:8080). Please ensure the Spring Boot backend is running (run start_backend.bat or mvn spring-boot:run).'
        );
      } else {
        setError(err.message || 'Something went wrong. Please check your backend connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            {mode === 'register' ? '👤' : mode === 'forgot' ? '🔑' : '⚡'}
          </div>
          <h2>
            {mode === 'register'
              ? 'Create an Account'
              : mode === 'forgot'
              ? 'Reset Your Password'
              : 'Welcome Back'}
          </h2>
          <p className="auth-subtitle">
            {mode === 'register'
              ? 'Register to monitor and calculate your appliance energy usage'
              : mode === 'forgot'
              ? 'Enter your username or email and choose a new password'
              : 'Sign in to access your Smart Energy Dashboard'}
          </p>
        </div>

        {error && (
          <div className="auth-error-banner">
            ⚠️ {error}
          </div>
        )}

        {successInfo && (
          <div className="auth-success-banner" style={{ background: '#dcfce7', color: '#15803d', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem', marginBottom: '20px', border: '1px solid #86efac' }}>
            ✓ {successInfo}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <>
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="e.g. Anurag Sharma"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="e.g. anurag"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  minLength={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="e.g. anurag@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder="At least 4 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={4}
                    style={{ width: '100%', paddingRight: '45px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--text-muted)' }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            </>
          )}

          {mode === 'login' && (
            <>
              <div className="form-group">
                <label htmlFor="usernameOrEmail">Username or Email</label>
                <input
                  type="text"
                  id="usernameOrEmail"
                  name="usernameOrEmail"
                  placeholder="Enter your username or email"
                  value={formData.usernameOrEmail}
                  onChange={handleChange}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
                  <button
                    type="button"
                    className="link-btn"
                    style={{ fontSize: '0.82rem', padding: 0 }}
                    onClick={() => {
                      setMode('forgot');
                      setError(null);
                      setSuccessInfo(null);
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div style={{ position: 'relative', marginTop: '6px' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', paddingRight: '45px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--text-muted)' }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            </>
          )}

          {mode === 'forgot' && (
            <>
              <div className="form-group">
                <label htmlFor="usernameOrEmail">Username or Email</label>
                <input
                  type="text"
                  id="usernameOrEmail"
                  name="usernameOrEmail"
                  placeholder="Enter your username or registered email"
                  value={formData.usernameOrEmail}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="newPassword"
                    name="newPassword"
                    placeholder="At least 4 characters"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                    minLength={4}
                    style={{ width: '100%', paddingRight: '45px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--text-muted)' }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Re-enter your new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={4}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-spinner"></span>
            ) : mode === 'register' ? (
              'Create Account'
            ) : mode === 'forgot' ? (
              'Update Password'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="auth-footer-toggle">
          {mode === 'register' && (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                className="link-btn"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccessInfo(null);
                }}
              >
                Sign In
              </button>
            </p>
          )}

          {mode === 'login' && (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                className="link-btn"
                onClick={() => {
                  setMode('register');
                  setError(null);
                  setSuccessInfo(null);
                }}
              >
                Sign Up
              </button>
            </p>
          )}

          {mode === 'forgot' && (
            <p>
              Remember your password?{' '}
              <button
                type="button"
                className="link-btn"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccessInfo(null);
                }}
              >
                Back to Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Auth;