import { useEffect, useState, type FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_EVENT } from '../graphql/queries';
import { useStore } from '../store/useStore';
import socket from '../socket';
import AppHeader from '../components/AppHeader';
import { formatEventDate, getEventCoverClass } from '../components/EventCard';
import { PREVIEW_EVENTS, PREVIEW_MODE } from '../preview';
import '../styles/EventDetail.css';

type Participant = { id: string; name: string; email: string };
type EventDetails = { id: string; name: string; location: string; startTime: string; category?: string | null; attendees: Participant[]; attendeeCount: number; isClosed: boolean };

const EventDetailScreen: FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const user = useStore((state) => state.user);
  const joinedEventIds = useStore((state) => state.joinedEventIds);
  const joinEvent = useStore((state) => state.joinEvent);
  const leaveEvent = useStore((state) => state.leaveEvent);
  const [liveCount, setLiveCount] = useState(0);
  const [notifications, setNotifications] = useState<string[]>([]);
  const { data, loading, error, refetch } = useQuery<{ event: EventDetails }>(GET_EVENT, { variables: { id: eventId }, skip: !eventId });
  const event = data?.event || (PREVIEW_MODE ? PREVIEW_EVENTS.find((previewEvent) => previewEvent.id === eventId) : undefined);
  const isJoined = Boolean(eventId && joinedEventIds.includes(eventId));

  useEffect(() => {
    if (!user || !eventId || PREVIEW_MODE) return;
    const handleJoined = (payload: { count: number; user: { name: string } }) => {
      setLiveCount(payload.count);
      setNotifications((previous) => [`${payload.user.name} joined`, ...previous.slice(0, 4)]);
      void refetch();
    };
    const handleLeft = (payload: { count: number; user: { name: string } }) => {
      setLiveCount(payload.count);
      setNotifications((previous) => [`${payload.user.name} left`, ...previous.slice(0, 4)]);
      void refetch();
    };
    const handleCount = (count: number) => setLiveCount(count);
    socket.on('user_joined', handleJoined);
    socket.on('user_left', handleLeft);
    socket.on('live_count', handleCount);
    socket.emit('join_room', { eventId });
    return () => {
      socket.off('user_joined', handleJoined);
      socket.off('user_left', handleLeft);
      socket.off('live_count', handleCount);
      socket.emit('leave_room', { eventId });
    };
  }, [eventId, refetch, user]);

  useEffect(() => { if (event) setLiveCount(event.attendeeCount); }, [event]);

  const handleJoin = async () => {
    if (eventId && await joinEvent(eventId)) socket.emit('join_event', { eventId, user });
  };
  const handleLeave = async () => {
    if (eventId && await leaveEvent(eventId)) socket.emit('leave_event', { eventId, user });
  };

  if (loading && !PREVIEW_MODE) return <div className="app-shell"><AppHeader /><div className="state-card page-state">Loading event...</div></div>;
  if ((!PREVIEW_MODE && error) || !event) return <div className="app-shell"><AppHeader /><div className="state-card state-error page-state"><h2>Event unavailable</h2><p>We couldn't find this event.</p><button className="primary-button" onClick={() => navigate('/events')}>Back to explore</button></div></div>;
  const eventDate = formatEventDate(event.startTime);

  return (
    <div className="app-shell">
      <AppHeader />
      <main className="event-detail-page">
        <button className="back-link" onClick={() => navigate('/events')}>← Back to explore</button>
        <section className={`detail-cover ${getEventCoverClass(event.category)}`}><span>✦</span><small>{event.category || 'Community event'}</small></section>
        <section className="detail-layout">
          <div className="detail-main">
            <span className="category-label">{event.category || 'Community'}</span>
            <h1>{event.name}<span className="heading-dot">.</span></h1>
            <div className="event-meta-row"><span>◷ <strong>{eventDate.date}</strong><br /><small>{eventDate.time}</small></span><span>⌖ <strong>{event.location}</strong><br /><small>Event venue</small></span></div>
            <div className="detail-description"><h2>About this event</h2><p>Join us for {event.name}, a welcoming {event.category?.toLowerCase() || 'community'} experience. Check in with your account to take part and connect with fellow attendees.</p></div>
          </div>
          <aside className="join-panel">
            <span className="eyebrow">EVENT ACCESS</span>
            <h2>Ready to join?</h2>
            <p>{event.attendeeCount} people are already going.</p>
            {event.isClosed ? <div className="status-message closed">Registration is closed</div> : isJoined ? <><div className="status-message joined">✓ You're on the list</div><button className="secondary-button" onClick={handleLeave}>Leave event</button></> : <button className="primary-button" onClick={handleJoin}>Join this event →</button>}
            <div className="live-count">◉ {liveCount} attendees currently connected</div>
          </aside>
        </section>
        {notifications.length > 0 && <div className="notifications"><span className="eyebrow">LIVE UPDATES</span>{notifications.map((note, index) => <div key={`${note}-${index}`}>{note}</div>)}</div>}
        <section className="participants-section"><div className="section-heading"><div><p className="eyebrow">THE CROWD</p><h2>Who's going</h2></div><span className="section-count">{event.attendeeCount} attendees</span></div>{event.attendees.length ? <div className="participant-stack">{event.attendees.map((participant) => <span key={participant.id} title={participant.email}>{participant.name.charAt(0).toUpperCase()}</span>)}</div> : <p className="muted-copy">Be the first to join this event.</p>}</section>
      </main>
    </div>
  );
};

export default EventDetailScreen;
