import { type FC } from 'react';
import { useQuery } from '@apollo/client';
import AppHeader from '../components/AppHeader';
import EventCard, { type EventSummary } from '../components/EventCard';
import { GET_EVENTS } from '../graphql/queries';
import { useStore } from '../store/useStore';
import { PREVIEW_EVENTS, PREVIEW_MODE } from '../preview';

const MyEventsScreen: FC = () => {
  const joinedEventIds = useStore((state) => state.joinedEventIds);
  const { data, loading, error } = useQuery<{ events: EventSummary[] }>(GET_EVENTS);
  const events = PREVIEW_MODE ? PREVIEW_EVENTS : data?.events || [];
  const joined = events.filter((event) => joinedEventIds.includes(event.id));
  const past = joined.filter((event) => new Date(event.startTime).getTime() < Date.now());
  const upcoming = joined.filter((event) => !past.includes(event));

  return (
    <div className="app-shell">
      <AppHeader />
      <main className="page-content">
        <section className="page-heading">
          <p className="eyebrow">YOUR CALENDAR</p>
          <h1>My events<span className="heading-dot">.</span></h1>
          <p>Keep track of the experiences you have said yes to.</p>
        </section>
        {loading && !PREVIEW_MODE && <div className="state-card">Loading your events...</div>}
        {error && !PREVIEW_MODE && <div className="state-card state-error">We couldn't load your events. Please try again.</div>}
        {(!loading || PREVIEW_MODE) && (
          <>
            <section className="section-block">
              <div className="section-heading"><h2>Coming up</h2><span>{upcoming.length} events</span></div>
              {upcoming.length ? <div className="events-grid">{upcoming.map((event) => <EventCard key={event.id} event={event} joined />)}</div> : <div className="empty-panel"><span>☀</span><h3>No upcoming events yet</h3><p>Find something lovely to do and it will appear here.</p></div>}
            </section>
            <section className="section-block">
              <div className="section-heading"><h2>Past events</h2><span>{past.length} events</span></div>
              {past.length ? <div className="events-grid">{past.map((event) => <EventCard key={event.id} event={event} joined />)}</div> : <p className="muted-copy">Your event history will show up here.</p>}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default MyEventsScreen;
