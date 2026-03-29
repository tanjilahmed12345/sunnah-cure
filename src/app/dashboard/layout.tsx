"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { mockCurrentUser } from "@/lib/mock/data/users";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Mock: use the current user's role for sidebar
  const user = mockCurrentUser;

  return (
    <div className="flex min-h-screen">
      <Sidebar role={user.role} />
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardTopbar user={user} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
