import { useEffect, useState, type FC } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_EVENT } from '../graphql/queries';
import { JOIN_EVENT, LEAVE_EVENT } from '../graphql/mutations';
import { useStore } from '../store/useStore';
import socket from '../socket';
import '../styles/EventDetail.css';

type Participant = { id: string; name: string; email: string };

const EventDetailScreen: FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const location = useLocation();
  const eventName = (location.state as any)?.name || 'Event';
  
  const user = useStore((s: any) => s.user);
  const joinedEventIds = useStore((s: any) => s.joinedEventIds);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [liveCount, setLiveCount] = useState(0);
  const [notifications, setNotifications] = useState<string[]>([]);

  const { data: eventData, refetch } = useQuery(GET_EVENT, {
    variables: { id: eventId },
    skip: !eventId
  });

  const [joinEvent] = useMutation(JOIN_EVENT);
  const [leaveEvent] = useMutation(LEAVE_EVENT);

  const isJoined = joinedEventIds.includes(eventId!);

  useEffect(() => {
    if (!user || !eventId) return;

    const handleUserJoined = (data: any) => {
      setLiveCount(data.count);
      setNotifications(prev => [`${data.user.name} joined`, ...prev.slice(0, 4)]);
      refetch();
    };

    const handleUserLeft = (data: any) => {
      setLiveCount(data.count);
      setNotifications(prev => [`${data.user.name} left`, ...prev.slice(0, 4)]);
      refetch();
    };

    const handleLiveCount = (count: number) => {
      setLiveCount(count);
    };

    socket.on('user_joined', handleUserJoined);
    socket.on('user_left', handleUserLeft);
    socket.on('live_count', handleLiveCount);

    socket.emit("join_room", { eventId });

    return () => {
      socket.off('user_joined', handleUserJoined);
      socket.off('user_left', handleUserLeft);
      socket.off('live_count', handleLiveCount);
      socket.emit("leave_room", { eventId });
    };
  }, [eventId, user, refetch]);

  useEffect(() => {
    if (eventData?.event) {
      setParticipants(eventData.event.attendees);
      setLiveCount(eventData.event.attendeeCount);
    }
  }, [eventData]);

  const handleJoin = async () => {
    try {
      await joinEvent({ variables: { eventId } });
      socket.emit("join_event", { eventId, user });
    } catch (err) {
      console.error("Join failed:", err);
    }
  };

  const handleLeave = async () => {
    try {
      await leaveEvent({ variables: { eventId } });
      socket.emit("leave_event", { eventId, user });
    } catch (err) {
      console.error("Leave failed:", err);
    }
  };

  return (
    <div className="event-detail">
      <h1>{eventName}</h1>
      <p>Live Attendees: {liveCount}</p>
      {eventData?.event?.isClosed && <p style={{ color: 'red' }}>Event Closed</p>}
      {!eventData?.event?.isClosed && (
        isJoined ? (
          <button onClick={handleLeave} className="leave-btn">Leave Event</button>
        ) : (
          <button onClick={handleJoin} className="join-btn">Join Event</button>
        )
      )}
      <div className="notifications">
        {notifications.map((note, i) => <div key={i}>{note}</div>)}
      </div>
      <h2>Participants:</h2>
      <div className="participants-list">
        {participants.length === 0 ? (
          <p>No participants yet</p>
        ) : (
          <ul>
            {participants.map((p) => (
              <li key={p.id}>{p.name} ({p.email})</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default EventDetailScreen;
