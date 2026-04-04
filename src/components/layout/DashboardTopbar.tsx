"use client";

import { ThemeToggle } from "@/components/common/ThemeToggle";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { NotificationBell } from "@/components/common/NotificationBell";
import { UserAvatarDropdown } from "@/components/common/UserAvatarDropdown";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import type { User } from "@/types";

interface DashboardTopbarProps {
  user: User;
}

export function DashboardTopbar({ user }: DashboardTopbarProps) {
  const { logout } = useAuth();
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-end gap-2 border-b bg-background/95 backdrop-blur px-4 md:px-6">
      <LanguageSwitcher />
      <ThemeToggle />
      <Separator orientation="vertical" className="h-6" />
      <NotificationBell />
      <UserAvatarDropdown user={user} onLogout={logout} />
    </header>
  );
}
