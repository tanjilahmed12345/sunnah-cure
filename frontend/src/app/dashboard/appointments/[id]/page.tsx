"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/i18n/useTranslation";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
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
  Loader2,
  MapPin,
  Send,
  User,
  X,
} from "lucide-react";
import type { Appointment, Message } from "@/types";
import type { HijamaData, RuqyahData, CounselingData } from "@/types";

interface ApiSuccess<T> {
  success: true;
  data: T;
}

interface Conversation {
  id: string;
  appointmentId?: string;
  messages?: Message[];
}

export default function AppointmentDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [message, setMessage] = useState("");

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [appointmentMessages, setAppointmentMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchData = useCallback(async () => {
    if (!params.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const appointmentRes = await apiClient.get<ApiSuccess<Appointment>>(
        ENDPOINTS.appointments.detail(params.id as string)
      );
      setAppointment(appointmentRes.data);

      // Get or create conversation for this appointment
      try {
        const convRes = await apiClient.post<ApiSuccess<Conversation>>(
          ENDPOINTS.messages.getOrCreateConversation,
          { appointmentId: params.id }
        );
        if (convRes.success) {
          setConversationId(convRes.data.id);
          const msgRes = await apiClient.get<ApiSuccess<Message[]>>(
            ENDPOINTS.messages.messages(convRes.data.id)
          );
          if (msgRes.success) setAppointmentMessages(msgRes.data);
        }
      } catch {
        // conversation fetch failed
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load appointment");
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (!conversationId) return;
    const interval = setInterval(async () => {
      try {
        const msgRes = await apiClient.get<ApiSuccess<Message[]>>(
          ENDPOINTS.messages.messages(conversationId)
        );
        if (msgRes.success) setAppointmentMessages(msgRes.data);
      } catch {
        // ignore
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [conversationId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{error || t.common.noResults}</p>
      </div>
    );
  }

  const canPay = appointment.paymentStatus === "unpaid";
  const canCancel =
    appointment.status === "pending" || appointment.status === "approved";

  async function handleCancel() {
    setIsCancelling(true);
    try {
      await apiClient.post(ENDPOINTS.appointments.cancel(params.id as string));
      toast.success(t.appointments.cancelAppointment);
      router.push("/dashboard/appointments");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel appointment");
    } finally {
      setIsCancelling(false);
    }
  }

  async function handleSendMessage() {
    if (!message.trim()) return;
    setIsSending(true);
    try {
      // Ensure we have a conversation
      let convId = conversationId;
      if (!convId) {
        const convRes = await apiClient.post<ApiSuccess<Conversation>>(
          ENDPOINTS.messages.getOrCreateConversation,
          { appointmentId: params.id }
        );
        if (convRes.success) {
          convId = convRes.data.id;
          setConversationId(convId);
        }
      }
      if (!convId) {
        toast.error("Could not create conversation.");
        return;
      }
      await apiClient.post(ENDPOINTS.messages.send(convId), {
        content: message.trim(),
      });
      toast.success(t.messages.send);
      setMessage("");
      // Refresh messages
      const msgRes = await apiClient.get<ApiSuccess<Message[]>>(
        ENDPOINTS.messages.messages(convId)
      );
      setAppointmentMessages(msgRes.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsSending(false);
    }
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

              {appointment.adminNotes && (appointment.status === "approved" || appointment.status === "completed") && (
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                  <p className="text-sm font-medium text-primary mb-1">
                    {t.appointments.noteFromAdmin}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {appointment.adminNotes}
                  </p>
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
                      isOwn={msg.senderId === user?.id}
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
                  disabled={isSending}
                />
                <Button size="icon" onClick={handleSendMessage} disabled={isSending}>
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
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
              disabled={isCancelling}
            >
              {isCancelling ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <X className="mr-2 h-4 w-4" />
              )}
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
