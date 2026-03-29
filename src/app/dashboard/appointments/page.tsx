"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { mockCurrentUser } from "@/lib/mock/data/users";
import { mockAppointments } from "@/lib/mock/data/appointments";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { AppointmentCard } from "@/components/common/AppointmentCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PaymentStatusBadge } from "@/components/common/PaymentStatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Eye } from "lucide-react";
import type { Appointment, AppointmentStatus } from "@/types";

type TabValue = "all" | AppointmentStatus;

export default function MyAppointmentsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabValue>("all");

  const userAppointments = mockAppointments.filter(
    (a) => a.patientId === mockCurrentUser.id
  );

  const filteredAppointments =
    activeTab === "all"
      ? userAppointments
      : userAppointments.filter((a) => a.status === activeTab);

  const columns: Column<Appointment>[] = [
    {
      key: "service",
      header: t.appointments.service,
      cell: (item) => (
        <span className="font-medium">{item.serviceName}</span>
      ),
    },
    {
      key: "dateTime",
      header: t.appointments.dateTime,
      cell: (item) =>
        item.scheduledDate
          ? `${item.scheduledDate} ${item.scheduledTime || ""}`
          : t.appointments.pendingDate,
      hideOnMobile: true,
    },
    {
      key: "status",
      header: t.appointments.status,
      cell: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "mode",
      header: t.appointments.mode,
      cell: (item) => <StatusBadge status={item.mode} />,
      hideOnMobile: true,
    },
    {
      key: "payment",
      header: t.appointments.payment,
      cell: (item) => <PaymentStatusBadge status={item.paymentStatus} />,
      hideOnMobile: true,
    },
    {
      key: "actions",
      header: t.appointments.actions,
      cell: (item) => (
        <Button asChild variant="ghost" size="sm">
          <Link href={`/dashboard/appointments/${item.id}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      ),
    },
  ];

  const tabs: { value: TabValue; label: string }[] = [
    { value: "all", label: t.appointments.all },
    { value: "pending", label: t.appointments.pending },
    { value: "approved", label: t.appointments.approved },
    { value: "completed", label: t.appointments.completed },
    { value: "cancelled", label: t.appointments.cancelled },
  ];

  return (
    <div>
      <PageHeader
        title={t.appointments.title}
        action={
          <Button asChild>
            <Link href="/dashboard/appointments/book">
              <Plus className="mr-2 h-4 w-4" />
              {t.appointments.bookNew}
            </Link>
          </Button>
        }
      />

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabValue)}
        className="mb-6"
      >
        <TabsList className="flex-wrap">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filteredAppointments.length === 0 ? (
        <EmptyState
          title={t.appointments.noAppointments}
          actionLabel={t.appointments.bookNew}
          onAction={() => router.push("/dashboard/appointments/book")}
        />
      ) : (
        <DataTable
          data={filteredAppointments}
          columns={columns}
          onRowClick={(item) =>
            router.push(`/dashboard/appointments/${item.id}`)
          }
          mobileCard={(item) => (
            <AppointmentCard
              appointment={item}
              href={`/dashboard/appointments/${item.id}`}
            />
          )}
        />
      )}
    </div>
  );
}
