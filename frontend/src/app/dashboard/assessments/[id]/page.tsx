"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { Assessment } from "@/types";

interface ApiSuccess<T> {
  success: true;
  data: T;
}

export default function AssessmentDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAssessment() {
      try {
        const res = await apiClient.get<ApiSuccess<Assessment>>(
          ENDPOINTS.assessments.detail(params.id as string)
        );
        setAssessment(res.data);
      } catch {
        setAssessment(null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAssessment();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t.common.noResults}</p>
      </div>
    );
  }

  const { formData } = assessment;

  return (
    <div>
      <PageHeader
        title={t.assessment.title}
        action={
          <div className="flex items-center gap-3">
            <StatusBadge status={assessment.status} />
            <Button variant="outline" onClick={() => router.back()}>
              {t.common.back}
            </Button>
          </div>
        }
      />

      <div className="space-y-4 mb-4">
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>{formatDate(assessment.createdAt)}</span>
          {assessment.assignedDoctorName && (
            <span>
              {t.appointments.doctor}: {assessment.assignedDoctorName}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step 1 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t.assessment.step1.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t.assessment.step1.prayerLabel}
              </span>
              <span className="font-medium capitalize">
                {formData.step1.prayerFrequency.replace("_", " ")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t.assessment.step1.quranLabel}
              </span>
              <span className="font-medium capitalize">
                {formData.step1.quranFrequency}
              </span>
            </div>
            {formData.step1.spiritualPractices.length > 0 && (
              <div>
                <span className="text-muted-foreground">
                  {t.assessment.step1.practicesLabel}
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {formData.step1.spiritualPractices.map((p) => (
                    <Badge key={p} variant="secondary" className="text-xs">
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {formData.step1.confidentialNotes && (
              <div>
                <span className="text-muted-foreground">
                  {t.assessment.step1.sinsLabel}
                </span>
                <p className="mt-1">{formData.step1.confidentialNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t.assessment.step2.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {formData.step2.physicalSymptoms.length > 0 && (
              <div>
                <span className="text-muted-foreground">
                  {t.assessment.step2.checkLabel}
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {formData.step2.physicalSymptoms.map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {formData.step2.elaboration && (
              <div>
                <span className="text-muted-foreground">
                  {t.assessment.step2.elaborateLabel}
                </span>
                <p className="mt-1">{formData.step2.elaboration}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 3 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t.assessment.step3.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {formData.step3.emotionalSymptoms.length > 0 && (
              <div>
                <span className="text-muted-foreground">
                  {t.assessment.step3.checkLabel}
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {formData.step3.emotionalSymptoms.map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {formData.step3.emotionalDetails && (
              <div>
                <span className="text-muted-foreground">
                  {t.assessment.step3.detailsLabel}
                </span>
                <p className="mt-1">{formData.step3.emotionalDetails}</p>
              </div>
            )}
            {formData.step3.previousDiagnosis && (
              <div>
                <span className="text-muted-foreground">
                  {t.assessment.step3.diagnosisLabel}
                </span>
                <p className="mt-1">{formData.step3.previousDiagnosis}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 4 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t.assessment.step4.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {formData.step4.spiritualSymptoms.length > 0 && (
              <div>
                <span className="text-muted-foreground">
                  {t.assessment.step4.checkLabel}
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {formData.step4.spiritualSymptoms.map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {formData.step4.unusualBehavior && (
              <div>
                <span className="text-muted-foreground">
                  {t.assessment.step4.behaviorLabel}
                </span>
                <p className="mt-1">{formData.step4.unusualBehavior}</p>
              </div>
            )}
            {formData.step4.familyHistory && (
              <div>
                <span className="text-muted-foreground">
                  {t.assessment.step4.familyLabel}
                </span>
                <p className="mt-1">{formData.step4.familyHistory}</p>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t.assessment.step4.modeLabel}
              </span>
              <span className="font-medium capitalize">
                {formData.step4.preferredMode}
              </span>
            </div>
            {formData.step4.contactTime && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t.assessment.step4.contactTimeLabel}
                </span>
                <span className="font-medium">
                  {formData.step4.contactTime}
                </span>
              </div>
            )}
            {formData.step4.additionalNotes && (
              <div>
                <span className="text-muted-foreground">
                  {t.assessment.step4.additionalLabel}
                </span>
                <p className="mt-1">{formData.step4.additionalNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Admin Notes */}
      {assessment.adminNotes && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">
              {t.appointments.internalNotes}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{assessment.adminNotes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
