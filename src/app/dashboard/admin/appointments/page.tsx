"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchInput } from "@/components/common/SearchInput";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PaymentStatusBadge } from "@/components/common/PaymentStatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { mockAppointments } from "@/lib/mock/data/appointments";
import { mockUsers } from "@/lib/mock/data/users";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Appointment } from "@/types";
import { Eye, Check, X } from "lucide-react";

export default function AdminAppointmentsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [approveDate, setApproveDate] = useState("");
  const [approveTime, setApproveTime] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([...mockAppointments]);

  const getPatientName = useCallback((patientId: string) => {
    return mockUsers.find((u) => u.id === patientId)?.name || "Unknown";
  }, []);

  const getPatientPhone = useCallback((patientId: string) => {
    return mockUsers.find((u) => u.id === patientId)?.phone || "";
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
          getPatientName(a.patientId).toLowerCase().includes(q) ||
          getPatientPhone(a.patientId).includes(q) ||
          a.serviceName.toLowerCase().includes(q)
      );
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [activeTab, searchQuery, appointments, getPatientName, getPatientPhone]);

  const handleApprove = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setApproveDate("");
    setApproveTime("");
    setApproveDialogOpen(true);
  };

  const handleReject = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const confirmApprove = () => {
    if (!selectedAppointment) return;
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === selectedAppointment.id
          ? {
              ...a,
              status: "approved" as const,
              scheduledDate: approveDate || a.scheduledDate,
              scheduledTime: approveTime || a.scheduledTime,
              updatedAt: new Date().toISOString(),
            }
          : a
      )
    );
    toast.success(`Appointment for ${getPatientName(selectedAppointment.patientId)} has been approved.`);
    setApproveDialogOpen(false);
    setSelectedAppointment(null);
  };

  const confirmReject = () => {
    if (!selectedAppointment) return;
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === selectedAppointment.id
          ? {
              ...a,
              status: "rejected" as const,
              rejectionReason: rejectReason,
              updatedAt: new Date().toISOString(),
            }
          : a
      )
    );
    toast.success(`Appointment for ${getPatientName(selectedAppointment.patientId)} has been rejected.`);
    setRejectDialogOpen(false);
    setSelectedAppointment(null);
  };

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
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/dashboard/admin/appointments/${item.id}`);
            }}
            title={t.common.viewDetails}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {item.status === "pending" && (
            <>
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
            </>
          )}
        </div>
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
        <div className="flex items-center justify-between mt-3">
          <PaymentStatusBadge status={item.paymentStatus} />
          <div className="flex gap-1">
            {item.status === "pending" && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-green-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApprove(item);
                  }}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReject(item);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <PageHeader title={t.appointments.title} />

      <div className="mb-6">
        <SearchInput
          onSearch={setSearchQuery}
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
          <TabsTrigger value="cancelled">{t.appointments.cancelled}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <DataTable
            data={filteredAppointments}
            columns={columns}
            onRowClick={(item) =>
              router.push(`/dashboard/admin/appointments/${item.id}`)
            }
            mobileCard={mobileCard}
          />
        </TabsContent>
      </Tabs>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.appointments.approve}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t.appointments.setDateTime}</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <Input
                  type="date"
                  value={approveDate}
                  onChange={(e) => setApproveDate(e.target.value)}
                />
                <Input
                  type="time"
                  value={approveTime}
                  onChange={(e) => setApproveTime(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setApproveDialogOpen(false)}
            >
              {t.common.cancel}
            </Button>
            <Button onClick={confirmApprove}>{t.appointments.approve}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.appointments.reject}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t.appointments.rejectReason}</Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={t.appointments.rejectReason}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
            >
              {t.common.cancel}
            </Button>
            <Button variant="destructive" onClick={confirmReject}>
              {t.appointments.reject}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
