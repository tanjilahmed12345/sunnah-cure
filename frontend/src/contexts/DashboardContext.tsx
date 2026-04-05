"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { useAuth } from "./AuthContext";
import type { Appointment, Conversation } from "@/types";

interface ApiSuccess<T> {
  success: true;
  data: T;
}

interface DashboardCounts {
  pendingAppointments: number;
  unreadMessages: number;
}

interface DashboardContextType {
  counts: DashboardCounts;
  refetchCounts: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const POLL_INTERVAL = 15000; // 15 seconds

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { user, isLoggedIn } = useAuth();
  const [counts, setCounts] = useState<DashboardCounts>({
    pendingAppointments: 0,
    unreadMessages: 0,
  });

  const fetchCounts = useCallback(async () => {
    if (!isLoggedIn || !user) return;

    try {
      const [aptsRes, convsRes] = await Promise.all([
        apiClient.get<ApiSuccess<Appointment[]>>(ENDPOINTS.appointments.list),
        apiClient.get<ApiSuccess<Conversation[]>>(ENDPOINTS.messages.conversations),
      ]);

      let pendingAppointments = 0;
      if (aptsRes.success) {
        const list = Array.isArray(aptsRes.data) ? aptsRes.data : [];
        if (user.role === "ADMIN") {
          pendingAppointments = list.filter((a) => a.status === "pending").length;
        } else {
          pendingAppointments = list.filter(
            (a) => a.status === "pending" || a.status === "approved"
          ).length;
        }
      }

      let unreadMessages = 0;
      if (convsRes.success) {
        const convs = Array.isArray(convsRes.data) ? convsRes.data : [];
        unreadMessages = convs.reduce(
          (sum, c) => sum + (c.unreadCount || 0),
          0
        );
      }

      setCounts({ pendingAppointments, unreadMessages });
    } catch {
      // silently fail
    }
  }, [isLoggedIn, user]);

  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchCounts]);

  return (
    <DashboardContext.Provider value={{ counts, refetchCounts: fetchCounts }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardCounts() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboardCounts must be used within DashboardProvider");
  return ctx;
}
