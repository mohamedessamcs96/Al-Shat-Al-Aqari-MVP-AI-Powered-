import { useState, useRef, useEffect } from 'react';
import {
  Send, MessageSquare, LogOut, ChevronRight,
  Plus, Star, Bell, Settings, HelpCircle,
  Building2, Scale, Wallet, Trash2,
  Heart, BellRing, LifeBuoy, SlidersHorizontal,
  BedDouble, Bath, Maximize2, MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from './ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { useNavigate } from 'react-router';
import { type ChatMessage } from '../lib/mock-data';
import { formatPrice, getCityName } from '../lib/formatters';
import { chat as chatApi, buyers as buyersApi } from '../lib/api-client';
import { getUser, logout as authLogout } from '../lib/auth';

type Conversation = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
};

const makeSaraGreeting = (id: string): ChatMessage => ({
  id,
  role: 'assistant',
  content: 'مرحباً! أنا سارة، مساعدتك الذكية في الشات العقاري. أنا هنا لمساعدتك في البحث عن العقار المثالي، مقارنة الأسعار، والتفاوض. كيف يمكنني مساعدتك اليوم؟',
  timestamp: new Date().toISOString(),
  suggestions: ['أبحث عن فيلا في الرياض', 'شقة بسعر 800 ألف', 'عقار بجوار البحر في جدة', 'أريد رؤية أفضل العروض'],
});

const QUICK_PROMPTS = [
  { label: 'عقارات الشركات', icon: <Building2 className="w-3.5 h-3.5" /> },
  { label: 'مقارنة عقارات', icon: <Scale className="w-3.5 h-3.5" /> },
  { label: 'هل السعر مناسب؟', icon: <Wallet className="w-3.5 h-3.5" /> },
];

const ACTION_CHIPS = ['اشراء', 'مقارنة', 'تفاوض', 'إستثمار'];

