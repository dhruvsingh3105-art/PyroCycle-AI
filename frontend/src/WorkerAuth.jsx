import React, { useState, useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export const WorkerLogin = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fillDemoAccount = () => {
    setEmail('worker@pyrocycle.com');
    setPassword('password123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const result = await login(email, password);
    if (result.success) {
      navigate('/worker/home');
    } else {
      setError(result.msg);
    }
    setIsLoading(false);
  };

  return (
    <div className="worker-page">
      <Link to="/" className="worker-back">← Back</Link>
      <div className="worker-container">
        <div className="worker-logo small">♻️</div>
        <h1>PyroCycle AI</h1>
        <p className="worker-tagline">Waste Collector & Aggregator Login</p>
        
        <div className="worker-card">
          <div style={{
            background: 'rgba(0, 255, 135, 0.06)',
            border: '1px solid rgba(0, 255, 135, 0.25)',
            borderRadius: '12px',
            padding: '12px 14px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div>
              <div style={{ fontSize: '11px', color: '#00ff87', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🚀 Quick Demo Access
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                worker@pyrocycle.com
              </div>
            </div>
            <button
              type="button"
              onClick={fillDemoAccount}
              style={{
                background: 'rgba(0, 255, 135, 0.15)',
                color: '#00ff87',
                border: '1px solid rgba(0, 255, 135, 0.35)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              ⚡ Fill Demo Login
            </button>
          </div>

          <form className="worker-form" onSubmit={handleSubmit}>
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="worker@example.com"
              required
            />
            
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            
            {error && <div className="worker-warning">{error}</div>}
            
            <button className="worker-primary-button" type="submit" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Login to Collector Portal →"}
            </button>
          </form>
          
          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
            Don't have an account? <Link to="/worker/register" style={{ color: '#00ff87', fontWeight: '600' }}>Register here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export const WorkerRegister = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const result = await register(email, password, 'worker', name);
    if (result.success) {
      navigate('/worker/onboarding'); // Redirect to onboarding instead of straight to home
    } else {
      setError(result.msg);
    }
    setIsLoading(false);
  };

  return (
    <div className="worker-page">
      <Link to="/worker/login" className="worker-back">← Back to Login</Link>
      <div className="worker-container">
        <div className="worker-logo small">♻️</div>
        <h1>PyroCycle AI</h1>
        <p className="worker-tagline">Worker Portal Registration</p>
        
        <div className="worker-card">
          <form className="worker-form" onSubmit={handleSubmit}>
            <label>Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required />

            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            
            {error && <div className="worker-warning">{error}</div>}
            
            <button className="worker-primary-button" type="submit" disabled={isLoading}>
              {isLoading ? "Registering..." : "Register"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
