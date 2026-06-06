import type { Metadata } from "next";

import { INFOMATION_COMPANY } from "@/constants/constants/infomation.constants";
import { AdminLoginPageView } from "@/features/auth";

export const metadata: Metadata = {
  title: `${INFOMATION_COMPANY.COMPANY_NAME} - Đăng nhập CMS`,
  description: `Đăng nhập hệ thống quản trị ${INFOMATION_COMPANY.COMPANY_NAME}`,
};

export default function LoginPage() {
  return <AdminLoginPageView />;
}
