import { useEffect, useState, type FC, type FormEvent } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import AppHeader from '../components/AppHeader';
import { GET_ME } from '../graphql/queries';
import { UPDATE_PROFILE } from '../graphql/mutations';
import { useStore } from '../store/useStore';
import { PREVIEW_MODE, PREVIEW_USER } from '../preview';

type Theme = 'light' | 'dark';

const ProfileScreen: FC = () => {
  const storeUser = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  const { data, loading, error } = useQuery(GET_ME);
  const [updateProfile, updateState] = useMutation(UPDATE_PROFILE);
  const user = PREVIEW_MODE ? storeUser || PREVIEW_USER : data?.me || storeUser;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => localStorage.getItem('event-checkin-theme') === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('event-checkin-theme', theme);
  }, [theme]);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    if (PREVIEW_MODE) {
      setUser({ ...user, name, email });
      setIsEditing(false);
      return;
    }
    const result = await updateProfile({ variables: { name, email } });
    if (result.data?.updateProfile) {
      setUser(result.data.updateProfile);
      setIsEditing(false);
    }
  };

  return (
    <div className="app-shell">
      <AppHeader />
      <main className="page-content profile-page">
        <section className="page-heading">
          <p className="eyebrow">YOUR SPACE</p>
          <h1>Profile<span className="heading-dot">.</span></h1>
          <p>Your account details and event activity.</p>
        </section>
        {loading && !PREVIEW_MODE && <div className="state-card">Loading your profile...</div>}
        {error && !PREVIEW_MODE && <div className="state-card state-error">We couldn't load your profile. Please try again.</div>}
        {(!loading || PREVIEW_MODE) && user && (
          <>
            <section className="profile-card">
              <div className="profile-avatar">{user.name.charAt(0).toUpperCase()}</div>
              <div className="profile-details">
                <span className="eyebrow">MEMBER PROFILE</span>
                <h2>{user.name}</h2>
                <p>{user.email}</p>
                <span className="role-pill">{user.role === 'ADMIN' ? 'Administrator' : 'Event member'}</span>
              </div>
              <button className="secondary-button profile-edit-button" onClick={() => setIsEditing((current) => !current)}>{isEditing ? 'Cancel' : 'Edit details'}</button>
            </section>
            {isEditing && <form className="profile-edit-form" onSubmit={handleSave}>
              <div className="form-group"><label htmlFor="profile-name">Name</label><input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} required /></div>
              <div className="form-group"><label htmlFor="profile-email">Email</label><input id="profile-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
              {updateState.error && <div className="error">{updateState.error.message}</div>}
              <button className="primary-button" type="submit" disabled={updateState.loading}>{updateState.loading ? 'Saving...' : 'Save changes'}</button>
            </form>}
            <section className="settings-card">
              <div><span className="eyebrow">PREFERENCES</span><h2>Appearance</h2><p>Choose how Event Check-In looks on this device.</p></div>
              <div className="theme-switch" role="group" aria-label="Theme preference">
                <button className={theme === 'light' ? 'selected' : ''} onClick={() => setTheme('light')}>☀ Light</button>
                <button className={theme === 'dark' ? 'selected' : ''} onClick={() => setTheme('dark')}>◐ Dark</button>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default ProfileScreen;
