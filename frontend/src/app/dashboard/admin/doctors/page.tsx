"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DoctorProfile } from "@/types";
import { Eye, Check, X, Loader2 } from "lucide-react";

interface ApiSuccess<T> {
  success: true;
  data: T;
}

export default function AdminDoctorsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(
    null
  );
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDoctors = useCallback(async () => {
    try {
      const res = await apiClient.get<ApiSuccess<DoctorProfile[]>>(
        ENDPOINTS.doctors.list
      );
      if (res.success) setDoctors(res.data);
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const approvedDoctors = doctors.filter(
    (d) => d.approvalStatus === "approved"
  );
  const pendingDoctors = doctors.filter(
    (d) => d.approvalStatus === "pending"
  );

  const handleApprove = (doc: DoctorProfile) => {
    setSelectedDoctor(doc);
    setApproveDialogOpen(true);
  };

  const handleReject = (doc: DoctorProfile) => {
    setSelectedDoctor(doc);
    setRejectDialogOpen(true);
  };

  const approvedColumns: Column<DoctorProfile>[] = [
    {
      key: "name",
      header: t.auth.register.nameLabel,
      cell: (item) => (
        <span className="font-medium">{item.user.name}</span>
      ),
    },
    {
      key: "specialization",
      header: "Specialization",
      cell: (item) => (
        <Badge variant="secondary" className="capitalize">
          {item.specialization.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      key: "phone",
      header: t.appointments.phone,
      cell: (item) => item.user.phone,
      hideOnMobile: true,
    },
    {
      key: "experience",
      header: "Experience",
      cell: (item) => `${item.experienceYears} years`,
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
            router.push(`/dashboard/admin/patients/${item.userId}`);
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const pendingColumns: Column<DoctorProfile>[] = [
    {
      key: "name",
      header: t.auth.register.nameLabel,
      cell: (item) => (
        <span className="font-medium">{item.user.name}</span>
      ),
    },
    {
      key: "specialization",
      header: "Specialization",
      cell: (item) => (
        <Badge variant="secondary" className="capitalize">
          {item.specialization.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      key: "qualifications",
      header: "Qualifications",
      cell: (item) => (
        <span className="text-sm">{item.qualifications}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "experience",
      header: "Experience",
      cell: (item) => `${item.experienceYears} years`,
      hideOnMobile: true,
    },
    {
      key: "actions",
      header: t.appointments.actions,
      cell: (item) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-green-600 hover:text-green-700"
            onClick={(e) => {
              e.stopPropagation();
              handleApprove(item);
            }}
            title={t.appointments.approve}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-600 hover:text-red-700"
            onClick={(e) => {
              e.stopPropagation();
              handleReject(item);
            }}
            title={t.appointments.reject}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const approvedMobileCard = (item: DoctorProfile) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">{item.user.name}</span>
          <Badge variant="secondary" className="capitalize">
            {item.specialization.replace(/_/g, " ")}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{item.user.phone}</p>
        <p className="text-sm text-muted-foreground">
          {item.experienceYears} years experience
        </p>
      </CardContent>
    </Card>
  );

  const pendingMobileCard = (item: DoctorProfile) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">{item.user.name}</span>
          <Badge variant="outline" className="capitalize">
            {item.specialization.replace(/_/g, " ")}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{item.qualifications}</p>
        <p className="text-sm text-muted-foreground">
          {item.experienceYears} years experience
        </p>
        <div className="flex gap-2 mt-3">
          <Button
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              handleApprove(item);
            }}
          >
            <Check className="h-4 w-4 mr-1" />
            {t.appointments.approve}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              handleReject(item);
            }}
          >
            <X className="h-4 w-4 mr-1" />
            {t.appointments.reject}
          </Button>
        </div>
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
      <PageHeader title={t.dashboard.sidebar.doctors} />

      <Tabs defaultValue="approved">
        <TabsList className="mb-4">
          <TabsTrigger value="approved">
            Approved Doctors ({approvedDoctors.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending Requests ({pendingDoctors.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="approved">
          <DataTable
            data={approvedDoctors}
            columns={approvedColumns}
            mobileCard={approvedMobileCard}
          />
        </TabsContent>

        <TabsContent value="pending">
          <DataTable
            data={pendingDoctors}
            columns={pendingColumns}
            mobileCard={pendingMobileCard}
          />
        </TabsContent>
      </Tabs>

      {/* Approve Dialog */}
      <ConfirmDialog
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        title="Approve Doctor"
        description={`Are you sure you want to approve ${selectedDoctor?.user.name}?`}
        confirmLabel={t.appointments.approve}
        onConfirm={async () => {
          if (selectedDoctor) {
            try {
              await apiClient.patch<ApiSuccess<DoctorProfile>>(
                ENDPOINTS.doctors.approve(selectedDoctor.id)
              );
              toast.success(`${selectedDoctor.user.name} has been approved.`);
              fetchDoctors();
            } catch (err) {
              toast.error("Failed to approve doctor.");
              console.error(err);
            }
          }
          setSelectedDoctor(null);
        }}
      />

      {/* Reject Dialog */}
      <ConfirmDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        title="Reject Doctor"
        description={`Are you sure you want to reject ${selectedDoctor?.user.name}'s application?`}
        confirmLabel={t.appointments.reject}
        variant="destructive"
        onConfirm={async () => {
          if (selectedDoctor) {
            try {
              await apiClient.patch<ApiSuccess<DoctorProfile>>(
                ENDPOINTS.doctors.reject(selectedDoctor.id)
              );
              toast.success(`${selectedDoctor.user.name}'s application has been rejected.`);
              fetchDoctors();
            } catch (err) {
              toast.error("Failed to reject doctor.");
              console.error(err);
            }
          }
          setSelectedDoctor(null);
        }}
      />
    </div>
  );
}
