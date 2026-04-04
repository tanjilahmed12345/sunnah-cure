"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/i18n/useTranslation";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { DoctorProfile } from "@/types";
import { Target, Eye, Heart, Users, Award, ShieldCheck } from "lucide-react";

interface ApiSuccess<T> { success: true; data: T; }

const specializationLabels: Record<string, string> = {
  hijama_therapy: "Hijama Therapy",
  ruqyah_therapy: "Ruqyah Therapy",
  islamic_counseling: "Islamic Counseling",
  general_wellness: "General Wellness",
};

export default function AboutPage() {
  const { t } = useTranslation();
  const [approvedDoctors, setApprovedDoctors] = useState<DoctorProfile[]>([]);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await apiClient.get<ApiSuccess<DoctorProfile[]>>(
          ENDPOINTS.doctors.list, { status: "approved" }
        );
        if (res.success) setApprovedDoctors(res.data);
      } catch { /* ignore - public page, doctors are optional */ }
    }
    fetch();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-amber-50 dark:from-teal-950/30 dark:via-background dark:to-amber-950/20">
        <div className="absolute top-20 right-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="container mx-auto px-4 py-16 sm:py-24 text-center">
          <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">
            {t.landing.about.subtitle}
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            {t.landing.about.title}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t.landing.about.description}
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: Heart,
                title: "Compassionate Care",
                desc: "We treat every patient with kindness, empathy, and respect, ensuring a supportive healing environment.",
              },
              {
                icon: ShieldCheck,
                title: "Authentic Practices",
                desc: "All our therapies follow authentic Sunnah methods guided by qualified practitioners with proper training.",
              },
              {
                icon: Award,
                title: "Excellence",
                desc: "We strive for the highest standards in service delivery, practitioner training, and patient outcomes.",
              },
            ].map((value) => (
              <Card key={value.title} className="rounded-xl text-center">
                <CardContent className="p-6">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <value.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {value.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Mission */}
            <Card className="rounded-xl border-l-4 border-l-primary">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Our Mission</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {t.landing.about.mission}
                </p>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  We are committed to making Prophetic medicine accessible to
                  everyone through professional, affordable, and compassionate
                  care that respects the traditions of Islam.
                </p>
              </CardContent>
            </Card>

            {/* Vision */}
            <Card className="rounded-xl border-l-4 border-l-amber-500">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                    <Eye className="h-6 w-6 text-amber-600" />
                  </div>
                  <h2 className="text-2xl font-bold">Our Vision</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  To be the leading center for faith-based holistic healthcare,
                  recognized for excellence in Prophetic medicine, spiritual
                  healing, and patient-centered care.
                </p>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  We envision a future where every individual has access to
                  authentic, quality healthcare that nurtures the body, mind, and
                  soul.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Our Practitioners
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Meet our team of qualified and experienced practitioners dedicated
              to your well-being.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {approvedDoctors.map((doctor) => {
              const initials = doctor.user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2);

              return (
                <Card
                  key={doctor.id}
                  className="rounded-xl hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6 text-center">
                    <Avatar className="h-20 w-20 mx-auto mb-4">
                      {doctor.user.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={doctor.user.avatarUrl}
                          alt={doctor.user.name}
                        />
                      ) : (
                        <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                          {initials}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <h3 className="font-semibold text-lg">
                      {doctor.user.name}
                    </h3>
                    <Badge variant="secondary" className="mt-2">
                      {specializationLabels[doctor.specialization] ||
                        doctor.specialization}
                    </Badge>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {doctor.qualifications}
                    </p>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                      {doctor.bio}
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      <span>{doctor.experienceYears} years experience</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
