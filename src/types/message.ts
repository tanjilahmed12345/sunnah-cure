import type { Timestamps } from "./common";
import type { UserRole } from "./user";

export interface Message extends Timestamps {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  isRead: boolean;
}

export interface Conversation extends Timestamps {
  id: string;
  participants: {
    userId: string;
    name: string;
    role: UserRole;
    avatarUrl: string | null;
  }[];
  lastMessage: Message | null;
  unreadCount: number;
  appointmentId?: string;
}
