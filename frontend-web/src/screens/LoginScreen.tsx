import { useState, type FC, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useMutation } from '@apollo/client';
import { LOGIN_MUTATION } from '../graphql/mutations';
import '../styles/Auth.css';

const LoginScreen: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const setUser = useStore((state) => state.setUser);
  const setToken = useStore((state) => state.setToken);

  const [loginMutation, { loading, error }] = useMutation(LOGIN_MUTATION);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { data } = await loginMutation({
        variables: { email, password },
      });

      if (data?.login) {
        const { token, user } = data.login;
        setUser(user);
        setToken(token);
        navigate('/events');
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Event Check-In</h1>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e: FormEvent<HTMLInputElement>) => setEmail(e.currentTarget.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e: FormEvent<HTMLInputElement>) => setPassword(e.currentTarget.value)}
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          {error && <div className="error">{error.message}</div>}
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
