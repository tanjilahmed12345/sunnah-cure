"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, BookOpen, Users, ClipboardList } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { formatCurrency } from "@/lib/utils";
import type { Service } from "@/types";

const iconMap: Record<string, React.ElementType> = {
  Heart,
  BookOpen,
  Users,
  ClipboardList,
};

interface ServiceCardProps {
  service: Service;
  showActions?: boolean;
}

export function ServiceCard({ service, showActions = true }: ServiceCardProps) {
  const { t, locale } = useTranslation();
  const Icon = iconMap[service.iconName] || Heart;
  const name = locale === "bn" ? service.nameBn : service.name;
  const description = locale === "bn" ? service.descriptionBn : service.description;

  return (
    <Card className="hover:shadow-lg transition-all duration-300 group overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="rounded-xl bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex gap-1.5">
            {service.isOnline && (
              <Badge variant="secondary" className="text-xs">
                {t.status.online}
              </Badge>
            )}
            {service.isOffline && (
              <Badge variant="outline" className="text-xs">
                {t.status.offline}
              </Badge>
            )}
          </div>
        </div>
        <CardTitle className="mt-3 text-lg">{name}</CardTitle>
        <CardDescription className="line-clamp-2">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{service.durationMinutes} min</span>
          <span className="font-semibold text-foreground">
            {service.hijamaPricing
              ? `From ${formatCurrency(service.hijamaPricing.minCups * service.hijamaPricing.pricePerCup)}`
              : formatCurrency(service.priceBDT)}
          </span>
        </div>
      </CardContent>
      {showActions && (
        <CardFooter className="gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href={`/services/${service.slug}`}>
              {t.common.viewDetails}
            </Link>
          </Button>
          <Button asChild size="sm" className="flex-1">
            <Link href={`/dashboard/appointments/book?service=${service.type}`}>
              {t.common.bookNow}
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
