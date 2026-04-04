"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslation } from "@/i18n/useTranslation";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import {
  hijamaBookingSchema,
  type HijamaBookingFormData,
  ruqyahBookingSchema,
  type RuqyahBookingFormData,
  counselingBookingSchema,
  type CounselingBookingFormData,
} from "@/lib/validations/booking";
import { StepIndicator } from "@/components/common/StepIndicator";
import { ServiceCard } from "@/components/common/ServiceCard";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Loader2,
  ClipboardList,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { ServiceType, AppointmentMode, Service, AssessmentFormData } from "@/types";

interface ApiSuccess<T> {
  success: true;
  data: T;
}

export default function BookAppointmentPage() {
  return (
    <Suspense>
      <BookAppointmentContent />
    </Suspense>
  );
}

function BookAppointmentContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const serviceParam = searchParams.get("service") as ServiceType | null;

  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      setIsLoadingServices(true);
      try {
        const res = await apiClient.get<ApiSuccess<Service[]>>(ENDPOINTS.services.list);
        setServices(res.data);
      } catch {
        toast.error("Failed to load services");
      } finally {
        setIsLoadingServices(false);
      }
    }
    fetchServices();
  }, []);

  const validService = serviceParam && services.some((s) => s.type === serviceParam)
    ? serviceParam
    : null;

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [mode, setMode] = useState<AppointmentMode>("offline");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceFormData, setServiceFormData] = useState<
    HijamaBookingFormData | RuqyahBookingFormData | CounselingBookingFormData | null
  >(null);
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [assessmentData, setAssessmentData] = useState<AssessmentFormData | null>(null);

  // Once services load, apply the service param
  useEffect(() => {
    if (!isLoadingServices && validService) {
      setSelectedService(validService);
      setCurrentStep(2);
    }
  }, [isLoadingServices, validService]);

  const isAssessmentService = selectedService === "hijama" || selectedService === "ruqyah";

  const STEP_SERVICE = 1;
  const STEP_FORM = 2;
  const STEP_ASSESSMENT = 99; // special step, not in indicator
  const STEP_ASSESSMENT_FORM = 98; // assessment service 3-step form
  const STEP_CONFIRM = 3;
  const STEP_SUCCESS = 4;

  const isAssessmentFlow = selectedService === "assessment";
  const steps = isAssessmentFlow
    ? [
        { title: t.booking.step1 },
        { title: t.booking.step2 },
        { title: t.booking.stepAssessment },
        { title: t.booking.step3 },
      ]
    : [
        { title: t.booking.step1 },
        { title: t.booking.step2 },
        { title: t.booking.step3 },
      ];

  // Map internal step to display step for StepIndicator
  const displayStep = isAssessmentFlow
    ? currentStep === STEP_ASSESSMENT_FORM
      ? 3
      : currentStep === STEP_CONFIRM
      ? 4
      : currentStep === STEP_SUCCESS
      ? 4
      : currentStep
    : currentStep === STEP_SUCCESS
    ? STEP_CONFIRM
    : currentStep;

  const bookableServices = services;
  const selectedServiceData = services.find(
    (s) => s.type === selectedService
  );

  function handleServiceSelect(type: ServiceType) {
    setSelectedService(type);
    setCurrentStep(STEP_FORM);
  }

  function handleServiceFormSubmit(
    data: HijamaBookingFormData | RuqyahBookingFormData | CounselingBookingFormData
  ) {
    setServiceFormData(data);
    if (selectedService === "hijama" && selectedServiceData?.hijamaPricing) {
      const hijamaData = data as HijamaBookingFormData;
      if (hijamaData.numberOfCups && hijamaData.numberOfCups > 0) {
        setCalculatedPrice(hijamaData.numberOfCups * selectedServiceData.hijamaPricing.pricePerCup);
      } else {
        setCalculatedPrice(null);
      }
    } else {
      setCalculatedPrice(null);
    }
    setCurrentStep(STEP_CONFIRM);
  }

  async function handleFinalSubmit() {
    setIsSubmitting(true);
    try {
      await apiClient.post(ENDPOINTS.appointments.create, {
        serviceType: selectedService,
        mode,
        serviceData: serviceFormData,
        assessmentData: assessmentData || undefined,
      });
      toast.success(t.booking.bookingSuccess);
      setCurrentStep(STEP_SUCCESS);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader title={t.booking.title} />

      {currentStep !== STEP_SUCCESS && (
        <StepIndicator steps={steps} currentStep={displayStep} className="mb-8" />
      )}

      {/* Step 1: Choose Service */}
      {currentStep === STEP_SERVICE && (
        <div>
          <p className="text-muted-foreground mb-6">{t.booking.selectService}</p>
          {isLoadingServices ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {bookableServices.map((service) => (
                <div
                  key={service.id}
                  onClick={() => handleServiceSelect(service.type)}
                  className="cursor-pointer"
                >
                  <ServiceCard service={service} showActions={false} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Service-specific form */}
      {currentStep === STEP_FORM && selectedService === "hijama" && selectedServiceData && (
        <HijamaForm
          onSubmit={handleServiceFormSubmit}
          onBack={() => setCurrentStep(STEP_SERVICE)}
          service={selectedServiceData}
        />
      )}
      {currentStep === STEP_FORM && selectedService === "ruqyah" && (
        <RuqyahForm
          onSubmit={handleServiceFormSubmit}
          onBack={() => setCurrentStep(STEP_SERVICE)}
        />
      )}
      {currentStep === STEP_FORM && selectedService === "counseling" && (
        <CounselingForm
          onSubmit={handleServiceFormSubmit}
          onBack={() => setCurrentStep(STEP_SERVICE)}
        />
      )}
      {currentStep === STEP_FORM && selectedService === "assessment" && (
        <Card>
          <CardHeader>
            <CardTitle>Health Assessment Booking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Our comprehensive health assessment evaluates your physical, mental, and spiritual well-being.
              A qualified practitioner will review your case and recommend the most suitable services.
            </p>
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-sm font-medium">What to expect:</p>
              <ul className="mt-2 text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Initial consultation with a practitioner</li>
                <li>Personalized health evaluation</li>
                <li>Recommendations within 24-48 hours</li>
              </ul>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(STEP_SERVICE)}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t.common.back}
              </Button>
              <Button
                onClick={() => {
                  setServiceFormData(null);
                  setCalculatedPrice(null);
                  setCurrentStep(STEP_ASSESSMENT_FORM);
                }}
                className="flex-1"
              >
                {t.common.next}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assessment Step (for online Hijama/Ruqyah) */}
      {currentStep === STEP_ASSESSMENT && (
        <InlineAssessmentForm
          onSubmit={(data) => {
            setAssessmentData(data);
            setCurrentStep(STEP_CONFIRM);
          }}
          onBack={() => setCurrentStep(STEP_CONFIRM)}
          initialData={assessmentData}
        />
      )}

      {/* Assessment Service Form (3-step: Physical, Mental, Spiritual) */}
      {currentStep === STEP_ASSESSMENT_FORM && (
        <AssessmentServiceForm
          onSubmit={(data) => {
            setAssessmentData(data);
            setCurrentStep(STEP_CONFIRM);
          }}
          onBack={() => setCurrentStep(STEP_FORM)}
          initialData={assessmentData}
        />
      )}

      {/* Mode + Confirmation */}
      {currentStep === STEP_CONFIRM && selectedServiceData && (() => {
        const mp = selectedServiceData.modePricing;
        const modePrice = mp
          ? (mode === "online" ? mp.onlinePriceBDT : mp.offlinePriceBDT) ?? selectedServiceData.priceBDT
          : selectedServiceData.priceBDT;
        const modeDuration = mp
          ? (mode === "online" ? mp.onlineDurationMinutes : mp.offlineDurationMinutes) ?? selectedServiceData.durationMinutes
          : selectedServiceData.durationMinutes;
        const isHijamaWithKnownCups = selectedService === "hijama" && calculatedPrice != null;
        const isHijamaUnsure = selectedService === "hijama" && calculatedPrice == null;
        const displayPrice = isHijamaWithKnownCups ? calculatedPrice : modePrice;
        const isOnline = mode === "online";

        return (
          <Card>
            <CardHeader>
              <CardTitle>{t.booking.confirmDetails}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mode Selection */}
              <div>
                <h3 className="font-medium mb-3">{t.booking.modeSelection}</h3>
                <RadioGroup
                  value={mode}
                  onValueChange={(v) => setMode(v as AppointmentMode)}
                  className="flex gap-4"
                >
                  {selectedServiceData.isOffline && (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="offline" id="offline" />
                      <Label htmlFor="offline">
                        {t.appointments.offline}
                        {mp?.offlinePriceBDT != null && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({formatCurrency(mp.offlinePriceBDT)} &middot; {mp.offlineDurationMinutes} min)
                          </span>
                        )}
                      </Label>
                    </div>
                  )}
                  {selectedServiceData.isOnline && (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="online" id="online" />
                      <Label htmlFor="online">
                        {t.appointments.online}
                        {mp?.onlinePriceBDT != null && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({formatCurrency(mp.onlinePriceBDT)} &middot; {mp.onlineDurationMinutes} min)
                          </span>
                        )}
                      </Label>
                    </div>
                  )}
                </RadioGroup>
                {isOnline && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 p-3 mt-3">
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      Online appointments require advance payment. After payment, your booking request will be sent to the doctor.
                      You will be contacted to schedule a date and time.
                    </p>
                  </div>
                )}
                {isOnline && isAssessmentService && !assessmentData && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 p-3 mt-3">
                    <div className="flex items-start gap-2">
                      <ClipboardList className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-amber-700 dark:text-amber-400">
                        An assessment form is required for online {selectedService === "hijama" ? "Hijama" : "Ruqyah"} appointments.
                        Please complete the assessment before booking.
                      </p>
                    </div>
                  </div>
                )}
                {isOnline && isAssessmentService && assessmentData && (
                  <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20 p-3 mt-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                        <p className="text-sm text-green-700 dark:text-green-400">
                          Assessment form completed.
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentStep(STEP_ASSESSMENT)}
                        className="text-xs"
                      >
                        Edit Assessment
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Summary */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.appointments.service}</span>
                  <span className="font-medium">{selectedServiceData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.appointments.mode}</span>
                  <span className="font-medium capitalize">{mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{modeDuration} min</span>
                </div>
                {selectedService === "hijama" && serviceFormData && selectedServiceData.hijamaPricing && (
                  (() => {
                    const cups = (serviceFormData as HijamaBookingFormData).numberOfCups;
                    const knowsCups = cups && cups > 0;
                    return knowsCups ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Number of Cups</span>
                          <span className="font-medium">{cups}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Rate per Cup</span>
                          <span className="text-muted-foreground">
                            {formatCurrency(selectedServiceData.hijamaPricing.pricePerCup)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Number of Cups</span>
                        <span className="font-medium text-amber-600">To be decided at session</span>
                      </div>
                    );
                  })()
                )}
                <Separator />
                {isHijamaUnsure ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 p-3">
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      Payment will be calculated after the session based on the number of cups used.
                    </p>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.payment.amount}</span>
                    <span className="font-semibold text-lg">{formatCurrency(displayPrice)}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                {isOnline && isAssessmentService && !assessmentData && (
                  <Button
                    variant="default"
                    onClick={() => setCurrentStep(STEP_ASSESSMENT)}
                    className="flex-1"
                  >
                    <ClipboardList className="mr-2 h-4 w-4" />
                    Fill Assessment Form
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(isAssessmentFlow ? STEP_ASSESSMENT_FORM : STEP_FORM)}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t.common.back}
                </Button>
                <Button
                  onClick={() => {
                    if (isOnline) {
                      handleFinalSubmit().then(() => {
                        router.push("/dashboard/payment/new-appointment");
                      });
                    } else {
                      handleFinalSubmit();
                    }
                  }}
                  className="flex-1"
                  disabled={isSubmitting || (isOnline && isAssessmentService && !assessmentData)}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="mr-2 h-4 w-4" />
                  )}
                  {isOnline ? "Pay & Book" : t.booking.submitBooking}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* Success Step */}
      {currentStep === STEP_SUCCESS && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-green-100 p-4 dark:bg-green-900/30">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-bold">{t.booking.bookingSuccess}</h2>
            <p className="mt-2 text-muted-foreground max-w-md">
              {t.booking.bookingSuccessNote}
            </p>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/appointments")}
              >
                {t.appointments.title}
              </Button>
              {mode === "online" && selectedServiceData && (
                <Button
                  onClick={() =>
                    router.push("/dashboard/payment/new-appointment")
                  }
                >
                  {t.appointments.payNow}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ─── Hijama Booking Form ─── */
function HijamaForm({
  onSubmit,
  onBack,
  service,
}: {
  onSubmit: (data: HijamaBookingFormData) => void;
  onBack: () => void;
  service: Service;
}) {
  const { t } = useTranslation();
  const pricing = service.hijamaPricing;
  const minCups = pricing?.minCups ?? 3;
  const pricePerCup = pricing?.pricePerCup ?? 200;

  const bodyParts = [
    { id: "Head", label: t.booking.hijama.head },
    { id: "Back", label: t.booking.hijama.back },
    { id: "Shoulders", label: t.booking.hijama.shoulders },
    { id: "Legs", label: t.booking.hijama.legs },
    { id: "Not Sure", label: t.booking.hijama.notSure },
  ];

  const medicalConditionOptions = [
    { id: "blood_pressure", label: "Blood Pressure" },
    { id: "diabetes", label: "Diabetes" },
    { id: "other", label: "Other" },
  ];

  const form = useForm<HijamaBookingFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(hijamaBookingSchema) as any,
    defaultValues: {
      type: "wet",
      numberOfCups: minCups,
      bodyParts: [],
      medicalConditions: [],
      medicalConditionOther: "",
      additionalNotes: "",
    },
  });

  const [notSureCups, setNotSureCups] = useState(false);
  const watchedCups = form.watch("numberOfCups");
  const effectiveCups = Math.max(watchedCups || minCups, minCups);
  const livePrice = effectiveCups * pricePerCup;
  const watchedConditions = form.watch("medicalConditions") || [];
  const showOtherInput = watchedConditions.includes("other");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.booking.hijama.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.booking.hijama.typeLabel}</FormLabel>
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
                      <SelectItem value="wet">
                        {t.booking.hijama.typeWet}
                      </SelectItem>
                      <SelectItem value="dry">
                        {t.booking.hijama.typeDry}
                      </SelectItem>
                      <SelectItem value="not_sure">
                        {t.booking.hijama.typeNotSure}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Checkbox
                  id="not-sure-cups"
                  checked={notSureCups}
                  onCheckedChange={(checked) => {
                    setNotSureCups(!!checked);
                    if (checked) {
                      form.setValue("numberOfCups", 0);
                    } else {
                      form.setValue("numberOfCups", minCups);
                    }
                  }}
                />
                <Label htmlFor="not-sure-cups" className="text-sm cursor-pointer">
                  I&apos;m not sure about the number of cups
                </Label>
              </div>

              {!notSureCups && (
                <FormField
                  control={form.control}
                  name="numberOfCups"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.booking.hijama.cupsLabel}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={minCups}
                          placeholder={`Minimum ${minCups}`}
                          {...field}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || minCups;
                            field.onChange(Math.max(val, minCups));
                          }}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Minimum {minCups} cups &middot; {formatCurrency(pricePerCup)} per cup
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Live Price Preview */}
            {notSureCups ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 p-4">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  The practitioner will decide the number of cups during your session.
                  Payment will be calculated afterwards at {formatCurrency(pricePerCup)} per cup.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Total</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {effectiveCups} cups &times; {formatCurrency(pricePerCup)}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(livePrice)}
                  </p>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="bodyParts"
              render={() => (
                <FormItem>
                  <FormLabel>{t.booking.hijama.bodyPartsLabel}</FormLabel>
                  <div className="grid grid-cols-2 gap-3">
                    {bodyParts.map((part) => (
                      <FormField
                        key={part.id}
                        control={form.control}
                        name="bodyParts"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(part.id)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  field.onChange(
                                    checked
                                      ? [...current, part.id]
                                      : current.filter(
                                          (v) => v !== part.id
                                        )
                                  );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {part.label}
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
            {/* Medical Conditions */}
            <FormField
              control={form.control}
              name="medicalConditions"
              render={() => (
                <FormItem>
                  <FormLabel>Medical Conditions</FormLabel>
                  <p className="text-xs text-muted-foreground mb-2">
                    Do you have any of the following medical conditions?
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {medicalConditionOptions.map((condition) => (
                      <FormField
                        key={condition.id}
                        control={form.control}
                        name="medicalConditions"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(condition.id)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  const updated = checked
                                    ? [...current, condition.id]
                                    : current.filter((v) => v !== condition.id);
                                  field.onChange(updated);
                                  if (!checked && condition.id === "other") {
                                    form.setValue("medicalConditionOther", "");
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {condition.label}
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
            {showOtherInput && (
              <FormField
                control={form.control}
                name="medicalConditionOther"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Please specify</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Describe your medical condition..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.booking.hijama.notesLabel}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t.booking.hijama.notesPlaceholder}
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

/* ─── Ruqyah Booking Form ─── */
function RuqyahForm({
  onSubmit,
  onBack,
}: {
  onSubmit: (data: RuqyahBookingFormData) => void;
  onBack: () => void;
}) {
  const { t } = useTranslation();

  const symptomOptions = [
    { id: "Nightmares", label: t.booking.ruqyah.nightmares },
    { id: "Anxiety", label: t.booking.ruqyah.anxiety },
    { id: "Hearing Voices", label: t.booking.ruqyah.hearingVoices },
    { id: "Feeling Heaviness", label: t.booking.ruqyah.heaviness },
    { id: "Aversion to Quran", label: t.booking.ruqyah.aversionQuran },
    { id: "Other", label: t.booking.ruqyah.other },
  ];

  const form = useForm<RuqyahBookingFormData>({
    resolver: zodResolver(ruqyahBookingSchema) as any,
    defaultValues: {
      isSelf: true,
      patientName: "",
      patientAge: undefined,
      patientGender: "",
      problemDescription: "",
      symptoms: [],
      additionalNotes: "",
    },
  });

  const isSelf = form.watch("isSelf");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.booking.ruqyah.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="isSelf"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <FormLabel className="cursor-pointer">
                    {t.booking.ruqyah.selfPatient}
                  </FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {!isSelf && (
              <div className="space-y-4 rounded-lg border p-4">
                <FormField
                  control={form.control}
                  name="patientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.booking.ruqyah.patientName}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="patientAge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.booking.ruqyah.patientAge}</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="patientGender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t.booking.ruqyah.patientGender}
                        </FormLabel>
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
                            <SelectItem value="male">
                              {t.auth.register.genderMale}
                            </SelectItem>
                            <SelectItem value="female">
                              {t.auth.register.genderFemale}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
            <FormField
              control={form.control}
              name="problemDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.booking.ruqyah.problemLabel}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t.booking.ruqyah.problemPlaceholder}
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
              name="symptoms"
              render={() => (
                <FormItem>
                  <FormLabel>{t.booking.ruqyah.symptomsLabel}</FormLabel>
                  <div className="grid grid-cols-2 gap-3">
                    {symptomOptions.map((symptom) => (
                      <FormField
                        key={symptom.id}
                        control={form.control}
                        name="symptoms"
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
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.booking.ruqyah.notesLabel}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t.booking.ruqyah.notesPlaceholder}
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

/* ─── Counseling Booking Form ─── */
function CounselingForm({
  onSubmit,
  onBack,
}: {
  onSubmit: (data: CounselingBookingFormData) => void;
  onBack: () => void;
}) {
  const { t } = useTranslation();

  const form = useForm<CounselingBookingFormData>({
    resolver: zodResolver(counselingBookingSchema) as any,
    defaultValues: {
      reason: "",
      additionalNotes: "",
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.booking.counseling.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.booking.counseling.reasonLabel}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t.booking.counseling.reasonPlaceholder}
                      rows={4}
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
                  <FormLabel>{t.booking.counseling.notesLabel}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t.booking.counseling.notesPlaceholder}
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

/* ─── Inline Assessment Form (for online Hijama/Ruqyah) ─── */
function InlineAssessmentForm({
  onSubmit,
  onBack,
  initialData,
}: {
  onSubmit: (data: AssessmentFormData) => void;
  onBack: () => void;
  initialData: AssessmentFormData | null;
}) {
  const { t } = useTranslation();
  const [assessStep, setAssessStep] = useState(1);

  const [step1, setStep1] = useState(
    initialData?.step1 || {
      prayerFrequency: "5_times" as const,
      quranFrequency: "daily" as const,
      spiritualPractices: [] as string[],
      confidentialNotes: "",
    }
  );
  const [step2, setStep2] = useState(
    initialData?.step2 || {
      physicalSymptoms: [] as string[],
      elaboration: "",
    }
  );
  const [step3, setStep3] = useState(
    initialData?.step3 || {
      emotionalSymptoms: [] as string[],
      emotionalDetails: "",
      previousDiagnosis: "",
    }
  );
  const [step4, setStep4] = useState(
    initialData?.step4 || {
      spiritualSymptoms: [] as string[],
      unusualBehavior: "",
      familyHistory: "",
      preferredMode: "online" as const,
      contactTime: "",
      additionalNotes: "",
    }
  );

  function toggleItem(arr: string[], item: string): string[] {
    return arr.includes(item) ? arr.filter((v) => v !== item) : [...arr, item];
  }

  const spiritualPracticeOpts = ["Regular Dhikr", "Daily Dua", "Tahajjud Prayer", "Charity/Sadaqah", "Fasting", "None"];
  const physicalSymptomOpts = ["Frequent headaches", "Unexplained body pain", "Sleep disturbances/Insomnia", "Changes in appetite", "Chronic fatigue", "Tightness in chest", "Skin issues"];
  const emotionalSymptomOpts = ["Persistent anxiety", "Depression/sadness", "Sudden anger outbursts", "Unexplained fearfulness", "Frequent nightmares", "Social withdrawal", "Difficulty concentrating", "Mood swings"];
  const spiritualSymptomOpts = ["Hearing whispers/voices", "Seeing shadows/figures", "Feeling unseen presence", "Aversion when hearing Quran", "Unexplained marks on body", "Feeling of being watched"];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Patient Assessment Form
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          This assessment helps the doctor understand your condition before the online session.
        </p>
      </CardHeader>
      <CardContent>
        {/* Mini step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  assessStep === s
                    ? "bg-primary text-primary-foreground"
                    : assessStep > s
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {assessStep > s ? <CheckCircle className="h-4 w-4" /> : s}
              </div>
              {s < 4 && <div className={`h-0.5 w-6 ${assessStep > s ? "bg-green-400" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        {/* Assessment Step 1: Spiritual */}
        {assessStep === 1 && (
          <div className="space-y-4">
            <h3 className="font-medium">{t.assessment.step1.title}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>{t.assessment.step1.prayerLabel}</Label>
                <Select
                  value={step1.prayerFrequency}
                  onValueChange={(v) => setStep1({ ...step1, prayerFrequency: v as typeof step1.prayerFrequency })}
                >
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5_times">5 Times Daily</SelectItem>
                    <SelectItem value="sometimes">Sometimes</SelectItem>
                    <SelectItem value="rarely">Rarely</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t.assessment.step1.quranLabel}</Label>
                <Select
                  value={step1.quranFrequency}
                  onValueChange={(v) => setStep1({ ...step1, quranFrequency: v as typeof step1.quranFrequency })}
                >
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="rarely">Rarely</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>{t.assessment.step1.practicesLabel}</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {spiritualPracticeOpts.map((p) => (
                  <div key={p} className="flex items-center space-x-2">
                    <Checkbox
                      id={`ia-sp-${p}`}
                      checked={step1.spiritualPractices.includes(p)}
                      onCheckedChange={() => setStep1({ ...step1, spiritualPractices: toggleItem(step1.spiritualPractices, p) })}
                    />
                    <Label htmlFor={`ia-sp-${p}`} className="font-normal cursor-pointer text-sm">{p}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label>{t.assessment.step1.sinsLabel}</Label>
              <Textarea
                value={step1.confidentialNotes || ""}
                onChange={(e) => setStep1({ ...step1, confidentialNotes: e.target.value })}
                className="mt-1"
                rows={2}
                placeholder="Optional confidential notes..."
              />
            </div>
          </div>
        )}

        {/* Assessment Step 2: Physical */}
        {assessStep === 2 && (
          <div className="space-y-4">
            <h3 className="font-medium">{t.assessment.step2.title}</h3>
            <div>
              <Label>Select any physical symptoms you experience</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {physicalSymptomOpts.map((s) => (
                  <div key={s} className="flex items-center space-x-2">
                    <Checkbox
                      id={`ia-ps-${s}`}
                      checked={step2.physicalSymptoms.includes(s)}
                      onCheckedChange={() => setStep2({ ...step2, physicalSymptoms: toggleItem(step2.physicalSymptoms, s) })}
                    />
                    <Label htmlFor={`ia-ps-${s}`} className="font-normal cursor-pointer text-sm">{s}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label>{t.assessment.step2.elaborateLabel}</Label>
              <Textarea
                value={step2.elaboration || ""}
                onChange={(e) => setStep2({ ...step2, elaboration: e.target.value })}
                className="mt-1"
                rows={3}
                placeholder="Describe your symptoms in more detail..."
              />
            </div>
          </div>
        )}

        {/* Assessment Step 3: Emotional */}
        {assessStep === 3 && (
          <div className="space-y-4">
            <h3 className="font-medium">{t.assessment.step3.title}</h3>
            <div>
              <Label>Select any emotional symptoms you experience</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {emotionalSymptomOpts.map((s) => (
                  <div key={s} className="flex items-center space-x-2">
                    <Checkbox
                      id={`ia-es-${s}`}
                      checked={step3.emotionalSymptoms.includes(s)}
                      onCheckedChange={() => setStep3({ ...step3, emotionalSymptoms: toggleItem(step3.emotionalSymptoms, s) })}
                    />
                    <Label htmlFor={`ia-es-${s}`} className="font-normal cursor-pointer text-sm">{s}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label>{t.assessment.step3.detailsLabel}</Label>
              <Textarea
                value={step3.emotionalDetails || ""}
                onChange={(e) => setStep3({ ...step3, emotionalDetails: e.target.value })}
                className="mt-1"
                rows={2}
              />
            </div>
            <div>
              <Label>{t.assessment.step3.diagnosisLabel}</Label>
              <Input
                value={step3.previousDiagnosis || ""}
                onChange={(e) => setStep3({ ...step3, previousDiagnosis: e.target.value })}
                className="mt-1"
                placeholder="Any previous diagnosis..."
              />
            </div>
          </div>
        )}

        {/* Assessment Step 4: Spiritual Symptoms */}
        {assessStep === 4 && (
          <div className="space-y-4">
            <h3 className="font-medium">{t.assessment.step4.title}</h3>
            <div>
              <Label>Select any spiritual symptoms you experience</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {spiritualSymptomOpts.map((s) => (
                  <div key={s} className="flex items-center space-x-2">
                    <Checkbox
                      id={`ia-ss-${s}`}
                      checked={step4.spiritualSymptoms.includes(s)}
                      onCheckedChange={() => setStep4({ ...step4, spiritualSymptoms: toggleItem(step4.spiritualSymptoms, s) })}
                    />
                    <Label htmlFor={`ia-ss-${s}`} className="font-normal cursor-pointer text-sm">{s}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label>{t.assessment.step4.behaviorLabel}</Label>
              <Textarea
                value={step4.unusualBehavior || ""}
                onChange={(e) => setStep4({ ...step4, unusualBehavior: e.target.value })}
                className="mt-1"
                rows={2}
              />
            </div>
            <div>
              <Label>{t.assessment.step4.familyLabel}</Label>
              <Textarea
                value={step4.familyHistory || ""}
                onChange={(e) => setStep4({ ...step4, familyHistory: e.target.value })}
                className="mt-1"
                rows={2}
              />
            </div>
            <div>
              <Label>{t.assessment.step4.additionalLabel}</Label>
              <Textarea
                value={step4.additionalNotes || ""}
                onChange={(e) => setStep4({ ...step4, additionalNotes: e.target.value })}
                className="mt-1"
                rows={2}
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (assessStep === 1) onBack();
              else setAssessStep(assessStep - 1);
            }}
            className="flex-1"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t.common.back}
          </Button>
          {assessStep < 4 ? (
            <Button
              type="button"
              onClick={() => setAssessStep(assessStep + 1)}
              className="flex-1"
            >
              {t.common.next}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => onSubmit({ step1, step2, step3, step4 })}
              className="flex-1"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Complete Assessment
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Assessment Service Form (3-step: Physical, Mental, Spiritual) ─── */
function AssessmentServiceForm({
  onSubmit,
  onBack,
  initialData,
}: {
  onSubmit: (data: AssessmentFormData) => void;
  onBack: () => void;
  initialData: AssessmentFormData | null;
}) {
  const { t } = useTranslation();
  const [subStep, setSubStep] = useState(1);
  const totalSubSteps = 3;

  const subStepLabels = ["Physical Info", "Mental Info", "Spiritual Info"];

  // Physical info (maps to AssessmentStep2)
  const [physical, setPhysical] = useState(
    initialData?.step2 || {
      physicalSymptoms: [] as string[],
      elaboration: "",
    }
  );

  // Mental info (maps to AssessmentStep3)
  const [mental, setMental] = useState(
    initialData?.step3 || {
      emotionalSymptoms: [] as string[],
      emotionalDetails: "",
      previousDiagnosis: "",
    }
  );

  // Spiritual info (maps to AssessmentStep1 + AssessmentStep4)
  const [spiritual, setSpiritual] = useState(
    initialData
      ? {
          prayerFrequency: initialData.step1.prayerFrequency,
          quranFrequency: initialData.step1.quranFrequency,
          spiritualPractices: initialData.step1.spiritualPractices,
          confidentialNotes: initialData.step1.confidentialNotes || "",
          spiritualSymptoms: initialData.step4.spiritualSymptoms,
          unusualBehavior: initialData.step4.unusualBehavior || "",
          familyHistory: initialData.step4.familyHistory || "",
        }
      : {
          prayerFrequency: "5_times" as const,
          quranFrequency: "daily" as const,
          spiritualPractices: [] as string[],
          confidentialNotes: "",
          spiritualSymptoms: [] as string[],
          unusualBehavior: "",
          familyHistory: "",
        }
  );

  function toggleItem(arr: string[], item: string): string[] {
    return arr.includes(item) ? arr.filter((v) => v !== item) : [...arr, item];
  }

  const physicalSymptomOpts = [
    "Frequent headaches",
    "Unexplained body pain",
    "Sleep disturbances/Insomnia",
    "Changes in appetite",
    "Chronic fatigue",
    "Tightness in chest",
    "Skin issues",
  ];
  const emotionalSymptomOpts = [
    "Persistent anxiety",
    "Depression/sadness",
    "Sudden anger outbursts",
    "Unexplained fearfulness",
    "Frequent nightmares",
    "Social withdrawal",
    "Difficulty concentrating",
    "Mood swings",
  ];
  const spiritualPracticeOpts = [
    "Regular Dhikr",
    "Daily Dua",
    "Tahajjud Prayer",
    "Charity/Sadaqah",
    "Fasting",
    "None",
  ];
  const spiritualSymptomOpts = [
    "Hearing whispers/voices",
    "Seeing shadows/figures",
    "Feeling unseen presence",
    "Aversion when hearing Quran",
    "Unexplained marks on body",
    "Feeling of being watched",
  ];

  function handleComplete() {
    const data: AssessmentFormData = {
      step1: {
        prayerFrequency: spiritual.prayerFrequency,
        quranFrequency: spiritual.quranFrequency,
        spiritualPractices: spiritual.spiritualPractices,
        confidentialNotes: spiritual.confidentialNotes,
      },
      step2: {
        physicalSymptoms: physical.physicalSymptoms,
        elaboration: physical.elaboration,
      },
      step3: {
        emotionalSymptoms: mental.emotionalSymptoms,
        emotionalDetails: mental.emotionalDetails,
        previousDiagnosis: mental.previousDiagnosis,
      },
      step4: {
        spiritualSymptoms: spiritual.spiritualSymptoms,
        unusualBehavior: spiritual.unusualBehavior,
        familyHistory: spiritual.familyHistory,
        preferredMode: "online",
        contactTime: "",
        additionalNotes: "",
      },
    };
    onSubmit(data);
  }

  const progressPercent = ((subStep - 1) / totalSubSteps) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Health Assessment Form
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Complete this assessment so our practitioners can better understand your condition.
        </p>
      </CardHeader>
      <CardContent>
        {/* Sub-step labels */}
        <div className="flex items-center justify-between mb-2">
          {subStepLabels.map((label, i) => {
            const stepNum = i + 1;
            const isActive = subStep === stepNum;
            const isDone = subStep > stepNum;
            return (
              <div key={label} className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                    isActive && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    isDone && "bg-primary text-primary-foreground",
                    !isActive && !isDone && "bg-muted text-muted-foreground"
                  )}
                >
                  {isDone ? <CheckCircle className="h-4 w-4" /> : stepNum}
                </div>
                <span
                  className={cn(
                    "mt-1.5 text-xs text-center",
                    isActive || isDone ? "text-foreground font-medium" : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2 mb-6">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Sub-step 1: Physical Info */}
        {subStep === 1 && (
          <div className="space-y-4">
            <h3 className="font-medium">Physical Health Information</h3>
            <div>
              <Label>Select any physical symptoms you experience</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {physicalSymptomOpts.map((s) => (
                  <div key={s} className="flex items-center space-x-2">
                    <Checkbox
                      id={`asf-ps-${s}`}
                      checked={physical.physicalSymptoms.includes(s)}
                      onCheckedChange={() =>
                        setPhysical({
                          ...physical,
                          physicalSymptoms: toggleItem(physical.physicalSymptoms, s),
                        })
                      }
                    />
                    <Label htmlFor={`asf-ps-${s}`} className="font-normal cursor-pointer text-sm">
                      {s}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label>Please elaborate on your symptoms</Label>
              <Textarea
                value={physical.elaboration || ""}
                onChange={(e) => setPhysical({ ...physical, elaboration: e.target.value })}
                className="mt-1"
                rows={3}
                placeholder="Describe your physical symptoms in more detail..."
              />
            </div>
          </div>
        )}

        {/* Sub-step 2: Mental Info */}
        {subStep === 2 && (
          <div className="space-y-4">
            <h3 className="font-medium">Mental & Emotional Health Information</h3>
            <div>
              <Label>Select any emotional symptoms you experience</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {emotionalSymptomOpts.map((s) => (
                  <div key={s} className="flex items-center space-x-2">
                    <Checkbox
                      id={`asf-es-${s}`}
                      checked={mental.emotionalSymptoms.includes(s)}
                      onCheckedChange={() =>
                        setMental({
                          ...mental,
                          emotionalSymptoms: toggleItem(mental.emotionalSymptoms, s),
                        })
                      }
                    />
                    <Label htmlFor={`asf-es-${s}`} className="font-normal cursor-pointer text-sm">
                      {s}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label>Share more about your emotional well-being</Label>
              <Textarea
                value={mental.emotionalDetails || ""}
                onChange={(e) => setMental({ ...mental, emotionalDetails: e.target.value })}
                className="mt-1"
                rows={2}
                placeholder="Describe your emotional state..."
              />
            </div>
            <div>
              <Label>Previous Diagnosis (if any)</Label>
              <Input
                value={mental.previousDiagnosis || ""}
                onChange={(e) => setMental({ ...mental, previousDiagnosis: e.target.value })}
                className="mt-1"
                placeholder="Any previous mental health diagnosis..."
              />
            </div>
          </div>
        )}

        {/* Sub-step 3: Spiritual Info */}
        {subStep === 3 && (
          <div className="space-y-4">
            <h3 className="font-medium">Spiritual Health Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>{t.assessment.step1.prayerLabel}</Label>
                <Select
                  value={spiritual.prayerFrequency}
                  onValueChange={(v) =>
                    setSpiritual({ ...spiritual, prayerFrequency: v as typeof spiritual.prayerFrequency })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5_times">5 Times Daily</SelectItem>
                    <SelectItem value="sometimes">Sometimes</SelectItem>
                    <SelectItem value="rarely">Rarely</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t.assessment.step1.quranLabel}</Label>
                <Select
                  value={spiritual.quranFrequency}
                  onValueChange={(v) =>
                    setSpiritual({ ...spiritual, quranFrequency: v as typeof spiritual.quranFrequency })
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
              </div>
            </div>
            <div>
              <Label>{t.assessment.step1.practicesLabel}</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {spiritualPracticeOpts.map((p) => (
                  <div key={p} className="flex items-center space-x-2">
                    <Checkbox
                      id={`asf-sp-${p}`}
                      checked={spiritual.spiritualPractices.includes(p)}
                      onCheckedChange={() =>
                        setSpiritual({
                          ...spiritual,
                          spiritualPractices: toggleItem(spiritual.spiritualPractices, p),
                        })
                      }
                    />
                    <Label htmlFor={`asf-sp-${p}`} className="font-normal cursor-pointer text-sm">
                      {p}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label>Select any spiritual symptoms you experience</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {spiritualSymptomOpts.map((s) => (
                  <div key={s} className="flex items-center space-x-2">
                    <Checkbox
                      id={`asf-ss-${s}`}
                      checked={spiritual.spiritualSymptoms.includes(s)}
                      onCheckedChange={() =>
                        setSpiritual({
                          ...spiritual,
                          spiritualSymptoms: toggleItem(spiritual.spiritualSymptoms, s),
                        })
                      }
                    />
                    <Label htmlFor={`asf-ss-${s}`} className="font-normal cursor-pointer text-sm">
                      {s}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label>Confidential Notes</Label>
              <Textarea
                value={spiritual.confidentialNotes || ""}
                onChange={(e) => setSpiritual({ ...spiritual, confidentialNotes: e.target.value })}
                className="mt-1"
                rows={2}
                placeholder="Any confidential information you'd like to share..."
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (subStep === 1) onBack();
              else setSubStep(subStep - 1);
            }}
            className="flex-1"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t.common.back}
          </Button>
          {subStep < totalSubSteps ? (
            <Button type="button" onClick={() => setSubStep(subStep + 1)} className="flex-1">
              {t.common.next}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="button" onClick={handleComplete} className="flex-1">
              <CheckCircle className="mr-2 h-4 w-4" />
              Complete Assessment
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
