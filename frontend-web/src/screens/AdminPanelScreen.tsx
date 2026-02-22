import { useState, useEffect, type FC } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_EVENTS, GET_EVENT_STATS, GET_ATTENDANCE_LOGS } from '../graphql/queries';
import { CREATE_EVENT, DELETE_EVENT, CLOSE_EVENT, EXPORT_ATTENDEES } from '../graphql/mutations';
import { useStore } from '../store/useStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import '../styles/Admin.css';

const AdminPanelScreen: FC = () => {
  const user = useStore((state) => state.user);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    startTime: '',
    category: ''
  });

  const { data: eventsData, refetch: refetchEvents } = useQuery(GET_EVENTS);
  const { data: statsData } = useQuery(GET_EVENT_STATS, {
    variables: { eventId: selectedEvent },
    skip: !selectedEvent
  });
  const { data: logsData } = useQuery(GET_ATTENDANCE_LOGS, {
    variables: { eventId: selectedEvent },
    skip: !selectedEvent
  });

  // Prepare chart data
  const chartData = events.map(event => ({
    name: event.name.substring(0, 10),
    attendees: event.attendeeCount
  }));

  const timeSeriesData = logsData?.attendanceLogs?.reduce((acc: any[], log: any) => {
    const hour = new Date(log.joinedAt).getHours();
    const existing = acc.find(d => d.hour === hour);
    if (existing) {
      existing.joins += 1;
    } else {
      acc.push({ hour, joins: 1 });
    }
    return acc;
  }, []).sort((a: any, b: any) => a.hour - b.hour) || [];

  const [createEvent] = useMutation(CREATE_EVENT);
  const [deleteEvent] = useMutation(DELETE_EVENT);
  const [closeEvent] = useMutation(CLOSE_EVENT);
  const [exportAttendees] = useMutation(EXPORT_ATTENDEES);

  useEffect(() => {
    if (eventsData?.events) {
      setEvents(eventsData.events);
    }
  }, [eventsData]);

  if (user?.role !== 'ADMIN') {
    return <div>Access denied. Admin only.</div>;
  }

  const handleCreate = async () => {
    try {
      await createEvent({ variables: formData });
      refetchEvents();
      setShowCreateForm(false);
      setFormData({ name: '', location: '', startTime: '', category: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete event?')) {
      try {
        await deleteEvent({ variables: { id } });
        refetchEvents();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleClose = async (id: string) => {
    try {
      await closeEvent({ variables: { id } });
      refetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleExport = async (eventId: string) => {
    try {
      const { data } = await exportAttendees({ variables: { eventId } });
      const csvData = data?.exportAttendees;
      if (csvData) {
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendees-${eventId}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>
      <button onClick={() => setShowCreateForm(!showCreateForm)}>
        {showCreateForm ? 'Cancel' : 'Create Event'}
      </button>

      {showCreateForm && (
        <div className="create-form">
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
          <input
            type="datetime-local"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
          />
          <input
            type="text"
            placeholder="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />
          <button onClick={handleCreate}>Create</button>
        </div>
      )}

      <div className="events-list">
        {events.map((event) => (
          <div key={event.id} className="event-item">
            <h3>{event.name}</h3>
            <p>{event.location} - {new Date(event.startTime).toLocaleString()}</p>
            <p>Attendees: {event.attendeeCount}</p>
            <button onClick={() => setSelectedEvent(event.id)}>View Details</button>
            <button onClick={() => handleClose(event.id)}>Close Event</button>
            <button onClick={() => handleExport(event.id)}>Export CSV</button>
            <button onClick={() => handleDelete(event.id)}>Delete</button>
          </div>
        ))}
      </div>

      {selectedEvent && statsData?.eventStats && (
        <div className="stats">
          <h2>Event Stats</h2>
          <p>Total Attendees: {statsData.eventStats.totalAttendees}</p>
          <p>Join Rate: {(statsData.eventStats.joinRate * 100).toFixed(2)}%</p>
          <p>Peak Concurrent: {statsData.eventStats.peakConcurrent}</p>
          <p>Participation: {(statsData.eventStats.participationPercentage).toFixed(2)}%</p>
        </div>
      )}

      <div className="charts">
        <h2>Analytics Dashboard</h2>
        {chartData.length > 0 && (
          <div className="chart-container">
            <h3>Attendees per Event</h3>
            <BarChart width={600} height={300} data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="attendees" fill="#8884d8" />
            </BarChart>
          </div>
        )}
        {selectedEvent && timeSeriesData.length > 0 && (
          <div className="chart-container">
            <h3>Join Activity Over Time</h3>
            <LineChart width={600} height={300} data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="joins" stroke="#82ca9d" />
            </LineChart>
          </div>
        )}
      </div>

      {selectedEvent && logsData?.attendanceLogs && (
        <div className="logs">
          <h2>Attendance Logs</h2>
          {logsData.attendanceLogs.map((log: any) => (
            <div key={log.id}>
              {log.user.name} - Joined: {new Date(log.joinedAt).toLocaleString()}
              {log.leftAt && ` - Left: ${new Date(log.leftAt).toLocaleString()}`}
              {log.duration && ` - Duration: ${log.duration}s`}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPanelScreen;