import { type FC } from 'react';
import { useQuery } from '@apollo/client';
import AppHeader from '../components/AppHeader';
import { GET_ME } from '../graphql/queries';
import { useStore } from '../store/useStore';
import { PREVIEW_MODE, PREVIEW_USER } from '../preview';

const ProfileScreen: FC = () => {
  const storeUser = useStore((state) => state.user);
  const { data, loading, error } = useQuery(GET_ME);
  const user = PREVIEW_MODE ? PREVIEW_USER : data?.me || storeUser;

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
          <section className="profile-card">
            <div className="profile-avatar">{user.name.charAt(0).toUpperCase()}</div>
            <div className="profile-details">
              <span className="eyebrow">MEMBER PROFILE</span>
              <h2>{user.name}</h2>
              <p>{user.email}</p>
              <span className="role-pill">{user.role === 'ADMIN' ? 'Administrator' : 'Event member'}</span>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default ProfileScreen;
