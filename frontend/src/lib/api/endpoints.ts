export const ENDPOINTS = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
    me: "/auth/me",
  },
  appointments: {
    list: "/appointments",
    detail: (id: string) => `/appointments/${id}`,
    create: "/appointments",
    update: (id: string) => `/appointments/${id}`,
    cancel: (id: string) => `/appointments/${id}/cancel`,
  },
  assessments: {
    list: "/assessments",
    detail: (id: string) => `/assessments/${id}`,
    create: "/assessments",
    update: (id: string) => `/assessments/${id}`,
  },
  services: {
    list: "/services",
    detail: (slug: string) => `/services/${slug}`,
  },
  doctors: {
    list: "/doctors",
    detail: (id: string) => `/doctors/${id}`,
    approve: (id: string) => `/doctors/${id}/approve`,
    reject: (id: string) => `/doctors/${id}/reject`,
  },
  patients: {
    list: "/patients",
    detail: (id: string) => `/patients/${id}`,
  },
  messages: {
    conversations: "/messages/conversations",
    messages: (conversationId: string) => `/messages/${conversationId}`,
    send: (conversationId: string) => `/messages/${conversationId}/send`,
  },
  notifications: {
    list: "/notifications",
    markRead: (id: string) => `/notifications/${id}/read`,
    markAllRead: "/notifications/read-all",
  },
  payments: {
    initiate: "/payments/initiate",
    detail: (id: string) => `/payments/${id}`,
  },
} as const;
