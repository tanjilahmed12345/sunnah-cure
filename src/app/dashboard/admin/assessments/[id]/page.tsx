"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockAssessments } from "@/lib/mock/data/assessments";
import { mockDoctors } from "@/lib/mock/data/doctors";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, CalendarPlus } from "lucide-react";

export default function AdminAssessmentDetailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const assessment = mockAssessments.find((a) => a.id === id);
  const approvedDoctors = mockDoctors.filter(
    (d) => d.approvalStatus === "approved"
  );

  const [status, setStatus] = useState(assessment?.status || "pending");
  const [assignedDoctor, setAssignedDoctor] = useState(
    assessment?.assignedDoctorId || ""
  );
  const [adminNotes, setAdminNotes] = useState(assessment?.adminNotes || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Assessment updated successfully.");
    }, 500);
  };

  if (!assessment) {
    return (
      <div>
        <PageHeader title={t.assessment.title} />
        <EmptyState title={t.common.noResults} />
      </div>
    );
  }

  const { formData } = assessment;

  return (
    <div>
      <PageHeader
        title={`${t.assessment.title} - ${assessment.patientName}`}
        action={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.common.back}
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assessment Steps */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status bar */}
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <StatusBadge status={assessment.status} />
                <span className="text-sm text-muted-foreground">
                  Submitted: {formatDate(assessment.createdAt)}
                </span>
              </div>
              {assessment.assignedDoctorName && (
                <span className="text-sm">
                  {t.appointments.doctor}: {assessment.assignedDoctorName}
                </span>
              )}
            </CardContent>
          </Card>

          {/* Step 1: Spiritual Background */}
          <Card>
            <CardHeader>
              <CardTitle>{t.assessment.step1.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">
                    {t.assessment.step1.prayerLabel}
                  </span>
                  <p className="font-medium capitalize">
                    {formData.step1.prayerFrequency.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    {t.assessment.step1.quranLabel}
                  </span>
                  <p className="font-medium capitalize">
                    {formData.step1.quranFrequency}
                  </p>
                </div>
              </div>
              {formData.step1.spiritualPractices &&
                formData.step1.spiritualPractices.length > 0 && (
                  <div>
                    <span className="text-sm text-muted-foreground">
                      {t.assessment.step1.practicesLabel}
                    </span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {formData.step1.spiritualPractices.map((practice) => (
                        <Badge key={practice} variant="secondary">
                          {practice}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              {formData.step1.confidentialNotes && (
                <div>
                  <span className="text-sm text-muted-foreground">
                    {t.assessment.step1.sinsLabel}
                  </span>
                  <p className="text-sm mt-1">
                    {formData.step1.confidentialNotes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Physical Symptoms */}
          <Card>
            <CardHeader>
              <CardTitle>{t.assessment.step2.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.step2.physicalSymptoms &&
                formData.step2.physicalSymptoms.length > 0 && (
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Symptoms
                    </span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {formData.step2.physicalSymptoms.map((symptom) => (
                        <Badge key={symptom} variant="secondary">
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              {formData.step2.elaboration && (
                <div>
                  <span className="text-sm text-muted-foreground">
                    {t.assessment.step2.elaborateLabel}
                  </span>
                  <p className="text-sm mt-1">{formData.step2.elaboration}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 3: Emotional/Psychological */}
          <Card>
            <CardHeader>
              <CardTitle>{t.assessment.step3.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.step3.emotionalSymptoms &&
                formData.step3.emotionalSymptoms.length > 0 && (
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Symptoms
                    </span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {formData.step3.emotionalSymptoms.map((symptom) => (
                        <Badge key={symptom} variant="secondary">
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              {formData.step3.emotionalDetails && (
                <div>
                  <span className="text-sm text-muted-foreground">
                    {t.assessment.step3.detailsLabel}
                  </span>
                  <p className="text-sm mt-1">
                    {formData.step3.emotionalDetails}
                  </p>
                </div>
              )}
              {formData.step3.previousDiagnosis && (
                <div>
                  <span className="text-sm text-muted-foreground">
                    {t.assessment.step3.diagnosisLabel}
                  </span>
                  <p className="text-sm mt-1">
                    {formData.step3.previousDiagnosis}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 4: Spiritual Symptoms */}
          <Card>
            <CardHeader>
              <CardTitle>{t.assessment.step4.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.step4.spiritualSymptoms &&
                formData.step4.spiritualSymptoms.length > 0 && (
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Symptoms
                    </span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {formData.step4.spiritualSymptoms.map((symptom) => (
                        <Badge key={symptom} variant="secondary">
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              {formData.step4.unusualBehavior && (
                <div>
                  <span className="text-sm text-muted-foreground">
                    {t.assessment.step4.behaviorLabel}
                  </span>
                  <p className="text-sm mt-1">
                    {formData.step4.unusualBehavior}
                  </p>
                </div>
              )}
              {formData.step4.familyHistory && (
                <div>
                  <span className="text-sm text-muted-foreground">
                    {t.assessment.step4.familyLabel}
                  </span>
                  <p className="text-sm mt-1">
                    {formData.step4.familyHistory}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">
                    {t.assessment.step4.modeLabel}
                  </span>
                  <p className="font-medium capitalize">
                    {formData.step4.preferredMode}
                  </p>
                </div>
                {formData.step4.contactTime && (
                  <div>
                    <span className="text-sm text-muted-foreground">
                      {t.assessment.step4.contactTimeLabel}
                    </span>
                    <p className="font-medium">
                      {formData.step4.contactTime}
                    </p>
                  </div>
                )}
              </div>
              {formData.step4.additionalNotes && (
                <div>
                  <span className="text-sm text-muted-foreground">
                    {t.assessment.step4.additionalLabel}
                  </span>
                  <p className="text-sm mt-1">
                    {formData.step4.additionalNotes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Admin Actions */}
        <div className="space-y-6">
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
                    <SelectItem value="pending">{t.status.pending}</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                  </SelectContent>
                </Select>
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

              <Separator />

              {/* Create Appointment from Assessment */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  router.push(
                    `/dashboard/admin/appointments?fromAssessment=${assessment.id}`
                  )
                }
              >
                <CalendarPlus className="h-4 w-4 mr-2" />
                Create Appointment from Assessment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
