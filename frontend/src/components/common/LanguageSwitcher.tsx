"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/useTranslation";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useTranslation();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLocale(locale === "en" ? "bn" : "en")}
      className="gap-1.5 text-sm font-medium"
      aria-label="Switch language"
    >
      <Languages className="h-4 w-4" />
      <span>{t.common.languageToggle}</span>
    </Button>
  );
}
