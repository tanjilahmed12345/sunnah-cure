"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PaymentStatusBadge } from "@/components/common/PaymentStatusBadge";
import { MessageBubble } from "@/components/common/MessageBubble";
import { EmptyState } from "@/components/common/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Appointment, DoctorProfile, HijamaData, RuqyahData, CounselingData, Message, Payment, Conversation } from "@/types";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  User,
  Calendar,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  ClipboardList,
  CreditCard,
  CheckCircle,
  Banknote,
  Loader2,
} from "lucide-react";
import type { PaymentMethod } from "@/types";

interface ApiSuccess<T> {
  success: true;
  data: T;
}

export default function AdminAppointmentDetailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const [status, setStatus] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [assignedDoctor, setAssignedDoctor] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [chatEnabled, setChatEnabled] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Payment management state
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [paymentTransactionId, setPaymentTransactionId] = useState("");
  const [paymentPhone, setPaymentPhone] = useState("");
  const [paymentBankName, setPaymentBankName] = useState("");
  const [paymentAccountNo, setPaymentAccountNo] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [localPaymentStatus, setLocalPaymentStatus] = useState("unpaid");

  const fetchAppointment = useCallback(async () => {
    try {
      const [aptRes, doctorsRes] = await Promise.all([
        apiClient.get<ApiSuccess<Appointment>>(ENDPOINTS.appointments.detail(id)),
        apiClient.get<ApiSuccess<DoctorProfile[]>>(ENDPOINTS.doctors.list),
      ]);
      if (aptRes.success) {
        const apt = aptRes.data;
        setAppointment(apt);
        setStatus(apt.status || "pending");
        setScheduledDate(apt.scheduledDate || "");
        setScheduledTime(apt.scheduledTime || "");
        setAssignedDoctor(apt.doctorId || "");
        setAdminNotes(apt.adminNotes || "");
        setChatEnabled(apt.chatEnabled ?? false);
        setLocalPaymentStatus(apt.paymentStatus || "unpaid");
      }
      if (doctorsRes.success) {
        const list = Array.isArray(doctorsRes.data) ? doctorsRes.data : doctorsRes.data.results ?? [];
        setDoctors(list.filter((d: DoctorProfile) => d.approvalStatus === "approved"));
      }
      // Get or create conversation for this appointment
      try {
        const convRes = await apiClient.post<ApiSuccess<Conversation>>(
          ENDPOINTS.messages.getOrCreateConversation,
          { appointmentId: id }
        );
        if (convRes.success) {
          setConversationId(convRes.data.id);
          const msgsRes = await apiClient.get<ApiSuccess<Message[]>>(
            ENDPOINTS.messages.messages(convRes.data.id)
          );
          if (msgsRes.success) setMessages(msgsRes.data);
        }
      } catch {
        // conversation fetch failed, messaging will be unavailable
      }
    } catch (err) {
      console.error("Failed to fetch appointment:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAppointment();
  }, [fetchAppointment]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (!conversationId) return;
    const interval = setInterval(async () => {
      try {
        const msgsRes = await apiClient.get<ApiSuccess<Message[]>>(
          ENDPOINTS.messages.messages(conversationId)
        );
        if (msgsRes.success) setMessages(msgsRes.data);
      } catch {
        // ignore
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [conversationId]);

  const handleSave = async () => {
    if (!appointment) return;
    setIsSaving(true);
    try {
      // Only send status transition if it actually changed
      const statusChanged = status !== appointment.status;
      if (statusChanged) {
        const actionMap: Record<string, string> = {
          approved: "approve",
          rejected: "reject",
          completed: "complete",
        };
        const action = actionMap[status];
        if (action) {
          await apiClient.patch<ApiSuccess<Appointment>>(
            ENDPOINTS.appointments.update(id),
            {
              action,
              scheduledDate: scheduledDate || undefined,
              scheduledTime: scheduledTime || undefined,
              adminNotes: adminNotes || undefined,
              rejectionReason: status === "rejected" ? adminNotes : undefined,
            }
          );
        }
      } else {
        // Update details without changing status
        await apiClient.patch<ApiSuccess<Appointment>>(
          ENDPOINTS.appointments.update(id),
          {
            action: "update_details",
            scheduledDate: scheduledDate || undefined,
            scheduledTime: scheduledTime || undefined,
            adminNotes: adminNotes || undefined,
            chatEnabled,
          }
        );
      }

      // Assign doctor separately if changed
      if (assignedDoctor && assignedDoctor !== appointment.doctorId) {
        await apiClient.patch<ApiSuccess<Appointment>>(
          ENDPOINTS.appointments.update(id),
          {
            action: "assign_doctor",
            doctorId: assignedDoctor,
          }
        );
      }

      toast.success("Appointment updated successfully.");
      fetchAppointment();
    } catch (err) {
      toast.error("Failed to update appointment.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    setIsSendingMessage(true);
    try {
      // Ensure we have a conversation
      let convId = conversationId;
      if (!convId) {
        const convRes = await apiClient.post<ApiSuccess<Conversation>>(
          ENDPOINTS.messages.getOrCreateConversation,
          { appointmentId: id }
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
      const res = await apiClient.post<ApiSuccess<Message>>(
        ENDPOINTS.messages.send(convId),
        { content: newMessage.trim() }
      );
      if (res.success) {
        setMessages((prev) => [...prev, res.data]);
        setNewMessage("");
      }
    } catch {
      toast.error("Failed to send message.");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!paymentMethod) {
      toast.error("Please select a payment method.");
      return;
    }
    setIsProcessingPayment(true);
    try {
      await apiClient.patch<ApiSuccess<Appointment>>(
        ENDPOINTS.appointments.update(id),
        {
          action: "confirm_payment",
          method: paymentMethod,
          transactionId: paymentTransactionId || undefined,
        }
      );
      setLocalPaymentStatus("paid");
      setShowPaymentForm(false);
      toast.success("Payment recorded successfully.");
      fetchAppointment();
    } catch (err) {
      toast.error("Failed to process payment.");
      console.error(err);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div>
        <PageHeader title={t.appointments.details} />
        <EmptyState title={t.common.noResults} />
      </div>
    );
  }

  const patient = appointment.patient;
  const doctor = appointment.doctor;

  const renderServiceData = () => {
    const data = appointment.serviceData;
    if (!data) return null;

    if (appointment.serviceType === "hijama") {
      const hijama = data as HijamaData;
      return (
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type</span>
            <span className="font-medium capitalize">{hijama.type}</span>
          </div>
          {hijama.numberOfCups && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cups</span>
              <span className="font-medium">{hijama.numberOfCups}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Body Parts</span>
            <span className="font-medium">{hijama.bodyParts.join(", ")}</span>
          </div>
          {hijama.medicalConditions && hijama.medicalConditions.length > 0 && (
            <div>
              <span className="text-muted-foreground">Medical Conditions</span>
              <p className="mt-1 text-sm font-medium">
                {hijama.medicalConditions
                  .map((c) => c === "other" && hijama.medicalConditionOther
                    ? `Other: ${hijama.medicalConditionOther}`
                    : c === "blood_pressure" ? "Blood Pressure"
                    : c === "diabetes" ? "Diabetes"
                    : c
                  )
                  .join(", ")}
              </p>
            </div>
          )}
          {hijama.additionalNotes && (
            <div>
              <span className="text-muted-foreground">Notes</span>
              <p className="mt-1 text-sm">{hijama.additionalNotes}</p>
            </div>
          )}
        </div>
      );
    }

    if (appointment.serviceType === "ruqyah") {
      const ruqyah = data as RuqyahData;
      return (
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Self</span>
            <span className="font-medium">
              {ruqyah.isSelf ? t.common.yes : t.common.no}
            </span>
          </div>
          {!ruqyah.isSelf && ruqyah.patientName && (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Patient Name</span>
                <span className="font-medium">{ruqyah.patientName}</span>
              </div>
              {ruqyah.patientAge && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Age</span>
                  <span className="font-medium">{ruqyah.patientAge}</span>
                </div>
              )}
              {ruqyah.patientGender && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gender</span>
                  <span className="font-medium capitalize">
                    {ruqyah.patientGender}
                  </span>
                </div>
              )}
            </>
          )}
          <div>
            <span className="text-muted-foreground">Problem</span>
            <p className="mt-1 text-sm">{ruqyah.problemDescription}</p>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Symptoms</span>
            <span className="font-medium">{ruqyah.symptoms.join(", ")}</span>
          </div>
        </div>
      );
    }

    if (appointment.serviceType === "counseling") {
      const counseling = data as CounselingData;
      return (
        <div className="space-y-2">
          <div>
            <span className="text-muted-foreground">Reason</span>
            <p className="mt-1 text-sm">{counseling.reason}</p>
          </div>
          {counseling.additionalNotes && (
            <div>
              <span className="text-muted-foreground">Notes</span>
              <p className="mt-1 text-sm">{counseling.additionalNotes}</p>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div>
      <PageHeader
        title={t.appointments.details}
        action={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.common.back}
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Appointment Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{appointment.serviceName}</CardTitle>
                <StatusBadge status={status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">
                    {t.appointments.mode}
                  </span>
                  <p className="font-medium capitalize">{appointment.mode}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    {t.appointments.dateTime}
                  </span>
                  <p className="font-medium">
                    {scheduledDate
                      ? `${formatDate(scheduledDate)} ${scheduledTime || ""}`
                      : "Not Assigned"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    {t.appointments.payment}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <PaymentStatusBadge status={localPaymentStatus} />
                    {appointment.paymentAmount && (
                      <span className="text-sm">
                        {formatCurrency(appointment.paymentAmount)}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    {t.appointments.doctor}
                  </span>
                  <p className="font-medium">
                    {assignedDoctor
                      ? doctors.find((d) => d.id === assignedDoctor)?.user.name || doctor?.user.name || "Not Assigned"
                      : "Not Assigned"}
                  </p>
                </div>
              </div>

              {appointment.rejectionReason && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm font-medium text-red-800 dark:text-red-400">
                    Rejection Reason
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {appointment.rejectionReason}
                  </p>
                </div>
              )}

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Service Details</h4>
                {renderServiceData()}
              </div>
            </CardContent>
          </Card>

          {/* Messages Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {t.messages.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t.messages.noMessages}
                </p>
              ) : (
                <div className="max-h-80 overflow-y-auto mb-4">
                  {messages.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      isOwn={msg.senderRole === "ADMIN"}
                    />
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder={t.messages.typeMessage}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage();
                  }}
                  disabled={isSendingMessage}
                />
                <Button size="icon" onClick={handleSendMessage} disabled={isSendingMessage}>
                  {isSendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Assessment Data */}
          {appointment.assessmentData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Patient Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Step 1 */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Spiritual Background</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Prayer Frequency</span>
                      <p className="font-medium capitalize">{appointment.assessmentData.step1.prayerFrequency.replace("_", " ")}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Quran Reading</span>
                      <p className="font-medium capitalize">{appointment.assessmentData.step1.quranFrequency}</p>
                    </div>
                  </div>
                  {appointment.assessmentData.step1.spiritualPractices.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {appointment.assessmentData.step1.spiritualPractices.map((p) => (
                        <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Separator />
                {/* Step 2 */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Physical Symptoms</h4>
                  {appointment.assessmentData.step2.physicalSymptoms.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {appointment.assessmentData.step2.physicalSymptoms.map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  )}
                  {appointment.assessmentData.step2.elaboration && (
                    <p className="text-sm text-muted-foreground mt-2">{appointment.assessmentData.step2.elaboration}</p>
                  )}
                </div>
                <Separator />
                {/* Step 3 */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Emotional Symptoms</h4>
                  {appointment.assessmentData.step3.emotionalSymptoms.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {appointment.assessmentData.step3.emotionalSymptoms.map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  )}
                  {appointment.assessmentData.step3.emotionalDetails && (
                    <p className="text-sm text-muted-foreground mt-2">{appointment.assessmentData.step3.emotionalDetails}</p>
                  )}
                </div>
                <Separator />
                {/* Step 4 */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Spiritual Symptoms</h4>
                  {appointment.assessmentData.step4.spiritualSymptoms.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {appointment.assessmentData.step4.spiritualSymptoms.map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  )}
                  {appointment.assessmentData.step4.additionalNotes && (
                    <p className="text-sm text-muted-foreground mt-2">{appointment.assessmentData.step4.additionalNotes}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Info / Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                {t.payment.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Existing payment record */}
              {payment && localPaymentStatus === "paid" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">
                      {t.payment.amount}
                    </span>
                    <p className="font-medium">
                      {formatCurrency(payment.amountBDT)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Method
                    </span>
                    <p className="font-medium capitalize">{payment.method}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Transaction ID
                    </span>
                    <p className="font-medium font-mono text-sm">
                      {payment.transactionId || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Status
                    </span>
                    <p className="font-medium capitalize">{payment.status}</p>
                  </div>
                </div>
              )}

              {/* Payment just confirmed by admin (no prior payment record) */}
              {!payment && localPaymentStatus === "paid" && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-300">Payment Recorded</p>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      {paymentMethod && <span className="capitalize">{paymentMethod}</span>}
                      {appointment.paymentAmount && ` — ${formatCurrency(appointment.paymentAmount)}`}
                    </p>
                  </div>
                </div>
              )}

              {/* Unpaid — show Mark as Paid button or form */}
              {localPaymentStatus === "unpaid" && !showPaymentForm && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PaymentStatusBadge status="unpaid" />
                      {appointment.paymentAmount && (
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(appointment.paymentAmount)}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowPaymentForm(true)}
                    className="w-full"
                    variant="default"
                  >
                    <Banknote className="mr-2 h-4 w-4" />
                    Mark as Paid
                  </Button>
                </div>
              )}

              {/* Payment form */}
              {localPaymentStatus === "unpaid" && showPaymentForm && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Payment Method</Label>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={(v) => {
                        setPaymentMethod(v as PaymentMethod);
                        setPaymentTransactionId("");
                        setPaymentPhone("");
                        setPaymentBankName("");
                        setPaymentAccountNo("");
                      }}
                      className="grid grid-cols-2 gap-2 mt-2"
                    >
                      {[
                        { value: "cash", label: "Cash" },
                        { value: "bkash", label: "bKash" },
                        { value: "nagad", label: "Nagad" },
                        { value: "rocket", label: "Rocket" },
                        { value: "bank", label: "Bank Transfer" },
                        { value: "card", label: "Card" },
                      ].map((m) => (
                        <div key={m.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={m.value} id={`pm-${m.value}`} />
                          <Label htmlFor={`pm-${m.value}`} className="font-normal cursor-pointer text-sm">
                            {m.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Method-specific fields */}
                  {(paymentMethod === "bkash" || paymentMethod === "nagad" || paymentMethod === "rocket") && (
                    <div className="space-y-3 rounded-lg border p-3">
                      <div>
                        <Label className="text-sm">Phone Number</Label>
                        <Input
                          value={paymentPhone}
                          onChange={(e) => setPaymentPhone(e.target.value)}
                          placeholder="01XXXXXXXXX"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Transaction ID</Label>
                        <Input
                          value={paymentTransactionId}
                          onChange={(e) => setPaymentTransactionId(e.target.value)}
                          placeholder="e.g. TXN12345678"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === "bank" && (
                    <div className="space-y-3 rounded-lg border p-3">
                      <div>
                        <Label className="text-sm">Bank Name</Label>
                        <Input
                          value={paymentBankName}
                          onChange={(e) => setPaymentBankName(e.target.value)}
                          placeholder="e.g. Dutch Bangla Bank"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Account / Reference No.</Label>
                        <Input
                          value={paymentAccountNo}
                          onChange={(e) => setPaymentAccountNo(e.target.value)}
                          placeholder="Account or reference number"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Transaction ID</Label>
                        <Input
                          value={paymentTransactionId}
                          onChange={(e) => setPaymentTransactionId(e.target.value)}
                          placeholder="Optional"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === "card" && (
                    <div className="space-y-3 rounded-lg border p-3">
                      <div>
                        <Label className="text-sm">Transaction / Approval ID</Label>
                        <Input
                          value={paymentTransactionId}
                          onChange={(e) => setPaymentTransactionId(e.target.value)}
                          placeholder="Card transaction reference"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className="text-sm">Notes (optional)</Label>
                    <Textarea
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      placeholder="Any additional notes about this payment..."
                      className="mt-1"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      onClick={() => setShowPaymentForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleConfirmPayment}
                      disabled={!paymentMethod || isProcessingPayment}
                      className="flex-1"
                    >
                      {isProcessingPayment ? "Processing..." : "Confirm Payment"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Patient Info */}
          {patient && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Patient Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{patient.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Age: {patient.age} | Gender:{" "}
                    <span className="capitalize">{patient.gender}</span>
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Admin Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Change Status */}
              <div>
                <Label>{t.appointments.status}</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">
                      {t.status.pending}
                    </SelectItem>
                    <SelectItem value="approved">
                      {t.status.approved}
                    </SelectItem>
                    <SelectItem value="completed">
                      {t.status.completed}
                    </SelectItem>
                    <SelectItem value="cancelled">
                      {t.status.cancelled}
                    </SelectItem>
                    <SelectItem value="rejected">
                      {t.status.rejected}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Set Date/Time */}
              <div>
                <Label>{t.appointments.setDateTime}</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <Input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                  <Input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
              </div>

              {/* Assign Doctor */}
              <div>
                <Label>{t.appointments.assignDoctor}</Label>
                <Select
                  value={assignedDoctor}
                  onValueChange={setAssignedDoctor}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={t.appointments.assignDoctor} />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id}>
                        {doc.user.name} ({doc.specialization.replace("_", " ")})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Chat Toggle */}
              {assignedDoctor && (
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label className="cursor-pointer">Enable Chat</Label>
                    <p className="text-xs text-muted-foreground">
                      Allow assigned staff to chat with this patient
                    </p>
                  </div>
                  <Switch
                    checked={chatEnabled}
                    onCheckedChange={setChatEnabled}
                  />
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <Label>{t.appointments.internalNotes}</Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder={t.appointments.internalNotes}
                  className="mt-1"
                  rows={4}
                />
              </div>

              <Button className="w-full" onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : t.common.save}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
