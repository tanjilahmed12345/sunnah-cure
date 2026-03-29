"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/context";
import { Languages } from "lucide-react";
import type { Locale } from "@/lib/constants";

const LOCALE_SEEN_KEY = "sunnah-cure-locale-selected";

export function LanguageSelectionDialog() {
  const { setLocale } = useLanguage();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const alreadySelected = localStorage.getItem(LOCALE_SEEN_KEY);
    if (!alreadySelected) {
      setOpen(true);
    }
  }, []);

  const handleSelect = (locale: Locale) => {
    setLocale(locale);
    localStorage.setItem(LOCALE_SEEN_KEY, "true");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent showCloseButton={false} className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader className="items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mx-auto mb-2">
            <Languages className="h-7 w-7 text-primary" />
          </div>
          <DialogTitle className="text-xl">
            Choose Your Language / ভাষা নির্বাচন করুন
          </DialogTitle>
          <DialogDescription>
            Select your preferred language to continue.
            <br />
            চালিয়ে যেতে আপনার পছন্দের ভাষা নির্বাচন করুন।
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Button
            variant="outline"
            size="lg"
            className="h-24 flex-col gap-2 text-base hover:border-primary hover:bg-primary/5"
            onClick={() => handleSelect("en")}
          >
            <span className="text-2xl">🇬🇧</span>
            <span className="font-semibold">English</span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-24 flex-col gap-2 text-base hover:border-primary hover:bg-primary/5"
            onClick={() => handleSelect("bn")}
          >
            <span className="text-2xl">🇧🇩</span>
            <span className="font-semibold">বাংলা</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
