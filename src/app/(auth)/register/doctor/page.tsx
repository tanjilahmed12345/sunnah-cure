"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  doctorRegisterSchema,
  type DoctorRegisterFormData,
} from "@/lib/validations/auth";
import { useTranslation } from "@/i18n/useTranslation";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function DoctorRegisterPage() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<DoctorRegisterFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(doctorRegisterSchema) as any,
    defaultValues: {
      name: "",
      phone: "",
      password: "",
      confirmPassword: "",
      address: "",
      age: undefined as unknown as number,
      gender: undefined as unknown as "male" | "female",
      specialization: undefined as unknown as DoctorRegisterFormData["specialization"],
      qualifications: "",
      experienceYears: undefined as unknown as number,
      bio: "",
    },
  });

  async function onSubmit(data: DoctorRegisterFormData) {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSuccess(true);
      toast.success(t.auth.doctorRegister.successTitle);
    } catch {
      toast.error(t.errors.networkError);
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full bg-green-100 p-4 dark:bg-green-900/30">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-bold">
            {t.auth.doctorRegister.successTitle}
          </h2>
          <p className="mt-2 text-muted-foreground max-w-sm">
            {t.auth.doctorRegister.successMessage}
          </p>
          <Button asChild className="mt-6">
            <Link href="/login">{t.auth.register.loginLink}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          {t.auth.doctorRegister.title}
        </CardTitle>
        <CardDescription>{t.auth.doctorRegister.subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Personal Info */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.auth.register.nameLabel}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t.auth.register.namePlaceholder}
                      {...field}
                    />
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
                    <Input
                      placeholder={t.auth.register.phonePlaceholder}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.auth.register.passwordLabel}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t.auth.register.passwordPlaceholder}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t.auth.register.confirmPasswordLabel}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={
                          t.auth.register.confirmPasswordPlaceholder
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.auth.register.addressLabel}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t.auth.register.addressPlaceholder}
                      {...field}
                    />
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
                      <Input
                        type="number"
                        placeholder={t.auth.register.agePlaceholder}
                        {...field}
                      />
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t.auth.register.genderLabel}
                          />
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

            <Separator className="my-2" />

            {/* Professional Info */}
            <FormField
              control={form.control}
              name="specialization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t.auth.doctorRegister.specializationLabel}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            t.auth.doctorRegister.specializationPlaceholder
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="hijama_therapy">
                        Hijama Therapy
                      </SelectItem>
                      <SelectItem value="ruqyah_therapy">
                        Ruqyah Therapy
                      </SelectItem>
                      <SelectItem value="islamic_counseling">
                        Islamic Counseling
                      </SelectItem>
                      <SelectItem value="general_wellness">
                        General Wellness
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="qualifications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t.auth.doctorRegister.qualificationsLabel}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        t.auth.doctorRegister.qualificationsPlaceholder
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="experienceYears"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t.auth.doctorRegister.experienceLabel}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={
                        t.auth.doctorRegister.experiencePlaceholder
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.auth.doctorRegister.bioLabel}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t.auth.doctorRegister.bioPlaceholder}
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
              {t.auth.doctorRegister.pendingNote}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.auth.doctorRegister.submitButton}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 text-center text-sm">
        <p className="text-muted-foreground">
          {t.auth.register.hasAccount}{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            {t.auth.register.loginLink}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
