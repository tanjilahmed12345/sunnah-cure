"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { toast } from "sonner";
import { useTranslation } from "@/i18n/useTranslation";
import { useAuth } from "@/contexts/AuthContext";
import { mockDoctors } from "@/lib/mock/data/doctors";
import { PageHeader } from "@/components/common/PageHeader";
import { StaffAvatar } from "@/components/common/StaffAvatar";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload } from "lucide-react";
import type { StaffDesignation } from "@/types";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .regex(/^01[3-9]\d{8}$/, "Please enter a valid phone number"),
  address: z.string().min(1, "Address is required"),
  age: z.coerce.number().min(1, "Age is required").max(120),
  gender: z.enum(["male", "female"]),
});

const staffProfileSchema = z.object({
  qualifications: z.string().optional(),
  bio: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type StaffProfileFormData = z.infer<typeof staffProfileSchema>;

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isStaffLoading, setIsStaffLoading] = useState(false);

  const isStaff = user?.role === "DOCTOR";
  const staffProfile = isStaff
    ? mockDoctors.find((d) => d.userId === user?.id) || mockDoctors[0]
    : null;

  const profileForm = useForm<ProfileFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(profileSchema) as any,
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      address: user?.address || "",
      age: user?.age || 0,
      gender: user?.gender || "male",
    },
  });

  const staffForm = useForm<StaffProfileFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(staffProfileSchema) as any,
    defaultValues: {
      qualifications: staffProfile?.qualifications || "",
      bio: staffProfile?.bio || "",
    },
  });

  async function onProfileSubmit(data: ProfileFormData) {
    setIsProfileLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsProfileLoading(false);
    toast.success(t.common.success);
  }

  async function onStaffSubmit(data: StaffProfileFormData) {
    setIsStaffLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsStaffLoading(false);
    toast.success("Professional info updated.");
  }

  function handlePhotoUpload() {
    // Mock: In real app, this would open a file picker and upload
    toast.success("Profile picture updated. (Demo)");
  }

  if (!user) return null;

  return (
    <div>
      <PageHeader title={t.profile.title} />

      <div className="space-y-6 max-w-2xl">
        {/* Profile Picture (Staff only) */}
        {isStaff && staffProfile && (
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <StaffAvatar
                  gender={user.gender}
                  name={user.name}
                  profilePictureUrl={staffProfile.profilePictureUrl}
                  size="lg"
                />
                <div>
                  <p className="font-medium">{user.name}</p>
                  <DesignationBadges designations={staffProfile.designations} />
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={handlePhotoUpload}
                  >
                    <Upload className="mr-2 h-3 w-3" />
                    Upload Photo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t.profile.personalInfo}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form
                onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.auth.register.nameLabel}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.auth.register.phoneLabel}</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Phone number cannot be changed (used for OTP login)
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.auth.register.addressLabel}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={profileForm.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.auth.register.ageLabel}</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
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
                <Button type="submit" disabled={isProfileLoading}>
                  {isProfileLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t.profile.updateProfile}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Professional Info (Staff only) */}
        {isStaff && staffProfile && (
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...staffForm}>
                <form
                  onSubmit={staffForm.handleSubmit(onStaffSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={staffForm.control}
                    name="qualifications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qualifications</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Certifications, degrees..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={staffForm.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell patients about yourself..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isStaffLoading}>
                    {isStaffLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Update Professional Info
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function DesignationBadges({ designations }: { designations: StaffDesignation[] }) {
  return (
    <div className="flex gap-1 mt-1">
      {designations.map((d) => (
        <Badge
          key={d}
          variant="secondary"
          className={
            d === "raqi"
              ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
              : "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400"
          }
        >
          {d === "raqi" ? "Raqi" : "Hajjam"}
        </Badge>
      ))}
    </div>
  );
}
