import { Server } from 'socket.io';

export let io: Server;

// Track participants per event
const eventParticipants: { [eventId: string]: any[] } = {};

const setupSocket = (server: any) => {
    io = new Server(server, {
        cors: { origin: '*' },
    });

    io.on('connection', (socket) => {
        socket.on('join_room', ({ eventId }) => {
            socket.join(eventId);
            const count = eventParticipants[eventId]?.length || 0;
            socket.emit('live_count', count);
        });

        socket.on('leave_room', ({ eventId }) => {
            socket.leave(eventId);
        });

        socket.on('join_event', ({ eventId, user }) => {
            // Add participant to tracking
            if (!eventParticipants[eventId]) {
                eventParticipants[eventId] = [];
            }
            // Remove if already exists (prevent duplicates)
            eventParticipants[eventId] = eventParticipants[eventId].filter((u: any) => u.id !== user.id);
            eventParticipants[eventId].push(user);
    
            const count = eventParticipants[eventId].length;
            io.to(eventId).emit('user_joined', { user, count });
            io.to(eventId).emit('live_count', count);
            console.log(`${user.name} joined event ${eventId}, total: ${count}`);
        });

        socket.on('leave_event', ({ eventId, user }) => {
            // Remove participant from tracking
            if (eventParticipants[eventId]) {
                eventParticipants[eventId] = eventParticipants[eventId].filter((u: any) => u.id !== user.id);
            }
            
            const count = eventParticipants[eventId].length;
            io.to(eventId).emit('user_left', { user, count });
            io.to(eventId).emit('live_count', count);
            console.log(`${user.name} left event ${eventId}, total: ${count}`);
        });

        // Legacy events for backward compatibility
        socket.on('joinEvent', ({ eventId, user }) => {
            socket.emit('join_event', { eventId, user });
        });

        socket.on('leaveRoom', ({ eventId, user }) => {
            socket.emit('leave_event', { eventId, user });
        });

        socket.on('get_participants', ({ eventId }) => {
            const participants = eventParticipants[eventId] || [];
            socket.emit('event_participants', participants);
            console.log(`Sent ${participants.length} participants for event ${eventId}`);
        });
    });

};
export default setupSocket;