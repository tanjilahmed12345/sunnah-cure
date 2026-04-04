export const APP_NAME = "Sunnah Cure";
export const APP_DESCRIPTION = "Diagnostic Center Appointment Booking System";

export const SUPPORTED_LOCALES = ["en", "bn"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  bn: "বাংলা",
};

export const DATE_LOCALES: Record<Locale, string> = {
  en: "en-US",
  bn: "bn-BD",
};

export const SERVICE_TYPES = ["hijama", "ruqyah", "counseling", "assessment"] as const;

export const APPOINTMENT_STATUSES = [
  "pending",
  "approved",
  "completed",
  "cancelled",
  "rejected",
] as const;

export const PAYMENT_STATUSES = ["paid", "unpaid", "pending"] as const;

export const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  approved: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  unpaid: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  online: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
  offline: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400",
};

export const NAV_ITEMS = [
  { label: "navbar.home", href: "/" },
  { label: "navbar.services", href: "/services" },
  { label: "navbar.about", href: "/about" },
  { label: "navbar.contact", href: "/contact" },
];

export const PATIENT_SIDEBAR_ITEMS = [
  { label: "dashboard.sidebar.overview", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "dashboard.sidebar.appointments", href: "/dashboard/appointments", icon: "CalendarCheck" },
  { label: "dashboard.sidebar.assessment", href: "/dashboard/assessments", icon: "ClipboardList" },
  { label: "dashboard.sidebar.messages", href: "/dashboard/messages", icon: "MessageSquare" },
  { label: "dashboard.sidebar.profile", href: "/dashboard/profile", icon: "User" },
];

export const DOCTOR_SIDEBAR_ITEMS = [
  { label: "dashboard.sidebar.overview", href: "/dashboard/doctor", icon: "LayoutDashboard" },
  { label: "dashboard.sidebar.appointments", href: "/dashboard/doctor/appointments", icon: "CalendarCheck" },
  { label: "dashboard.sidebar.messages", href: "/dashboard/messages", icon: "MessageSquare" },
  { label: "dashboard.sidebar.profile", href: "/dashboard/profile", icon: "User" },
];

export const ADMIN_SIDEBAR_ITEMS = [
  { label: "dashboard.sidebar.overview", href: "/dashboard/admin", icon: "LayoutDashboard" },
  { label: "dashboard.sidebar.appointments", href: "/dashboard/admin/appointments", icon: "CalendarCheck" },
  { label: "dashboard.sidebar.assessments", href: "/dashboard/admin/assessments", icon: "ClipboardList" },
  { label: "dashboard.sidebar.patients", href: "/dashboard/admin/patients", icon: "Users" },
  { label: "dashboard.sidebar.staff", href: "/dashboard/admin/staff", icon: "UserCheck" },
  { label: "dashboard.sidebar.messages", href: "/dashboard/admin/messages", icon: "MessageSquare" },
  { label: "dashboard.sidebar.services", href: "/dashboard/admin/settings", icon: "Settings" },
  { label: "dashboard.sidebar.profile", href: "/dashboard/profile", icon: "User" },
];
