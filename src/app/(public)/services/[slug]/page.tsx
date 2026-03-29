"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { mockServices } from "@/lib/mock/data/services";
import { useTranslation } from "@/i18n/useTranslation";
import { formatCurrency } from "@/lib/utils";
import {
  CheckCircle,
  Clock,
  Banknote,
  Wifi,
  Building2,
  ArrowLeft,
  ArrowRight,
  ListChecks,
  HelpCircle,
} from "lucide-react";

export default function ServiceDetailPage() {
  const { t, locale } = useTranslation();
  const params = useParams();
  const slug = params.slug as string;

  const service = mockServices.find((s) => s.slug === slug);

  if (!service) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">{t.errors.notFound}</h1>
        <p className="mt-2 text-muted-foreground">
          The service you are looking for does not exist.
        </p>
        <Button asChild className="mt-6">
          <Link href="/services">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t.common.back}
          </Link>
        </Button>
      </div>
    );
  }

  const name = locale === "bn" ? service.nameBn : service.name;
  const fullDescription =
    locale === "bn" ? service.fullDescriptionBn : service.fullDescription;
  const benefits = locale === "bn" ? service.benefitsBn : service.benefits;
  const whatToExpect =
    locale === "bn" ? service.whatToExpectBn : service.whatToExpect;

  const faqItems = [
    {
      q: `How long is a ${service.name} session?`,
      a: `Each ${service.name} session typically lasts ${service.durationMinutes} minutes. The actual duration may vary depending on individual needs and the practitioner's assessment.`,
    },
    {
      q: `Is ${service.name} available online?`,
      a: service.isOnline
        ? `Yes, ${service.name} is available online. You can book a virtual session from the comfort of your home.`
        : `Currently, ${service.name} is only available as an in-person service at our center.`,
    },
    {
      q: `How should I prepare for my ${service.name} session?`,
      a: `We recommend wearing comfortable clothing, staying hydrated, and arriving 10 minutes early for your appointment. Avoid heavy meals right before the session.`,
    },
    {
      q: `Can I book multiple sessions?`,
      a: `Absolutely. Many patients benefit from multiple sessions. After your first session, your practitioner will recommend a follow-up plan tailored to your needs.`,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 sm:py-16">
      {/* Back Link */}
      <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
        <Link href="/services">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t.common.back}
        </Link>
      </Button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {service.isOnline && (
                <Badge variant="secondary" className="gap-1">
                  <Wifi className="h-3 w-3" />
                  {t.status.online}
                </Badge>
              )}
              {service.isOffline && (
                <Badge variant="outline" className="gap-1">
                  <Building2 className="h-3 w-3" />
                  {t.status.offline}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {name}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              {fullDescription}
            </p>
          </div>

          {/* Benefits */}
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-primary" />
              {t.servicesPage.benefits}
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {benefits.map((benefit, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl border p-4"
                >
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* What to Expect */}
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <ListChecks className="h-5 w-5 text-primary" />
              {t.servicesPage.whatToExpect}
            </h2>
            <div className="space-y-3">
              {whatToExpect.map((step, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {i + 1}
                  </div>
                  <p className="text-sm text-muted-foreground pt-1.5">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Service FAQ */}
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <HelpCircle className="h-5 w-5 text-primary" />
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left text-sm">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="rounded-xl sticky top-24">
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-4">Service Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {t.servicesPage.duration}
                      </p>
                      <p className="font-medium">
                        {service.durationMinutes} min
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Banknote className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {t.servicesPage.price}
                      </p>
                      <p className="font-medium text-lg text-primary">
                        {formatCurrency(service.priceBDT)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      {service.isOnline ? (
                        <Wifi className="h-5 w-5 text-primary" />
                      ) : (
                        <Building2 className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {t.servicesPage.mode}
                      </p>
                      <p className="font-medium">
                        {service.isOnline && service.isOffline
                          ? t.servicesPage.onlineOffline
                          : t.servicesPage.offlineOnly}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <Button asChild size="lg" className="w-full text-base">
                  <Link
                    href={`/dashboard/appointments/book?service=${service.type}`}
                  >
                    {t.servicesPage.bookThisService}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
