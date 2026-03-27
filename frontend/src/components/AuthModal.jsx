import { useState } from 'react';
import { registerUser } from '../services/api';
import { loginWithEmail } from '../services/firebaseConfig';

export default function AuthModal({ onClose, onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        // === LOGIN ===
        // Firebase client-side login: authenticates the user and returns an ID token.
        // The ID token can then be sent to the backend as a Bearer token
        // to access protected routes like GET /api/auth/me
        //
        // REQUIRED: Set your Firebase config in src/services/firebaseConfig.js
        // Make sure "Email/Password" is enabled in Firebase Console > Authentication > Sign-in method
        const { user, idToken } = await loginWithEmail(email, password);
        onLoginSuccess?.({ email: user.email, uid: user.uid, idToken });
        onClose();
      } else {
        // === REGISTER ===
        // Calls POST /api/auth/register on the FastAPI backend
        // This creates the user via firebase-admin SDK server-side
        //
        // REQUIRED: The backend needs FIREBASE_CREDENTIALS_PATH in .env
        // pointing to your firebase-service-account.json file
        const data = await registerUser(email, password);
        // After successful registration, auto-login
        const { user, idToken } = await loginWithEmail(email, password);
        onLoginSuccess?.({ email: user.email, uid: data.uid || user.uid, idToken });
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="modal__title">
          {mode === 'login' ? 'Login' : 'Register'}
        </div>

        {error && <div className="modal__error">{error}</div>}

        <input
          className="modal__input"
          type="email"
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          className="modal__input"
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={6}
        />

        <button className="modal__btn" type="submit" disabled={loading}>
          {loading ? 'Processing...' : mode === 'login' ? 'LOGIN' : 'REGISTER'}
        </button>

        <div className="modal__toggle">
          {mode === 'login' ? (
            <>Don&apos;t have an account? <span onClick={() => { setMode('register'); setError(''); }}>Register</span></>
          ) : (
            <>Already have an account? <span onClick={() => { setMode('login'); setError(''); }}>Login</span></>
          )}
        </div>
      </form>
    </div>
  );
}
