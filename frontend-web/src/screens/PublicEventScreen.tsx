import { type FC } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_PUBLIC_EVENT } from '../graphql/queries';
import '../styles/EventDetail.css';

const PublicEventScreen: FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data, loading, error } = useQuery(GET_PUBLIC_EVENT, {
    variables: { slug }
  });

  if (loading) return <div>Loading event...</div>;
  if (error) return <div>Error loading event</div>;
  if (!data?.publicEvent) return <div>Event not found</div>;

  const event = data.publicEvent;

  return (
    <div className="event-detail">
      <h1>{event.name}</h1>
      <p><strong>Location:</strong> {event.location}</p>
      <p><strong>Time:</strong> {new Date(event.startTime).toLocaleString()}</p>
      <p><strong>Category:</strong> {event.category || 'N/A'}</p>
      <p><strong>Current Attendees:</strong> {event.attendeeCount}</p>
      <p>This is a public event page. Login to join!</p>
    </div>
  );
};

export default PublicEventScreen;