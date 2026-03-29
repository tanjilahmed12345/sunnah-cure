"use client";

import { useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { mockCurrentUser } from "@/lib/mock/data/users";
import {
  mockConversations,
  mockMessages,
} from "@/lib/mock/data/messages";
import { PageHeader } from "@/components/common/PageHeader";
import { MessageBubble } from "@/components/common/MessageBubble";
import { EmptyState } from "@/components/common/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types";

export default function MessagesPage() {
  const { t } = useTranslation();
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(
      mockConversations.length > 0 ? mockConversations[0] : null
    );
  const [message, setMessage] = useState("");

  const conversationMessages = selectedConversation
    ? mockMessages.filter(
        (m) => m.conversationId === selectedConversation.id
      )
    : [];

  function getOtherParticipant(conv: Conversation) {
    return conv.participants.find(
      (p) => p.userId !== mockCurrentUser.id
    ) || conv.participants[0];
  }

  function handleSend() {
    if (!message.trim()) return;
    toast.success(t.messages.send);
    setMessage("");
  }

  return (
    <div>
      <PageHeader title={t.messages.title} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-220px)]">
        {/* Conversation List */}
        <Card className="md:col-span-1 flex flex-col">
          <CardContent className="p-0 flex-1">
            <ScrollArea className="h-full">
              {mockConversations.length === 0 ? (
                <EmptyState
                  icon={<MessageSquare className="h-8 w-8 text-muted-foreground" />}
                  title={t.messages.noConversations}
                />
              ) : (
                <div className="divide-y">
                  {mockConversations.map((conv) => {
                    const other = getOtherParticipant(conv);
                    const isSelected = selectedConversation?.id === conv.id;
                    const initials = other.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2);

                    return (
                      <div
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv)}
                        className={cn(
                          "flex items-center gap-3 p-4 cursor-pointer transition-colors hover:bg-muted/50",
                          isSelected && "bg-muted"
                        )}
                      >
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarFallback className="text-sm">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm truncate">
                              {other.name}
                            </span>
                            {conv.unreadCount > 0 && (
                              <Badge className="h-5 w-5 flex items-center justify-center rounded-full p-0 text-[10px]">
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
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Message Thread */}
        <Card className="md:col-span-2 flex flex-col">
          <CardContent className="flex flex-col flex-1 p-0">
            {selectedConversation ? (
              <>
                {/* Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getOtherParticipant(selectedConversation)
                          .name.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">
                      {getOtherParticipant(selectedConversation).name}
                    </span>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  {conversationMessages.length === 0 ? (
                    <p className="text-center py-8 text-sm text-muted-foreground">
                      {t.messages.noMessages}
                    </p>
                  ) : (
                    conversationMessages.map((msg) => (
                      <MessageBubble
                        key={msg.id}
                        message={msg}
                        isOwn={msg.senderId === mockCurrentUser.id}
                      />
                    ))
                  )}
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={t.messages.typeMessage}
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
              <div className="flex-1 flex items-center justify-center">
                <EmptyState
                  icon={<MessageSquare className="h-8 w-8 text-muted-foreground" />}
                  title={t.messages.noConversations}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
