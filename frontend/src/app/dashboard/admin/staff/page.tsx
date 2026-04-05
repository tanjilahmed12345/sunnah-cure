"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslation } from "@/i18n/useTranslation";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { PageHeader } from "@/components/common/PageHeader";
import { StaffAvatar } from "@/components/common/StaffAvatar";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { addStaffSchema, type AddStaffFormData } from "@/lib/validations/auth";
import type { DoctorProfile, StaffDesignation } from "@/types";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

interface ApiSuccess<T> {
  success: true;
  data: T;
}

function DesignationBadges({ designations }: { designations: StaffDesignation[] }) {
  return (
    <div className="flex gap-1 flex-wrap">
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

export default function AdminStaffPage() {
  const { t } = useTranslation();
  const [staff, setStaff] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<DoctorProfile | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<DoctorProfile | null>(null);

  const form = useForm<AddStaffFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(addStaffSchema) as any,
    defaultValues: {
      name: "",
      phone: "",
      gender: "" as unknown as "male" | "female",
      age: "" as unknown as number,
      address: "",
      designations: [],
      qualifications: "",
      experienceYears: "" as unknown as number,
      bio: "",
    },
  });

  const fetchStaff = useCallback(async () => {
    try {
      const res = await apiClient.get<ApiSuccess<DoctorProfile[]>>(
        ENDPOINTS.doctors.list
      );
      if (res.success) setStaff(res.data);
    } catch (err) {
      console.error("Failed to fetch staff:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  function openAddDialog() {
    form.reset({
      name: "",
      phone: "",
      gender: "" as unknown as "male" | "female",
      age: "" as unknown as number,
      address: "",
      designations: [],
      qualifications: "",
      experienceYears: "" as unknown as number,
      bio: "",
    });
    setEditingStaff(null);
    setAddDialogOpen(true);
  }

  function openEditDialog(doc: DoctorProfile) {
    setEditingStaff(doc);
    form.reset({
      name: doc.user.name,
      phone: doc.user.phone,
      gender: doc.user.gender,
      age: doc.user.age,
      address: doc.user.address,
      designations: doc.designations,
      qualifications: doc.qualifications,
      experienceYears: doc.experienceYears,
      bio: doc.bio,
    });
    setAddDialogOpen(true);
  }

  async function onSubmit(data: AddStaffFormData) {
    try {
      if (editingStaff) {
        // For editing, we use the same add endpoint or a dedicated update
        // Since there's no specific edit endpoint, we'll use PATCH on detail
        await apiClient.patch<ApiSuccess<DoctorProfile>>(
          ENDPOINTS.doctors.detail(editingStaff.id),
          data
        );
        toast.success(`${data.name}'s profile updated.`);
      } else {
        await apiClient.post<ApiSuccess<DoctorProfile>>(
          ENDPOINTS.doctors.add,
          data
        );
        toast.success(`${data.name} added as staff.`);
      }
      setAddDialogOpen(false);
      setEditingStaff(null);
      fetchStaff();
    } catch (err) {
      toast.error(editingStaff ? "Failed to update staff." : "Failed to add staff.");
      console.error(err);
    }
  }

  async function handleDelete() {
    if (!selectedStaff) return;
    try {
      await apiClient.delete<ApiSuccess<void>>(
        ENDPOINTS.doctors.delete(selectedStaff.id)
      );
      toast.success(`${selectedStaff.user.name} removed from staff.`);
      setSelectedStaff(null);
      fetchStaff();
    } catch (err) {
      toast.error("Failed to remove staff.");
      console.error(err);
    }
  }

  const columns: Column<DoctorProfile>[] = [
    {
      key: "name",
      header: "Name",
      cell: (item) => (
        <div className="flex items-center gap-3">
          <StaffAvatar
            gender={item.user.gender}
            name={item.user.name}
            profilePictureUrl={item.profilePictureUrl}
            size="sm"
          />
          <span className="font-medium">{item.user.name}</span>
        </div>
      ),
    },
    {
      key: "designation",
      header: "Designation",
      cell: (item) => <DesignationBadges designations={item.designations} />,
    },
    {
      key: "phone",
      header: "Phone",
      cell: (item) => item.user.phone,
      hideOnMobile: true,
    },
    {
      key: "experience",
      header: "Experience",
      cell: (item) =>
        item.experienceYears ? `${item.experienceYears} years` : "—",
      hideOnMobile: true,
    },
    {
      key: "actions",
      header: "Actions",
      cell: (item) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              openEditDialog(item);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-600 hover:text-red-700"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedStaff(item);
              setDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const mobileCard = (item: DoctorProfile) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <StaffAvatar
            gender={item.user.gender}
            name={item.user.name}
            profilePictureUrl={item.profilePictureUrl}
            size="md"
          />
          <div>
            <span className="font-medium">{item.user.name}</span>
            <DesignationBadges designations={item.designations} />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{item.user.phone}</p>
        {item.experienceYears > 0 && (
          <p className="text-sm text-muted-foreground">
            {item.experienceYears} years experience
          </p>
        )}
        <div className="flex gap-2 mt-3">
          <Button size="sm" variant="outline" className="flex-1" onClick={() => openEditDialog(item)}>
            <Pencil className="h-3 w-3 mr-1" /> Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="flex-1"
            onClick={() => {
              setSelectedStaff(item);
              setDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="h-3 w-3 mr-1" /> Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageHeader title="Staff Management" />
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Staff
        </Button>
      </div>

      <DataTable data={staff} columns={columns} mobileCard={mobileCard} />

      {/* Add/Edit Staff Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingStaff ? "Edit Staff" : "Add New Staff"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
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
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="01XXXXXXXXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
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
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Age" {...field} />
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
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Address (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Designations */}
              <FormField
                control={form.control}
                name="designations"
                render={() => (
                  <FormItem>
                    <FormLabel>Designation</FormLabel>
                    <div className="flex gap-4 mt-1">
                      {(["raqi", "hajjam"] as const).map((d) => (
                        <FormField
                          key={d}
                          control={form.control}
                          name="designations"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(d)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value || [];
                                    field.onChange(
                                      checked
                                        ? [...current, d]
                                        : current.filter((v) => v !== d)
                                    );
                                  }}
                                />
                              </FormControl>
                              <Label className="font-normal cursor-pointer">
                                {d === "raqi" ? "Raqi" : "Hajjam"}
                              </Label>
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
                name="qualifications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qualifications (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Certifications, degrees..." {...field} />
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
                    <FormLabel>Experience (years, optional)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
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
                    <FormLabel>Bio (optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Short bio..." rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                {editingStaff ? "Update Staff" : "Add Staff"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Remove Staff"
        description={`Are you sure you want to remove ${selectedStaff?.user.name}? They will no longer be able to login.`}
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
