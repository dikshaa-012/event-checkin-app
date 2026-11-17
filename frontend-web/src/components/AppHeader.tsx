import { type FC } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { PREVIEW_MODE } from '../preview';

const AppHeader: FC = () => {
  const navigate = useNavigate();
  const user = useStore((state) => state.user);
  const logout = useStore((state) => state.logout);

  const handleLogout = () => {
    localStorage.removeItem('token');
    logout();
    navigate('/login');
  };

  return (
    <header className="app-header">
      {PREVIEW_MODE && <span className="preview-indicator">Preview mode · local fixtures</span>}
      <button className="brand" onClick={() => navigate('/events')} aria-label="Go to event discovery">
        <span className="brand-mark">✦</span>
        <span>Event Check-In</span>
      </button>
      <nav className="main-nav" aria-label="Main navigation">
        <NavLink to="/events" className={({ isActive }) => isActive ? 'active' : ''}>Explore</NavLink>
        <NavLink to="/my-events" className={({ isActive }) => isActive ? 'active' : ''}>My events</NavLink>
        <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>Profile</NavLink>
        {user?.role === 'ADMIN' && <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''}>Admin</NavLink>}
      </nav>
      <div className="header-account">
        <span className="avatar" aria-hidden="true">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
        <button className="text-button" onClick={handleLogout}>Log out</button>
      </div>
    </header>
  );
};

export default AppHeader;
