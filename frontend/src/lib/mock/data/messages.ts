import type { Message, Conversation } from "@/types";

export const mockMessages: Message[] = [
  {
    id: "msg-1",
    conversationId: "conv-1",
    senderId: "admin-1",
    senderName: "Admin",
    senderRole: "ADMIN",
    content: "Assalamu Alaikum, your Hijama appointment has been approved for April 10th at 10:00 AM.",
    isRead: true,
    createdAt: "2025-03-22T14:00:00Z",
    updatedAt: "2025-03-22T14:00:00Z",
  },
  {
    id: "msg-2",
    conversationId: "conv-1",
    senderId: "user-1",
    senderName: "Ahmed Rahman",
    senderRole: "PATIENT",
    content: "Wa Alaikum Assalam, JazakAllah Khair! Should I bring anything for the session?",
    isRead: true,
    createdAt: "2025-03-22T14:30:00Z",
    updatedAt: "2025-03-22T14:30:00Z",
  },
  {
    id: "msg-3",
    conversationId: "conv-1",
    senderId: "admin-1",
    senderName: "Admin",
    senderRole: "ADMIN",
    content: "Please wear loose clothing and avoid eating 2 hours before the session. Bring a towel if possible.",
    isRead: false,
    createdAt: "2025-03-22T15:00:00Z",
    updatedAt: "2025-03-22T15:00:00Z",
  },
];

export const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    participants: [
      { userId: "user-1", name: "Ahmed Rahman", role: "PATIENT", avatarUrl: null },
      { userId: "admin-1", name: "Admin", role: "ADMIN", avatarUrl: null },
    ],
    lastMessage: mockMessages[2],
    unreadCount: 1,
    appointmentId: "apt-1",
    createdAt: "2025-03-22T14:00:00Z",
    updatedAt: "2025-03-22T15:00:00Z",
  },
];
