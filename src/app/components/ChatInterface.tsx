import { useState, useRef, useEffect } from 'react';
import {
  Send, MessageSquare, LogOut, ChevronRight,
  Plus, Star, Bell, Settings, HelpCircle,
  Building2, Scale, Wallet, Trash2,
  Heart, BellRing, LifeBuoy, SlidersHorizontal,
} from 'lucide-react';
import { Input } from './ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { useNavigate } from 'react-router';
import { mockListings, formatPrice, getCityName, type ChatMessage } from '../lib/mock-data';

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

const SEED_CONVERSATIONS: Conversation[] = [
  { id: 'h1', title: 'شراء شقة في الرياض', createdAt: Date.now() - 86400000, messages: [makeSaraGreeting('h1g')] },
  { id: 'h2', title: 'إستثمار في جدة', createdAt: Date.now() - 172800000, messages: [makeSaraGreeting('h2g')] },
  { id: 'h3', title: 'مقارنة الفيلا', createdAt: Date.now() - 259200000, messages: [makeSaraGreeting('h3g')] },
  { id: 'h4', title: 'تقييم المكاسة', createdAt: Date.now() - 345600000, messages: [makeSaraGreeting('h4g')] },
];

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
  const [conversations, setConversations] = useState<Conversation[]>([
    { id: newConvId, title: 'محادثة جديدة', createdAt: Date.now(), messages: [makeSaraGreeting('g0')] },
    ...SEED_CONVERSATIONS,
  ]);
  const [activeId, setActiveId] = useState(newConvId);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  // Default closed on mobile (< 1024px), open on desktop
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [sidebarPanel, setSidebarPanel] = useState<'favorites' | 'notifications' | 'settings' | 'help' | null>(null);
  const isDesktop = () => window.innerWidth >= 1024;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const activeConv = conversations.find(c => c.id === activeId) ?? conversations[0];
  const messages = activeConv.messages;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const generateAIResponse = (userMessage: string): ChatMessage => {
    const lower = userMessage.toLowerCase();
    let relevantListings = mockListings;

    if (lower.includes('فيلا') || lower.includes('villa')) relevantListings = mockListings.filter(l => l.property_type === 'Villa');
    if (lower.includes('شقة') || lower.includes('apartment')) relevantListings = mockListings.filter(l => l.property_type === 'Apartment');
    if (lower.includes('الرياض') || lower.includes('riyadh')) relevantListings = relevantListings.filter(l => l.city_id === '1');
    if (lower.includes('جدة') || lower.includes('jeddah')) relevantListings = relevantListings.filter(l => l.city_id === '2');
    if (lower.includes('800') || lower.includes('٨٠٠')) relevantListings = relevantListings.filter(l => l.price >= 600000 && l.price <= 1000000);
    if (lower.includes('مليون') || lower.includes('million')) relevantListings = relevantListings.filter(l => l.price >= 1000000);

    if (relevantListings.length > 0) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: `عثرت على ${relevantListings.length} عقار يطابق معاييرك. إليك أفضل الخيارات:`,
        timestamp: new Date().toISOString(),
        listings: relevantListings.slice(0, 3),
        suggestions: ['أريد رؤية المزيد', 'هل يمكن ترتيب زيارة؟', 'أريد التفاوض على السعر', 'ابحث عن خيارات أخرى'],
      };
    }
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'أفهم متطلباتك. دعني أساعدك في العثور على العقار المثالي. يمكنك أيضاً تقديم طلب عقار مخصص.',
      timestamp: new Date().toISOString(),
      suggestions: ['ميزانيتي 800 ألف إلى مليون', 'أفضل شمال الرياض', '3 غرف نوم على الأقل', 'عقار بحديقة'],
      hasNoDemandCTA: true,
    };
  };

  const handleSend = (text?: string) => {
    const textToSend = text || inputValue.trim();
    if (!textToSend) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: textToSend, timestamp: new Date().toISOString() };

    setConversations(prev => prev.map(c => {
      if (c.id !== activeId) return c;
      const hasUserMsg = c.messages.some(m => m.role === 'user');
      return {
        ...c,
        title: hasUserMsg ? c.title : textToSend.slice(0, 32),
        messages: [...c.messages, userMsg],
      };
    }));
    setInputValue('');
    setIsTyping(true);
    setTimeout(() => {
      const aiMsg = generateAIResponse(textToSend);
      setConversations(prev => prev.map(c =>
        c.id !== activeId ? c : { ...c, messages: [...c.messages, aiMsg] }
      ));
      setIsTyping(false);
    }, 1000);
  };

  const startNewChat = () => {
    const id = `chat_${Date.now()}`;
    const greeting = makeSaraGreeting(`${id}_g`);
    setConversations(prev => [{ id, title: 'محادثة جديدة', createdAt: Date.now(), messages: [greeting] }, ...prev]);
    setActiveId(id);
    setInputValue('');
    if (!isDesktop()) setSidebarOpen(false);
  };

  const selectConversation = (id: string) => {
    setActiveId(id);
    if (!isDesktop()) setSidebarOpen(false);
  };

  const deleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
            أ
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">أحمد</p>
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
            <button onClick={() => navigate('/')} className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-colors">
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
                    {message.content}
                  </div>

                  {/* Property cards */}
                  {message.listings && message.listings.length > 0 && (
                    <div className="mt-3 w-full space-y-2.5">
                      {message.listings.map((listing) => (
                        <div
                          key={listing.id}
                          className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer border border-slate-100"
                          onClick={() => navigate(`/listings/${listing.id}`)}
                        >
                          <div className="relative">
                            <img src={listing.images[0]} alt="" className="w-full h-40 object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <span
                              className="absolute top-2 right-2 text-white text-xs font-bold px-2.5 py-1 rounded-full"
                              style={{ background: 'linear-gradient(135deg,#0e2057,#1a1060)' }}
                            >
                              {formatPrice(listing.price)}
                            </span>
                            {listing.quality_score >= 90 && (
                              <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">مميز</span>
                            )}
                            <div className="absolute bottom-2 right-3" dir="rtl">
                              <p className="text-white font-bold text-sm drop-shadow">{listing.property_type}</p>
                              <p className="text-white/80 text-xs">{listing.address}</p>
                            </div>
                          </div>
                          <div className="px-4 py-2.5 flex items-center justify-between" dir="rtl">
                            <div className="flex gap-3 text-xs text-slate-500">
                              <span><b className="text-slate-800">{listing.bedrooms}</b> غرف</span>
                              <span className="text-slate-300">·</span>
                              <span><b className="text-slate-800">{listing.area}</b> م²</span>
                              <span className="text-slate-300">·</span>
                              <span>{getCityName(listing.city_id)}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-indigo-400" />
                          </div>
                        </div>
                      ))}
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
                {mockListings.slice(0, 4).map(l => (
                  <div
                    key={l.id}
                    className="flex gap-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/40 cursor-pointer transition-all"
                    onClick={() => { setSidebarPanel(null); navigate(`/listings/${l.id}`); }}
                  >
                    <img src={l.images[0]} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{l.property_type} — {l.address}</p>
                      <p className="text-xs text-indigo-600 font-bold mt-0.5">{formatPrice(l.price)}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{l.bedrooms} غرف · {l.area} م²</p>
                    </div>
                    <Heart className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5 fill-rose-400" />
                  </div>
                ))}
                <p className="text-xs text-slate-400 text-center pt-2">احفظ العقارات من الشات لتظهر هنا</p>
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
              <SheetHeader className="mb-4">
                <SheetTitle className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-slate-600" />
                  الإعدادات
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">الحساب</p>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">أ</div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">أحمد</p>
                      <p className="text-xs text-slate-400">ahmed@example.com</p>
                    </div>
                  </div>
                </div>
                {[
                  { label: 'اللغة', value: 'العربية' },
                  { label: 'المدينة الافتراضية', value: 'الرياض' },
                  { label: 'عملة العرض', value: 'ريال سعودي (SAR)' },
                  { label: 'الإشعارات', value: 'مفعّلة' },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
                    <span className="text-sm text-slate-700">{s.label}</span>
                    <span className="text-sm text-indigo-600 font-medium">{s.value}</span>
                  </div>
                ))}
                <button
                  onClick={() => { setSidebarPanel(null); navigate('/'); }}
                  className="w-full mt-2 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
                >
                  تسجيل الخروج
                </button>
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

