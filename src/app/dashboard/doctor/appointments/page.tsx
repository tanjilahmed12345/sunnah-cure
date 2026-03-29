"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchInput } from "@/components/common/SearchInput";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PaymentStatusBadge } from "@/components/common/PaymentStatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { mockAppointments } from "@/lib/mock/data/appointments";
import { mockUsers } from "@/lib/mock/data/users";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Appointment } from "@/types";
import { Eye } from "lucide-react";

const CURRENT_DOCTOR_ID = "doc-1";

export default function DoctorAppointmentsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const getPatientName = useCallback((patientId: string) => {
    return mockUsers.find((u) => u.id === patientId)?.name || "Unknown";
  }, []);

  const getPatientPhone = useCallback((patientId: string) => {
    return mockUsers.find((u) => u.id === patientId)?.phone || "";
  }, []);

  const doctorAppointments = mockAppointments.filter(
    (a) => a.doctorId === CURRENT_DOCTOR_ID
  );

  const filteredAppointments = useMemo(() => {
    let filtered = [...doctorAppointments];

    if (activeTab !== "all") {
      filtered = filtered.filter((a) => a.status === activeTab);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          getPatientName(a.patientId).toLowerCase().includes(q) ||
          getPatientPhone(a.patientId).includes(q) ||
          a.serviceName.toLowerCase().includes(q)
      );
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [activeTab, searchQuery, doctorAppointments, getPatientName, getPatientPhone]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
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
      key: "phone",
      header: t.appointments.phone,
      cell: (item) => getPatientPhone(item.patientId),
      hideOnMobile: true,
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
      key: "payment",
      header: t.appointments.payment,
      cell: (item) => (
        <div className="flex flex-col gap-1">
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
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/dashboard/doctor/appointments/${item.id}`);
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const mobileCard = (item: Appointment) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">{getPatientName(item.patientId)}</span>
          <StatusBadge status={item.status} />
        </div>
        <p className="text-sm text-muted-foreground">{item.serviceName}</p>
        <p className="text-sm text-muted-foreground">
          {item.scheduledDate
            ? `${formatDate(item.scheduledDate)} ${item.scheduledTime || ""}`
            : t.appointments.pendingDate}
        </p>
        <div className="mt-2">
          <PaymentStatusBadge status={item.paymentStatus} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <PageHeader title={t.appointments.title} />

      <div className="mb-6">
        <SearchInput
          onSearch={handleSearch}
          placeholder={t.common.search}
          className="max-w-sm"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">{t.appointments.all}</TabsTrigger>
          <TabsTrigger value="pending">{t.appointments.pending}</TabsTrigger>
          <TabsTrigger value="approved">{t.appointments.approved}</TabsTrigger>
          <TabsTrigger value="completed">{t.appointments.completed}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <DataTable
            data={filteredAppointments}
            columns={columns}
            onRowClick={(item) =>
              router.push(`/dashboard/doctor/appointments/${item.id}`)
            }
            mobileCard={mobileCard}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
