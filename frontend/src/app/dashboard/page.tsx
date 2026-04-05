"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/i18n/useTranslation";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
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
import type { Appointment, Assessment, Conversation } from "@/types";

interface ApiSuccess<T> {
  success: true;
  data: T;
}

export default function PatientDashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [aptsRes, assessRes, convsRes] = await Promise.all([
          apiClient.get<ApiSuccess<Appointment[]>>(ENDPOINTS.appointments.list),
          apiClient.get<ApiSuccess<Assessment[]>>(ENDPOINTS.assessments.list),
          apiClient.get<ApiSuccess<Conversation[]>>(ENDPOINTS.messages.conversations),
        ]);
        if (aptsRes.success) setAppointments(aptsRes.data);
        if (assessRes.success) setAssessments(assessRes.data);
        if (convsRes.success) setConversations(convsRes.data);
      } catch {
        // handle error silently
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (!user) return null;

  const upcoming = appointments.filter(
    (a) => a.status === "approved" || a.status === "pending"
  );
  const completed = appointments.filter((a) => a.status === "completed");
  const pendingAssessments = assessments.filter((a) => a.status === "pending");
  const unreadMessages = conversations.reduce(
    (sum, c) => sum + c.unreadCount,
    0
  );
  const recentAppointments = appointments.slice(0, 5);

  return (
    <div>
      <PageHeader
        title={`${t.dashboard.patient.welcome}, ${user.name}`}
        description={t.common.tagline}
      />

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
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
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : recentAppointments.length === 0 ? (
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
