export enum BloodGroup {
  A_POS = 'A+',
  A_NEG = 'A-',
  B_POS = 'B+',
  B_NEG = 'B-',
  AB_POS = 'AB+',
  AB_NEG = 'AB-',
  O_POS = 'O+',
  O_NEG = 'O-',
}

export enum UserRole {
  DONOR = 'DONOR',
  REQUESTER = 'REQUESTER',
  ADMIN = 'ADMIN',
}

export enum RequestUrgency {
  NORMAL = 'Normal',
  URGENT = 'Urgent',
  CRITICAL = 'Critical',
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  bloodGroup?: BloodGroup;
  isAvailable?: boolean;
  lastDonationDate?: string; // ISO Date string
  collegeId?: string;
  location?: string;
  hasAllergies?: boolean;
}

export interface BloodRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  bloodGroup: BloodGroup;
  units: number;
  hospitalName: string;
  location: string;
  urgency: RequestUrgency;
  description: string;
  status: 'OPEN' | 'FULFILLED' | 'CANCELLED';
  createdAt: string;
  distance?: string; // Mock distance for UI
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'ALERT' | 'INFO';
  timestamp: string;
  read: boolean;
}

export interface HistoryItem {
  id: string | number;
  userId: string;
  type: 'Donation' | 'Request';
  date: string; // YYYY-MM-DD
  location: string;
  units: number;
  status: string;
}