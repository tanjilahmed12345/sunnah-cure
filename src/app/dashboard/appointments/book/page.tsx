"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslation } from "@/i18n/useTranslation";
import { mockServices } from "@/lib/mock/data/services";
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
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { ServiceType, AppointmentMode, Service } from "@/types";

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
  const serviceParam = searchParams.get("service") as ServiceType | null;
  const validService = serviceParam && mockServices.some((s) => s.type === serviceParam)
    ? serviceParam
    : null;

  const [currentStep, setCurrentStep] = useState(validService ? 2 : 1);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(
    validService
  );
  const [mode, setMode] = useState<AppointmentMode>("offline");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceFormData, setServiceFormData] = useState<
    HijamaBookingFormData | RuqyahBookingFormData | CounselingBookingFormData | null
  >(null);
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);

  const steps = [
    { title: t.booking.step1 },
    { title: t.booking.step2 },
    { title: t.booking.step3 },
    { title: t.booking.step4 },
  ];

  const bookableServices = mockServices;
  const selectedServiceData = mockServices.find(
    (s) => s.type === selectedService
  );

  function handleServiceSelect(type: ServiceType) {
    setSelectedService(type);
    setCurrentStep(2);
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
        setCalculatedPrice(null); // "not sure" — pay after session
      }
    } else {
      setCalculatedPrice(null);
    }
    setCurrentStep(3);
  }

  async function handleFinalSubmit() {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    toast.success(t.booking.bookingSuccess);
    setCurrentStep(4);
  }

  return (
    <div>
      <PageHeader title={t.booking.title} />

      <StepIndicator steps={steps} currentStep={currentStep} className="mb-8" />

      {/* Step 1: Choose Service */}
      {currentStep === 1 && (
        <div>
          <p className="text-muted-foreground mb-6">{t.booking.selectService}</p>
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
        </div>
      )}

      {/* Step 2: Service-specific form */}
      {currentStep === 2 && selectedService === "hijama" && selectedServiceData && (
        <HijamaForm
          onSubmit={handleServiceFormSubmit}
          onBack={() => setCurrentStep(1)}
          service={selectedServiceData}
        />
      )}
      {currentStep === 2 && selectedService === "ruqyah" && (
        <RuqyahForm
          onSubmit={handleServiceFormSubmit}
          onBack={() => setCurrentStep(1)}
        />
      )}
      {currentStep === 2 && selectedService === "counseling" && (
        <CounselingForm
          onSubmit={handleServiceFormSubmit}
          onBack={() => setCurrentStep(1)}
        />
      )}
      {currentStep === 2 && selectedService === "assessment" && (
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
                onClick={() => setCurrentStep(1)}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t.common.back}
              </Button>
              <Button
                onClick={() => {
                  setServiceFormData(null);
                  setCalculatedPrice(null);
                  setCurrentStep(3);
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

      {/* Step 3: Mode + Confirmation */}
      {currentStep === 3 && selectedServiceData && (
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
                {selectedServiceData.isOnline && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="online" id="online" />
                    <Label htmlFor="online">{t.appointments.online}</Label>
                  </div>
                )}
                {selectedServiceData.isOffline && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="offline" id="offline" />
                    <Label htmlFor="offline">{t.appointments.offline}</Label>
                  </div>
                )}
              </RadioGroup>
              {mode === "online" && (
                <p className="text-sm text-muted-foreground mt-2">
                  {t.booking.counseling.onlinePaymentNote}
                </p>
              )}
            </div>

            <Separator />

            {/* Summary */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t.appointments.service}
                </span>
                <span className="font-medium">
                  {selectedServiceData.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t.appointments.mode}
                </span>
                <span className="font-medium capitalize">{mode}</span>
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
              {calculatedPrice != null ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.payment.amount}</span>
                  <span className="font-semibold text-lg">
                    {formatCurrency(calculatedPrice)}
                  </span>
                </div>
              ) : selectedService === "hijama" ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 p-3">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    Payment will be calculated after the session based on the number of cups used.
                  </p>
                </div>
              ) : (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.payment.amount}</span>
                  <span className="font-semibold text-lg">
                    {formatCurrency(selectedServiceData.priceBDT)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(2)}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t.common.back}
              </Button>
              <Button
                onClick={handleFinalSubmit}
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="mr-2 h-4 w-4" />
                )}
                {t.booking.submitBooking}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Success */}
      {currentStep === 4 && (
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
