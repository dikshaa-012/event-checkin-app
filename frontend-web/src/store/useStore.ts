import { create } from 'zustand';
import { gql } from '@apollo/client';
import client from '../graphql/client';

type User = {
  id: string;
  name: string;
  role: string;
};

type Store = {
  isLoggedIn: boolean;
  user: User | null;
  token: string | null;
  joinedEventIds: string[];
  login: () => void;
  logout: () => void;
  joinEvent: (eventId: string) => Promise<boolean>;
  leaveEvent: (eventId: string) => Promise<boolean>;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
};

const JOIN_EVENT_MUTATION = gql`
  mutation JoinEvent($eventId: ID!) {
    joinEvent(eventId: $eventId) {
      id
    }
  }
`;

const LEAVE_EVENT_MUTATION = gql`
  mutation LeaveEvent($eventId: ID!) {
    leaveEvent(eventId: $eventId) {
      id
    }
  }
`;

export const useStore = create<Store>((set: any, get: any) => ({
  isLoggedIn: false,
  user: null,
  token: null,
  joinedEventIds: [],
  login: () => set({ isLoggedIn: true }),
  logout: () => set({ isLoggedIn: false, user: null, token: null, joinedEventIds: [] }),
  setUser: (user: User) => set({ user }),
  setToken: (token: string) => set({ token }),
  joinEvent: async (eventId: string) => {
    try {
      console.log("Calling GraphQL join mutation");
      const user = get().user;
      const token = get().token;
      if (!user || !token) return false;

      await client.mutate({
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

      await client.mutate({
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
      }));

      return true;
    } catch (err) {
      console.error("Leave event error:", err);
      return false;
    }
  },
}));
