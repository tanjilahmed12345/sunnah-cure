"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/i18n/useTranslation";
import { mockAppointments } from "@/lib/mock/data/appointments";
import { mockMessages } from "@/lib/mock/data/messages";
import { mockCurrentUser } from "@/lib/mock/data/users";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PaymentStatusBadge } from "@/components/common/PaymentStatusBadge";
import { MessageBubble } from "@/components/common/MessageBubble";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PageHeader } from "@/components/common/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  CreditCard,
  MapPin,
  Send,
  User,
  X,
} from "lucide-react";
import type { HijamaData, RuqyahData, CounselingData } from "@/types";

export default function AppointmentDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [message, setMessage] = useState("");

  const appointment = mockAppointments.find((a) => a.id === params.id);

  if (!appointment) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t.common.noResults}</p>
      </div>
    );
  }

  const appointmentMessages = mockMessages.filter(
    (m) => m.conversationId === "conv-1"
  );

  const canPay =
    appointment.mode === "online" && appointment.paymentStatus === "unpaid";
  const canCancel =
    appointment.status === "pending" || appointment.status === "approved";

  function handleCancel() {
    toast.success(t.appointments.cancelAppointment);
    router.push("/dashboard/appointments");
  }

  function handleSendMessage() {
    if (!message.trim()) return;
    toast.success(t.messages.send);
    setMessage("");
  }

  function renderServiceData() {
    if (!appointment || !appointment.serviceData) return null;

    if (appointment.serviceType === "hijama") {
      const data = appointment.serviceData as HijamaData;
      return (
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {t.booking.hijama.typeLabel}
            </span>
            <span className="font-medium capitalize">{data.type}</span>
          </div>
          {data.numberOfCups && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t.booking.hijama.cupsLabel}
              </span>
              <span className="font-medium">{data.numberOfCups}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {t.booking.hijama.bodyPartsLabel}
            </span>
            <span className="font-medium">{data.bodyParts.join(", ")}</span>
          </div>
          {data.additionalNotes && (
            <div>
              <span className="text-muted-foreground text-sm">
                {t.booking.hijama.notesLabel}
              </span>
              <p className="text-sm mt-1">{data.additionalNotes}</p>
            </div>
          )}
        </div>
      );
    }

    if (appointment.serviceType === "ruqyah") {
      const data = appointment.serviceData as RuqyahData;
      return (
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {t.booking.ruqyah.selfPatient}
            </span>
            <span className="font-medium">
              {data.isSelf ? t.common.yes : t.common.no}
            </span>
          </div>
          {!data.isSelf && data.patientName && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t.booking.ruqyah.patientName}
              </span>
              <span className="font-medium">{data.patientName}</span>
            </div>
          )}
          <div>
            <span className="text-muted-foreground text-sm">
              {t.booking.ruqyah.problemLabel}
            </span>
            <p className="text-sm mt-1">{data.problemDescription}</p>
          </div>
          {data.symptoms.length > 0 && (
            <div>
              <span className="text-muted-foreground text-sm">
                {t.booking.ruqyah.symptomsLabel}
              </span>
              <p className="text-sm mt-1">{data.symptoms.join(", ")}</p>
            </div>
          )}
        </div>
      );
    }

    if (appointment.serviceType === "counseling") {
      const data = appointment.serviceData as CounselingData;
      return (
        <div className="space-y-2">
          <div>
            <span className="text-muted-foreground text-sm">
              {t.booking.counseling.reasonLabel}
            </span>
            <p className="text-sm mt-1">{data.reason}</p>
          </div>
          {data.additionalNotes && (
            <div>
              <span className="text-muted-foreground text-sm">
                {t.booking.counseling.notesLabel}
              </span>
              <p className="text-sm mt-1">{data.additionalNotes}</p>
            </div>
          )}
        </div>
      );
    }

    return null;
  }

  return (
    <div>
      <PageHeader
        title={t.appointments.details}
        action={
          <Button variant="outline" onClick={() => router.back()}>
            {t.common.back}
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle>{appointment.serviceName}</CardTitle>
                <StatusBadge status={appointment.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {appointment.scheduledDate || t.appointments.pendingDate}
                  </span>
                </div>
                {appointment.scheduledTime && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{appointment.scheduledTime}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <StatusBadge status={appointment.mode} />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <PaymentStatusBadge status={appointment.paymentStatus} />
                  {appointment.paymentAmount && (
                    <span className="text-muted-foreground">
                      ({appointment.paymentAmount} {t.common.currency})
                    </span>
                  )}
                </div>
                {appointment.doctorId && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{t.appointments.doctor}: {appointment.doctorId}</span>
                  </div>
                )}
              </div>

              {appointment.rejectionReason && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {appointment.rejectionReason}
                </div>
              )}

              <Separator />

              {/* Service-specific data */}
              {renderServiceData()}
            </CardContent>
          </Card>

          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t.messages.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-80 overflow-y-auto mb-4">
                {appointmentMessages.length === 0 ? (
                  <p className="text-center py-4 text-sm text-muted-foreground">
                    {t.messages.noMessages}
                  </p>
                ) : (
                  appointmentMessages.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      isOwn={msg.senderId === mockCurrentUser.id}
                    />
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t.messages.typeMessage}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage();
                  }}
                />
                <Button size="icon" onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Actions */}
        <div className="space-y-4">
          {canPay && (
            <Button asChild className="w-full" size="lg">
              <Link
                href={`/dashboard/payment/${appointment.id}`}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {t.appointments.payNow}
              </Link>
            </Button>
          )}
          {canCancel && (
            <Button
              variant="destructive"
              className="w-full"
              size="lg"
              onClick={() => setCancelOpen(true)}
            >
              <X className="mr-2 h-4 w-4" />
              {t.appointments.cancelAppointment}
            </Button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title={t.appointments.cancelAppointment}
        description={t.appointments.cancelConfirm}
        onConfirm={handleCancel}
        variant="destructive"
      />
    </div>
  );
}
