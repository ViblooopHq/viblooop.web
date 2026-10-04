// Permissive, scoped to what event-details actually consumes — the backend
// contract for Event/User isn't validated or fully documented anywhere (see SPEC.md),
// so every field beyond the ones we read is still allowed through via the index signature.

export interface EventLocationCoordinates {
  coordinates?: [number, number];
  [key: string]: any;
}

export interface EventAddress {
  fullAddress?: string;
  partialAddress?: string;
  area?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  country?: string;
  location?: EventLocationCoordinates;
  [key: string]: any;
}

export interface EventCreator {
  _id: string;
  username?: string;
  profileImage?: string;
  averageRating?: number | string;
  eventCount?: number;
  [key: string]: any;
}

export interface EventDetails {
  _id: string;
  title?: string;
  description?: string;
  image?: string;
  gallery?: string[];
  attendees?: Array<string | { _id: string; username?: string; profileImage?: string }>;
  attendeeLimit?: number;
  attendeeMix?: number;
  audiencePreference?: string;
  cost?: string;
  price?: number;
  eventDate?: string;
  eventTime?: string;
  endTime?: string;
  endDate?: string;
  category?: { title?: string; name?: string } | string;
  address?: EventAddress;
  location?: EventLocationCoordinates;
  createdBy?: EventCreator;
  averageRating?: number;
  tags?: string[];
  expectations?: string[];
  [key: string]: any;
}

export interface AttendeeProfile {
  profileImage: string;
  userId: string;
  userName: string;
}

export interface EventDrawerPerson {
  userId: string;
  userName: string;
  profileImage: string;
  role: 'Host' | 'Attendee';
}

export type RequestActionState = 'pending' | 'processing' | 'accepted' | 'rejected';

export interface JoinRequestNotification {
  _id?: string;
  id?: string;
  type?: string;
  status?: string;
  eventId?: string | { _id: string };
  senderId?: string | { _id: string; username?: string; profileImage?: string };
  sender?: { _id?: string; username?: string; profileImage?: string };
  senderName?: string;
  senderImage?: string;
  [key: string]: any;
}
