'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Minimize2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchApi } from '@/lib/api';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { Chat, Message, Settings } from '@/types';
import { cn, formatDate } from '@/lib/utils';
import Link from 'next/link';

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatId, setChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => fetchApi<Settings>('/public/settings'),
  });

  const chatEnabled = settings?.chat?.enabled !== false;

  const { data: chat } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: async () => {
      if (!chatId) {
        const created = await fetchApi<Chat>('/chat', { method: 'POST', body: JSON.stringify({ subject: 'General Inquiry' }) });
        setChatId(created._id);
        return created;
      }
      return fetchApi<Chat>(`/chat`);
    },
    enabled: open && isAuthenticated && chatEnabled,
  });

  const activeChatId = chatId || chat?._id;

  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ['chat-messages', activeChatId],
    queryFn: () => fetchApi<Message[]>(`/chat/${activeChatId}/messages`),
    enabled: !!activeChatId && open,
    refetchInterval: open ? 5000 : false,
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      api.post(`/chat/${activeChatId}/messages`, { content, messageType: 'text' }),
    onSuccess: () => {
      setMessage('');
      refetchMessages();
      queryClient.invalidateQueries({ queryKey: ['chat-messages', activeChatId] });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!chatEnabled) return null;

  const handleOpen = () => {
    if (!isAuthenticated) return;
    setOpen(true);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeChatId) return;
    sendMutation.mutate(message.trim());
  };

  return (
    <>
      {!open && (
        <button
          onClick={handleOpen}
          className="fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-blue-700"
          aria-label="Open chat"
        >
          <MessageSquare className="h-6 w-6" />
          {settings?.chat?.adminOnline && (
            <span className="absolute right-1 top-1 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
          )}
        </button>
      )}

      {open && (
        <div className="fixed bottom-4 right-4 z-50 flex h-[480px] w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
          <div className="flex items-center justify-between bg-blue-600 px-4 py-3 text-white">
            <div>
              <p className="font-semibold">MobiStore Support</p>
              <p className="text-xs text-blue-100">
                {settings?.chat?.adminOnline ? 'We are online' : 'We will reply soon'}
              </p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="text-white hover:bg-blue-700" onClick={() => setOpen(false)}>
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-blue-700" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {!isAuthenticated ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
              <MessageSquare className="h-12 w-12 text-zinc-400" />
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Please login to chat with our support team.</p>
              <Link href="/login">
                <Button>Login to Chat</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <p className="text-center text-sm text-zinc-500">
                    {settings?.chat?.autoReplyMessage || 'Hello! How can we help you today?'}
                  </p>
                )}
                {messages.map((msg) => {
                  const isCustomer = msg.senderRole === 'customer';
                  return (
                    <div key={msg._id} className={cn('flex', isCustomer ? 'justify-end' : 'justify-start')}>
                      <div
                        className={cn(
                          'max-w-[80%] rounded-2xl px-3 py-2 text-sm',
                          isCustomer
                            ? 'bg-blue-600 text-white'
                            : 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                        )}
                      >
                        <p>{msg.content}</p>
                        <p className={cn('mt-1 text-[10px]', isCustomer ? 'text-blue-200' : 'text-zinc-500')}>
                          {formatDate(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSend} className="flex gap-2 border-t border-zinc-200 p-3 dark:border-zinc-700">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  disabled={sendMutation.isPending}
                />
                <Button type="submit" size="icon" disabled={!message.trim() || sendMutation.isPending}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
