"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
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
import { mockAppointments } from "@/lib/mock/data/appointments";
import { mockUsers } from "@/lib/mock/data/users";
import { mockDoctors } from "@/lib/mock/data/doctors";
import { mockMessages } from "@/lib/mock/data/messages";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { HijamaData, RuqyahData, CounselingData } from "@/types";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Calendar,
  Send,
  MessageSquare,
} from "lucide-react";

const CURRENT_DOCTOR_USER_ID = "user-doc-1";

export default function DoctorAppointmentDetailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const appointment = mockAppointments.find((a) => a.id === id);
  const patient = appointment
    ? mockUsers.find((u) => u.id === appointment.patientId)
    : null;
  const messages = mockMessages.filter((m) => m.conversationId === "conv-1");

  const [doctorNotes, setDoctorNotes] = useState("");
  const [newMessage, setNewMessage] = useState("");

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
        {/* Main Content */}
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
                    {t.appointments.patient}
                  </span>
                  <p className="font-medium">
                    {patient?.name || "Unknown"}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Service Details</h4>
                {renderServiceData()}
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
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
                      isOwn={msg.senderId === CURRENT_DOCTOR_USER_ID}
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
                    if (e.key === "Enter" && newMessage.trim()) {
                      setNewMessage("");
                    }
                  }}
                />
                <Button
                  size="icon"
                  onClick={() => {
                    if (newMessage.trim()) setNewMessage("");
                  }}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
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

          {/* Doctor Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Doctor Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{t.appointments.internalNotes}</Label>
                <Textarea
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder="Add your notes about this appointment..."
                  className="mt-1"
                  rows={6}
                />
              </div>
              <Button className="w-full">{t.common.save}</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
