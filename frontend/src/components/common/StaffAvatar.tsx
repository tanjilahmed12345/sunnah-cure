"use client";

import { cn } from "@/lib/utils";
import type { Gender } from "@/types";

interface StaffAvatarProps {
  gender: Gender;
  name: string;
  profilePictureUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
};

/**
 * Circular avatar for staff members.
 * Shows profile picture if available, otherwise a gender-based Muslim avatar.
 * Male: man with kufi/topi and beard
 * Female: woman with hijab/veil
 */
export function StaffAvatar({
  gender,
  name,
  profilePictureUrl,
  size = "md",
  className,
}: StaffAvatarProps) {
  if (profilePictureUrl) {
    return (
      <img
        src={profilePictureUrl}
        alt={name}
        className={cn(
          "rounded-full object-cover border-2 border-muted",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center overflow-hidden border-2 border-muted shrink-0",
        sizeClasses[size],
        className
      )}
      title={name}
    >
      {gender === "male" ? <MaleMuslimAvatar /> : <FemaleMuslimAvatar />}
    </div>
  );
}

function MaleMuslimAvatar() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      {/* Background */}
      <rect width="100" height="100" fill="#e8d5b7" />
      {/* Face */}
      <ellipse cx="50" cy="52" rx="22" ry="26" fill="#d4a574" />
      {/* Kufi/Topi (Muslim cap) */}
      <ellipse cx="50" cy="28" rx="24" ry="14" fill="#f5f5f5" />
      <rect x="26" y="28" width="48" height="6" rx="2" fill="#f5f5f5" />
      <rect x="26" y="33" width="48" height="3" fill="#e0e0e0" />
      {/* Eyes */}
      <ellipse cx="41" cy="48" rx="3" ry="2.5" fill="#2c1810" />
      <ellipse cx="59" cy="48" rx="3" ry="2.5" fill="#2c1810" />
      {/* Nose */}
      <ellipse cx="50" cy="56" rx="2.5" ry="3" fill="#c49565" />
      {/* Beard */}
      <path
        d="M32 60 Q35 55 40 58 Q45 62 50 63 Q55 62 60 58 Q65 55 68 60 Q70 72 65 80 Q58 88 50 90 Q42 88 35 80 Q30 72 32 60Z"
        fill="#3d2b1f"
      />
      {/* Mouth (hidden behind beard, slight gap) */}
      <path d="M44 62 Q50 65 56 62" stroke="#2c1810" strokeWidth="1" fill="none" />
    </svg>
  );
}

function FemaleMuslimAvatar() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      {/* Background */}
      <rect width="100" height="100" fill="#d5c4e0" />
      {/* Hijab outer */}
      <path
        d="M15 40 Q15 15 50 12 Q85 15 85 40 Q88 65 80 85 Q70 98 50 100 Q30 98 20 85 Q12 65 15 40Z"
        fill="#7c6b8a"
      />
      {/* Hijab inner wrap */}
      <path
        d="M25 42 Q25 22 50 18 Q75 22 75 42 Q75 50 72 55 Q65 62 50 64 Q35 62 28 55 Q25 50 25 42Z"
        fill="#8d7b9b"
      />
      {/* Face */}
      <ellipse cx="50" cy="48" rx="20" ry="22" fill="#d4a574" />
      {/* Face frame from hijab */}
      <path
        d="M30 38 Q30 26 50 23 Q70 26 70 38"
        stroke="#7c6b8a"
        strokeWidth="5"
        fill="none"
      />
      {/* Eyes */}
      <ellipse cx="42" cy="46" rx="3" ry="2.5" fill="#2c1810" />
      <ellipse cx="58" cy="46" rx="3" ry="2.5" fill="#2c1810" />
      {/* Eyelashes */}
      <path d="M39 44 Q42 42 45 44" stroke="#2c1810" strokeWidth="0.8" fill="none" />
      <path d="M55 44 Q58 42 61 44" stroke="#2c1810" strokeWidth="0.8" fill="none" />
      {/* Nose */}
      <ellipse cx="50" cy="53" rx="2" ry="2.5" fill="#c49565" />
      {/* Mouth */}
      <path d="M45 59 Q50 62 55 59" stroke="#b85c5c" strokeWidth="1.5" fill="none" />
      {/* Chin drape */}
      <path
        d="M30 58 Q30 70 35 80 Q40 90 50 92 Q60 90 65 80 Q70 70 70 58"
        stroke="#7c6b8a"
        strokeWidth="4"
        fill="none"
      />
    </svg>
  );
}
