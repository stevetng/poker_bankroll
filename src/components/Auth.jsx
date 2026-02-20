import { useState } from 'react';

export default function Auth({ onSignIn, onSignUp, error, onClearError }) {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState('');

  const switchMode = (m) => {
    setMode(m);
    setEmail('');
    setPassword('');
    setConfirm('');
    setLocalError('');
    onClearError();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Email and password are required.');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setLocalError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirm) {
        setLocalError('Passwords do not match.');
        return;
      }
      onSignUp(email, password);
    } else {
      onSignIn(email, password);
    }
  };

  const displayError = localError || error;

  return (
    <div className="auth-page">
      <div className="auth-window">
        <div className="auth-titlebar">
          <span>Poker Bankroll Tracker - {mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
        </div>
        <div className="auth-body">
          <div className="auth-icon-area">
            <div className="auth-icon">&#9824;</div>
            <p className="auth-welcome">
              {mode === 'signin'
                ? 'Sign in to access your bankroll data across all your devices.'
                : 'Create an account to start tracking your poker sessions.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="email">Email:</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="auth-field">
              <label htmlFor="password">Password:</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              />
            </div>
            {mode === 'signup' && (
              <div className="auth-field">
                <label htmlFor="confirm">Confirm:</label>
                <input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            )}

            {displayError && <div className="auth-error">{displayError}</div>}

            <div className="auth-actions">
              <button type="submit" className="btn btn-primary">
                {mode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="auth-switch">
            {mode === 'signin' ? (
              <p>
                Don't have an account?{' '}
                <button className="btn-link" onClick={() => switchMode('signup')}>
                  Create one
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button className="btn-link" onClick={() => switchMode('signin')}>
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
