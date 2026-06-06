import { Metadata } from "next";
import { INFOMATION_COMPANY } from "@/constants/constants/infomation.constants";
import { UserManagementPageView } from "@/features/users";

export const metadata: Metadata = {
  title: `${INFOMATION_COMPANY.COMPANY_NAME} - Quản lý người dùng`,
  description: `Quản lý người dùng hệ thống quản trị ${INFOMATION_COMPANY.COMPANY_NAME}`,
};

export default function UserManagementPage() {
  return <UserManagementPageView />;
}
