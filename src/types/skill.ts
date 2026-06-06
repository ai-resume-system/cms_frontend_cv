export interface Skill {
  id: string;
  name: string;
  slug: string;
  careerCategoryId: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  children?: Skill[];
}
