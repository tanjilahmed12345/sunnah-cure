"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/i18n/useTranslation";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Assessment } from "@/types";

interface ApiSuccess<T> {
  success: true;
  data: T;
}

export default function AssessmentsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAssessments() {
      try {
        const res = await apiClient.get<ApiSuccess<Assessment[]>>(
          ENDPOINTS.assessments.list
        );
        setAssessments(res.data);
      } catch {
        setAssessments([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAssessments();
  }, []);

  const columns: Column<Assessment>[] = [
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
      cell: (item) => item.assignedDoctorName || "-",
      hideOnMobile: true,
    },
  ];

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title={t.dashboard.sidebar.assessments}
          action={
            <Button asChild>
              <Link href="/dashboard/assessment/new">
                <Plus className="mr-2 h-4 w-4" />
                {t.dashboard.patient.takeAssessment}
              </Link>
            </Button>
          }
        />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={t.dashboard.sidebar.assessments}
        action={
          <Button asChild>
            <Link href="/dashboard/assessment/new">
              <Plus className="mr-2 h-4 w-4" />
              {t.dashboard.patient.takeAssessment}
            </Link>
          </Button>
        }
      />

      {assessments.length === 0 ? (
        <EmptyState
          title={t.common.noResults}
          description={t.assessment.subtitle}
          actionLabel={t.dashboard.patient.takeAssessment}
          onAction={() => router.push("/dashboard/assessment/new")}
        />
      ) : (
        <DataTable
          data={assessments}
          columns={columns}
          onRowClick={(item) =>
            router.push(`/dashboard/assessments/${item.id}`)
          }
          mobileCard={(item) => (
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      {formatDate(item.createdAt)}
                    </p>
                    {item.assignedDoctorName && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.assignedDoctorName}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              </CardContent>
            </Card>
          )}
        />
      )}
    </div>
  );
}
