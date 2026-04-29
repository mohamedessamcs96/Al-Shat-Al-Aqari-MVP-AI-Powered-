import { useState, useRef, useEffect } from 'react';
import {
  Send, MessageSquare, LogOut, ChevronRight,
  Plus, Star, Bell, Settings, HelpCircle,
  Building2, Scale, Wallet, Trash2,
  Heart, BellRing, LifeBuoy, SlidersHorizontal,
  BedDouble, Bath, Maximize2, MapPin, UserPen, Check, X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from './ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { useNavigate } from 'react-router';
import { type ChatMessage, mockListings } from '../lib/mock-data';
import { formatPrice, getCityName } from '../lib/formatters';
import { chat as chatApi, buyers as buyersApi, directChat as directChatApi } from '../lib/api-client';
import { getUser, getToken, getRole, logout as authLogout } from '../lib/auth';

// ── Guest local search ────────────────────────────────────────────────────────
function guestSearch(text: string): { content: string; listings: any[]; suggestions: string[] } {
  const t = text.toLowerCase();

  // Detect city
  const cityId =
    /رياض|riyadh/.test(t) ? '1' :
    /جد[هة]|jeddah/.test(t) ? '2' :
    /دمام|dammam/.test(t) ? '3' : null;

  // Detect property type
  const wantedType =
    /فيل[اة]|فله|villa/.test(t) ? 'Villa' :
    /شق[هة]|apartment|flat/.test(t) ? 'Apartment' :
    /دوبلكس|duplex/.test(t) ? 'Duplex' :
    /أرض|ارض|land/.test(t) ? 'Land' :
    /مكتب|office/.test(t) ? 'Office' : null;

  // Detect budget ceiling (e.g. مليون => ×1,000,000 / ألف => ×1,000)
  let budget: number | null = null;
  const milMatch = t.match(/(\d[\d.,]*)\s*(مليون|million)/);
  const alfMatch = t.match(/(\d[\d.,]*)\s*(ألف|الف|thousand|k)/);
  if (milMatch) budget = parseFloat(milMatch[1].replace(/,/g, '')) * 1_000_000;
  else if (alfMatch) budget = parseFloat(alfMatch[1].replace(/,/g, '')) * 1_000;

  // Detect bedroom count
  const bedMatch = t.match(/(\d)\s*(غرف|غرفة|rooms?|bed)/);
  const wantedBeds = bedMatch ? parseInt(bedMatch[1]) : null;

  // Filter
  let results = mockListings.filter(l => l.status === 'active');
  if (cityId) results = results.filter(l => l.city_id === cityId);
  if (wantedType) results = results.filter(l => l.property_type.toLowerCase() === wantedType.toLowerCase());
  if (budget) results = results.filter(l => l.price <= budget!);
  if (wantedBeds) results = results.filter(l => l.bedrooms >= wantedBeds);

  // If nothing matches exactly, relax city/type filter and return closest
  if (results.length === 0) results = mockListings.filter(l => l.status === 'active').slice(0, 3);

  // Convert to backend-shape listing cards (short_title, summary)
  const listings = results.slice(0, 4).map(l => {
    const cityName = l.city_id === '1' ? 'الرياض' : l.city_id === '2' ? 'جدة' : 'الدمام';
    const typeName =
      l.property_type === 'Villa' ? 'فيلا' :
      l.property_type === 'Apartment' ? 'شقة' :
      l.property_type === 'Duplex' ? 'دوبلكس' :
      l.property_type === 'Land' ? 'أرض' : l.property_type;
    return {
      license: `MOCK-${l.id}`,
      short_title: `${typeName} ${cityName} ${l.area}م ${l.price}`,
      summary: `${l.bedrooms} غرف | ${l.bathrooms} حمّامات | ${l.area} م² | ${l.price}`,
      description: l.description,
    };
  });

  const cityLabel = cityId === '1' ? 'الرياض' : cityId === '2' ? 'جدة' : cityId === '3' ? 'الدمام' : '';
  const found = listings.length;
  const content = found > 0
    ? `وجدت ${found} عقار${found > 1 ? 'ات' : ''} تناسب طلبك${cityLabel ? ` في ${cityLabel}` : ''}. إليك أفضل الخيارات المتاحة:`
    : 'لم أجد عقارات تطابق طلبك بالضبط، لكن إليك أقرب الخيارات المتاحة:';

  return {
    content,
    listings,
    suggestions: ['أريد رؤية المزيد', 'غيّر المدينة', 'أريد ترتيب زيارة', 'سجّل للوصول لجميع العقارات'],
  };
}

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
  const isLoggedIn = !!getToken();

  // Settings panel – real buyer profile
  const [buyerProfile, setBuyerProfile] = useState<{
    name?: string; phone?: string; email?: string;
    bio?: string; whatsapp?: string; address?: string; website?: string; logo_url?: string;
  } | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editLogoUrl, setEditLogoUrl] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [notifNew, setNotifNew] = useState(true);
  const [notifPrice, setNotifPrice] = useState(true);
  const [notifMessages, setNotifMessages] = useState(false);
  const [unreadDirectCount, setUnreadDirectCount] = useState(0);

  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchUnread = async () => {
      try {
        const raw = await directChatApi.getUnreadCount() as Record<string, unknown>;
        const n = Number((raw as any)?.unread_count ?? (raw as any)?.count ?? (raw as any)?.total ?? 0);
        setUnreadDirectCount(Number.isFinite(n) ? n : 0);
      } catch { /* ignore */ }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30_000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

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
            bio: d?.bio ?? '',
            whatsapp: d?.whatsapp ?? '',
            address: d?.address ?? '',
            website: d?.website ?? '',
            logo_url: d?.logo_url ?? '',
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

    // If we only have a local/fallback conversation, try to create a real one on the backend
    let convId = activeId;
    if (!convId || convId === 'current' || convId.startsWith('local_')) {
      try {
        const res = await chatApi.startConversation();
        const raw = res as any;
        const newId = String(
          raw.id ??
          raw._id ??
          raw.conversation_id ??
          (raw.data as any)?.id ??
          (raw.data as any)?.conversation_id ??
          ''
        );
        if (newId && !newId.startsWith('local_')) {
          convId = newId;
          setConversations(prev => prev.map(c =>
            c.id === activeId ? { ...c, id: newId } : c
          ));
          setActiveId(newId);
        }
        // If newId is empty/local, convId stays as-is → will hit the local fallback in catch below
      } catch (startErr) {
        console.warn('[chat] startConversation failed:', startErr);
        // convId stays local_* → handleSend catch will use guestSearch
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
      // If we still have no real conversation ID, fall back to local AI
      if (!convId || convId.startsWith('local_')) throw new Error('local');

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
      const isLocal = err instanceof Error && err.message === 'local';
      const isAuthErr = err instanceof Error && (err.message.includes('401') || err.message.includes('انتهت') || err.message.includes('session'));

      // If backend refused (auth/local) → use local AI as graceful fallback for guests
      if (isLocal || isAuthErr || !isLoggedIn) {
        const result = guestSearch(textToSend);
        const aiMsg: ChatMessage = {
          id: String(Date.now() + 1),
          role: 'assistant',
          content: result.content,
          timestamp: new Date().toISOString(),
          suggestions: result.suggestions,
          listings: result.listings.length > 0 ? result.listings : undefined,
        };
        setConversations(prev => prev.map(c =>
          c.id !== convId ? c : { ...c, messages: [...c.messages, aiMsg] }
        ));
      } else {
        // Real logged-in error – show toast and remove optimistic message
        toast.error(err instanceof Error ? err.message : 'تعذّر إرسال الرسالة');
        setConversations(prev => prev.map(c =>
          c.id !== convId ? c : { ...c, messages: c.messages.filter(m => m.id !== userMsg.id) }
        ));
      }
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
          {isLoggedIn ? (
            <>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg shadow-blue-900/40 ring-1 ring-white/20">
                {(user?.name ?? 'م')[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{user?.name ?? 'مستخدم'}</p>
                <p className="text-blue-300/50 text-xs">عميل</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white/60 flex-shrink-0 ring-1 ring-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/70 font-semibold text-sm">زائر</p>
                <button
                  onClick={() => navigate('/')}
                  className="text-blue-300 text-xs hover:text-blue-200 transition-colors"
                >
                  سجّل الدخول ←
                </button>
              </div>
            </>
          )}
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
            <button onClick={() => navigate('/demand')} className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-colors" title="طلب عقار">
              <MessageSquare className="w-4 h-4" />
            </button>
            {isLoggedIn && (
              <button
                onClick={() => navigate(getRole() === 'office' ? '/office/direct-chat' : '/direct-chat')}
                className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-slate-100 text-blue-600 hover:text-blue-700 transition-colors relative"
                title="المحادثات المباشرة"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"/>
                  <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/>
                </svg>
                {unreadDirectCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                    {unreadDirectCount > 9 ? '9+' : unreadDirectCount}
                  </span>
                )}
              </button>
            )}
            {isLoggedIn ? (
              <button onClick={() => { authLogout(); navigate('/'); }} className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={() => navigate('/')} className="px-3 h-8 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                دخول
              </button>
            )}
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          <div className="max-w-2xl mx-auto space-y-6">

            {/* Welcome headline */}
            {messages.length === 1 && messages[0].role === 'assistant' && (
              <div className="text-center pt-8 pb-2">
                <div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-lg shadow-indigo-900/30 ring-1 ring-white/10 overflow-hidden"
                  style={{ background: 'linear-gradient(135deg,#0e2057,#1a1060)' }}
                >
                  <img src="/favicon.svg" alt="سارة" className="w-full h-full object-cover" />
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
                    className="w-8 h-8 rounded-xl flex-shrink-0 shadow-md shadow-indigo-900/30 mt-0.5 ring-1 ring-white/10 overflow-hidden"
                    style={{ background: 'linear-gradient(135deg,#0e2057,#1a1060)' }}
                  >
                    <img src="/favicon.svg" alt="سارة" className="w-full h-full object-cover" />
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
        <SheetContent side="right" className="w-80 sm:w-96 flex flex-col overflow-hidden p-0" dir="rtl">
          {sidebarPanel === 'favorites' && (
            <div className="flex flex-col h-full">
              <div className="px-5 pt-5 pb-3 border-b border-slate-100 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span className="font-semibold text-slate-800 text-sm">المفضلة</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                <p className="text-xs text-slate-400 text-center py-8">احفظ العقارات من الشات لتظهر هنا</p>
              </div>
            </div>
          )}

          {sidebarPanel === 'notifications' && (
            <div className="flex flex-col h-full">
              <div className="px-5 pt-5 pb-3 border-b border-slate-100 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <BellRing className="w-4 h-4 text-amber-500" />
                  <span className="font-semibold text-slate-800 text-sm">التنبيهات</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
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
            </div>
          )} 

          {sidebarPanel === 'settings' && (
            <div className="flex flex-col h-full">
              {/* ── Header ── */}
              <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-slate-100 flex-shrink-0">
                {editingProfile && (
                  <button
                    onClick={() => setEditingProfile(false)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-500 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
                <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                <span className="font-semibold text-slate-800 text-sm">
                  {editingProfile ? 'تعديل الملف الشخصي' : 'الإعدادات'}
                </span>
              </div>

              {/* ── Scrollable body ── */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5" dir="rtl">

                {editingProfile ? (
                  /* ─── Edit Profile Screen ─── */
                  <div className="space-y-4">
                    {/* Avatar preview */}
                    <div className="flex justify-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-300 to-indigo-400 flex items-center justify-center text-white font-extrabold text-2xl shadow-md ring-2 ring-indigo-100 overflow-hidden">
                        {editLogoUrl ? (
                          <img src={editLogoUrl} alt="" className="w-full h-full object-cover"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                        ) : (
                          (editName || buyerProfile?.name || user?.name || 'م')[0]
                        )}
                      </div>
                    </div>

                    {[
                      { label: 'الاسم', value: editName, set: setEditName, placeholder: 'اسمك الكامل', type: 'text' },
                      { label: 'نبذة قصيرة', value: editBio, set: setEditBio, placeholder: 'اكتب نبذة مختصرة عنك', type: 'text' },
                      { label: 'رقم الجوال', value: editPhone, set: setEditPhone, placeholder: '+966500000000', type: 'tel' },
                      { label: 'رقم واتساب', value: editWhatsapp, set: setEditWhatsapp, placeholder: '+966500000000', type: 'tel' },
                      { label: 'العنوان', value: editAddress, set: setEditAddress, placeholder: 'المدينة، الحي', type: 'text' },
                      { label: 'الموقع الإلكتروني', value: editWebsite, set: setEditWebsite, placeholder: 'https://example.com', type: 'url' },
                      { label: 'رابط الصورة الشخصية', value: editLogoUrl, set: setEditLogoUrl, placeholder: 'https://...', type: 'url' },
                    ].map((f) => (
                      <div key={f.label}>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">{f.label}</label>
                        <Input
                          type={f.type}
                          value={f.value}
                          onChange={(e) => f.set(e.target.value)}
                          placeholder={f.placeholder}
                          className="h-10 text-sm bg-slate-50 border-slate-200 focus:bg-white"
                          dir="ltr"
                        />
                      </div>
                    ))}

                    <button
                      disabled={isSavingProfile}
                      onClick={async () => {
                        if (!user?.id) return;
                        setIsSavingProfile(true);
                        try {
                          await buyersApi.updateProfile(user.id, {
                            name: editName,
                            bio: editBio,
                            phone: editPhone,
                            whatsapp: editWhatsapp,
                            address: editAddress,
                            website: editWebsite,
                            logo_url: editLogoUrl,
                          });
                          setBuyerProfile(prev => ({
                            ...prev,
                            name: editName, bio: editBio, phone: editPhone,
                            whatsapp: editWhatsapp, address: editAddress,
                            website: editWebsite, logo_url: editLogoUrl,
                          }));
                          toast.success('تم حفظ الملف الشخصي');
                          setEditingProfile(false);
                        } catch {
                          toast.error('فشل الحفظ، حاول مجدداً');
                        } finally {
                          setIsSavingProfile(false);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors mt-2"
                    >
                      <Check className="w-4 h-4" />
                      {isSavingProfile ? 'جاري الحفظ…' : 'حفظ التغييرات'}
                    </button>
                  </div>
                ) : (
                  /* ─── Main Settings Screen ─── */
                  <>
                    {/* Profile card */}
                    <div
                      className="relative rounded-2xl p-4 overflow-hidden"
                      style={{ background: 'linear-gradient(135deg,#0e2057 0%,#312e81 100%)' }}
                    >
                      <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                      <div className="flex items-center gap-3 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-300 to-indigo-400 flex items-center justify-center text-white font-extrabold text-lg shadow-lg ring-2 ring-white/20 flex-shrink-0 overflow-hidden">
                          {buyerProfile?.logo_url ? (
                            <img src={buyerProfile.logo_url} alt="" className="w-full h-full object-cover"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                          ) : (
                            ((buyerProfile?.name ?? user?.name) ?? 'م')[0]
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold text-sm truncate">{buyerProfile?.name ?? user?.name ?? 'مستخدم'}</p>
                          <p className="text-blue-200 text-xs mt-0.5 truncate">{buyerProfile?.phone ?? user?.phone ?? buyerProfile?.email ?? user?.email ?? ''}</p>
                          {buyerProfile?.bio && <p className="text-blue-300/80 text-[11px] mt-0.5 truncate">{buyerProfile.bio}</p>}
                        </div>
                        <button
                          className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-blue-200 hover:text-white transition-colors flex items-center justify-center"
                          title="تعديل الملف الشخصي"
                          onClick={() => {
                            setEditName(buyerProfile?.name ?? user?.name ?? '');
                            setEditBio(buyerProfile?.bio ?? '');
                            setEditPhone(buyerProfile?.phone ?? user?.phone ?? '');
                            setEditWhatsapp(buyerProfile?.whatsapp ?? '');
                            setEditAddress(buyerProfile?.address ?? '');
                            setEditWebsite(buyerProfile?.website ?? '');
                            setEditLogoUrl(buyerProfile?.logo_url ?? '');
                            setEditingProfile(true);
                          }}
                        >
                          <UserPen className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex gap-2 mt-3 relative z-10">
                        <span className="text-[11px] bg-white/15 text-blue-100 px-2.5 py-1 rounded-full font-medium">عميل</span>
                        <span className="text-[11px] bg-emerald-400/20 text-emerald-300 px-2.5 py-1 rounded-full font-medium">✔ حساب موثق</span>
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
                              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                                n.on ? 'right-1' : 'left-1'
                              }`} />
                            </button>
                          </div>
                        ))}
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
                  </>
                )}
              </div>
            </div>
          )}

          {sidebarPanel === 'help' && (
            <div className="flex flex-col h-full">
              <div className="px-5 pt-5 pb-3 border-b border-slate-100 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <LifeBuoy className="w-4 h-4 text-indigo-500" />
                  <span className="font-semibold text-slate-800 text-sm">المساعدة</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
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
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

