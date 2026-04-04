"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchInput } from "@/components/common/SearchInput";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { Assessment } from "@/types";
import { Eye, Loader2 } from "lucide-react";

interface ApiSuccess<T> {
  success: true;
  data: T;
}

export default function AdminAssessmentsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssessments = useCallback(async () => {
    try {
      const res = await apiClient.get<ApiSuccess<Assessment[]>>(
        ENDPOINTS.assessments.list
      );
      if (res.success) setAssessments(res.data);
    } catch (err) {
      console.error("Failed to fetch assessments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  const filteredAssessments = useMemo(() => {
    let filtered = [...assessments];

    if (activeTab !== "all") {
      filtered = filtered.filter((a) => a.status === activeTab);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.patientName.toLowerCase().includes(q) ||
          (a.assignedDoctorName && a.assignedDoctorName.toLowerCase().includes(q))
      );
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [activeTab, searchQuery, assessments]);

  const columns: Column<Assessment>[] = [
    {
      key: "patient",
      header: t.appointments.patient,
      cell: (item) => (
        <span className="font-medium">{item.patientName}</span>
      ),
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
