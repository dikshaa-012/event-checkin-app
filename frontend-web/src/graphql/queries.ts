import { gql } from '@apollo/client';

export const GET_EVENTS = gql`
  query GetEvents($category: String, $search: String, $date: String) {
    events(category: $category, search: $search, date: $date) {
      id
      name
      location
      startTime
      category
      attendeeCount
      isClosed
    }
  }
`;

export const GET_EVENT = gql`
  query GetEvent($id: ID!) {
    event(id: $id) {
      id
      name
      location
      startTime
      category
      attendees {
        id
        name
        email
      }
      attendeeCount
      isClosed
    }
  }
`;

export const GET_ME = gql`
  query GetMe {
    me {
      id
      name
      email
      role
    }
  }
`;

export const GET_EVENT_STATS = gql`
  query GetEventStats($eventId: ID!) {
    eventStats(eventId: $eventId) {
      totalAttendees
      joinRate
      peakConcurrent
      participationPercentage
    }
  }
`;

export const GET_ATTENDANCE_LOGS = gql`
  query GetAttendanceLogs($eventId: ID!) {
    attendanceLogs(eventId: $eventId) {
      id
      userId
      joinedAt
      leftAt
      duration
      user {
        name
        email
      }
    }
  }
`;

export const GET_PUBLIC_EVENT = gql`
  query GetPublicEvent($slug: String!) {
    publicEvent(slug: $slug) {
      id
      name
      location
      startTime
      category
      attendeeCount
    }
  }
`;
