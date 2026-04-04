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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { mockAssessments } from "@/lib/mock/data/assessments";
import { mockDoctors } from "@/lib/mock/data/doctors";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, CalendarPlus, Pencil, Save, X } from "lucide-react";
import type { AssessmentFormData } from "@/types";

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
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<AssessmentFormData | null>(
    assessment ? { ...assessment.formData } : null
  );

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Assessment updated successfully.");
    }, 500);
  };

  const handleSaveFormData = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      toast.success("Assessment form data updated successfully.");
    }, 500);
  };

  if (!assessment || !formData) {
    return (
      <div>
        <PageHeader title={t.assessment.title} />
        <EmptyState title={t.common.noResults} />
      </div>
    );
  }

  const spiritualPracticeOptions = [
    "Regular Dhikr",
    "Daily Dua",
    "Tahajjud Prayer",
    "Charity/Sadaqah",
    "Fasting",
    "None",
  ];

  const physicalSymptomOptions = [
    "Frequent headaches",
    "Unexplained body pain",
    "Sleep disturbances/Insomnia",
    "Changes in appetite",
    "Chronic fatigue",
    "Tightness in chest",
    "Skin issues",
  ];

  const emotionalSymptomOptions = [
    "Persistent anxiety",
    "Depression/sadness",
    "Sudden anger outbursts",
    "Unexplained fearfulness",
    "Frequent nightmares",
    "Social withdrawal",
    "Difficulty concentrating",
    "Mood swings",
  ];

  const spiritualSymptomOptions = [
    "Hearing whispers/voices",
    "Seeing shadows/figures",
    "Feeling unseen presence",
    "Aversion when hearing Quran",
    "Unexplained marks on body",
    "Feeling of being watched",
  ];

  function toggleArrayItem(arr: string[], item: string): string[] {
    return arr.includes(item)
      ? arr.filter((v) => v !== item)
      : [...arr, item];
  }

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
              <div className="flex items-center gap-2">
                {assessment.assignedDoctorName && (
                  <span className="text-sm">
                    {t.appointments.doctor}: {assessment.assignedDoctorName}
                  </span>
                )}
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1.5" />
                    Edit Form
                  </Button>
                ) : (
                  <div className="flex gap-1.5">
                    <Button
                      size="sm"
                      onClick={handleSaveFormData}
                      disabled={isSaving}
                    >
                      <Save className="h-3.5 w-3.5 mr-1.5" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData({ ...assessment.formData });
                        setIsEditing(false);
                      }}
                    >
                      <X className="h-3.5 w-3.5 mr-1.5" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
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
                  <Label className="text-sm text-muted-foreground">
                    {t.assessment.step1.prayerLabel}
                  </Label>
                  {isEditing ? (
                    <Select
                      value={formData.step1.prayerFrequency}
                      onValueChange={(v) =>
                        setFormData({
                          ...formData,
                          step1: {
                            ...formData.step1,
                            prayerFrequency: v as typeof formData.step1.prayerFrequency,
                          },
                        })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5_times">5 Times</SelectItem>
                        <SelectItem value="sometimes">Sometimes</SelectItem>
                        <SelectItem value="rarely">Rarely</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="font-medium capitalize mt-1">
                      {formData.step1.prayerFrequency.replace("_", " ")}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    {t.assessment.step1.quranLabel}
                  </Label>
                  {isEditing ? (
                    <Select
                      value={formData.step1.quranFrequency}
                      onValueChange={(v) =>
                        setFormData({
                          ...formData,
                          step1: {
                            ...formData.step1,
                            quranFrequency: v as typeof formData.step1.quranFrequency,
                          },
                        })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="rarely">Rarely</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="font-medium capitalize mt-1">
                      {formData.step1.quranFrequency}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">
                  {t.assessment.step1.practicesLabel}
                </Label>
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {spiritualPracticeOptions.map((practice) => (
                      <div key={practice} className="flex items-center space-x-2">
                        <Checkbox
                          id={`sp-${practice}`}
                          checked={formData.step1.spiritualPractices.includes(practice)}
                          onCheckedChange={() =>
                            setFormData({
                              ...formData,
                              step1: {
                                ...formData.step1,
                                spiritualPractices: toggleArrayItem(
                                  formData.step1.spiritualPractices,
                                  practice
                                ),
                              },
                            })
                          }
                        />
                        <Label htmlFor={`sp-${practice}`} className="font-normal cursor-pointer text-sm">
                          {practice}
                        </Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.step1.spiritualPractices.map((practice) => (
                      <span key={practice} className="inline-flex items-center rounded-md bg-secondary px-2.5 py-0.5 text-xs font-medium">
                        {practice}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">
                  {t.assessment.step1.sinsLabel}
                </Label>
                {isEditing ? (
                  <Textarea
                    value={formData.step1.confidentialNotes || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        step1: { ...formData.step1, confidentialNotes: e.target.value },
                      })
                    }
                    className="mt-1"
                    rows={2}
                  />
                ) : (
                  <p className="text-sm mt-1">
                    {formData.step1.confidentialNotes || "—"}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Physical Symptoms */}
          <Card>
            <CardHeader>
              <CardTitle>{t.assessment.step2.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Symptoms</Label>
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {physicalSymptomOptions.map((symptom) => (
                      <div key={symptom} className="flex items-center space-x-2">
                        <Checkbox
                          id={`ps-${symptom}`}
                          checked={formData.step2.physicalSymptoms.includes(symptom)}
                          onCheckedChange={() =>
                            setFormData({
                              ...formData,
                              step2: {
                                ...formData.step2,
                                physicalSymptoms: toggleArrayItem(
                                  formData.step2.physicalSymptoms,
                                  symptom
                                ),
                              },
                            })
                          }
                        />
                        <Label htmlFor={`ps-${symptom}`} className="font-normal cursor-pointer text-sm">
                          {symptom}
                        </Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.step2.physicalSymptoms.map((symptom) => (
                      <span key={symptom} className="inline-flex items-center rounded-md bg-secondary px-2.5 py-0.5 text-xs font-medium">
                        {symptom}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">
                  {t.assessment.step2.elaborateLabel}
                </Label>
                {isEditing ? (
                  <Textarea
                    value={formData.step2.elaboration || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        step2: { ...formData.step2, elaboration: e.target.value },
                      })
                    }
                    className="mt-1"
                    rows={2}
                  />
                ) : (
                  <p className="text-sm mt-1">{formData.step2.elaboration || "—"}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Emotional/Psychological */}
          <Card>
            <CardHeader>
              <CardTitle>{t.assessment.step3.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Symptoms</Label>
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {emotionalSymptomOptions.map((symptom) => (
                      <div key={symptom} className="flex items-center space-x-2">
                        <Checkbox
                          id={`es-${symptom}`}
                          checked={formData.step3.emotionalSymptoms.includes(symptom)}
                          onCheckedChange={() =>
                            setFormData({
                              ...formData,
                              step3: {
                                ...formData.step3,
                                emotionalSymptoms: toggleArrayItem(
                                  formData.step3.emotionalSymptoms,
                                  symptom
                                ),
                              },
                            })
                          }
                        />
                        <Label htmlFor={`es-${symptom}`} className="font-normal cursor-pointer text-sm">
                          {symptom}
                        </Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.step3.emotionalSymptoms.map((symptom) => (
                      <span key={symptom} className="inline-flex items-center rounded-md bg-secondary px-2.5 py-0.5 text-xs font-medium">
                        {symptom}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">
                  {t.assessment.step3.detailsLabel}
                </Label>
                {isEditing ? (
                  <Textarea
                    value={formData.step3.emotionalDetails || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        step3: { ...formData.step3, emotionalDetails: e.target.value },
                      })
                    }
                    className="mt-1"
                    rows={2}
                  />
                ) : (
                  <p className="text-sm mt-1">{formData.step3.emotionalDetails || "—"}</p>
                )}
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">
                  {t.assessment.step3.diagnosisLabel}
                </Label>
                {isEditing ? (
                  <Input
                    value={formData.step3.previousDiagnosis || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        step3: { ...formData.step3, previousDiagnosis: e.target.value },
                      })
                    }
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm mt-1">{formData.step3.previousDiagnosis || "—"}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Step 4: Spiritual Symptoms & Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>{t.assessment.step4.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Symptoms</Label>
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {spiritualSymptomOptions.map((symptom) => (
                      <div key={symptom} className="flex items-center space-x-2">
                        <Checkbox
                          id={`ss-${symptom}`}
                          checked={formData.step4.spiritualSymptoms.includes(symptom)}
                          onCheckedChange={() =>
                            setFormData({
                              ...formData,
                              step4: {
                                ...formData.step4,
                                spiritualSymptoms: toggleArrayItem(
                                  formData.step4.spiritualSymptoms,
                                  symptom
                                ),
                              },
                            })
                          }
                        />
                        <Label htmlFor={`ss-${symptom}`} className="font-normal cursor-pointer text-sm">
                          {symptom}
                        </Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.step4.spiritualSymptoms.map((symptom) => (
                      <span key={symptom} className="inline-flex items-center rounded-md bg-secondary px-2.5 py-0.5 text-xs font-medium">
                        {symptom}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">
                  {t.assessment.step4.behaviorLabel}
                </Label>
                {isEditing ? (
                  <Textarea
                    value={formData.step4.unusualBehavior || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        step4: { ...formData.step4, unusualBehavior: e.target.value },
                      })
                    }
                    className="mt-1"
                    rows={2}
                  />
                ) : (
                  <p className="text-sm mt-1">{formData.step4.unusualBehavior || "—"}</p>
                )}
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">
                  {t.assessment.step4.familyLabel}
                </Label>
                {isEditing ? (
                  <Textarea
                    value={formData.step4.familyHistory || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        step4: { ...formData.step4, familyHistory: e.target.value },
                      })
                    }
                    className="mt-1"
                    rows={2}
                  />
                ) : (
                  <p className="text-sm mt-1">{formData.step4.familyHistory || "—"}</p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">
                    {t.assessment.step4.modeLabel}
                  </Label>
                  {isEditing ? (
                    <RadioGroup
                      value={formData.step4.preferredMode}
                      onValueChange={(v) =>
                        setFormData({
                          ...formData,
                          step4: {
                            ...formData.step4,
                            preferredMode: v as "online" | "offline",
                          },
                        })
                      }
                      className="flex gap-4 mt-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="online" id="edit-online" />
                        <Label htmlFor="edit-online" className="font-normal cursor-pointer">
                          Online
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="offline" id="edit-offline" />
                        <Label htmlFor="edit-offline" className="font-normal cursor-pointer">
                          Offline
                        </Label>
                      </div>
                    </RadioGroup>
                  ) : (
                    <p className="font-medium capitalize mt-1">
                      {formData.step4.preferredMode}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    {t.assessment.step4.contactTimeLabel}
                  </Label>
                  {isEditing ? (
                    <Input
                      value={formData.step4.contactTime || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          step4: { ...formData.step4, contactTime: e.target.value },
                        })
                      }
                      className="mt-1"
                    />
                  ) : (
                    <p className="font-medium mt-1">
                      {formData.step4.contactTime || "—"}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">
                  {t.assessment.step4.additionalLabel}
                </Label>
                {isEditing ? (
                  <Textarea
                    value={formData.step4.additionalNotes || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        step4: { ...formData.step4, additionalNotes: e.target.value },
                      })
                    }
                    className="mt-1"
                    rows={2}
                  />
                ) : (
                  <p className="text-sm mt-1">{formData.step4.additionalNotes || "—"}</p>
                )}
              </div>
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
