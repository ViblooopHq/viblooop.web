export type AudienceMixType = 'women' | 'men' | 'open';
export type EventCostType = 'Free' | 'Paid';

export interface CreateEventAddressValue {
  street: string;
  area: string;
  landmark: string;
  pinCode: string;
}

export interface CreateEventFormValue {
  title: string;
  description: string;
  shortDescription: string;
  eventDate: Date | string;
  endDate: Date | string;
  eventTime: string;
  endTime: string;
  address: CreateEventAddressValue;
  attendeeLimit: number;
  audiencePreference: AudienceMixType;
  attendeeMix: number;
  hostOnlyChat: boolean;
  safetyGuidelines: boolean;
  safetyAgreement: boolean;
  expectations: string[];
  tags: string;
  category: string;
  cost: EventCostType;
  price: number | string;
}
