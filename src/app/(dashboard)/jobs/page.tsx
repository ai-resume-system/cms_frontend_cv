import { INFOMATION_COMPANY } from "@/constants/constants/infomation.constants";
import { JobModerationPageView } from "@/features/jobs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `${INFOMATION_COMPANY.COMPANY_NAME} - Tin tuyển dụng`,
  description: `Tin tuyển dụng - ${INFOMATION_COMPANY.COMPANY_NAME}`,
};

export default function JobModerationPage() {
  return <JobModerationPageView />;
}
