"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { useTranslation } from "@/i18n/useTranslation";
import type { Appointment } from "@/types";

interface AppointmentCardProps {
  appointment: Appointment;
  href?: string;
}

export function AppointmentCard({ appointment, href }: AppointmentCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-sm">{appointment.serviceName}</h4>
              <StatusBadge status={appointment.status} />
            </div>
            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
              {appointment.scheduledDate ? (
                <>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {appointment.scheduledDate}
                  </span>
                  {appointment.scheduledTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {appointment.scheduledTime}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-yellow-600 dark:text-yellow-400 text-xs">
                  {t.appointments.pendingDate}
                </span>
              )}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <StatusBadge status={appointment.mode} />
              <PaymentStatusBadge status={appointment.paymentStatus} />
            </div>
          </div>
          {href && (
            <Button asChild variant="ghost" size="sm">
              <Link href={href}>{t.common.viewDetails}</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
