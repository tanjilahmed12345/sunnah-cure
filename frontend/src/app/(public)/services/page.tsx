"use client";

import { useState, useEffect } from "react";
import { ServiceCard } from "@/components/common/ServiceCard";
import { PageHeader } from "@/components/common/PageHeader";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { useTranslation } from "@/i18n/useTranslation";
import type { Service } from "@/types";
import { Loader2 } from "lucide-react";

interface ApiSuccess<T> { success: true; data: T; }

export default function ServicesPage() {
  const { t } = useTranslation();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await apiClient.get<ApiSuccess<Service[]>>(ENDPOINTS.services.list);
        if (res.success) setServices(res.data);
      } catch { /* ignore */ } finally { setLoading(false); }
    }
    fetch();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 sm:py-16">
      <PageHeader
        title={t.servicesPage.title}
        description={t.servicesPage.subtitle}
      />
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  );
}
