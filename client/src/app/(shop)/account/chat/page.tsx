'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import api, { fetchApi } from '@/lib/api';
import { Chat, Message } from '@/types';
import { formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function AccountChatPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: chats = [], isLoading: chatsLoading } = useQuery({
    queryKey: ['my-chats'],
    queryFn: () => fetchApi<Chat[]>('/chat'),
  });

  const activeChatId = selectedChatId || chats[0]?._id;

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['chat-messages', activeChatId],
    queryFn: () => fetchApi<Message[]>(`/chat/${activeChatId}/messages`),
    enabled: !!activeChatId,
    refetchInterval: 5000,
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) => api.post(`/chat/${activeChatId}/messages`, { content, messageType: 'text' }),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['chat-messages', activeChatId] });
      queryClient.invalidateQueries({ queryKey: ['my-chats'] });
    },
  });

  const startChat = useMutation({
    mutationFn: () => fetchApi<Chat>('/chat', { method: 'POST', body: JSON.stringify({ subject: 'Support Request' }) }),
    onSuccess: (chat) => {
      setSelectedChatId(chat._id);
      queryClient.invalidateQueries({ queryKey: ['my-chats'] });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeChatId) return;
    sendMutation.mutate(message.trim());
  };

  if (chatsLoading) return <Skeleton className="h-96" />;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Conversations</CardTitle>
          <Button size="sm" onClick={() => startChat.mutate()} disabled={startChat.isPending}>
            New Chat
          </Button>
        </CardHeader>
        <CardContent className="space-y-2 p-2">
          {!chats.length ? (
            <p className="p-4 text-center text-sm text-zinc-500">No conversations yet</p>
          ) : (
            chats.map((chat) => (
              <button
                key={chat._id}
                onClick={() => setSelectedChatId(chat._id)}
                className={cn(
                  'w-full rounded-lg p-3 text-left transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800',
                  activeChatId === chat._id && 'bg-blue-50 dark:bg-blue-950'
                )}
              >
                <p className="font-medium text-sm">{chat.subject || 'Support'}</p>
                <p className="truncate text-xs text-zinc-500">{chat.lastMessage}</p>
                {chat.unreadCustomer > 0 && (
                  <span className="mt-1 inline-block rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                    {chat.unreadCustomer}
                  </span>
                )}
              </button>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="flex flex-col lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-5 w-5" />
            Chat with Shop
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col">
          {!activeChatId ? (
            <div className="flex flex-1 flex-col items-center justify-center py-12 text-zinc-500">
              <MessageSquare className="mb-4 h-12 w-12" />
              <p>Start a conversation with our support team</p>
              <Button className="mt-4" onClick={() => startChat.mutate()}>Start Chat</Button>
            </div>
          ) : (
            <>
              <div className="mb-4 max-h-96 flex-1 space-y-3 overflow-y-auto rounded-lg border p-4 dark:border-zinc-800">
                {messagesLoading ? (
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={cn(
                        'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                        msg.senderRole === 'customer'
                          ? 'ml-auto bg-blue-600 text-white'
                          : msg.senderRole === 'bot'
                          ? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                          : 'bg-zinc-200 dark:bg-zinc-700'
                      )}
                    >
                      <p>{msg.content}</p>
                      <p className="mt-1 text-xs opacity-70">{formatDate(msg.createdAt)}</p>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSend} className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  disabled={sendMutation.isPending}
                />
                <Button type="submit" size="icon" disabled={sendMutation.isPending || !message.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
