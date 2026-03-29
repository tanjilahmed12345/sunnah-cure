import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: "h-7 w-7",
  md: "h-8 w-8",
  lg: "h-10 w-10",
};

const textSizes = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-2xl",
};

export function Logo({ size = "md", showText = true, className }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <Image
        src="/logo.svg"
        alt="Sunnah Cure"
        width={40}
        height={40}
        className={cn("rounded-md", sizes[size])}
      />
      {showText && (
        <span className={cn("font-bold text-primary", textSizes[size])}>
          Sunnah Cure
        </span>
      )}
    </Link>
  );
}
