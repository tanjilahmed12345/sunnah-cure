"use client";

import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS } from "@/lib/constants";
import { useTranslation } from "@/i18n/useTranslation";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { t } = useTranslation();
  const colorClass = STATUS_COLORS[status] || STATUS_COLORS.pending;
  const label = (t.status as Record<string, string>)[status] || status;

  return (
    <Badge
      variant="outline"
      className={cn("border-0 font-medium", colorClass, className)}
    >
      {label}
    </Badge>
  );
}
