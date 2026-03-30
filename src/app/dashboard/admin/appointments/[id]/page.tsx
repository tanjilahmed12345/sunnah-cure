"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { toast } from "sonner";
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
import { mockAppointments } from "@/lib/mock/data/appointments";
import { mockUsers } from "@/lib/mock/data/users";
import { mockDoctors } from "@/lib/mock/data/doctors";
import { mockMessages } from "@/lib/mock/data/messages";
import { mockPayments } from "@/lib/mock/data/payments";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Appointment, HijamaData, RuqyahData, CounselingData } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  User,
  Calendar,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  ClipboardList,
} from "lucide-react";

export default function AdminAppointmentDetailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const appointment = mockAppointments.find((a) => a.id === id);
  const patient = appointment
    ? mockUsers.find((u) => u.id === appointment.patientId)
    : null;
  const approvedDoctors = mockDoctors.filter(
    (d) => d.approvalStatus === "approved"
  );
  const initialMessages = mockMessages.filter((m) => m.conversationId === "conv-1");
  const [messages, setMessages] = useState(initialMessages);
  const payment = appointment
    ? mockPayments.find((p) => p.appointmentId === appointment.id)
    : null;

  const [status, setStatus] = useState(appointment?.status || "pending");
  const [scheduledDate, setScheduledDate] = useState(
    appointment?.scheduledDate || ""
  );
  const [scheduledTime, setScheduledTime] = useState(
    appointment?.scheduledTime || ""
  );
  const [assignedDoctor, setAssignedDoctor] = useState(
    appointment?.doctorId || ""
  );
  const [adminNotes, setAdminNotes] = useState(appointment?.adminNotes || "");
  const [newMessage, setNewMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Appointment updated successfully.");
    }, 500);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const msg = {
      id: `msg-${Date.now()}`,
      conversationId: "conv-1",
      senderId: "admin-1",
      senderName: "Admin",
      senderRole: "ADMIN" as const,
      content: newMessage.trim(),
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, msg]);
    setNewMessage("");
  };

  if (!appointment) {
    return (
      <div>
        <PageHeader title={t.appointments.details} />
        <EmptyState title={t.common.noResults} />
      </div>
    );
  }

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
                <StatusBadge status={appointment.status} />
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
                    {appointment.scheduledDate
                      ? `${formatDate(appointment.scheduledDate)} ${appointment.scheduledTime || ""}`
                      : t.appointments.pendingDate}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    {t.appointments.payment}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <PaymentStatusBadge status={appointment.paymentStatus} />
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
                    {appointment.doctorId
                      ? mockDoctors.find((d) => d.id === appointment.doctorId)
                          ?.user.name || "Unknown"
                      : "Not assigned"}
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
                />
                <Button size="icon" onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
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

          {/* Payment Info */}
          {payment && (
            <Card>
              <CardHeader>
                <CardTitle>{t.payment.title}</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          )}
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
                    {approvedDoctors.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id}>
                        {doc.user.name} ({doc.specialization.replace("_", " ")})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
