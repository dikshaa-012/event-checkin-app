import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';

export type EventSummary = {
  id: string;
  name: string;
  location: string;
  startTime: string;
  category?: string | null;
  attendeeCount: number;
  isClosed: boolean;
};

const categoryColors: Record<string, string> = {
  Tech: 'cover-lavender',
  Music: 'cover-coral',
  Sports: 'cover-mint',
  Arts: 'cover-yellow',
};

export const getEventCoverClass = (category?: string | null) =>
  categoryColors[category || ''] || 'cover-lavender';

export const formatEventDate = (startTime: string) => {
  if (!startTime) return { day: 'TBD', date: 'Date to be announced', time: 'Time to be announced' };
  const date = new Date(startTime);
  return {
    day: date.toLocaleDateString(undefined, { weekday: 'short' }),
    date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
    time: date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
  };
};

const EventCard: FC<{ event: EventSummary; featured?: boolean; joined?: boolean }> = ({ event, featured, joined }) => {
  const navigate = useNavigate();
  const eventDate = formatEventDate(event.startTime);

  return (
    <article className={`event-card ${featured ? 'event-card-featured' : ''}`}>
      <button className={`event-cover ${getEventCoverClass(event.category)}`} onClick={() => navigate(`/event/${event.id}`)} aria-label={`View ${event.name}`}>
        <span className="cover-sparkle">✦</span>
        <span className="cover-category">{event.category || 'Community'}</span>
        {featured && <span className="featured-label">Featured</span>}
      </button>
      <div className="event-card-body">
        <div className="event-card-date">{eventDate.day} · {eventDate.date}</div>
        <h3>{event.name}</h3>
        <p className="event-location">⌖ {event.location}</p>
        <div className="event-card-footer">
          <span className="attendee-count">◉ {event.attendeeCount} going</span>
          {joined ? <span className="joined-pill">Joined</span> : <button className="small-button" onClick={() => navigate(`/event/${event.id}`)}>View event</button>}
        </div>
      </div>
    </article>
  );
};

export default EventCard;
