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

export const formatEventDate = (startTime?: string | null) => {
  if (!startTime) return { day: 'TBD', date: 'Date to be announced', time: 'Time to be announced' };
  const normalizedStartTime = startTime.trim();
  const numericStartTime = /^\d+$/.test(normalizedStartTime) ? Number(normalizedStartTime) : null;
  const timestamp = numericStartTime !== null
    ? (normalizedStartTime.length === 10 ? numericStartTime * 1000 : numericStartTime)
    : normalizedStartTime;
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return { day: 'TBD', date: 'Date unavailable', time: 'Time unavailable' };
  }
  return {
    day: date.toLocaleDateString(undefined, { weekday: 'short' }),
    date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
    time: date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
  };
};

const EventCard: FC<{ event: EventSummary; featured?: boolean; joined?: boolean; attendeeCount?: number }> = ({ event, featured, joined, attendeeCount = event.attendeeCount }) => {
  const navigate = useNavigate();
  const eventDate = formatEventDate(event.startTime);
  const openEvent = () => navigate(`/event/${event.id}`, { state: { event } });

  return (
    <article className={`event-card ${featured ? 'event-card-featured' : ''}`}>
      <button className={`event-cover ${getEventCoverClass(event.category)}`} onClick={openEvent} aria-label={`View ${event.name}`}>
        <span className="cover-sparkle">✦</span>
        <span className="cover-category">{event.category || 'Community'}</span>
        {featured && <span className="featured-label">Featured</span>}
      </button>
      <div className="event-card-body">
        <div className="event-card-date">{eventDate.day} · {eventDate.date}</div>
        <h3>{event.name}</h3>
        <p className="event-location">⌖ {event.location}</p>
        <div className="event-card-footer">
          <span className="attendee-count">◉ {attendeeCount} going</span>
          {joined ? <span className="joined-pill">Joined</span> : <button className="small-button" onClick={openEvent}>View event</button>}
        </div>
      </div>
    </article>
  );
};

export default EventCard;
