import { EUserRole, EUserStatus } from "@/constants/enums/user.enum";

export interface UserProfile {
  id?: string;
  fullName?: string;
  avatarUrl?: string | null;
  bio?: string | null;
}

export interface CompanyProfile {
  id?: string;
  name?: string;
  companyName?: string; // Tương thích ngược
  taxCode?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  address?: string | null;
  location?: string | null; // Tương thích ngược
  description?: string | null;
  websiteUrl?: string | null;
  employeeMin?: number | null;
  employeeMax?: number | null;
  careerCategoryId?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface User {
  id: string;
  email: string;
  phone?: string | null;
  role: EUserRole;
  status: EUserStatus;
  createdAt: string;
  updatedAt: string;
  profile?: UserProfile | null;
  company?: CompanyProfile | null;
}
