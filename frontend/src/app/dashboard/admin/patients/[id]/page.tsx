"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PaymentStatusBadge } from "@/components/common/PaymentStatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Appointment, Assessment, User } from "@/types";
import { ArrowLeft, User as UserIcon, Phone, MapPin, Calendar, Loader2 } from "lucide-react";

interface ApiSuccess<T> {
  success: true;
  data: T;
}

export default function AdminPatientDetailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [patient, setPatient] = useState<User | null>(null);
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>([]);
  const [patientAssessments, setPatientAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [patientRes, appointmentsRes, assessmentsRes] = await Promise.all([
        apiClient.get<ApiSuccess<User>>(ENDPOINTS.patients.detail(id)),
        apiClient.get<ApiSuccess<Appointment[]>>(ENDPOINTS.appointments.list),
        apiClient.get<ApiSuccess<Assessment[]>>(ENDPOINTS.assessments.list),
      ]);
      if (patientRes.success) setPatient(patientRes.data);
      if (appointmentsRes.success) {
        const filtered = appointmentsRes.data
          .filter((a) => a.patientId === id)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        setPatientAppointments(filtered);
      }
      if (assessmentsRes.success) {
        const filtered = assessmentsRes.data
          .filter((a) => a.patientId === id)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        setPatientAssessments(filtered);
      }
    } catch (err) {
      console.error("Failed to fetch patient data:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
                <UserIcon className="h-5 w-5 text-primary" />
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
      </Tabs>
    </div>
  );
}
