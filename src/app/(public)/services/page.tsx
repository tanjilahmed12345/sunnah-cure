"use client";

import { ServiceCard } from "@/components/common/ServiceCard";
import { PageHeader } from "@/components/common/PageHeader";
import { mockServices } from "@/lib/mock/data/services";
import { useTranslation } from "@/i18n/useTranslation";

export default function ServicesPage() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-12 sm:py-16">
      <PageHeader
        title={t.servicesPage.title}
        description={t.servicesPage.subtitle}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {mockServices.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}
