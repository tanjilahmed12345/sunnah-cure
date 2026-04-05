"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { UserAvatarDropdown } from "@/components/common/UserAvatarDropdown";
import { Logo } from "@/components/common/Logo";
import { useTranslation } from "@/i18n/useTranslation";
import { NAV_ITEMS } from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const { user, isLoggedIn, logout } = useAuth();

  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    label: item.label.split(".").reduce((obj: Record<string, unknown>, key: string) => obj[key] as Record<string, unknown>, t as unknown as Record<string, unknown>) as unknown as string,
  }));

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Logo size="md" />

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          {user ? (
            <UserAvatarDropdown user={user} onLogout={logout} />
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">{t.navbar.login}</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">{t.navbar.register}</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-80 pt-10">
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "px-4 py-2.5 text-sm font-medium rounded-lg transition-colors hover:bg-accent",
                      pathname === item.href
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="my-3 border-t" />
                <LanguageSwitcher />
                <div className="my-3 border-t" />
                {user ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-accent"
                  >
                    {t.navbar.dashboard}
                  </Link>
                ) : (
                  <div className="flex flex-col gap-2 px-2">
                    <Button asChild variant="outline">
                      <Link href="/login" onClick={() => setOpen(false)}>
                        {t.navbar.login}
                      </Link>
                    </Button>
                    <Button asChild>
                      <Link href="/register" onClick={() => setOpen(false)}>
                        {t.navbar.register}
                      </Link>
                    </Button>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
