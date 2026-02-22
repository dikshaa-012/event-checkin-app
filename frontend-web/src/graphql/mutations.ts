import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        role
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($name: String!, $email: String!, $password: String!) {
    register(name: $name, email: $email, password: $password) {
      token
      user {
        id
        name
        role
      }
    }
  }
`;

export const JOIN_EVENT = gql`
  mutation JoinEvent($eventId: ID!) {
    joinEvent(eventId: $eventId) {
      id
      name
      attendees {
        id
        name
      }
    }
  }
`;

export const LEAVE_EVENT = gql`
  mutation LeaveEvent($eventId: ID!) {
    leaveEvent(eventId: $eventId) {
      id
      name
      attendees {
        id
        name
      }
    }
  }
`;

export const CREATE_EVENT = gql`
  mutation CreateEvent($name: String!, $location: String!, $startTime: String!, $category: String) {
    createEvent(name: $name, location: $location, startTime: $startTime, category: $category) {
      id
      name
      location
      startTime
      category
    }
  }
`;

export const UPDATE_EVENT = gql`
  mutation UpdateEvent($id: ID!, $name: String, $location: String, $startTime: String, $category: String) {
    updateEvent(id: $id, name: $name, location: $location, startTime: $startTime, category: $category) {
      id
      name
      location
      startTime
      category
    }
  }
`;

export const DELETE_EVENT = gql`
  mutation DeleteEvent($id: ID!) {
    deleteEvent(id: $id)
  }
`;

export const CLOSE_EVENT = gql`
  mutation CloseEvent($id: ID!) {
    closeEvent(id: $id) {
      id
      isClosed
    }
  }
`;

export const EXPORT_ATTENDEES = gql`
  mutation ExportAttendees($eventId: ID!) {
    exportAttendees(eventId: $eventId)
  }
`;
