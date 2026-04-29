import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  Send, ArrowRight, MessageSquare, Circle,
  Paperclip, Image, File, Loader2, Wifi, WifiOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { directChat, type DirectChatRoom, type DirectChatMessage } from '../lib/api-client';
import { getToken, getUser, getRole } from '../lib/auth';
import { cn } from './ui/utils';

// ── WebSocket URL ─────────────────────────────────────────────────────────────
const WS_BASE = 'ws://79.72.4.1:8000';

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractRooms(raw: unknown): DirectChatRoom[] {
  if (Array.isArray(raw)) return raw as DirectChatRoom[];
  const r = raw as Record<string, unknown>;
  if (Array.isArray(r?.data)) return r.data as DirectChatRoom[];
  if (Array.isArray(r?.results)) return r.results as DirectChatRoom[];
  return [];
}

function extractMessages(raw: unknown): DirectChatMessage[] {
  if (Array.isArray(raw)) return raw as DirectChatMessage[];
  const r = raw as Record<string, unknown>;
  if (Array.isArray(r?.data)) return r.data as DirectChatMessage[];
  if (Array.isArray(r?.results)) return r.results as DirectChatMessage[];
  return [];
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
  if (isToday) return 'اليوم';
  return d.toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' });
}

function getRoomDisplayName(room: DirectChatRoom, myRole: 'buyer' | 'office' | null): string {
  if (room.other_name) return room.other_name;
  return myRole === 'buyer' ? 'المكتب العقاري' : 'العميل';
}

function getInitials(name: string): string {
  return name.charAt(0).toUpperCase();
}

// ── WebSocket event types ─────────────────────────────────────────────────────

interface WsConnectionEvent {
  type: 'connection_established';
  user_id: string;
  role: string;
}
interface WsRoomJoinedEvent {
  type: 'room_joined';
  room_id: string;
}
interface WsNewMessageEvent {
  type: 'new_message' | 'message_sent';
  room_id: string;
  message: DirectChatMessage;
}
interface WsTypingEvent {
  type: 'user_typing';
  room_id: string;
  user_id: string;
  user_name: string;
  role: string;
  is_typing: boolean;
}
interface WsReadEvent {
  type: 'messages_marked_read';
  room_id: string;
  marked_count: number;
}
interface WsErrorEvent {
  type: 'error';
  error_code: string;
  message: string;
}

type WsEvent =
  | WsConnectionEvent
  | WsRoomJoinedEvent
  | WsNewMessageEvent
  | WsTypingEvent
  | WsReadEvent
  | WsErrorEvent
  | { type: string; [k: string]: unknown };

// ── Main component ────────────────────────────────────────────────────────────

