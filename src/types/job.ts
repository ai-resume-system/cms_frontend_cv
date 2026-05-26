import { EJobStatus } from "@/constants/enums/job.enum";
import { CompanyProfile } from "./user";
import { CareerCategory } from "./category";

export interface Job {
  id: string;
  title: string;
  shortDescription: string | null;
  description: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  experienceYears: number;
  expiredAt: string;
  status: EJobStatus;
  rejectReason?: string | null;
  createdAt: string;
  updatedAt: string;
  company?: CompanyProfile | null;
  careerCategory?: CareerCategory | null;
}
