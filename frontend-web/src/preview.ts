import type { EventSummary } from './components/EventCard';

export const PREVIEW_MODE = import.meta.env.DEV && import.meta.env.VITE_DEV_PREVIEW === 'true';

export const PREVIEW_USER = {
  id: 'preview-user',
  name: 'Alex Morgan',
  email: 'alex.preview@example.com',
  role: 'USER',
};

export type PreviewEvent = EventSummary & {
  attendees: Array<{ id: string; name: string; email: string }>;
};

export const PREVIEW_EVENTS: PreviewEvent[] = [
  {
    id: 'preview-design-night',
    name: 'Designers After Dark',
    location: 'The Courtyard, New Delhi',
    startTime: '2026-11-28T19:30:00.000Z',
    category: 'Arts',
    attendeeCount: 128,
    isClosed: false,
    attendees: [
      { id: 'preview-1', name: 'Maya Singh', email: 'maya@example.com' },
      { id: 'preview-2', name: 'Rohan Mehta', email: 'rohan@example.com' },
      { id: 'preview-3', name: 'Jamie Lee', email: 'jamie@example.com' },
    ],
  },
  {
    id: 'preview-indie-live',
    name: 'Indie Live Sessions',
    location: 'The Piano Man, Gurugram',
    startTime: '2026-12-05T20:00:00.000Z',
    category: 'Music',
    attendeeCount: 86,
    isClosed: false,
    attendees: [
      { id: 'preview-4', name: 'Nisha Kapoor', email: 'nisha@example.com' },
      { id: 'preview-5', name: 'Kabir Shah', email: 'kabir@example.com' },
    ],
  },
  {
    id: 'preview-run-club',
    name: 'Sunday Run Club',
    location: 'Lodhi Garden Gate 2',
    startTime: '2026-11-22T06:30:00.000Z',
    category: 'Sports',
    attendeeCount: 42,
    isClosed: false,
    attendees: [
      { id: 'preview-6', name: 'Sara Ali', email: 'sara@example.com' },
    ],
  },
  {
    id: 'preview-product-lab',
    name: 'Product People Lab',
    location: '91Springboard, Noida',
    startTime: '2026-12-12T10:00:00.000Z',
    category: 'Tech',
    attendeeCount: 64,
    isClosed: false,
    attendees: [],
  },
  {
    id: 'preview-supper-club',
    name: 'The Sunday Supper Club',
    location: 'Sunder Nursery',
    startTime: '2026-11-08T18:00:00.000Z',
    category: 'Community',
    attendeeCount: 31,
    isClosed: true,
    attendees: [],
  },
];
