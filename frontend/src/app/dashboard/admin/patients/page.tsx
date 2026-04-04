"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchInput } from "@/components/common/SearchInput";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Card, CardContent } from "@/components/ui/card";
import { mockUsers } from "@/lib/mock/data/users";
import { formatDate } from "@/lib/utils";
import type { User } from "@/types";

export default function AdminPatientsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const patients = mockUsers.filter((u) => u.role === "PATIENT");

  const filteredPatients = useMemo(() => {
    if (!searchQuery) return patients;
    const q = searchQuery.toLowerCase();
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.address.toLowerCase().includes(q)
    );
  }, [searchQuery, patients]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const columns: Column<User>[] = [
    {
      key: "name",
      header: t.auth.register.nameLabel,
      cell: (item) => <span className="font-medium">{item.name}</span>,
    },
    {
      key: "phone",
      header: t.appointments.phone,
      cell: (item) => item.phone,
    },
    {
      key: "address",
      header: t.auth.register.addressLabel,
      cell: (item) => item.address,
      hideOnMobile: true,
    },
    {
      key: "age",
      header: t.auth.register.ageLabel,
      cell: (item) => item.age,
      hideOnMobile: true,
    },
    {
      key: "gender",
      header: t.auth.register.genderLabel,
      cell: (item) => (
        <span className="capitalize">{item.gender}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "joined",
      header: "Joined",
      cell: (item) => formatDate(item.createdAt),
      hideOnMobile: true,
    },
  ];

  const mobileCard = (item: User) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium">{item.name}</span>
          <span className="text-sm text-muted-foreground capitalize">
            {item.gender}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{item.phone}</p>
        <p className="text-sm text-muted-foreground">{item.address}</p>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <PageHeader title={t.dashboard.sidebar.patients} />

      <div className="mb-6">
        <SearchInput
          onSearch={handleSearch}
          placeholder={t.common.search}
          className="max-w-sm"
        />
      </div>

      <DataTable
        data={filteredPatients}
        columns={columns}
        onRowClick={(item) =>
          router.push(`/dashboard/admin/patients/${item.id}`)
        }
        mobileCard={mobileCard}
      />
    </div>
  );
}