export function DirectChat() {
  const navigate = useNavigate();
  const myRole = getRole() as 'buyer' | 'office' | null;
  const myUser = getUser();
  const token = getToken();

  const [rooms, setRooms] = useState<DirectChatRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DirectChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({}); // roomId → userName
  const [typingTimeout, setTypingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const joinedRooms = useRef<Set<string>>(new Set());

  const selectedRoom = rooms.find(r => r.id === selectedRoomId) ?? null;

  // ── Scroll to bottom ────────────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // ── Load rooms ──────────────────────────────────────────────────────────────
  const loadRooms = useCallback(async () => {
    try {
      const raw = await directChat.listRooms();
      setRooms(extractRooms(raw));
    } catch {
      // Silently ignore – rooms will be empty
    } finally {
      setIsLoadingRooms(false);
    }
  }, []);

  useEffect(() => { loadRooms(); }, [loadRooms]);

  // ── Load messages for selected room ─────────────────────────────────────────
  const loadMessages = useCallback(async (roomId: string) => {
    setIsLoadingMessages(true);
    try {
      const raw = await directChat.listMessages(roomId);
      setMessages(extractMessages(raw));
      // Mark as read
      directChat.markRoomAsRead(roomId).catch(() => {});
      // Update unread badge in room list
      setRooms(prev =>
        prev.map(r => (r.id === roomId ? { ...r, unread_count: 0 } : r))
      );
    } catch {
      toast.error('تعذّر تحميل الرسائل');
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // ── WebSocket connection ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;

    const ws = new WebSocket(`${WS_BASE}/ws/direct-chat/?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsConnected(true);
    };

    ws.onclose = () => {
      setWsConnected(false);
    };

    ws.onerror = () => {
      setWsConnected(false);
    };

    ws.onmessage = (ev) => {
      let event: WsEvent;
      try {
        event = JSON.parse(ev.data as string) as WsEvent;
      } catch {
        return;
      }

      if (event.type === 'new_message' || event.type === 'message_sent') {
        const e = event as WsNewMessageEvent;
        const msg = e.message;
        // Add to messages if this room is selected
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m.id === msg.id)) return prev;
          if (e.room_id !== selectedRoomId) return prev;
          return [...prev, msg];
        });
        // Update last message preview in room list
        setRooms(prev =>
          prev.map(r =>
            r.id === e.room_id
              ? {
                  ...r,
                  last_message: {
                    content: msg.content,
                    sender_role: msg.sender_role,
                    created_at: msg.created_at,
                  },
                  unread_count:
                    e.room_id === selectedRoomId
                      ? 0
                      : (r.unread_count ?? 0) + 1,
                  updated_at: msg.created_at,
                }
              : r
          )
        );
        // Auto mark-read via WS if chat is open
        if (e.room_id === selectedRoomId && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'mark_read', room_id: e.room_id }));
        }
      }

      if (event.type === 'user_typing') {
        const e = event as WsTypingEvent;
        setTypingUsers(prev => {
          if (e.is_typing) return { ...prev, [e.room_id]: e.user_name };
          const next = { ...prev };
          delete next[e.room_id];
          return next;
        });
      }

      if (event.type === 'messages_marked_read') {
        const e = event as WsReadEvent;
        setRooms(prev =>
          prev.map(r => (r.id === e.room_id ? { ...r, unread_count: 0 } : r))
        );
      }
    };

    return () => {
      ws.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ── Join room via WS when room is selected ───────────────────────────────────
  useEffect(() => {
    if (!selectedRoomId) return;
    loadMessages(selectedRoomId);

    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN && !joinedRooms.current.has(selectedRoomId)) {
      ws.send(JSON.stringify({ type: 'join_room', room_id: selectedRoomId }));
      joinedRooms.current.add(selectedRoomId);
    }
  }, [selectedRoomId, loadMessages]);

  // ── Send message ─────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    const content = inputText.trim();
    if (!content || !selectedRoomId || isSending) return;

    setInputText('');
    setIsSending(true);

    // Optimistic UI: add a temporary message
    const tempId = `temp-${Date.now()}`;
    const tempMsg: DirectChatMessage = {
      id: tempId,
      room_id: selectedRoomId,
      sender_id: myUser?.id ?? '',
      sender_role: myRole ?? 'buyer',
      message_type: 1,
      content,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      // Try WebSocket first
      const ws = wsRef.current;
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: 'send_message',
            room_id: selectedRoomId,
            content,
            message_type: 1,
          })
        );
      } else {
        // Fallback to HTTP
        const res = await directChat.sendMessage(selectedRoomId, content, 1);
        const actualMsg = (res as { data?: DirectChatMessage }).data ?? res as unknown as DirectChatMessage;
        // Replace temp with real
        setMessages(prev =>
          prev.map(m => (m.id === tempId ? { ...actualMsg } : m))
        );
      }
    } catch {
      // Remove temp message on error
      setMessages(prev => prev.filter(m => m.id !== tempId));
      toast.error('تعذّر إرسال الرسالة');
    } finally {
      setIsSending(false);
    }
  }, [inputText, selectedRoomId, isSending, myRole, myUser]);

  // ── Typing indicator ─────────────────────────────────────────────────────────
  const handleInputChange = (val: string) => {
    setInputText(val);
    if (!selectedRoomId) return;

    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    if (!isTyping) {
      setIsTyping(true);
      ws.send(JSON.stringify({ type: 'typing', room_id: selectedRoomId, is_typing: true }));
    }

    if (typingTimeout) clearTimeout(typingTimeout);
    const t = setTimeout(() => {
      setIsTyping(false);
      ws.send(JSON.stringify({ type: 'typing', room_id: selectedRoomId, is_typing: false }));
    }, 2000);
    setTypingTimeout(t);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Message grouping by date ─────────────────────────────────────────────────
  const groupedMessages = messages.reduce<{ date: string; msgs: DirectChatMessage[] }[]>((acc, msg) => {
    const date = formatDate(msg.created_at);
    const last = acc[acc.length - 1];
    if (!last || last.date !== date) {
      acc.push({ date, msgs: [msg] });
    } else {
      last.msgs.push(msg);
    }
    return acc;
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden" dir="rtl">
      {/* ── Sidebar: room list ─────────────────────────────────────────────── */}
      <aside className="w-80 flex-shrink-0 bg-white border-l border-gray-200 flex flex-col">
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-gray-800 text-lg">المحادثات</span>
          </div>
          <div className="flex items-center gap-2">
            {/* WS status */}
            <span title={wsConnected ? 'متصل' : 'غير متصل'}>
              {wsConnected
                ? <Wifi className="w-4 h-4 text-green-500" />
                : <WifiOff className="w-4 h-4 text-gray-400" />}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(myRole === 'office' ? '/office/dashboard' : '/buyer/dashboard')}
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Room list */}
        <ScrollArea className="flex-1">
          {isLoadingRooms ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : rooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
              <MessageSquare className="w-10 h-10 opacity-30" />
              <p className="text-sm">لا توجد محادثات بعد</p>
            </div>
          ) : (
            <ul>
              {rooms
                .slice()
                .sort((a, b) => new Date(b.updated_at ?? 0).getTime() - new Date(a.updated_at ?? 0).getTime())
                .map(room => {
                  const name = getRoomDisplayName(room, myRole);
                  const isSelected = room.id === selectedRoomId;
                  const typingInRoom = typingUsers[room.id];
                  return (
                    <li key={room.id}>
                      <button
                        onClick={() => setSelectedRoomId(room.id)}
                        className={cn(
                          'w-full flex items-start gap-3 px-4 py-3 text-right transition-colors border-b border-gray-50',
                          isSelected
                            ? 'bg-blue-50 border-r-4 border-r-blue-500'
                            : 'hover:bg-gray-50'
                        )}
                      >
                        <Avatar className="w-10 h-10 flex-shrink-0 mt-0.5">
                          <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                            {getInitials(name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-semibold text-gray-800 text-sm truncate">{name}</span>
                            {room.last_message && (
                              <span className="text-xs text-gray-400 flex-shrink-0">
                                {formatTime(room.last_message.created_at)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between gap-1 mt-0.5">
                            <span className="text-xs text-gray-500 truncate">
                              {typingInRoom
                                ? <span className="text-blue-500 italic">يكتب...</span>
                                : room.last_message?.content || <span className="opacity-50">لا توجد رسائل</span>}
                            </span>
                            {(room.unread_count ?? 0) > 0 && (
                              <Badge className="bg-blue-600 text-white text-xs px-1.5 py-0.5 min-w-[20px] flex-shrink-0">
                                {room.unread_count}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
            </ul>
          )}
        </ScrollArea>
      </aside>

      {/* ── Main: messages area ────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0">
        {selectedRoom ? (
          <>
            {/* Chat header */}
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3 shadow-sm">
              <Avatar className="w-9 h-9">
                <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                  {getInitials(getRoomDisplayName(selectedRoom, myRole))}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-800 text-sm">
                  {getRoomDisplayName(selectedRoom, myRole)}
                </p>
                {typingUsers[selectedRoom.id] && (
                  <p className="text-xs text-blue-500 animate-pulse">يكتب...</p>
                )}
                {!typingUsers[selectedRoom.id] && (
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Circle className={cn('w-2 h-2 fill-current', wsConnected ? 'text-green-500' : 'text-gray-300')} />
                    {wsConnected ? 'متصل الآن' : 'غير متصل'}
                  </p>
                )}
              </div>
              {selectedRoom.listing_id && (
                <Badge variant="outline" className="mr-auto text-xs">
                  مرتبط بعقار
                </Badge>
              )}
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 px-4 py-4">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full py-20">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400 gap-2">
                  <MessageSquare className="w-12 h-12 opacity-20" />
                  <p>ابدأ المحادثة الآن</p>
                </div>
              ) : (
                <>
                  {groupedMessages.map(group => (
                    <div key={group.date}>
                      {/* Date separator */}
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-gray-400 bg-white px-2">{group.date}</span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>
                      {group.msgs.map(msg => {
                        const isMe = msg.sender_id === myUser?.id || msg.sender_role === myRole;
                        return (
                          <div
                            key={msg.id}
                            className={cn(
                              'flex mb-2',
                              isMe ? 'justify-start' : 'justify-end'
                            )}
                          >
                            <div
                              className={cn(
                                'max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm',
                                isMe
                                  ? 'bg-blue-600 text-white rounded-tr-sm'
                                  : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100'
                              )}
                            >
                              {/* File attachment */}
                              {msg.message_type === 2 && msg.file_url && (
                                <div className="mb-1">
                                  <img
                                    src={msg.file_url}
                                    alt="صورة"
                                    className="max-w-full rounded-lg max-h-48 object-cover"
                                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                                  />
                                </div>
                              )}
                              {msg.message_type === 3 && msg.file_url && (
                                <a
                                  href={msg.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={cn(
                                    'flex items-center gap-2 mb-1 underline text-xs',
                                    isMe ? 'text-blue-100' : 'text-blue-600'
                                  )}
                                >
                                  <File className="w-4 h-4" />
                                  ملف مرفق
                                </a>
                              )}
                              <p className="leading-relaxed break-words">{msg.content}</p>
                              <div
                                className={cn(
                                  'flex items-center gap-1 mt-1 text-xs',
                                  isMe ? 'text-blue-200 justify-start' : 'text-gray-400 justify-end'
                                )}
                              >
                                <span>{formatTime(msg.created_at)}</span>
                                {isMe && (
                                  <span>{msg.is_read ? '✓✓' : '✓'}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </ScrollArea>

            {/* Input bar */}
            <div className="bg-white border-t border-gray-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                  title="إرفاق صورة"
                  onClick={() => toast.info('رفع الملفات عبر WebSocket غير مدعوم حالياً')}
                >
                  <Image className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                  title="إرفاق ملف"
                  onClick={() => toast.info('رفع الملفات عبر WebSocket غير مدعوم حالياً')}
                >
                  <Paperclip className="w-5 h-5" />
                </Button>
                <Input
                  className="flex-1 rounded-full border-gray-200 bg-gray-50 focus:bg-white text-right"
                  placeholder="اكتب رسالتك..."
                  value={inputText}
                  onChange={e => handleInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isSending}
                  dir="rtl"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputText.trim() || isSending}
                  className="rounded-full w-10 h-10 p-0 flex items-center justify-center bg-blue-600 hover:bg-blue-700 flex-shrink-0"
                >
                  {isSending
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
            <MessageSquare className="w-16 h-16 opacity-20" />
            <div className="text-center">
              <p className="text-lg font-medium">اختر محادثة</p>
              <p className="text-sm opacity-70">اختر محادثة من القائمة لعرض الرسائل</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
