"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
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
import type { Conversation, Message } from "@/types";
import { Send, MessageSquare, Loader2 } from "lucide-react";

interface ApiSuccess<T> { success: true; data: T; }

export default function AdminMessagesPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchConversations() {
      try {
        const res = await apiClient.get<ApiSuccess<Conversation[]>>(ENDPOINTS.messages.conversations);
        if (res.success) {
          setConversations(res.data);
          if (res.data.length > 0) setSelectedConversation(res.data[0]);
        }
      } catch { /* ignore */ } finally { setLoadingConvs(false); }
    }
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!selectedConversation) return;
    async function fetchMessages() {
      setLoadingMsgs(true);
      try {
        const res = await apiClient.get<ApiSuccess<Message[]>>(ENDPOINTS.messages.messages(selectedConversation!.id));
        if (res.success) setMessages(res.data);
      } catch { /* ignore */ } finally { setLoadingMsgs(false); }
    }
    fetchMessages();
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const getOtherParticipant = (conv: Conversation) => {
    return conv.participants.find((p) => p.userId !== user?.id);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    setIsSending(true);
    try {
      const res = await apiClient.post<ApiSuccess<Message>>(
        ENDPOINTS.messages.send(selectedConversation.id),
        { content: newMessage.trim() }
      );
      if (res.success) {
        setMessages((prev) => [...prev, res.data]);
        setNewMessage("");
      }
    } catch { toast.error("Failed to send message"); }
    finally { setIsSending(false); }
  };

  return (
    <div>
      <PageHeader title={t.messages.title} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-220px)]">
        <Card className="md:col-span-1 flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {loadingConvs ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">{t.messages.noConversations}</div>
              ) : (
                conversations.map((conv) => {
                  const other = getOtherParticipant(conv);
                  const isSelected = selectedConversation?.id === conv.id;
                  const initials = other ? other.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "??";

                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={cn("w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors", isSelected ? "bg-primary/10" : "hover:bg-muted")}
                    >
                      <Avatar className="h-10 w-10 flex-shrink-0"><AvatarFallback>{initials}</AvatarFallback></Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm truncate">{other?.name || "Unknown"}</span>
                          {conv.unreadCount > 0 && (
                            <Badge variant="default" className="h-5 w-5 flex items-center justify-center p-0 text-[10px] rounded-full">{conv.unreadCount}</Badge>
                          )}
                        </div>
                        {conv.lastMessage && <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMessage.content}</p>}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </Card>

        <Card className="md:col-span-2 flex flex-col">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {getOtherParticipant(selectedConversation)?.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "??"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{getOtherParticipant(selectedConversation)?.name || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground capitalize">{getOtherParticipant(selectedConversation)?.role || ""}</p>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                {loadingMsgs ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
                ) : messages.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">{t.messages.noMessages}</p>
                ) : (
                  <>
                    {messages.map((msg) => (
                      <MessageBubble key={msg.id} message={msg} isOwn={msg.senderId === user?.id} />
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </ScrollArea>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input placeholder={t.messages.typeMessage} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }} disabled={isSending} />
                  <Button size="icon" onClick={handleSend} disabled={isSending}><Send className="h-4 w-4" /></Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <EmptyState icon={<MessageSquare className="h-8 w-8 text-muted-foreground" />} title={t.messages.noConversations} description="Select a conversation to start messaging" />
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
