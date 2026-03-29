"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchInput } from "@/components/common/SearchInput";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { mockAssessments } from "@/lib/mock/data/assessments";
import { mockUsers } from "@/lib/mock/data/users";
import { formatDate } from "@/lib/utils";
import type { Assessment } from "@/types";
import { Eye } from "lucide-react";

export default function AdminAssessmentsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const getPatientPhone = (patientId: string) => {
    return mockUsers.find((u) => u.id === patientId)?.phone || "";
  };

  const filteredAssessments = useMemo(() => {
    let filtered = [...mockAssessments];

    if (activeTab !== "all") {
      filtered = filtered.filter((a) => a.status === activeTab);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.patientName.toLowerCase().includes(q) ||
          getPatientPhone(a.patientId).includes(q) ||
          (a.assignedDoctorName && a.assignedDoctorName.toLowerCase().includes(q))
      );
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [activeTab, searchQuery]);

  const columns: Column<Assessment>[] = [
    {
      key: "patient",
      header: t.appointments.patient,
      cell: (item) => (
        <span className="font-medium">{item.patientName}</span>
      ),
    },
    {
      key: "phone",
      header: t.appointments.phone,
      cell: (item) => getPatientPhone(item.patientId),
      hideOnMobile: true,
    },
    {
      key: "date",
      header: t.appointments.dateTime,
      cell: (item) => formatDate(item.createdAt),
      hideOnMobile: true,
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
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/dashboard/admin/assessments/${item.id}`);
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const mobileCard = (item: Assessment) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">{item.patientName}</span>
          <StatusBadge status={item.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          {formatDate(item.createdAt)}
        </p>
        {item.assignedDoctorName && (
          <p className="text-sm text-muted-foreground mt-1">
            {t.appointments.doctor}: {item.assignedDoctorName}
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div>
      <PageHeader title={t.dashboard.sidebar.assessments} />

      <div className="mb-6">
        <SearchInput
          onSearch={setSearchQuery}
          placeholder={t.common.search}
          className="max-w-sm"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">{t.status.pending}</TabsTrigger>
          <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
          <TabsTrigger value="assigned">Assigned</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <DataTable
            data={filteredAssessments}
            columns={columns}
            onRowClick={(item) =>
              router.push(`/dashboard/admin/assessments/${item.id}`)
            }
            mobileCard={mobileCard}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
