export type MembershipLevel = 'GOLD' | 'SILVER' | 'BRONZE' | 'PLATINUM';

export interface Employee {
  id: number;
  username: string;
  name: string;
  company: string;
  email?: string;
  membershipLevel: MembershipLevel;
  validUntil: string;
  startDate?: string;
  logoUrl?: string;
  profileImage?: string;
  profileImageAdded: boolean;
  firstLogin: boolean;
  isAdmin: boolean;
}

export interface Benefit {
  id: number;
  level: MembershipLevel;
  title: string;
  description: string;
  validUntil: string;
}

export interface TermsAndPrivacy {
  id: number;
  content: string;
  type: 'terms' | 'privacy';
  updatedAt: string;
}