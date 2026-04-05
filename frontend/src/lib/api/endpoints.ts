export const ENDPOINTS = {
  auth: {
    login: "/auth/login/",
    register: "/auth/register/",
    logout: "/auth/logout/",
    me: "/auth/me/",
    tokenRefresh: "/auth/token/refresh/",
  },
  appointments: {
    list: "/appointments/",
    detail: (id: string) => `/appointments/${id}/`,
    create: "/appointments/",
    update: (id: string) => `/appointments/${id}/`,
    cancel: (id: string) => `/appointments/${id}/cancel/`,
    calendar: "/appointments/calendar/",
  },
  assessments: {
    list: "/assessments/",
    detail: (id: string) => `/assessments/${id}/`,
    create: "/assessments/",
    update: (id: string) => `/assessments/${id}/`,
  },
  services: {
    list: "/services/",
    detail: (slug: string) => `/services/${slug}/`,
    update: (slug: string) => `/services/${slug}/update/`,
  },
  doctors: {
    list: "/doctors/",
    add: "/doctors/add/",
    detail: (id: string) => `/doctors/${id}/`,
    approve: (id: string) => `/doctors/${id}/approve/`,
    reject: (id: string) => `/doctors/${id}/reject/`,
    delete: (id: string) => `/doctors/${id}/delete/`,
  },
  patients: {
    list: "/patients/",
    detail: (id: string) => `/patients/${id}/`,
  },
  messages: {
    conversations: "/messages/conversations/",
    getOrCreateConversation: "/messages/conversations/get-or-create/",
    messages: (conversationId: string) => `/messages/${conversationId}/`,
    send: (conversationId: string) => `/messages/${conversationId}/send/`,
  },
  notifications: {
    list: "/notifications/",
    markRead: (id: string) => `/notifications/${id}/read/`,
    markAllRead: "/notifications/read-all/",
  },
  payments: {
    initiate: "/payments/initiate/",
    list: "/payments/",
    detail: (id: string) => `/payments/${id}/`,
  },
  admin: {
    stats: "/admin/stats/",
  },
} as const;
