"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { Appointment } from "@/types";
import {
  Users,
  CalendarCheck,
  Clock,
  UserCheck,
  ClipboardList,
  BarChart3,
  Loader2,
} from "lucide-react";

interface ApiSuccess<T> {
  success: true;
  data: T;
}

interface AdminStats {
  totalPatients: number;
  totalAppointments: number;
  todayAppointments: number;
  pendingCount: number;
  completionRate: number;
  totalRevenue: number;
  totalStaff: number;
  totalAssessments: number;
}

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
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, appointmentsRes] = await Promise.all([
          apiClient.get<ApiSuccess<AdminStats>>(ENDPOINTS.admin.stats),
          apiClient.get<ApiSuccess<Appointment[]>>(ENDPOINTS.appointments.list),
        ]);
        if (statsRes.success) setStats(statsRes.data);
        if (appointmentsRes.success) setAppointments(appointmentsRes.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const recentAppointments = useMemo(
    () =>
      [...appointments]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 10),
    [appointments]
  );

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      pending: 0,
      approved: 0,
      completed: 0,
      cancelled: 0,
      rejected: 0,
    };
    appointments.forEach((a) => {
      counts[a.status] = (counts[a.status] || 0) + 1;
    });
    return counts;
  }, [appointments]);

  const maxCount = useMemo(
    () => Math.max(...Object.values(statusCounts), 1),
    [statusCounts]
  );

  const getPatientName = useCallback(
    (item: Appointment) => {
      return item.patient?.name || "Unknown";
    },
    []
  );

  const columns: Column<Appointment>[] = [
    {
      key: "patient",
      header: t.appointments.patient,
      cell: (item) => (
        <span className="font-medium">{getPatientName(item)}</span>
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
      cell: (item) => <StatusBadge status={item.mode} />,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
          value={stats?.totalPatients ?? 0}
          icon={Users}
          href="/dashboard/admin/patients"
        />
        <StatCard
          label={t.dashboard.admin.todayAppointments}
          value={stats?.todayAppointments ?? 0}
          icon={CalendarCheck}
          href="/dashboard/admin/appointments?filter=today"
        />
        <StatCard
          label={t.dashboard.admin.pendingAppointments}
          value={stats?.pendingCount ?? 0}
          icon={Clock}
          href="/dashboard/admin/appointments?filter=pending"
        />
        <StatCard
          label="Total Staff"
          value={stats?.totalStaff ?? 0}
          icon={UserCheck}
          href="/dashboard/admin/staff"
        />
        <StatCard
          label={t.dashboard.admin.totalAssessments}
          value={stats?.totalAssessments ?? 0}
          icon={ClipboardList}
          href="/dashboard/admin/assessments"
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
                Total: {stats?.totalAppointments ?? appointments.length} appointments
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
