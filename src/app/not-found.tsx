"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/useTranslation";
import { Home, SearchX } from "lucide-react";

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 via-white to-amber-50 dark:from-teal-950/30 dark:via-background dark:to-amber-950/20 px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 mb-6">
          <SearchX className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-7xl font-extrabold text-primary">404</h1>
        <h2 className="mt-4 text-2xl font-bold tracking-tight">
          {t.notFound.title}
        </h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          {t.notFound.description}
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            {t.notFound.goHome}
          </Link>
        </Button>
      </div>
    </div>
  );
}
