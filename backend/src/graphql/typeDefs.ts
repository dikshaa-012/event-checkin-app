import { gql } from 'apollo-server-express';

const typeDefs = gql`
  enum Role {
    USER
    ADMIN
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
  }

  type Event {
    id: ID!
    name: String!
    location: String!
    startTime: String!
    category: String
    isClosed: Boolean!
    attendees: [User!]!
    attendeeCount: Int!
  }

  type AttendanceLog {
    id: ID!
    userId: String!
    eventId: String!
    joinedAt: String!
    leftAt: String
    duration: Int
    user: User!
  }

  type EventStats {
    totalAttendees: Int!
    joinRate: Float!
    peakConcurrent: Int!
    participationPercentage: Float!
  }

  type Query {
    events(category: String, search: String, date: String): [Event!]!
    event(id: ID!): Event
    me: User
    eventStats(eventId: ID!): EventStats
    attendanceLogs(eventId: ID!): [AttendanceLog!]!
    publicEvent(slug: String!): Event
  }

  type Mutation {
    login(email: String!, password: String!): AuthPayload!
    register(name: String!, email: String!, password: String!): AuthPayload!
    joinEvent(eventId: ID!): Event
    leaveEvent(eventId: ID!): Event
    createEvent(name: String!, location: String!, startTime: String!, category: String): Event
    updateEvent(id: ID!, name: String, location: String, startTime: String, category: String): Event
    deleteEvent(id: ID!): Boolean!
    closeEvent(id: ID!): Event
    exportAttendees(eventId: ID!): String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }
`;

export default typeDefs;
