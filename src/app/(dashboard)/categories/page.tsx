import { INFOMATION_COMPANY } from "@/constants/constants/infomation.constants";
import { CategoriesPageView } from "@/features/categories";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `${INFOMATION_COMPANY.COMPANY_NAME} - Danh mục`,
  description: `Danh mục - ${INFOMATION_COMPANY.COMPANY_NAME}`,
};

export default function CategoriesPage() {
  return <CategoriesPageView />;
}
