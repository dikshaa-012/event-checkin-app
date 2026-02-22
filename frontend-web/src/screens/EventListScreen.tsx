import { type FC, useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { GET_EVENTS } from '../graphql/queries';
import { useStore } from '../store/useStore';
import '../styles/EventList.css';

type Event = {
  id: string;
  name: string;
  location: string;
  startTime: string;
  category?: string;
  attendeeCount: number;
  isClosed: boolean;
};

const EventListScreen: FC = () => {
  const navigate = useNavigate();
  const user = useStore((state) => state.user);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, loading, error, refetch } = useQuery<{ events: Event[] }>(GET_EVENTS, {
    variables: { category: category || undefined, search: debouncedSearch || undefined, date: date || undefined }
  });

  if (loading) return <div className="loading">Loading events...</div>;
  if (error) return <div className="error">Error loading events</div>;
  if (!data?.events || data.events.length === 0) return <div className="no-events">No events found</div>;

  return (
    <div className="event-list">
      <h1>Events</h1>
      {user?.role === 'ADMIN' && (
        <button onClick={() => navigate('/admin')}>Admin Panel</button>
      )}
      <div className="filters">
        <input
          type="text"
          placeholder="Search events"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          <option value="Tech">Tech</option>
          <option value="Music">Music</option>
          <option value="Sports">Sports</option>
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button onClick={() => refetch()}>Filter</button>
      </div>
      <div className="events-grid">
        {data.events.map((event) => (
          <div key={event.id} className="event-card">
            <h2>{event.name}</h2>
            <p><strong>Location:</strong> {event.location}</p>
            <p><strong>Time:</strong> {event.startTime ? new Date(event.startTime).toLocaleString() : 'TBD'}</p>
            <p><strong>Category:</strong> {event.category || 'N/A'}</p>
            <p><strong>Attendees:</strong> {event.attendeeCount}</p>
            {event.isClosed && <p style={{ color: 'red' }}>Event Closed</p>}
            <button onClick={() => navigate(`/event/${event.id}`, { state: { name: event.name } })}>
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventListScreen;
