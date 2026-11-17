import { create } from 'zustand';
import { gql } from '@apollo/client';
import client from '../graphql/client';
import { PREVIEW_EVENTS, PREVIEW_MODE, PREVIEW_USER } from '../preview';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Store = {
  isLoggedIn: boolean;
  user: User | null;
  token: string | null;
  joinedEventIds: string[];
  eventAttendeeCounts: Record<string, number>;
  login: () => void;
  logout: () => void;
  joinEvent: (eventId: string) => Promise<boolean>;
  leaveEvent: (eventId: string) => Promise<boolean>;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setJoinedEventIds: (eventIds: string[]) => void;
};

const JOIN_EVENT_MUTATION = gql`
  mutation JoinEvent($eventId: ID!) {
    joinEvent(eventId: $eventId) {
      id
      attendeeCount
    }
  }
`;

const LEAVE_EVENT_MUTATION = gql`
  mutation LeaveEvent($eventId: ID!) {
    leaveEvent(eventId: $eventId) {
      id
      attendeeCount
    }
  }
`;

export const useStore = create<Store>((set: any, get: any) => ({
  isLoggedIn: PREVIEW_MODE,
  user: PREVIEW_MODE ? PREVIEW_USER : null,
  token: PREVIEW_MODE ? 'preview-token' : null,
  joinedEventIds: PREVIEW_MODE ? ['preview-design-night', 'preview-supper-club'] : [],
  login: () => set({ isLoggedIn: true }),
  logout: () => set({ isLoggedIn: false, user: null, token: null, joinedEventIds: [], eventAttendeeCounts: {} }),
  setUser: (user: User) => set({ user }),
  setToken: (token: string) => set({ token }),
  setJoinedEventIds: (joinedEventIds: string[]) => set({ joinedEventIds }),
  eventAttendeeCounts: {},
  joinEvent: async (eventId: string) => {
    try {
      const user = get().user;
      const token = get().token;
      if (!user || !token) return false;
      if (PREVIEW_MODE) {
        const previewEvent = PREVIEW_EVENTS.find((event) => event.id === eventId);
        set((state: any) => ({
          joinedEventIds: state.joinedEventIds.includes(eventId) ? state.joinedEventIds : [...state.joinedEventIds, eventId],
          eventAttendeeCounts: previewEvent
            ? { ...state.eventAttendeeCounts, [eventId]: previewEvent.attendeeCount + 1 }
            : state.eventAttendeeCounts,
        }));
        return true;
      }

      const result = await client.mutate<{ joinEvent: { attendeeCount: number } }>({
        mutation: JOIN_EVENT_MUTATION,
        variables: { eventId },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      set((state: any) => ({
        joinedEventIds: [...state.joinedEventIds, eventId],
        eventAttendeeCounts: {
          ...state.eventAttendeeCounts,
          [eventId]: result.data?.joinEvent?.attendeeCount,
        },
      }));

      return true;
    } catch (err) {
      console.error("Join event error:", err);
      return false;
    }
  },
  leaveEvent: async (eventId: string) => {
    try {
      const user = get().user;
      const token = get().token;
      if (!user || !token) return false;
      if (PREVIEW_MODE) {
        const previewEvent = PREVIEW_EVENTS.find((event) => event.id === eventId);
        set((state: any) => ({
          joinedEventIds: state.joinedEventIds.filter((id: string) => id !== eventId),
          eventAttendeeCounts: previewEvent
            ? { ...state.eventAttendeeCounts, [eventId]: previewEvent.attendeeCount }
            : state.eventAttendeeCounts,
        }));
        return true;
      }

      const result = await client.mutate<{ leaveEvent: { attendeeCount: number } }>({
        mutation: LEAVE_EVENT_MUTATION,
        variables: { eventId },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      set((state: any) => ({
        joinedEventIds: state.joinedEventIds.filter((id: string) => id !== eventId),
        eventAttendeeCounts: {
          ...state.eventAttendeeCounts,
          [eventId]: result.data?.leaveEvent?.attendeeCount,
        },
      }));

      return true;
    } catch (err) {
      console.error("Leave event error:", err);
      return false;
    }
  },
}));
