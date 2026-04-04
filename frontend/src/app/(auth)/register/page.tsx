"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";
import { useTranslation } from "@/i18n/useTranslation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";

const DUMMY_OTP = "123456";

export default function RegisterPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { login } = useAuth();

  const [step, setStep] = useState<"info" | "otp">("info");
  const [isLoading, setIsLoading] = useState(false);
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const form = useForm<RegisterFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(registerSchema) as any,
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      age: undefined as unknown as number,
      gender: undefined as unknown as "male" | "female",
    },
  });

  async function onInfoSubmit(data: RegisterFormData) {
    setIsLoading(true);
    setFormData(data);
    // Mock: send OTP
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsLoading(false);
    setStep("otp");
  }

  // Auto-fill OTP after 3 seconds
  useEffect(() => {
    if (step !== "otp") return;
    setIsAutoFilling(true);
    const timer = setTimeout(() => {
      const digits = DUMMY_OTP.split("");
      setOtpValues(digits);
      setIsAutoFilling(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [step]);

  // Auto-verify when all 6 digits are filled
  useEffect(() => {
    const code = otpValues.join("");
    if (code.length === 6 && /^\d{6}$/.test(code) && !isVerifying) {
      handleVerify(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpValues]);

  async function handleVerify(code: string) {
    setIsVerifying(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    if (code === DUMMY_OTP) {
      login();
      toast.success("Registration successful!");
      router.push("/dashboard");
    } else {
      toast.error("Invalid OTP. Please try again.");
      setIsVerifying(false);
    }
  }

  function handleOtpChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    const newValues = [...otpValues];
    newValues[index] = value;
    setOtpValues(newValues);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t.auth.register.title}</CardTitle>
        <CardDescription>
          {step === "info"
            ? t.auth.register.subtitle
            : `OTP sent to ${formData?.phone}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "info" ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onInfoSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.auth.register.nameLabel}</FormLabel>
                    <FormControl>
                      <Input placeholder={t.auth.register.namePlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.auth.register.phoneLabel}</FormLabel>
                    <FormControl>
                      <Input placeholder={t.auth.register.phonePlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.auth.register.addressLabel}</FormLabel>
                    <FormControl>
                      <Input placeholder={t.auth.register.addressPlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.auth.register.ageLabel}</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder={t.auth.register.agePlaceholder} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.auth.register.genderLabel}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t.auth.register.genderLabel} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">{t.auth.register.genderMale}</SelectItem>
                          <SelectItem value="female">{t.auth.register.genderFemale}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t.auth.register.submitButton}
              </Button>
            </form>
          </Form>
        ) : (
          <div className="space-y-6">
            {isAutoFilling && (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <p className="text-sm text-muted-foreground">Waiting for OTP...</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Enter OTP</label>
              <div className="flex justify-center gap-2 mt-2">
                {otpValues.map((val, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={val}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="h-12 w-12 rounded-lg border-2 border-input bg-background text-center text-lg font-semibold focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    disabled={isAutoFilling || isVerifying}
                  />
                ))}
              </div>
            </div>

            {isVerifying && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying...
              </div>
            )}

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setStep("info");
                setOtpValues(["", "", "", "", "", ""]);
                setIsAutoFilling(false);
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to registration
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-center text-sm">
        <p className="text-muted-foreground w-full">
          {t.auth.register.hasAccount}{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            {t.auth.register.loginLink}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
