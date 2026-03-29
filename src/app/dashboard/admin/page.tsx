"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockAppointments } from "@/lib/mock/data/appointments";
import { mockAssessments } from "@/lib/mock/data/assessments";
import { mockUsers } from "@/lib/mock/data/users";
import { mockDoctors } from "@/lib/mock/data/doctors";
import { formatDate } from "@/lib/utils";
import type { Appointment } from "@/types";
import {
  Users,
  CalendarCheck,
  Clock,
  Stethoscope,
  ClipboardList,
  BarChart3,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500",
  approved: "bg-blue-500",
  completed: "bg-green-500",
  cancelled: "bg-gray-400",
  rejected: "bg-red-500",
};

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const patients = mockUsers.filter((u) => u.role === "PATIENT");
  const pendingAppointments = mockAppointments.filter(
    (a) => a.status === "pending"
  );
  const todayAppointments = mockAppointments.filter(
    (a) => a.scheduledDate === new Date().toISOString().split("T")[0]
  );
  const pendingDoctors = mockDoctors.filter(
    (d) => d.approvalStatus === "pending"
  );

  const recentAppointments = [...mockAppointments]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 10);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      pending: 0,
      approved: 0,
      completed: 0,
      cancelled: 0,
      rejected: 0,
    };
    mockAppointments.forEach((a) => {
      counts[a.status] = (counts[a.status] || 0) + 1;
    });
    return counts;
  }, []);

  const maxCount = useMemo(
    () => Math.max(...Object.values(statusCounts), 1),
    [statusCounts]
  );

  const getPatientName = useCallback((patientId: string) => {
    return mockUsers.find((u) => u.id === patientId)?.name || "Unknown";
  }, []);

  const columns: Column<Appointment>[] = [
    {
      key: "patient",
      header: t.appointments.patient,
      cell: (item) => (
        <span className="font-medium">{getPatientName(item.patientId)}</span>
      ),
    },
    {
      key: "service",
      header: t.appointments.service,
      cell: (item) => item.serviceName,
      hideOnMobile: true,
    },
    {
      key: "mode",
      header: t.appointments.mode,
      cell: (item) => (
        <StatusBadge status={item.mode} />
      ),
      hideOnMobile: true,
    },
    {
      key: "status",
      header: t.appointments.status,
      cell: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "date",
      header: t.appointments.dateTime,
      cell: (item) =>
        item.scheduledDate
          ? `${formatDate(item.scheduledDate)} ${item.scheduledTime || ""}`
          : t.appointments.pendingDate,
      hideOnMobile: true,
    },
    {
      key: "actions",
      header: t.appointments.actions,
      cell: (item) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/dashboard/admin/appointments/${item.id}`);
          }}
        >
          {t.common.viewDetails}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t.dashboard.admin.title}
        description={`${t.dashboard.patient.welcome}, Admin`}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          label={t.dashboard.admin.totalPatients}
          value={patients.length}
          icon={Users}
        />
        <StatCard
          label={t.dashboard.admin.todayAppointments}
          value={todayAppointments.length}
          icon={CalendarCheck}
        />
        <StatCard
          label={t.dashboard.admin.pendingAppointments}
          value={pendingAppointments.length}
          icon={Clock}
        />
        <StatCard
          label={t.dashboard.admin.pendingDoctors}
          value={pendingDoctors.length}
          icon={Stethoscope}
        />
        <StatCard
          label={t.dashboard.admin.totalAssessments}
          value={mockAssessments.length}
          icon={ClipboardList}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent appointment requests */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                {t.dashboard.admin.recentRequests}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard/admin/appointments")}
              >
                {t.common.seeAll}
              </Button>
            </CardHeader>
            <CardContent>
              <DataTable
                data={recentAppointments}
                columns={columns}
                pageSize={5}
                onRowClick={(item) =>
                  router.push(`/dashboard/admin/appointments/${item.id}`)
                }
              />
            </CardContent>
          </Card>
        </div>

        {/* Appointment Status Chart */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t.dashboard.admin.appointmentTrends}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-around h-64 gap-3 pt-4">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <div
                    key={status}
                    className="flex flex-col items-center gap-2 flex-1"
                  >
                    <span className="text-sm font-semibold">{count}</span>
                    <div
                      className={`w-full rounded-t-md ${STATUS_COLORS[status]} transition-all duration-500`}
                      style={{
                        height: `${Math.max((count / maxCount) * 180, 8)}px`,
                      }}
                    />
                    <span className="text-xs text-muted-foreground capitalize text-center">
                      {status}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Total: {mockAppointments.length} appointments
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
