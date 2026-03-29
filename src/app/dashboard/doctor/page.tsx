"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockAppointments } from "@/lib/mock/data/appointments";
import { mockUsers } from "@/lib/mock/data/users";
import { formatDate } from "@/lib/utils";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";

const CURRENT_DOCTOR_ID = "doc-1";

export default function DoctorDashboardPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const doctorAppointments = mockAppointments.filter(
    (a) => a.doctorId === CURRENT_DOCTOR_ID
  );
  const assignedCount = doctorAppointments.filter(
    (a) => a.status === "approved"
  ).length;
  const completedCount = doctorAppointments.filter(
    (a) => a.status === "completed"
  ).length;
  const pendingCount = doctorAppointments.filter(
    (a) => a.status === "pending"
  ).length;

  const recentAssigned = doctorAppointments
    .filter((a) => a.status === "approved" || a.status === "pending")
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  const getPatientName = (patientId: string) => {
    return mockUsers.find((u) => u.id === patientId)?.name || "Unknown";
  };

  return (
    <div>
      <PageHeader
        title={t.dashboard.doctor.title}
        description={`${t.dashboard.patient.welcome}, Dr. Abu Bakr Siddique`}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          label={t.dashboard.doctor.assignedAppointments}
          value={assignedCount}
          icon={CalendarCheck}
        />
        <StatCard
          label={t.dashboard.doctor.completedAppointments}
          value={completedCount}
          icon={CheckCircle2}
        />
        <StatCard
          label={t.dashboard.doctor.pendingAppointments}
          value={pendingCount}
          icon={Clock}
        />
      </div>

      {/* Recent Assigned Appointments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">
            {t.dashboard.doctor.assignedAppointments}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/doctor/appointments")}
          >
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
                  onClick={() =>
                    router.push(`/dashboard/doctor/appointments/${apt.id}`)
                  }
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium">
                        {getPatientName(apt.patientId)}
                      </span>
                      <StatusBadge status={apt.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {apt.serviceName}
                      {apt.scheduledDate &&
                        ` - ${formatDate(apt.scheduledDate)} ${apt.scheduledTime || ""}`}
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
