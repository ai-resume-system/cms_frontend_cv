import { ECareerCategoriesStatus } from "@/constants/enums/category.enum";

export interface CareerCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: ECareerCategoriesStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  _count?: {
    jobs: number;
  };
}
