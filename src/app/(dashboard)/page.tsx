import { INFOMATION_COMPANY } from "@/constants/constants/infomation.constants";
import { DashboardPageView } from "@/features/dashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `${INFOMATION_COMPANY.COMPANY_NAME} - Dashboard`,
  description: `Dashboard hệ thống quản trị ${INFOMATION_COMPANY.COMPANY_NAME}`,
};

export default function DashboardPage() {
  return <DashboardPageView />;
}
