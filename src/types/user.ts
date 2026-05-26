import { EUserRole, EUserStatus } from "@/constants/enums/user.enum";

export interface UserProfile {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
}

export interface CompanyProfile {
  id: string;
  companyName: string;
  taxCode: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  location: string | null;
  description: string | null;
  websiteUrl: string | null;
}

export interface User {
  id: string;
  email: string;
  phone: string | null;
  role: EUserRole;
  status: EUserStatus;
  createdAt: string;
  updatedAt: string;
  profile?: UserProfile | null;
  company?: CompanyProfile | null;
}
