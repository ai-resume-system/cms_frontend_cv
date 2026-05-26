import type { Metadata } from "next";
import "./globals.css";
import { INFOMATION_COMPANY } from "@/constants/constants/infomation.constants";

export const metadata: Metadata = {
  title: `${INFOMATION_COMPANY.COMPANY_NAME} - Hệ thống quản trị`,
  description: "Trang quản trị hệ thống tuyển dụng và gợi ý CV AI",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-background text-on-surface">
        {children}
      </body>
    </html>
  );
}
