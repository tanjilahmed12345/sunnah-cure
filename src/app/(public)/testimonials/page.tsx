"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/useTranslation";
import { mockTestimonials } from "@/lib/mock/data/testimonials";
import { Star, Quote, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const serviceFilters = [
  { id: "all", label: "All", labelBn: "সব" },
  { id: "Hijama Therapy", label: "Hijama", labelBn: "হিজামা" },
  { id: "Ruqyah Therapy", label: "Ruqyah", labelBn: "রুকইয়াহ" },
  { id: "Islamic Counseling", label: "Counseling", labelBn: "কাউন্সেলিং" },
  { id: "Health Assessment", label: "Assessment", labelBn: "মূল্যায়ন" },
];

export default function TestimonialsPage() {
  const { t, locale } = useTranslation();
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered =
    activeFilter === "all"
      ? mockTestimonials
      : mockTestimonials.filter((t) => t.service === activeFilter);

  return (
    <div className="py-16 sm:py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {t.landing.testimonials.title}
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-lg">
            {t.landing.testimonials.subtitle}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          <Filter className="h-4 w-4 text-muted-foreground mr-1" />
          {serviceFilters.map((filter) => (
            <Button
              key={filter.id}
              variant={activeFilter === filter.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(filter.id)}
              className="rounded-full"
            >
              {locale === "bn" ? filter.labelBn : filter.label}
            </Button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item, i) => {
            const name = locale === "bn" ? item.nameBn : item.name;
            const text = locale === "bn" ? item.textBn : item.text;
            const service = locale === "bn" ? item.serviceBn : item.service;
            const initials = item.name
              .split(" ")
              .map((n) => n[0])
              .join("");

            return (
              <Card
                key={item.id}
                className={cn(
                  "rounded-xl hover:shadow-lg transition-all duration-500 group opacity-0 animate-[fadeSlideUp_0.5s_ease_forwards]",
                )}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star
                          key={s}
                          className={cn(
                            "h-4 w-4 transition-transform duration-300",
                            s < item.rating
                              ? "fill-amber-400 text-amber-400 group-hover:scale-110"
                              : "text-muted-foreground/30"
                          )}
                          style={{ transitionDelay: `${s * 50}ms` }}
                        />
                      ))}
                    </div>
                    <Quote className="h-5 w-5 text-primary/20 group-hover:text-primary/40 transition-colors" />
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                    &ldquo;{text}&rdquo;
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                        {initials}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{name}</p>
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {service}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            No reviews found for this service.
          </p>
        )}
      </div>
    </div>
  );
}
