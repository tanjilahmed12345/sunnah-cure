"use client";

import Link from "next/link";
import { useTranslation } from "@/i18n/useTranslation";
import { mockCurrentUser } from "@/lib/mock/data/users";
import { mockAppointments } from "@/lib/mock/data/appointments";
import { mockAssessments } from "@/lib/mock/data/assessments";
import { mockConversations } from "@/lib/mock/data/messages";
import { StatCard } from "@/components/common/StatCard";
import { AppointmentCard } from "@/components/common/AppointmentCard";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarCheck,
  CheckCircle,
  ClipboardList,
  MessageSquare,
  Plus,
  FileText,
} from "lucide-react";

export default function PatientDashboardPage() {
  const { t } = useTranslation();
  const user = mockCurrentUser;

  const userAppointments = mockAppointments.filter(
    (a) => a.patientId === user.id
  );
  const upcoming = userAppointments.filter(
    (a) => a.status === "approved" || a.status === "pending"
  );
  const completed = userAppointments.filter((a) => a.status === "completed");
  const pendingAssessments = mockAssessments.filter(
    (a) => a.patientId === user.id && a.status === "pending"
  );
  const unreadMessages = mockConversations.reduce(
    (sum, c) => sum + c.unreadCount,
    0
  );
  const recentAppointments = userAppointments.slice(0, 5);

  return (
    <div>
      <PageHeader
        title={`${t.dashboard.patient.welcome}, ${user.name}`}
        description={t.common.tagline}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label={t.dashboard.patient.upcomingAppointments}
          value={upcoming.length}
          icon={CalendarCheck}
        />
        <StatCard
          label={t.dashboard.patient.completedAppointments}
          value={completed.length}
          icon={CheckCircle}
        />
        <StatCard
          label={t.dashboard.patient.pendingAssessments}
          value={pendingAssessments.length}
          icon={ClipboardList}
        />
        <StatCard
          label={t.dashboard.sidebar.messages}
          value={unreadMessages}
          icon={MessageSquare}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Appointments */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                {t.dashboard.patient.recentAppointments}
              </CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/appointments">
                  {t.dashboard.patient.viewAll}
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentAppointments.length === 0 ? (
                <EmptyState
                  title={t.dashboard.patient.noUpcoming}
                  description={t.appointments.noAppointments}
                />
              ) : (
                recentAppointments.map((apt) => (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    href={`/dashboard/appointments/${apt.id}`}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t.dashboard.patient.quickActions}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start" size="lg">
                <Link href="/dashboard/appointments/book">
                  <Plus className="mr-2 h-4 w-4" />
                  {t.dashboard.patient.bookAppointment}
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start"
                size="lg"
              >
                <Link href="/dashboard/assessment/new">
                  <FileText className="mr-2 h-4 w-4" />
                  {t.dashboard.patient.takeAssessment}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
