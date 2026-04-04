"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/i18n/useTranslation";
import { mockCurrentUser } from "@/lib/mock/data/users";
import { mockAssessments } from "@/lib/mock/data/assessments";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Assessment } from "@/types";

export default function AssessmentsPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const userAssessments = mockAssessments.filter(
    (a) => a.patientId === mockCurrentUser.id
  );

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

      {userAssessments.length === 0 ? (
        <EmptyState
          title={t.common.noResults}
          description={t.assessment.subtitle}
          actionLabel={t.dashboard.patient.takeAssessment}
          onAction={() => router.push("/dashboard/assessment/new")}
        />
      ) : (
        <DataTable
          data={userAssessments}
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
