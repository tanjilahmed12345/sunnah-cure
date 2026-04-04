import type { Timestamps } from "./common";

export type ServiceType = "hijama" | "ruqyah" | "counseling" | "assessment";

export interface HijamaPricing {
  minCups: number;
  pricePerCup: number;
}

export interface ModePricing {
  onlinePriceBDT?: number;
  offlinePriceBDT?: number;
  onlineDurationMinutes?: number;
  offlineDurationMinutes?: number;
}

export interface Service extends Timestamps {
  id: string;
  type: ServiceType;
  slug: string;
  name: string;
  nameBn: string;
  description: string;
  descriptionBn: string;
  fullDescription: string;
  fullDescriptionBn: string;
  durationMinutes: number;
  priceBDT: number;
  isActive: boolean;
  isOnline: boolean;
  isOffline: boolean;
  iconName: string;
  imageUrl: string;
  benefits: string[];
  benefitsBn: string[];
  whatToExpect: string[];
  whatToExpectBn: string[];
  hijamaPricing?: HijamaPricing;
  modePricing?: ModePricing;
}
