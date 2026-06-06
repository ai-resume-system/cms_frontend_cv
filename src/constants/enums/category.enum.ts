export enum ECareerCategoriesStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export const ECareerCategoriesStatusLabels: Record<
  ECareerCategoriesStatus,
  string
> = {
  [ECareerCategoriesStatus.ACTIVE]: "Hoạt động",
  [ECareerCategoriesStatus.INACTIVE]: "Không hoạt động",
};
