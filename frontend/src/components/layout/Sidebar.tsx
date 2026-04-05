"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  ClipboardList,
  MessageSquare,
  User,
  Users,
  Stethoscope,
  UserCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslation } from "@/i18n/useTranslation";
import {
  PATIENT_SIDEBAR_ITEMS,
  DOCTOR_SIDEBAR_ITEMS,
  ADMIN_SIDEBAR_ITEMS,
} from "@/lib/constants";
import { Logo } from "@/components/common/Logo";
import { cn } from "@/lib/utils";
import { useDashboardCounts } from "@/contexts/DashboardContext";
import type { UserRole } from "@/types";
import { Menu } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  CalendarCheck,
  ClipboardList,
  MessageSquare,
  User,
  Users,
  Stethoscope,
  UserCheck,
  Settings,
};

interface SidebarProps {
  role: UserRole;
}

function getTranslatedLabel(t: Record<string, unknown>, labelKey: string): string {
  const keys = labelKey.split(".");
  let current: unknown = t;
  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return labelKey;
    }
  }
  return typeof current === "string" ? current : labelKey;
}

export function Sidebar({ role }: SidebarProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { counts } = useDashboardCounts();

  const items =
    role === "ADMIN"
      ? ADMIN_SIDEBAR_ITEMS
      : role === "DOCTOR"
        ? DOCTOR_SIDEBAR_ITEMS
        : PATIENT_SIDEBAR_ITEMS;

  // Map sidebar hrefs to badge counts
  const getBadge = (href: string): number => {
    if (href.includes("appointments") && !href.includes("appointments/")) {
      return counts.pendingAppointments;
    }
    if (href.includes("messages")) {
      return counts.unreadMessages;
    }
    return 0;
  };

  const SidebarContent = () => (
    <ScrollArea className="flex-1 py-4">
      <nav className="flex flex-col gap-1 px-3">
        {items.map((item) => {
          const Icon = iconMap[item.icon] || LayoutDashboard;
          const label = getTranslatedLabel(t as unknown as Record<string, unknown>, item.label);
          const isActive = pathname === item.href;
          const badge = getBadge(item.href);

          const linkContent = (
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                collapsed && "justify-center px-2"
              )}
            >
              <span className="relative flex-shrink-0">
                <Icon className="h-5 w-5" />
                {badge > 0 && collapsed && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </span>
              {!collapsed && (
                <span className="flex-1 flex items-center justify-between">
                  <span>{label}</span>
                  {badge > 0 && (
                    <span className={cn(
                      "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-destructive text-destructive-foreground"
                    )}>
                      {badge > 99 ? "99+" : badge}
                    </span>
                  )}
                </span>
              )}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right">
                  {label} {badge > 0 ? `(${badge})` : ""}
                </TooltipContent>
              </Tooltip>
            );
          }

          return <div key={item.href}>{linkContent}</div>;
        })}
      </nav>
    </ScrollArea>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r bg-sidebar min-h-screen transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className={cn("flex items-center h-16 border-b px-4", collapsed ? "justify-center" : "justify-between")}>
          {!collapsed && (
            <Logo size="sm" />
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
        <SidebarContent />
      </aside>

      {/* Mobile Sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed bottom-4 left-4 z-50 h-12 w-12 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex items-center h-16 border-b px-4">
            <Logo size="sm" />
          </div>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