function ConvList({ convs, activeId, onSelect, onDelete }: {
  convs: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}) {
  return (
    <div className="space-y-0.5">
      {convs.map(conv => (
        <button
          key={conv.id}
          onClick={() => onSelect(conv.id)}
          className={`group w-full flex items-center gap-2.5 px-2 py-2 rounded-xl text-sm text-right transition-all ${
            activeId === conv.id
              ? 'bg-white/15 text-white'
              : 'text-white/60 hover:bg-white/8 hover:text-white'
          }`}
        >
          <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${activeId === conv.id ? 'text-blue-400' : 'text-white/30'}`} />
          <span className="flex-1 truncate text-xs leading-5">{conv.title}</span>
          <span
            role="button"
            onClick={(e) => onDelete(conv.id, e)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:text-red-400 text-white/30"
          >
            <Trash2 className="w-3 h-3" />
          </span>
        </button>
      ))}
    </div>
  );
}

export function ChatInterface() {
  const newConvId = 'current';
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  // Default closed on mobile (< 1024px), open on desktop
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [sidebarPanel, setSidebarPanel] = useState<'favorites' | 'notifications' | 'settings' | 'help' | null>(null);
  const isDesktop = () => window.innerWidth >= 1024;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const user = getUser();

  // Settings panel – real buyer profile
  const [buyerProfile, setBuyerProfile] = useState<{ name?: string; phone?: string; email?: string } | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [notifNew, setNotifNew] = useState(true);
  const [notifPrice, setNotifPrice] = useState(true);
  const [notifMessages, setNotifMessages] = useState(false);

  // Load buyer profile from API when settings panel opens (only once)
  useEffect(() => {
    if (sidebarPanel === 'settings' && !profileLoaded && user?.id) {
      buyersApi.getProfile(user.id)
        .then((raw: any) => {
          const d = raw?.data ?? raw;
          setBuyerProfile({
            name: d?.name ?? user?.name,
            phone: d?.phone ?? user?.phone,
            email: d?.email ?? user?.email,
          });
        })
        .catch(() => {
          // Fallback to what's in localStorage
          setBuyerProfile({ name: user?.name, phone: user?.phone, email: user?.email });
        })
        .finally(() => setProfileLoaded(true));
    }
  }, [sidebarPanel, profileLoaded, user?.id]);

  const activeConv = conversations.find(c => c.id === activeId) ?? conversations[0];
  const messages = activeConv?.messages ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Load conversations from API on mount
  useEffect(() => {
    chatApi.listConversations().then((data) => {
      // API may return wrapped response: { data: [...] } or { results: [...] } or raw array
      const raw = data as unknown;
      const list: Array<Record<string, unknown>> = Array.isArray(raw)
        ? (raw as Array<Record<string, unknown>>)
        : Array.isArray((raw as any)?.data) ? (raw as any).data
        : Array.isArray((raw as any)?.results) ? (raw as any).results
        : [];
      const convs = list.map((c) => ({
        id: String(c.id ?? c._id ?? ''),
        title: String(c.title ?? c.summary ?? 'محادثة'),
        messages: [] as ChatMessage[],
        createdAt: c.created_at ? new Date(String(c.created_at)).getTime() : Date.now(),
      }));
      if (convs.length > 0) {
        setConversations(convs);
        setActiveId(convs[0].id);
        loadMessages(convs[0].id, convs);
      } else {
        // No conversations yet – create the first one automatically
        createNewConversation();
      }
    }).catch(() => {
      // Not authenticated or network error – start with a greeting-only view
      const id = newConvId;
      setConversations([{ id, title: 'محادثة جديدة', createdAt: Date.now(), messages: [makeSaraGreeting(`${id}_g`)] }]);
      setActiveId(id);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMessages = (convId: string, convList: Conversation[]) => {
    chatApi.getMessages(convId).then((data) => {
      const raw = data as Record<string, unknown>;
      // Backend may return: { messages: [...] } | { data: { messages: [...] } } | { data: [...] } | [...]
      const msgArray: Array<Record<string, unknown>> =
        Array.isArray(raw) ? (raw as Array<Record<string, unknown>>) :
        Array.isArray((raw as any)?.messages) ? (raw as any).messages :
        Array.isArray((raw as any)?.data?.messages) ? (raw as any).data.messages :
        Array.isArray((raw as any)?.data) ? (raw as any).data :
        [];
      const msgs: ChatMessage[] = (msgArray as Array<Record<string, unknown>>).map((m) => ({
        id: String(m.id ?? Date.now()),
        role: m.role === 'user' ? 'user' : 'assistant',
        content: String(m.content ?? ''),
        timestamp: String(m.created_at ?? new Date().toISOString()),
      }));
      if (msgs.length === 0) {
        msgs.push(makeSaraGreeting(`${convId}_g`));
      }
      setConversations(convList.map(c => c.id === convId ? { ...c, messages: msgs } : c));
    }).catch(() => {});
  };

  const createNewConversation = async () => {
    try {
      const res = await chatApi.startConversation();
      const raw = res as any;
      // Backend may return { id } directly or wrapped { success, data: { id } }
      const id = String(
        raw.id ?? raw._id ?? raw.conversation_id ??
        raw.data?.id ?? raw.data?.conversation_id ??
        `local_${Date.now()}`
      );
      const greeting = makeSaraGreeting(`${id}_g`);
      const newConv: Conversation = { id, title: 'محادثة جديدة', createdAt: Date.now(), messages: [greeting] };
      setConversations(prev => [newConv, ...prev]);
      setActiveId(id);
    } catch {
      // Fallback: local-only conversation
      const id = `local_${Date.now()}`;
      const greeting = makeSaraGreeting(`${id}_g`);
      setConversations(prev => [{ id, title: 'محادثة جديدة', createdAt: Date.now(), messages: [greeting] }, ...prev]);
      setActiveId(id);
    }
  };

  const handleSend = async (text?: string) => {
    const textToSend = text || inputValue.trim();
    if (!textToSend) return;

    // If we only have a local/fallback conversation, create a real one on the backend first
    let convId = activeId;
    if (!convId || convId === 'current' || convId.startsWith('local_')) {
      try {
        const res = await chatApi.startConversation();
        const raw = res as any;
        console.log('[chat] startConversation raw:', JSON.stringify(raw));
        const newId = String(
          raw.id ??
          raw._id ??
          raw.conversation_id ??
          (raw.data as any)?.id ??
          (raw.data as any)?.conversation_id ??
          `local_${Date.now()}`
        );
        console.log('[chat] resolved convId:', newId);
        convId = newId;
        setConversations(prev => prev.map(c =>
          c.id === activeId ? { ...c, id: newId } : c
        ));
        setActiveId(newId);
      } catch (startErr) {
        console.warn('[chat] startConversation failed:', startErr);
        // No backend conversation – send as local_* so we don't hit /current/messages/
        if (!convId || convId === 'current') {
          convId = `local_${Date.now()}`;
          setActiveId(convId);
          setConversations(prev => prev.map(c => c.id === activeId ? { ...c, id: convId } : c));
        }
      }
    }

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: textToSend, timestamp: new Date().toISOString() };

    setConversations(prev => prev.map(c => {
      if (c.id !== convId) return c;
      const hasUserMsg = c.messages.some(m => m.role === 'user');
      return {
        ...c,
        title: hasUserMsg ? c.title : textToSend.slice(0, 32),
        messages: [...c.messages, userMsg],
      };
    }));
    setInputValue('');
    setIsTyping(true);

    try {
      // Skip API call for local-only conversations (no backend session)
      if (convId.startsWith('local_')) throw new Error('local');
      const res = await chatApi.sendMessage(convId, textToSend);
      const raw = res as any;
      console.log('[chat] sendMessage raw:', JSON.stringify(raw));
      // Backend may wrap: { data: { assistant_message: {content} } } or flat { role, content, ... }
      const rawData = raw?.data ?? raw;
      const assistantContent = String(
        (rawData.assistant_message as Record<string, unknown>)?.content ??
        rawData.ai_message ??
        rawData.reply ?? rawData.content ?? rawData.message ??
        (rawData.messages as any[])?.[rawData.messages?.length - 1]?.content ??
        'أفهم متطلباتك. دعني أساعدك في العثور على العقار المثالي.'
      );
      const aiMsg: ChatMessage = {
        id: String(raw.id ?? rawData.id ?? (Date.now() + 1).toString()),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date().toISOString(),
        suggestions: (rawData.suggestions as string[] | undefined) ?? ['أريد رؤية المزيد', 'هل يمكن ترتيب زيارة؟', 'أريد التفاوض على السعر'],
        listings: (rawData.listings as ChatMessage['listings'] | undefined),
      };
      setConversations(prev => prev.map(c =>
        c.id !== convId ? c : { ...c, messages: [...c.messages, aiMsg] }
      ));
    } catch (err) {
      console.error('[chat] sendMessage error:', err);
      const errMsg = err instanceof Error && err.message !== 'local'
        ? err.message
        : 'تعذّر إرسال الرسالة. تحقق من تسجيل الدخول غ';
      toast.error(errMsg);
      // Remove the optimistic user message on failure
      setConversations(prev => prev.map(c =>
        c.id !== convId ? c : { ...c, messages: c.messages.filter(m => m.id !== userMsg.id) }
      ));
    } finally {
      setIsTyping(false);
    }
  };

  const startNewChat = () => {
    createNewConversation();
    if (!isDesktop()) setSidebarOpen(false);
  };

  const selectConversation = (id: string) => {
    setActiveId(id);
    // Lazy-load messages for this conversation if not yet loaded
    setConversations(prev => {
      const conv = prev.find(c => c.id === id);
      if (conv && conv.messages.length === 0) {
        loadMessages(id, prev);
      }
      return prev;
    });
    if (!isDesktop()) setSidebarOpen(false);
  };

  const deleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    chatApi.deleteConversation(id).catch(() => {});
    setConversations(prev => {
      const next = prev.filter(c => c.id !== id);
      if (activeId === id && next.length > 0) setActiveId(next[0].id);
      return next;
    });
  };

  // Group conversations by recency
  const todayMs = Date.now() - 86400000;
  const weekMs = Date.now() - 7 * 86400000;
  const todayChats = conversations.filter(c => c.createdAt >= todayMs);
  const weekChats = conversations.filter(c => c.createdAt >= weekMs && c.createdAt < todayMs);
  const olderChats = conversations.filter(c => c.createdAt < weekMs);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50" dir="rtl">

      {/* ── Mobile backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed lg:relative inset-y-0 right-0 z-30 lg:z-auto
          ${sidebarOpen ? 'translate-x-0 w-72 lg:w-64' : 'translate-x-full lg:translate-x-0 lg:w-0'}
          overflow-hidden transition-all duration-300 flex-shrink-0 flex flex-col
        `}
        style={{ background: 'linear-gradient(145deg,#0a0f1e 0%,#0e2057 45%,#1a1060 100%)' }}
      >
        {/* Decorative blobs — same as login hero */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-600/10 rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        {/* User header */}
        <div className="relative z-10 flex items-center gap-3 px-4 py-4 border-b border-white/10 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg shadow-blue-900/40 ring-1 ring-white/20">
            {(user?.name ?? 'م')[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">{user?.name ?? 'مستخدم'}</p>
            <p className="text-blue-300/50 text-xs">عميل</p>
          </div>
        </div>

        {/* New Chat */}
        <div className="relative z-10 px-3 py-3 flex-shrink-0">
          <button
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/20 bg-white/8 text-white/80 hover:bg-white/15 hover:text-white transition-all text-sm font-medium backdrop-blur-sm"
          >
            <Plus className="w-4 h-4" />
            محادثة جديدة
          </button>
        </div>

        {/* Conversation history */}
        <div className="relative z-10 px-2 flex-1 overflow-y-auto space-y-4 pb-2">
          {todayChats.length > 0 && (
            <div>
              <p className="text-blue-300/40 text-[10px] font-semibold uppercase tracking-widest mb-1 px-2">اليوم</p>
              <ConvList convs={todayChats} activeId={activeId} onSelect={selectConversation} onDelete={deleteConversation} />
            </div>
          )}
          {weekChats.length > 0 && (
            <div>
              <p className="text-blue-300/40 text-[10px] font-semibold uppercase tracking-widest mb-1 px-2">هذا الأسبوع</p>
              <ConvList convs={weekChats} activeId={activeId} onSelect={selectConversation} onDelete={deleteConversation} />
            </div>
          )}
          {olderChats.length > 0 && (
            <div>
              <p className="text-blue-300/40 text-[10px] font-semibold uppercase tracking-widest mb-1 px-2">محادثات سابقة</p>
              <ConvList convs={olderChats} activeId={activeId} onSelect={selectConversation} onDelete={deleteConversation} />
            </div>
          )}
        </div>

        {/* Bottom nav */}
        <div className="relative z-10 border-t border-white/10 px-3 py-3 space-y-0.5 flex-shrink-0">
          {([
            { icon: <Heart className="w-4 h-4" />, label: 'المفضلة', panel: 'favorites' as const },
            { icon: <BellRing className="w-4 h-4" />, label: 'التنبيهات', panel: 'notifications' as const },
          ] as const).map(item => (
            <button key={item.label} onClick={() => setSidebarPanel(item.panel)} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-white/40 hover:bg-white/8 hover:text-blue-300 transition-colors">
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
          <div className="h-px bg-white/10 my-1" />
          {([
            { icon: <SlidersHorizontal className="w-4 h-4" />, label: 'الإعدادات', panel: 'settings' as const },
            { icon: <LifeBuoy className="w-4 h-4" />, label: 'مساعدة', panel: 'help' as const },
          ] as const).map(item => (
            <button key={item.label} onClick={() => setSidebarPanel(item.panel)} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-white/40 hover:bg-white/8 hover:text-blue-300 transition-colors">
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0 lg:transition-all lg:duration-300">

        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-3 sm:px-6 h-14 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Toggle sidebar */}
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors flex-shrink-0"
              aria-label="القائمة"
            >
              <div className="space-y-1">
                <span className="block w-4 h-0.5 bg-slate-500" />
                <span className="block w-4 h-0.5 bg-slate-500" />
                <span className="block w-3 h-0.5 bg-slate-500" />
              </div>
            </button>
            {/* Brand */}
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md shadow-blue-900/30 ring-1 ring-white/20 flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#0e2057,#1a1060)' }}
              >
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 text-sm leading-tight">الشات العقاري</p>
                <p className="hidden sm:block text-slate-400 text-xs leading-tight">سارة — مساعدة ذكية للعقارات</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={() => navigate('/demand')} className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-colors">
              <MessageSquare className="w-4 h-4" />
            </button>
            <button onClick={() => { authLogout(); navigate('/'); }} className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          <div className="max-w-2xl mx-auto space-y-6">

            {/* Welcome headline */}
            {messages.length === 1 && messages[0].role === 'assistant' && (
              <div className="text-center pt-8 pb-2">
                <div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-2xl text-white font-bold text-xl mb-4 shadow-lg shadow-indigo-900/30 ring-1 ring-white/10"
                  style={{ background: 'linear-gradient(135deg,#0e2057,#1a1060)' }}
                >
                  س
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-1">أنا سارة، مساعدتك العقارية الذكية</h2>
                <p className="text-slate-400 text-sm">كيف يمكنني مساعدتك اليوم؟</p>
                <div className="flex flex-wrap gap-2 justify-center mt-5">
                  {QUICK_PROMPTS.map(p => (
                    <button
                      key={p.label}
                      onClick={() => handleSend(p.label)}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-sm text-slate-700 hover:border-indigo-400 hover:text-indigo-700 hover:bg-indigo-50/60 transition-all shadow-sm"
                    >
                      <span className="text-indigo-400">{p.icon}</span>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                dir="ltr"
                className={`flex gap-3 items-start ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Sara avatar */}
                {message.role === 'assistant' && (
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-900/30 mt-0.5 text-white font-bold text-sm ring-1 ring-white/10"
                    style={{ background: 'linear-gradient(135deg,#0e2057,#1a1060)' }}
                  >
                    س
                  </div>
                )}

                <div className={`flex-1 max-w-lg flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* Bubble */}
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      message.role === 'user'
                        ? 'text-white rounded-tr-sm shadow-md shadow-indigo-900/30'
                        : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm shadow-sm'
                    }`}
                    style={message.role === 'user' ? { background: 'linear-gradient(135deg,#0e2057,#1a1060)' } : {}}
                    dir="rtl"
                  >
                    {message.listings && message.listings.length > 0
                      // When cards follow, show only a short plain-text intro (strip markdown)
                      ? (() => {
                          const plain = message.content
                            .replace(/\*\*?([^*]+)\*\*?/g, '$1')
                            .replace(/^[•*#>\-]+\s*/gm, '')
                            .split('\n')
                            .map(l => l.trim())
                            .filter(Boolean)
                            .slice(0, 2)
                            .join(' ');
                          return <span>{plain}</span>;
                        })()
                      // Normal message: render markdown-like formatting
                      : message.content
                          .split('\n')
                          .map((line, li) => {
                            const trimmed = line.trim();
                            if (!trimmed) return <br key={li} />;
                            // Bold: **text** or *text*
                            const parts = trimmed.split(/(\*{1,2}[^*]+\*{1,2})/g);
                            const rendered = parts.map((p, pi) =>
                              /^\*{1,2}([^*]+)\*{1,2}$/.test(p)
                                ? <strong key={pi}>{p.replace(/\*/g, '')}</strong>
                                : p
                            );
                            // Bullet line
                            if (/^[•·*\-]/.test(trimmed)) {
                              return (
                                <div key={li} className="flex gap-2 my-0.5">
                                  <span className="text-indigo-400 mt-0.5 flex-shrink-0">•</span>
                                  <span>{rendered}</span>
                                </div>
                              );
                            }
                            return <p key={li} className="my-0.5">{rendered}</p>;
                          })
                    }
                  </div>

                  {/* Property cards */}
                  {message.listings && message.listings.length > 0 && (
                    <div className="mt-3 w-full" dir="rtl">
                      <div
                        className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory"
                        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
                      >
                        {message.listings.map((listing: any, idx: number) => {
                          // Parse summary: "4 غرف | None حمّامات | 195 م² | 1100000.0"
                          const parts     = (listing.summary ?? '').split('|').map((s: string) => s.trim());
                          const bedrooms  = parseInt(parts[0] ?? '') || null;
                          const bathrooms = (parts[1] ?? '').includes('None') ? null : (parseInt(parts[1] ?? '') || null);
                          const area      = parseFloat(parts[2] ?? '') || null;
                          const rawPrice  = parseFloat(parts[3] ?? '') || null;
                          // Parse short_title: "فيلا الرياض 195م 1100000.0"
                          const titleWords = (listing.short_title ?? '').split(' ');
                          const propType   = titleWords[0] ?? 'عقار';
                          const city       = titleWords[1] ?? '';

                          const TYPE_IMAGES: Record<string, string[]> = {
                            'فيلا':    [
                              'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400&q=80',
                              'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80',
                              'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&q=80',
                              'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80',
                            ],
                            'شقة':    [
                              'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80',
                              'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80',
                              'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&q=80',
                            ],
                            'أرض':    [
                              'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80',
                              'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=400&q=80',
                            ],
                            'مكتب':   [
                              'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80',
                              'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&q=80',
                            ],
                            'عمارة':  [
                              'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&q=80',
                              'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=400&q=80',
                            ],
                            'استراحة':[
                              'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80',
                              'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80',
                            ],
                          };
                          const TYPE_META: Record<string, { bg: string }> = {
                            'فيلا':    { bg: 'linear-gradient(135deg,#1e3a8a,#3730a3)' },
                            'شقة':     { bg: 'linear-gradient(135deg,#065f46,#0369a1)' },
                            'أرض':     { bg: 'linear-gradient(135deg,#92400e,#b45309)' },
                            'مكتب':    { bg: 'linear-gradient(135deg,#1e3a5f,#1f2937)' },
                            'عمارة':   { bg: 'linear-gradient(135deg,#134e4a,#155e75)' },
                            'استراحة': { bg: 'linear-gradient(135deg,#581c87,#831843)' },
                          };
                          const imgList = TYPE_IMAGES[propType] ?? TYPE_IMAGES['فيلا'];
                          const imgUrl  = imgList[idx % imgList.length];
                          const meta  = TYPE_META[propType] ?? TYPE_META['فيلا'];
                          const isRent = rawPrice !== null && rawPrice < 300000;

                          return (
                            <div
                              key={listing.license ?? listing.id ?? idx}
                              className="flex-shrink-0 w-56 snap-start rounded-2xl overflow-hidden bg-white flex flex-col"
                              style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.1)' }}
                            >
                              {/* Photo header */}
                              <div className="relative h-36 overflow-hidden">
                                <img
                                  src={imgUrl}
                                  alt={propType}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                                {/* dark gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                                {/* badges top */}
                                <div className="absolute top-2.5 right-2.5 left-2.5 flex items-start justify-between">
                                  <span
                                    className="text-[10px] font-black text-white px-2.5 py-1 rounded-full"
                                    style={{ background: meta.bg, backdropFilter: 'blur(4px)' }}
                                  >
                                    {propType}
                                  </span>
                                  {isRent && (
                                    <span className="text-[9px] font-bold text-white bg-emerald-500/90 px-2 py-1 rounded-full">إيجار</span>
                                  )}
                                </div>
                                {/* price + city pinned to bottom */}
                                <div className="absolute bottom-2.5 right-3 left-3">
                                  {rawPrice && (
                                    <p className="text-white font-black text-base leading-none drop-shadow">
                                      {isRent
                                        ? `${new Intl.NumberFormat('ar-SA').format(rawPrice)} ر.س/سنوي`
                                        : formatPrice(rawPrice)
                                      }
                                    </p>
                                  )}
                                  {city && (
                                    <div className="flex items-center gap-1 mt-1">
                                      <MapPin className="w-3 h-3 text-white/70" />
                                      <p className="text-white/80 text-[11px] font-medium">{city}</p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Stats */}
                              <div className="flex items-center justify-around px-3 py-3 bg-slate-50 border-b border-slate-100">
                                {bedrooms !== null && (
                                  <div className="flex flex-col items-center gap-1">
                                    <div className="flex items-center gap-1">
                                      <BedDouble className="w-3.5 h-3.5 text-indigo-400" />
                                      <span className="text-sm font-bold text-slate-800">{bedrooms}</span>
                                    </div>
                                    <span className="text-[9px] text-slate-400 font-medium">غرف</span>
                                  </div>
                                )}
                                {bedrooms !== null && area !== null && <div className="w-px h-7 bg-slate-200" />}
                                {area !== null && (
                                  <div className="flex flex-col items-center gap-1">
                                    <div className="flex items-center gap-1">
                                      <Maximize2 className="w-3 h-3 text-emerald-400" />
                                      <span className="text-sm font-bold text-slate-800">{area}</span>
                                    </div>
                                    <span className="text-[9px] text-slate-400 font-medium">م²</span>
                                  </div>
                                )}
                                {bathrooms !== null && area !== null && <div className="w-px h-7 bg-slate-200" />}
                                {bathrooms !== null && (
                                  <div className="flex flex-col items-center gap-1">
                                    <div className="flex items-center gap-1">
                                      <Bath className="w-3 h-3 text-sky-400" />
                                      <span className="text-sm font-bold text-slate-800">{bathrooms}</span>
                                    </div>
                                    <span className="text-[9px] text-slate-400 font-medium">حمام</span>
                                  </div>
                                )}
                              </div>

                              {/* License footer */}
                              {listing.license && (
                                <div className="px-4 py-2 flex items-center justify-between">
                                  <p className="text-[9px] text-slate-300 truncate">{listing.license}</p>
                                  <Building2 className="w-3 h-3 text-slate-200 flex-shrink-0" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {message.listings.length > 2 && (
                        <p className="text-[10px] text-slate-400 mt-2 text-center">
                          ← اسحب لرؤية المزيد &nbsp;·&nbsp; {message.listings.length} عقار
                        </p>
                      )}
                    </div>
                  )}

                  {/* Suggestion pills */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3" dir="rtl">
                      {message.suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(s)}
                          className="bg-white border border-slate-200 text-slate-600 text-xs px-3 py-1.5 rounded-full hover:border-indigo-400 hover:text-indigo-700 hover:bg-indigo-50/60 transition-all shadow-sm"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Demand CTA */}
                  {message.hasNoDemandCTA && (
                    <button
                      onClick={() => navigate('/demand')}
                      className="mt-3 w-full text-white font-semibold py-2.5 px-4 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center gap-2"
                      style={{ background: 'linear-gradient(135deg,#16a34a,#059669)' }}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span dir="rtl">أنشئ طلب عقار مخصص الآن</span>
                    </button>
                  )}
                </div>

                {/* User avatar */}
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0 mt-0.5 text-white font-bold text-sm shadow-md shadow-indigo-900/30 ring-1 ring-white/20">
                    أ
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div dir="ltr" className="flex gap-3 items-start">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm ring-1 ring-white/10"
                  style={{ background: 'linear-gradient(135deg,#0e2057,#1a1060)' }}
                >
                  س
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5 items-center h-4">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="bg-white border-t border-slate-200 px-4 sm:px-8 py-3 flex-shrink-0">
          <div className="max-w-2xl mx-auto">
            {/* Action chips */}
            <div className="flex gap-2 mb-2.5 justify-start flex-wrap" dir="rtl">
              {ACTION_CHIPS.map(chip => (
                <button
                  key={chip}
                  onClick={() => handleSend(chip)}
                  className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
            {/* Input row */}
            <div className="flex gap-2 items-center bg-slate-50 rounded-2xl border border-slate-200 px-3 py-1.5 focus-within:border-indigo-400 focus-within:bg-white transition-colors" dir="rtl">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="اكتب طلبك هنا... (مثال: فيلا في الرياض بميزانية مليون)"
                className="flex-1 border-0 bg-transparent text-right text-sm focus-visible:ring-0 shadow-none px-1 py-2 text-slate-700 placeholder:text-slate-400"
                dir="rtl"
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputValue.trim()}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0 disabled:opacity-40 transition-all hover:scale-105 shadow-md shadow-indigo-900/30"
                style={{ background: 'linear-gradient(135deg,#0e2057,#1a1060)' }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-400 text-center mt-2">مدعوم بالذكاء الاصطناعي • الشات العقاري</p>
          </div>
        </div>
      </div>

      {/* ── Side Panels ── */}
      <Sheet open={sidebarPanel !== null} onOpenChange={(open) => { if (!open) setSidebarPanel(null); }}>
        <SheetContent side="right" className="w-80 sm:w-96" dir="rtl">
          {sidebarPanel === 'favorites' && (
            <>
              <SheetHeader className="mb-4">
                <SheetTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500" />
                  المفضلة
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-3">
                <p className="text-xs text-slate-400 text-center py-8">احفظ العقارات من الشات لتظهر هنا</p>
              </div>
            </>
          )}

          {sidebarPanel === 'notifications' && (
            <>
              <SheetHeader className="mb-4">
                <SheetTitle className="flex items-center gap-2">
                  <BellRing className="w-5 h-5 text-amber-500" />
                  التنبيهات
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-3">
                {[
                  { title: 'عقار جديد في الرياض', body: 'فيلا 5 غرف بسعر 1.2 مليون — حي النرجس', time: 'منذ 10 دقائق', dot: 'bg-blue-500' },
                  { title: 'انخفاض سعر عقار محفوظ', body: 'شقة 3 غرف في جدة — انخفض السعر 8%', time: 'منذ ساعة', dot: 'bg-emerald-500' },
                  { title: 'رد من مكتب عقاري', body: 'مكتب برايم يرد على استفسارك', time: 'منذ 3 ساعات', dot: 'bg-indigo-500' },
                  { title: 'عرض خاص', body: 'خصم 5% على عقارات المدينة المنورة هذا الأسبوع', time: 'أمس', dot: 'bg-rose-500' },
                ].map((n, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                    <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{n.body}</p>
                      <p className="text-[11px] text-slate-400 mt-1">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {sidebarPanel === 'settings' && (
            <>
              <SheetHeader className="mb-0">
                <SheetTitle className="flex items-center gap-2 text-base">
                  <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                  الإعدادات
                </SheetTitle>
              </SheetHeader>

              <div className="mt-5 space-y-6" dir="rtl">
                {/* Profile card */}
                <div
                  className="relative rounded-2xl p-4 overflow-hidden"
                  style={{ background: 'linear-gradient(135deg,#0e2057 0%,#312e81 100%)' }}
                >
                  <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-300 to-indigo-400 flex items-center justify-center text-white font-extrabold text-lg shadow-lg ring-2 ring-white/20 flex-shrink-0">
                      {((buyerProfile?.name ?? user?.name) ?? 'م')[0]}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{buyerProfile?.name ?? user?.name ?? 'مستخدم'}</p>
                      <p className="text-blue-200 text-xs mt-0.5">{buyerProfile?.email ?? user?.email ?? buyerProfile?.phone ?? user?.phone ?? ''}</p>
                    </div>
                    <button className="mr-auto text-blue-200 hover:text-white transition-colors" onClick={() => { setSidebarPanel(null); navigate('/buyer/dashboard'); }}>
                      <ChevronRight className="w-4 h-4 rotate-180" />
                    </button>
                  </div>
                  <div className="flex gap-3 mt-3 relative z-10">
                    <span className="text-[11px] bg-white/15 text-blue-100 px-2.5 py-1 rounded-full font-medium">عميل</span>
                    <span className="text-[11px] bg-emerald-400/20 text-emerald-300 px-2.5 py-1 rounded-full font-medium">✔ حساب موثق</span>
                  </div>
                </div>

                {/* Preferences */}
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">التفضيلات</p>
                  <div className="rounded-2xl border border-slate-100 divide-y divide-slate-100 overflow-hidden bg-white">
                    {[
                      { label: 'اللغة', value: 'العربية', icon: '🌐' },
                      { label: 'المدينة الافتراضية', value: 'الرياض', icon: '📍' },
                      { label: 'عملة العرض', value: 'ر.س (SAR)', icon: '💰' },
                    ].map((s) => (
                      <button
                        key={s.label}
                        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 transition-colors text-right group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-base leading-none">{s.icon}</span>
                          <span className="text-sm text-slate-700 font-medium">{s.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-indigo-600">
                          <span className="text-xs font-semibold">{s.value}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors rotate-180" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notifications */}
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">الإشعارات</p>
                  <div className="rounded-2xl border border-slate-100 divide-y divide-slate-100 overflow-hidden bg-white">
                    {([
                      { label: 'عقارات جديدة', sub: 'إشعار عند توفر عقار مطابق', on: notifNew, set: setNotifNew },
                      { label: 'تغيرات الأسعار', sub: 'متابعة انخفاض الأسعار', on: notifPrice, set: setNotifPrice },
                      { label: 'رسائل المكاتب', sub: 'ردود ومحادثات جديدة', on: notifMessages, set: setNotifMessages },
                    ] as const).map((n) => (
                      <div key={n.label} className="flex items-center justify-between px-4 py-3.5">
                        <div>
                          <p className="text-sm font-medium text-slate-800">{n.label}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{n.sub}</p>
                        </div>
                        <button
                          onClick={() => n.set((v: boolean) => !v)}
                          className={`w-10 h-6 rounded-full relative transition-colors flex-shrink-0 ${
                            n.on ? 'bg-indigo-500' : 'bg-slate-200'
                          }`}
                        >
                          <span
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                              n.on ? 'right-1' : 'left-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Account actions */}
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">الحساب</p>
                  <div className="rounded-2xl border border-slate-100 divide-y divide-slate-100 overflow-hidden bg-white">
                    <button
                      onClick={() => { setSidebarPanel(null); setSidebarOpen(false); setTimeout(() => navigate('/buyer/dashboard?tab=profile'), 50); }}
                      className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 transition-colors text-right group"
                    >
                      <span className="text-sm text-slate-700 font-medium">تعديل الملف الشخصي</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors rotate-180" />
                    </button>
                  </div>
                </div>

                {/* Logout */}
                <button
                  onClick={() => { setSidebarPanel(null); authLogout(); navigate('/'); }}
                  className="w-full py-3 rounded-2xl bg-red-50 border border-red-100 text-red-500 text-sm font-semibold hover:bg-red-100 active:bg-red-200 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  تسجيل الخروج
                </button>

                <p className="text-center text-[11px] text-slate-300 pb-2">الشات العقاري · الإصدار 1.0.0</p>
              </div>
            </>
          )}

          {sidebarPanel === 'help' && (
            <>
              <SheetHeader className="mb-4">
                <SheetTitle className="flex items-center gap-2">
                  <LifeBuoy className="w-5 h-5 text-indigo-500" />
                  المساعدة
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-3">
                {[
                  { q: 'كيف أبحث عن عقار؟', a: 'اكتب طلبك في مربع النص أسفل الشاشة، مثل: فيلا في الرياض بميزانية مليون ريال.' },
                  { q: 'كيف أحفظ عقاراً في المفضلة؟', a: 'انقر على أيقونة القلب في بطاقة العقار لحفظه في قائمة المفضلة.' },
                  { q: 'هل يمكنني التفاوض عبر التطبيق؟', a: 'نعم، سارة تساعدك في بدء مفاوضات مع المكاتب العقارية مباشرةً من المحادثة.' },
                  { q: 'كيف أقدم طلب عقار مخصص؟', a: 'انقر على زر "أنشئ طلب عقار مخصص" الذي يظهر في المحادثة، أو اذهب لقسم الطلبات.' },
                ].map((item, i) => (
                  <details key={i} className="group rounded-xl border border-slate-100 overflow-hidden">
                    <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-semibold text-slate-800 hover:bg-slate-50 list-none">
                      {item.q}
                      <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform flex-shrink-0 mr-2" />
                    </summary>
                    <p className="px-4 pb-3 pt-1 text-sm text-slate-500 leading-relaxed">{item.a}</p>
                  </details>
                ))}
                <div className="mt-4 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                  <p className="text-sm font-semibold text-indigo-800 mb-1">تواصل معنا</p>
                  <p className="text-xs text-indigo-600">support@alshat-alaqari.com</p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

