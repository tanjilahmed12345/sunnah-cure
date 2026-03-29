"use client";

import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PaymentStatusBadge } from "@/components/common/PaymentStatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { DataTable, type Column } from "@/components/common/DataTable";
import { MessageBubble } from "@/components/common/MessageBubble";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { mockUsers } from "@/lib/mock/data/users";
import { mockAppointments } from "@/lib/mock/data/appointments";
import { mockAssessments } from "@/lib/mock/data/assessments";
import { mockMessages } from "@/lib/mock/data/messages";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Appointment, Assessment } from "@/types";
import { ArrowLeft, User, Phone, MapPin, Calendar } from "lucide-react";

export default function AdminPatientDetailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const patient = mockUsers.find((u) => u.id === id);
  const patientAppointments = mockAppointments
    .filter((a) => a.patientId === id)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  const patientAssessments = mockAssessments
    .filter((a) => a.patientId === id)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  const patientMessages = mockMessages.filter(
    (m) => m.senderId === id || m.conversationId === "conv-1"
  );

  if (!patient) {
    return (
      <div>
        <PageHeader title={t.dashboard.sidebar.patients} />
        <EmptyState title={t.common.noResults} />
      </div>
    );
  }

  const appointmentColumns: Column<Appointment>[] = [
    {
      key: "service",
      header: t.appointments.service,
      cell: (item) => item.serviceName,
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
      key: "payment",
      header: t.appointments.payment,
      cell: (item) => (
        <div className="flex items-center gap-2">
          <PaymentStatusBadge status={item.paymentStatus} />
          {item.paymentAmount && (
            <span className="text-xs text-muted-foreground">
              {formatCurrency(item.paymentAmount)}
            </span>
          )}
        </div>
      ),
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

  const assessmentColumns: Column<Assessment>[] = [
    {
      key: "date",
      header: t.appointments.dateTime,
      cell: (item) => formatDate(item.createdAt),
    },
    {
      key: "status",
      header: t.appointments.status,
      cell: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "doctor",
      header: t.appointments.doctor,
      cell: (item) => item.assignedDoctorName || "Not assigned",
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
            router.push(`/dashboard/admin/assessments/${item.id}`);
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
        title={patient.name}
        action={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.common.back}
          </Button>
        }
      />

      {/* Patient Info Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{patient.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t.appointments.phone}
                </p>
                <p className="font-medium">{patient.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t.auth.register.addressLabel}
                </p>
                <p className="font-medium">{patient.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Age / Gender
                </p>
                <p className="font-medium">
                  {patient.age} / <span className="capitalize">{patient.gender}</span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="appointments">
        <TabsList className="mb-4">
          <TabsTrigger value="appointments">
            {t.dashboard.sidebar.appointments} ({patientAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="assessments">
            {t.dashboard.sidebar.assessments} ({patientAssessments.length})
          </TabsTrigger>
          <TabsTrigger value="messages">
            {t.messages.title} ({patientMessages.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appointments">
          {patientAppointments.length === 0 ? (
            <EmptyState title={t.appointments.noAppointments} />
          ) : (
            <DataTable
              data={patientAppointments}
              columns={appointmentColumns}
              onRowClick={(item) =>
                router.push(`/dashboard/admin/appointments/${item.id}`)
              }
            />
          )}
        </TabsContent>

        <TabsContent value="assessments">
          {patientAssessments.length === 0 ? (
            <EmptyState title={t.common.noResults} />
          ) : (
            <DataTable
              data={patientAssessments}
              columns={assessmentColumns}
              onRowClick={(item) =>
                router.push(`/dashboard/admin/assessments/${item.id}`)
              }
            />
          )}
        </TabsContent>

        <TabsContent value="messages">
          {patientMessages.length === 0 ? (
            <EmptyState title={t.messages.noMessages} />
          ) : (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  {patientMessages.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      isOwn={msg.senderRole === "ADMIN"}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
