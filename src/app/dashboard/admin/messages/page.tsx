"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { MessageBubble } from "@/components/common/MessageBubble";
import { EmptyState } from "@/components/common/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  mockConversations,
  mockMessages,
} from "@/lib/mock/data/messages";
import type { Conversation, Message } from "@/types";
import { Send, MessageSquare } from "lucide-react";

export default function AdminMessagesPage() {
  const { t } = useTranslation();
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(
      mockConversations.length > 0 ? mockConversations[0] : null
    );
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([...mockMessages]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUserId = "admin-1";

  const conversationMessages = selectedConversation
    ? messages.filter(
        (m) => m.conversationId === selectedConversation.id
      )
    : [];

  const getOtherParticipant = (conv: Conversation) => {
    return conv.participants.find((p) => p.userId !== currentUserId);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationMessages.length]);

  const handleSend = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const msg: Message = {
      id: `msg-${Date.now()}`,
      conversationId: selectedConversation.id,
      senderId: currentUserId,
      senderName: "Admin",
      senderRole: "ADMIN",
      content: newMessage.trim(),
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, msg]);
    setNewMessage("");
    toast.success("Message sent.");
  };

  return (
    <div>
      <PageHeader title={t.messages.title} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-220px)]">
        {/* Conversation List */}
        <Card className="md:col-span-1 flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {mockConversations.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {t.messages.noConversations}
                </div>
              ) : (
                mockConversations.map((conv) => {
                  const other = getOtherParticipant(conv);
                  const isSelected = selectedConversation?.id === conv.id;
                  const initials = other
                    ? other.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : "??";

                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                        isSelected
                          ? "bg-primary/10"
                          : "hover:bg-muted"
                      )}
                    >
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm truncate">
                            {other?.name || "Unknown"}
                          </span>
                          {conv.unreadCount > 0 && (
                            <Badge
                              variant="default"
                              className="h-5 w-5 flex items-center justify-center p-0 text-[10px] rounded-full"
                            >
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                        {conv.lastMessage && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {conv.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Chat Area */}
        <Card className="md:col-span-2 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {getOtherParticipant(selectedConversation)
                      ?.name.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2) || "??"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">
                    {getOtherParticipant(selectedConversation)?.name ||
                      "Unknown"}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {getOtherParticipant(selectedConversation)?.role || ""}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {conversationMessages.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    {t.messages.noMessages}
                  </p>
                ) : (
                  <>
                    {conversationMessages.map((msg) => (
                      <MessageBubble
                        key={msg.id}
                        message={msg}
                        isOwn={msg.senderId === currentUserId}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder={t.messages.typeMessage}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSend();
                    }}
                  />
                  <Button size="icon" onClick={handleSend}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <EmptyState
                icon={
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                }
                title={t.messages.noConversations}
                description="Select a conversation to start messaging"
              />
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
