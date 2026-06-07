'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Send } from 'lucide-react';
import api, { fetchApi } from '@/lib/api';
import { Chat, Message } from '@/types';
import { formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function AdminChatPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: chats = [], isLoading } = useQuery({
    queryKey: ['admin-chats'],
    queryFn: () => fetchApi<Chat[]>('/chat'),
    refetchInterval: 10000,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['admin-chat-messages', selectedChatId],
    queryFn: () => fetchApi<Message[]>(`/chat/${selectedChatId}/messages`),
    enabled: !!selectedChatId,
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (selectedChatId) {
      queryClient.invalidateQueries({ queryKey: ['unread-counts'] });
    }
  }, [selectedChatId, messages.length, queryClient]);

  const sendMutation = useMutation({
    mutationFn: (content: string) => api.post(`/chat/${selectedChatId}/messages`, { content }),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['admin-chat-messages', selectedChatId] });
      queryClient.invalidateQueries({ queryKey: ['admin-chats'] });
      queryClient.invalidateQueries({ queryKey: ['unread-counts'] });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Customer Chat</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Manage customer conversations</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">Conversations ({chats.length})</CardTitle></CardHeader>
          <CardContent className="max-h-[500px] space-y-2 overflow-y-auto p-2">
            {chats.map((chat) => (
              <button
                key={chat._id}
                onClick={() => setSelectedChatId(chat._id)}
                className={cn(
                  'w-full rounded-lg border p-3 text-left dark:border-zinc-800',
                  selectedChatId === chat._id && 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{chat.customer?.name || 'Customer'}</p>
                  {chat.unreadAdmin > 0 && <Badge>{chat.unreadAdmin}</Badge>}
                </div>
                <p className="truncate text-xs text-zinc-500">{chat.lastMessage}</p>
                <Badge variant="outline" className="mt-1 text-xs">{chat.status}</Badge>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="flex flex-col lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-5 w-5" />
              {selectedChatId ? 'Conversation' : 'Select a chat'}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            {selectedChatId ? (
              <>
                <div className="mb-4 max-h-96 flex-1 space-y-2 overflow-y-auto rounded-lg border p-4 dark:border-zinc-800">
                  {messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={cn(
                        'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                        msg.senderRole === 'admin' ? 'ml-auto bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800'
                      )}
                    >
                      <p>{msg.content}</p>
                      <p className="text-xs opacity-70">{formatDate(msg.createdAt)}</p>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={(e) => { e.preventDefault(); if (message.trim()) sendMutation.mutate(message.trim()); }} className="flex gap-2">
                  <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Reply to customer..." />
                  <Button type="submit" size="icon"><Send className="h-4 w-4" /></Button>
                </form>
              </>
            ) : (
              <p className="py-12 text-center text-zinc-500">Select a conversation to reply</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
