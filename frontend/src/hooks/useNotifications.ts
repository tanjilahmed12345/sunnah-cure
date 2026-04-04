"use client";

import { useState, useCallback, useEffect } from "react";
import type { Notification } from "@/types";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

interface ApiSuccess<T> {
  success: true;
  data: T;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await apiClient.get<ApiSuccess<Notification[]>>(
        ENDPOINTS.notifications.list
      );
      if (res.success) {
        setNotifications(res.data);
      }
    } catch {
      // silently fail if not authenticated
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await apiClient.patch(ENDPOINTS.notifications.markRead(id));
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // ignore
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await apiClient.post(ENDPOINTS.notifications.markAllRead);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // ignore
    }
  }, []);

  return { notifications, unreadCount, markAsRead, markAllAsRead, refetch: fetchNotifications };
}
