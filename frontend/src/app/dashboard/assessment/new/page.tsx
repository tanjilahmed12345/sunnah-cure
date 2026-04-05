"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslation } from "@/i18n/useTranslation";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { Assessment } from "@/types";
import {
  assessmentStep1Schema,
  assessmentStep2Schema,
  assessmentStep3Schema,
  assessmentStep4Schema,
  type AssessmentStep1Data,
  type AssessmentStep2Data,
  type AssessmentStep3Data,
  type AssessmentStep4Data,
} from "@/lib/validations/assessment";
import { StepIndicator } from "@/components/common/StepIndicator";
import { PageHeader } from "@/components/common/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Loader2, CheckCircle } from "lucide-react";

interface ApiSuccess<T> {
  success: true;
  data: T;
}

export default function NewAssessmentPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [step1Data, setStep1Data] = useState<AssessmentStep1Data | null>(null);
  const [step2Data, setStep2Data] = useState<AssessmentStep2Data | null>(null);
  const [step3Data, setStep3Data] = useState<AssessmentStep3Data | null>(null);

  const steps = [
    { title: t.assessment.step1.title },
    { title: t.assessment.step2.title },
    { title: t.assessment.step3.title },
    { title: t.assessment.step4.title },
  ];

  const progress = (currentStep / 4) * 100;

  async function handleFinalSubmit(data: AssessmentStep4Data) {
    setIsSubmitting(true);
    try {
      const formData = {
        step1: step1Data!,
        step2: step2Data!,
        step3: step3Data!,
        step4: data,
      };
      await apiClient.post<ApiSuccess<Assessment>>(
        ENDPOINTS.assessments.create,
        { formData }
      );
      setIsSuccess(true);
      toast.success(t.assessment.assessmentSuccess);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit assessment"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <div>
        <PageHeader title={t.assessment.title} />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-green-100 p-4 dark:bg-green-900/30">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-bold">
              {t.assessment.assessmentSuccess}
            </h2>
            <p className="mt-2 text-muted-foreground max-w-md">
              {t.assessment.assessmentSuccessNote}
            </p>
            <Button
              className="mt-6"
              onClick={() => router.push("/dashboard/assessments")}
            >
              {t.dashboard.sidebar.assessments}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={t.assessment.title}
        description={t.assessment.subtitle}
      />

      <StepIndicator steps={steps} currentStep={currentStep} className="mb-4" />
      <Progress value={progress} className="mb-8 h-2" />

      {currentStep === 1 && (
        <Step1Form
          defaultValues={step1Data}
          onSubmit={(data) => {
            setStep1Data(data);
            setCurrentStep(2);
          }}
        />
      )}
      {currentStep === 2 && (
        <Step2Form
          defaultValues={step2Data}
          onSubmit={(data) => {
            setStep2Data(data);
            setCurrentStep(3);
          }}
          onBack={() => setCurrentStep(1)}
        />
      )}
      {currentStep === 3 && (
        <Step3Form
          defaultValues={step3Data}
          onSubmit={(data) => {
            setStep3Data(data);
            setCurrentStep(4);
          }}
          onBack={() => setCurrentStep(2)}
        />
      )}
      {currentStep === 4 && (
        <Step4Form
          onSubmit={handleFinalSubmit}
          onBack={() => setCurrentStep(3)}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}

/* ─── Step 1 ─── */
function Step1Form({
  defaultValues,
  onSubmit,
}: {
  defaultValues: AssessmentStep1Data | null;
  onSubmit: (data: AssessmentStep1Data) => void;
}) {
  const { t } = useTranslation();

  const practices = [
    { id: "Regular Dhikr", label: t.assessment.step1.dhikr },
    { id: "Daily Dua", label: t.assessment.step1.dua },
    { id: "Tahajjud Prayer", label: t.assessment.step1.tahajjud },
    { id: "Charity/Sadaqah", label: t.assessment.step1.charity },
    { id: "Fasting", label: t.assessment.step1.fasting },
    { id: "None", label: t.assessment.step1.none },
  ];

  const form = useForm<AssessmentStep1Data>({
    resolver: zodResolver(assessmentStep1Schema) as any,
    defaultValues: defaultValues || {
      prayerFrequency: "" as unknown as AssessmentStep1Data["prayerFrequency"],
      quranFrequency: "" as unknown as AssessmentStep1Data["quranFrequency"],
      spiritualPractices: [],
      confidentialNotes: "",
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.assessment.step1.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="prayerFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.assessment.step1.prayerLabel}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="5_times">
                        {t.assessment.step1.prayer5}
                      </SelectItem>
                      <SelectItem value="sometimes">
                        {t.assessment.step1.prayerSometimes}
                      </SelectItem>
                      <SelectItem value="rarely">
                        {t.assessment.step1.prayerRarely}
                      </SelectItem>
                      <SelectItem value="never">
                        {t.assessment.step1.prayerNever}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quranFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.assessment.step1.quranLabel}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="daily">
                        {t.assessment.step1.quranDaily}
                      </SelectItem>
                      <SelectItem value="weekly">
                        {t.assessment.step1.quranWeekly}
                      </SelectItem>
                      <SelectItem value="rarely">
                        {t.assessment.step1.quranRarely}
                      </SelectItem>
                      <SelectItem value="never">
                        {t.assessment.step1.quranNever}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="spiritualPractices"
              render={() => (
                <FormItem>
                  <FormLabel>{t.assessment.step1.practicesLabel}</FormLabel>
                  <div className="grid grid-cols-2 gap-3">
                    {practices.map((practice) => (
                      <FormField
                        key={practice.id}
                        control={form.control}
                        name="spiritualPractices"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(practice.id)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  field.onChange(
                                    checked
                                      ? [...current, practice.id]
                                      : current.filter(
                                          (v) => v !== practice.id
                                        )
                                  );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {practice.label}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confidentialNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.assessment.step1.sinsLabel}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t.assessment.step1.sinsPlaceholder}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end pt-2">
              <Button type="submit">
                {t.common.next}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

/* ─── Step 2 ─── */
function Step2Form({
  defaultValues,
  onSubmit,
  onBack,
}: {
  defaultValues: AssessmentStep2Data | null;
  onSubmit: (data: AssessmentStep2Data) => void;
  onBack: () => void;
}) {
  const { t } = useTranslation();

  const symptoms = [
    { id: "Frequent headaches", label: t.assessment.step2.headaches },
    { id: "Unexplained body pain", label: t.assessment.step2.bodyPain },
    { id: "Sleep disturbances/Insomnia", label: t.assessment.step2.sleepIssues },
    { id: "Changes in appetite", label: t.assessment.step2.appetite },
    { id: "Chronic fatigue", label: t.assessment.step2.fatigue },
    { id: "Tightness in chest", label: t.assessment.step2.chestTight },
    { id: "Skin issues", label: t.assessment.step2.skinIssues },
  ];

  const form = useForm<AssessmentStep2Data>({
    resolver: zodResolver(assessmentStep2Schema) as any,
    defaultValues: defaultValues || {
      physicalSymptoms: [],
      elaboration: "",
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.assessment.step2.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="physicalSymptoms"
              render={() => (
                <FormItem>
                  <FormLabel>{t.assessment.step2.checkLabel}</FormLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {symptoms.map((symptom) => (
                      <FormField
                        key={symptom.id}
                        control={form.control}
                        name="physicalSymptoms"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(symptom.id)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  field.onChange(
                                    checked
                                      ? [...current, symptom.id]
                                      : current.filter(
                                          (v) => v !== symptom.id
                                        )
                                  );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {symptom.label}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="elaboration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.assessment.step2.elaborateLabel}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t.assessment.step2.elaboratePlaceholder}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t.common.back}
              </Button>
              <Button type="submit" className="flex-1">
                {t.common.next}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

/* ─── Step 3 ─── */
function Step3Form({
  defaultValues,
  onSubmit,
  onBack,
}: {
  defaultValues: AssessmentStep3Data | null;
  onSubmit: (data: AssessmentStep3Data) => void;
  onBack: () => void;
}) {
  const { t } = useTranslation();

  const symptoms = [
    { id: "Persistent anxiety", label: t.assessment.step3.anxiety },
    { id: "Depression/sadness", label: t.assessment.step3.depression },
    { id: "Sudden anger outbursts", label: t.assessment.step3.anger },
    { id: "Unexplained fearfulness", label: t.assessment.step3.fear },
    { id: "Frequent nightmares", label: t.assessment.step3.nightmares },
    { id: "Social withdrawal", label: t.assessment.step3.withdrawal },
    { id: "Difficulty concentrating", label: t.assessment.step3.concentration },
    { id: "Mood swings", label: t.assessment.step3.moodSwings },
  ];

  const form = useForm<AssessmentStep3Data>({
    resolver: zodResolver(assessmentStep3Schema) as any,
    defaultValues: defaultValues || {
      emotionalSymptoms: [],
      emotionalDetails: "",
      previousDiagnosis: "",
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.assessment.step3.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="emotionalSymptoms"
              render={() => (
                <FormItem>
                  <FormLabel>{t.assessment.step3.checkLabel}</FormLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {symptoms.map((symptom) => (
                      <FormField
                        key={symptom.id}
                        control={form.control}
                        name="emotionalSymptoms"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(symptom.id)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  field.onChange(
                                    checked
                                      ? [...current, symptom.id]
                                      : current.filter(
                                          (v) => v !== symptom.id
                                        )
                                  );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {symptom.label}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="emotionalDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.assessment.step3.detailsLabel}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t.assessment.step3.detailsPlaceholder}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="previousDiagnosis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.assessment.step3.diagnosisLabel}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t.assessment.step3.diagnosisPlaceholder}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t.common.back}
              </Button>
              <Button type="submit" className="flex-1">
                {t.common.next}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

/* ─── Step 4 ─── */
function Step4Form({
  onSubmit,
  onBack,
  isSubmitting,
}: {
  onSubmit: (data: AssessmentStep4Data) => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const { t } = useTranslation();

  const symptoms = [
    { id: "Hearing whispers/voices", label: t.assessment.step4.whispers },
    { id: "Seeing shadows/figures", label: t.assessment.step4.shadows },
    { id: "Feeling an unseen presence", label: t.assessment.step4.presence },
    { id: "Aversion when hearing Quran", label: t.assessment.step4.aversionQuran },
    { id: "Unexplained marks on body", label: t.assessment.step4.marks },
    { id: "Feeling of being watched", label: t.assessment.step4.watched },
  ];

  const form = useForm<AssessmentStep4Data>({
    resolver: zodResolver(assessmentStep4Schema) as any,
    defaultValues: {
      spiritualSymptoms: [],
      unusualBehavior: "",
      familyHistory: "",
      preferredMode: "offline",
      contactTime: "",
      additionalNotes: "",
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.assessment.step4.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="spiritualSymptoms"
              render={() => (
                <FormItem>
                  <FormLabel>{t.assessment.step4.checkLabel}</FormLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {symptoms.map((symptom) => (
                      <FormField
                        key={symptom.id}
                        control={form.control}
                        name="spiritualSymptoms"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(symptom.id)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  field.onChange(
                                    checked
                                      ? [...current, symptom.id]
                                      : current.filter(
                                          (v) => v !== symptom.id
                                        )
                                  );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {symptom.label}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unusualBehavior"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.assessment.step4.behaviorLabel}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t.assessment.step4.behaviorPlaceholder}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="familyHistory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.assessment.step4.familyLabel}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t.assessment.step4.familyPlaceholder}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="preferredMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.assessment.step4.modeLabel}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="online" id="mode-online" />
                        <Label htmlFor="mode-online">
                          {t.assessment.step4.online}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="offline" id="mode-offline" />
                        <Label htmlFor="mode-offline">
                          {t.assessment.step4.offline}
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.assessment.step4.contactTimeLabel}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t.assessment.step4.contactTimePlaceholder}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.assessment.step4.additionalLabel}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t.assessment.step4.additionalPlaceholder}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t.common.back}
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {t.assessment.submitAssessment}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
