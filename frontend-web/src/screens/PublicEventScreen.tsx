import { type FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_PUBLIC_EVENT } from '../graphql/queries';
import { formatEventDate, getEventCoverClass } from '../components/EventCard';
import { PREVIEW_EVENTS, PREVIEW_MODE } from '../preview';
import '../styles/EventDetail.css';

const PublicEventScreen: FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(GET_PUBLIC_EVENT, { variables: { slug } });
  const event = data?.publicEvent || (PREVIEW_MODE ? PREVIEW_EVENTS.find((previewEvent) => previewEvent.id === slug) : undefined);
  if (loading && !PREVIEW_MODE) return <div className="public-shell"><div className="state-card page-state">Loading event...</div></div>;
  if ((!PREVIEW_MODE && error) || !event) return <div className="public-shell"><div className="state-card state-error page-state"><h2>Event not found</h2><button className="primary-button" onClick={() => navigate('/login')}>Go to login</button></div></div>;
  const eventDate = formatEventDate(event.startTime);
  return <div className="public-shell"><main className="public-event"><div className={`detail-cover ${getEventCoverClass(event.category)}`}><span>✦</span><small>{event.category || 'Community event'}</small></div><div className="public-content"><span className="brand static-brand"><span className="brand-mark">✦</span> Gatherly</span><span className="category-label">{event.category || 'Community'}</span><h1>{event.name}<span className="heading-dot">.</span></h1><p className="public-lede">An event worth making room for. Come along and make a memory.</p><div className="event-meta-row"><span>◷ <strong>{eventDate.date}</strong><br /><small>{eventDate.time}</small></span><span>⌖ <strong>{event.location}</strong><br /><small>Event venue</small></span></div><div className="public-callout"><strong>Want to join?</strong><span>Log in to your account to register and check in.</span><button className="primary-button" onClick={() => navigate('/login')}>Join the event →</button></div><p className="muted-copy">{event.attendeeCount} people are already going.</p></div></main></div>;
};

export default PublicEventScreen;
