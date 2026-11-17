import { useState, type FC, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useMutation } from '@apollo/client';
import { LOGIN_MUTATION, REGISTER_MUTATION } from '../graphql/mutations';
import '../styles/Auth.css';

const LoginScreen: FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const setUser = useStore((state) => state.setUser);
  const setToken = useStore((state) => state.setToken);
  const [loginMutation, loginState] = useMutation(LOGIN_MUTATION);
  const [registerMutation, registerState] = useMutation(REGISTER_MUTATION);
  const loading = loginState.loading || registerState.loading;
  const error = loginState.error || registerState.error;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = isRegistering ? await registerMutation({ variables: { name, email, password } }) : await loginMutation({ variables: { email, password } });
    const auth = result.data?.login || result.data?.register;
    if (auth) {
      localStorage.setItem('token', auth.token);
      setUser(auth.user);
      setToken(auth.token);
      navigate('/events');
    }
  };

  return <div className="auth-page"><div className="auth-art"><span className="brand static-brand"><span className="brand-mark">✦</span> Gatherly</span><div><span className="auth-star">✦</span><h1>Make room<br />for <em>memories.</em></h1><p>Discover the people, places and moments that make your week feel a little brighter.</p></div><small>EVENTS MADE FOR YOUR PEOPLE</small></div><div className="auth-panel"><div className="auth-card"><span className="eyebrow">{isRegistering ? 'WELCOME TO THE COMMUNITY' : 'WELCOME BACK'}</span><h2>{isRegistering ? 'Create your account' : 'Let’s get you out there'}</h2><p className="auth-intro">{isRegistering ? 'Start finding experiences worth showing up for.' : 'Sign in to discover what’s happening around you.'}</p><form onSubmit={handleSubmit}>{isRegistering && <div className="form-group"><label htmlFor="name">Your name</label><input id="name" type="text" value={name} onChange={(event) => setName(event.target.value)} required placeholder="What should we call you?" /></div>}<div className="form-group"><label htmlFor="email">Email address</label><input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@example.com" /></div><div className="form-group"><label htmlFor="password">Password</label><input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} placeholder="At least 6 characters" /></div>{error && <div className="error">{error.message}</div>}<button className="primary-button" type="submit" disabled={loading}>{loading ? 'One moment...' : isRegistering ? 'Create account →' : 'Continue →'}</button></form><p className="auth-switch">{isRegistering ? 'Already have an account?' : 'New to Gatherly?'} <button onClick={() => setIsRegistering(!isRegistering)}>{isRegistering ? 'Sign in' : 'Create an account'}</button></p></div></div></div>;
};

export default LoginScreen;
