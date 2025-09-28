import { Event } from './event.model';

export interface AdminRegistration {
  id: number;
  uuid: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone_number: string | null;
  event: Event;
}
