import { CMS_ROUTES } from "@/constants/constants/routes";

export function redirectToLogin(): void {
  if (typeof window === "undefined") {
    return;
  }

  if (window.location.pathname !== CMS_ROUTES.LOGIN) {
    window.location.replace(CMS_ROUTES.LOGIN);
  }
}
