"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { Appointment } from "@/types";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";

interface ApiSuccess<T> { success: true; data: T; }

export default function DoctorDashboardPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await apiClient.get<ApiSuccess<Appointment[]>>(ENDPOINTS.appointments.list);
        if (res.success) setAppointments(res.data);
      } catch { /* ignore */ }
    }
    fetch();
  }, []);

  if (!user) return null;

  const assignedCount = appointments.filter((a) => a.status === "approved").length;
  const completedCount = appointments.filter((a) => a.status === "completed").length;
  const pendingCount = appointments.filter((a) => a.status === "pending").length;

  const recentAssigned = appointments
    .filter((a) => a.status === "approved" || a.status === "pending")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div>
      <PageHeader
        title={t.dashboard.doctor.title}
        description={`${t.dashboard.patient.welcome}, ${user.name}`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label={t.dashboard.doctor.assignedAppointments} value={assignedCount} icon={CalendarCheck} />
        <StatCard label={t.dashboard.doctor.completedAppointments} value={completedCount} icon={CheckCircle2} />
        <StatCard label={t.dashboard.doctor.pendingAppointments} value={pendingCount} icon={Clock} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">{t.dashboard.doctor.assignedAppointments}</CardTitle>
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/doctor/appointments")}>
            {t.common.seeAll}
          </Button>
        </CardHeader>
        <CardContent>
          {recentAssigned.length === 0 ? (
            <EmptyState title={t.appointments.noAppointments} />
          ) : (
            <div className="space-y-3">
              {recentAssigned.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/dashboard/doctor/appointments/${apt.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium">{apt.patient?.name || "Unknown"}</span>
                      <StatusBadge status={apt.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {apt.serviceName}
                      {apt.scheduledDate && ` - ${formatDate(apt.scheduledDate)} ${apt.scheduledTime || ""}`}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
