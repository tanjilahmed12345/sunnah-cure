"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { cn } from "@/lib/utils";
import type { Testimonial } from "@/types";

interface TestimonialSliderProps {
  testimonials: Testimonial[];
  autoplay?: boolean;
  interval?: number;
}

export function TestimonialSlider({
  testimonials,
  autoplay = true,
  interval = 4000,
}: TestimonialSliderProps) {
  const { locale } = useTranslation();
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => {
    const updateVisibleCount = () => {
      setVisibleCount(
        window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1
      );
    };
    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  const maxIndex = Math.max(testimonials.length - visibleCount, 0);

  const goTo = useCallback(
    (index: number) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrent(Math.max(0, Math.min(index, maxIndex)));
      setTimeout(() => setIsAnimating(false), 500);
    },
    [isAnimating, maxIndex]
  );

  const next = useCallback(() => {
    goTo(current >= maxIndex ? 0 : current + 1);
  }, [current, maxIndex, goTo]);

  const prev = useCallback(() => {
    goTo(current <= 0 ? maxIndex : current - 1);
  }, [current, maxIndex, goTo]);

  useEffect(() => {
    if (!autoplay || isPaused) return;
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [autoplay, isPaused, interval, next]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slider */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${current * (100 / visibleCount)}%)`,
          }}
        >
          {testimonials.map((item) => {
            const name = locale === "bn" ? item.nameBn : item.name;
            const text = locale === "bn" ? item.textBn : item.text;
            const service = locale === "bn" ? item.serviceBn : item.service;
            const initials = item.name
              .split(" ")
              .map((n) => n[0])
              .join("");

            return (
              <div
                key={item.id}
                className="flex-shrink-0 px-3"
                style={{ width: `${100 / visibleCount}%` }}
              >
                <Card className="h-full rounded-xl border hover:shadow-lg transition-shadow duration-300 group">
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
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {service}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="outline"
        size="icon"
        className="absolute -left-4 top-1/2 -translate-y-1/2 rounded-full shadow-md bg-background/90 backdrop-blur-sm h-10 w-10 hidden sm:flex"
        onClick={prev}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="absolute -right-4 top-1/2 -translate-y-1/2 rounded-full shadow-md bg-background/90 backdrop-blur-sm h-10 w-10 hidden sm:flex"
        onClick={next}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              i === current
                ? "w-8 bg-primary"
                : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
          />
        ))}
      </div>
    </div>
  );
}
