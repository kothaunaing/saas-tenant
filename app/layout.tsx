import type { Metadata } from "next";
import "./globals.css";
import WorkspaceProvider from "@/tenant/components/workspace-provider";
export const metadata: Metadata = {
  title: "Serenity | Salon workspace",
  icons: { icon: "/favicon.svg" },
  description:
    "Appointments, customers, and your team. Together in your Serenity salon workspace.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WorkspaceProvider>{children}</WorkspaceProvider>
      </body>
    </html>
  );
}
