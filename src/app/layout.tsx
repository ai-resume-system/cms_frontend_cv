import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";

import { ToastProvider } from "@/components/providers/ToastProvider";
import { INFOMATION_COMPANY } from "@/constants/constants/infomation.constants";

import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin", "vietnamese"],
  variable: "--font-manrope",
});

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
    <html
      lang="vi"
      className={`${inter.variable} ${manrope.variable} h-full antialiased light`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-on-surface">
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
