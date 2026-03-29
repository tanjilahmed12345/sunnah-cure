"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ServiceCard } from "@/components/common/ServiceCard";
import { mockServices } from "@/lib/mock/data/services";
import { useTranslation } from "@/i18n/useTranslation";
import {
  Star,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  CheckCircle,
  Search,
  CalendarCheck,
  Stethoscope,
  ClipboardCheck,
} from "lucide-react";

const testimonials = [
  {
    name: "Ahmed Rahman",
    text: "The Hijama therapy session was incredibly professional. I felt a significant improvement in my chronic back pain after just two sessions. Highly recommended!",
    rating: 5,
  },
  {
    name: "Fatima Begum",
    text: "The Ruqyah sessions brought me immense peace. The practitioner was compassionate and knowledgeable. I felt safe throughout the entire process.",
    rating: 5,
  },
  {
    name: "Yusuf Islam",
    text: "Islamic counseling helped me navigate a very difficult time in my life. The faith-based approach made all the difference in my recovery.",
    rating: 4,
  },
  {
    name: "Aisha Khatun",
    text: "The health assessment was thorough and the recommendations were very helpful. Great service that combines modern and traditional healing.",
    rating: 5,
  },
];

const howItWorksIcons = [Search, CalendarCheck, Stethoscope, ClipboardCheck];

export default function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-amber-50 dark:from-teal-950/30 dark:via-background dark:to-amber-950/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 right-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-96 w-96 rounded-full bg-amber-500/5 blur-3xl" />
        <div className="container relative mx-auto px-4 py-20 sm:py-28 lg:py-36">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {t.landing.hero.title}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl leading-relaxed">
              {t.landing.hero.subtitle}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="w-full sm:w-auto text-base px-8">
                <Link href="/dashboard/appointments/book">
                  {t.landing.hero.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-base px-8"
              >
                <Link href="/services">{t.landing.hero.secondaryCta}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t.landing.services.title}
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              {t.landing.services.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-semibold text-primary uppercase tracking-wide">
                {t.landing.about.subtitle}
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                {t.landing.about.title}
              </h2>
              <p className="mt-6 text-muted-foreground leading-relaxed text-lg">
                {t.landing.about.description}
              </p>
              <div className="mt-8 rounded-xl border-l-4 border-primary bg-primary/5 p-6">
                <p className="text-foreground font-medium italic">
                  &ldquo;{t.landing.about.mission}&rdquo;
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "4+", label: "Services" },
                { value: "10+", label: "Practitioners" },
                { value: "500+", label: "Patients Served" },
                { value: "98%", label: "Satisfaction Rate" },
              ].map((stat) => (
                <Card key={stat.label} className="rounded-xl text-center p-6">
                  <CardContent className="p-0">
                    <p className="text-3xl font-bold text-primary">{stat.value}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t.landing.howItWorks.title}
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              {t.landing.howItWorks.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {(
              [
                {
                  title: t.landing.howItWorks.step1Title,
                  desc: t.landing.howItWorks.step1Description,
                },
                {
                  title: t.landing.howItWorks.step2Title,
                  desc: t.landing.howItWorks.step2Description,
                },
                {
                  title: t.landing.howItWorks.step3Title,
                  desc: t.landing.howItWorks.step3Description,
                },
                {
                  title: t.landing.howItWorks.step4Title,
                  desc: t.landing.howItWorks.step4Description,
                },
              ] as const
            ).map((step, i) => {
              const Icon = howItWorksIcons[i];
              return (
                <div key={i} className="relative text-center group">
                  {i < 3 && (
                    <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] border-t-2 border-dashed border-primary/20" />
                  )}
                  <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <span className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {i + 1}
                    </span>
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t.landing.testimonials.title}
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              {t.landing.testimonials.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((item, i) => (
              <Card key={i} className="rounded-xl">
                <CardContent className="p-6">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star
                        key={s}
                        className={`h-4 w-4 ${
                          s < item.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    &ldquo;{item.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {item.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <span className="font-medium text-sm">{item.name}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t.landing.faq.title}
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              {t.landing.faq.subtitle}
            </p>
          </div>
          <div className="mx-auto max-w-3xl">
            <Accordion type="single" collapsible className="w-full">
              {[
                { q: t.landing.faq.q1, a: t.landing.faq.a1 },
                { q: t.landing.faq.q2, a: t.landing.faq.a2 },
                { q: t.landing.faq.q3, a: t.landing.faq.a3 },
                { q: t.landing.faq.q4, a: t.landing.faq.a4 },
                { q: t.landing.faq.q5, a: t.landing.faq.a5 },
              ].map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left text-base">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-primary to-teal-600 dark:from-primary/90 dark:to-teal-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t.landing.cta.title}
          </h2>
          <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
            {t.landing.cta.subtitle}
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="mt-8 text-base px-8 bg-white text-primary hover:bg-white/90"
          >
            <Link href="/dashboard/appointments/book">
              {t.landing.cta.button}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t.landing.contact.title}
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              {t.landing.contact.subtitle}
            </p>
          </div>
          <div className="mx-auto max-w-2xl grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">{t.footer.address}</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">{t.footer.phone}</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">{t.footer.email}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
