"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Smartphone, Mail } from "lucide-react";
import type { PaymentMethod } from "@/types";

const methodConfig: Record<
  PaymentMethod,
  { icon: React.ElementType; color: string; bgColor: string }
> = {
  bkash: { icon: Smartphone, color: "text-pink-600", bgColor: "bg-pink-50 dark:bg-pink-950/30" },
  nagad: { icon: Smartphone, color: "text-orange-600", bgColor: "bg-orange-50 dark:bg-orange-950/30" },
  rocket: { icon: Smartphone, color: "text-purple-600", bgColor: "bg-purple-50 dark:bg-purple-950/30" },
  paypal: { icon: Mail, color: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-950/30" },
  stripe: { icon: CreditCard, color: "text-indigo-600", bgColor: "bg-indigo-50 dark:bg-indigo-950/30" },
  card: { icon: CreditCard, color: "text-slate-600", bgColor: "bg-slate-50 dark:bg-slate-950/30" },
};

interface PaymentMethodCardProps {
  method: PaymentMethod;
  label: string;
  selected: boolean;
  onSelect: () => void;
}

export function PaymentMethodCard({
  method,
  label,
  selected,
  onSelect,
}: PaymentMethodCardProps) {
  const config = methodConfig[method];
  const Icon = config.icon;

  return (
    <Card
      onClick={onSelect}
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        selected && "ring-2 ring-primary border-primary"
      )}
    >
      <CardContent className="flex items-center gap-3 p-4">
        <div className={cn("rounded-lg p-2", config.bgColor)}>
          <Icon className={cn("h-5 w-5", config.color)} />
        </div>
        <span className="font-medium text-sm">{label}</span>
      </CardContent>
    </Card>
  );
}
