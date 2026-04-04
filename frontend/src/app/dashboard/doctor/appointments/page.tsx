"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchInput } from "@/components/common/SearchInput";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PaymentStatusBadge } from "@/components/common/PaymentStatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Appointment } from "@/types";
import { Eye } from "lucide-react";

interface ApiSuccess<T> { success: true; data: T; }

export default function DoctorAppointmentsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
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

  const filteredAppointments = useMemo(() => {
    let filtered = [...appointments];
    if (activeTab !== "all") {
      filtered = filtered.filter((a) => a.status === activeTab);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          (a.patient?.name || "").toLowerCase().includes(q) ||
          (a.patient?.phone || "").includes(q) ||
          a.serviceName.toLowerCase().includes(q)
      );
    }
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [activeTab, searchQuery, appointments]);

  const handleSearch = useCallback((query: string) => { setSearchQuery(query); }, []);

  const columns: Column<Appointment>[] = [
    { key: "patient", header: t.appointments.patient, cell: (item) => <span className="font-medium">{item.patient?.name || "Unknown"}</span> },
    { key: "phone", header: t.appointments.phone, cell: (item) => item.patient?.phone || "", hideOnMobile: true },
    { key: "service", header: t.appointments.service, cell: (item) => item.serviceName, hideOnMobile: true },
    { key: "mode", header: t.appointments.mode, cell: (item) => <StatusBadge status={item.mode} />, hideOnMobile: true },
    { key: "status", header: t.appointments.status, cell: (item) => <StatusBadge status={item.status} /> },
    {
      key: "date", header: t.appointments.dateTime,
      cell: (item) => item.scheduledDate ? `${formatDate(item.scheduledDate)} ${item.scheduledTime || ""}` : t.appointments.pendingDate,
      hideOnMobile: true,
    },
    {
      key: "payment", header: t.appointments.payment,
      cell: (item) => (
        <div className="flex flex-col gap-1">
          <PaymentStatusBadge status={item.paymentStatus} />
          {item.paymentAmount && <span className="text-xs text-muted-foreground">{formatCurrency(item.paymentAmount)}</span>}
        </div>
      ),
      hideOnMobile: true,
    },
    {
      key: "actions", header: t.appointments.actions,
      cell: (item) => (
        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/doctor/appointments/${item.id}`); }}>
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const mobileCard = (item: Appointment) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">{item.patient?.name || "Unknown"}</span>
          <StatusBadge status={item.status} />
        </div>
        <p className="text-sm text-muted-foreground">{item.serviceName}</p>
        <p className="text-sm text-muted-foreground">
          {item.scheduledDate ? `${formatDate(item.scheduledDate)} ${item.scheduledTime || ""}` : t.appointments.pendingDate}
        </p>
        <div className="mt-2"><PaymentStatusBadge status={item.paymentStatus} /></div>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <PageHeader title={t.appointments.title} />
      <div className="mb-6">
        <SearchInput onSearch={handleSearch} placeholder={t.common.search} className="max-w-sm" />
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">{t.appointments.all}</TabsTrigger>
          <TabsTrigger value="pending">{t.appointments.pending}</TabsTrigger>
          <TabsTrigger value="approved">{t.appointments.approved}</TabsTrigger>
          <TabsTrigger value="completed">{t.appointments.completed}</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab}>
          <DataTable data={filteredAppointments} columns={columns} onRowClick={(item) => router.push(`/dashboard/doctor/appointments/${item.id}`)} mobileCard={mobileCard} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
