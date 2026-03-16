export type ContactRelationship =
  | 'direct_report'
  | 'manager'
  | 'executive'
  | 'prospect'
  | 'customer'
  | 'partner'
  | 'vendor'
  | 'other';

export interface Contact {
  id?: number;
  name: string;
  role?: string;
  company?: string;
  email?: string;
  phone?: string;
  relationship?: ContactRelationship;
  notes?: string;
  lastContacted?: string; // ISO date string
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}
