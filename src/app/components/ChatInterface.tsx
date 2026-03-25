import { useState, useRef, useEffect } from 'react';
import { Send, User, MessageSquare, Sparkles, LogOut, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useNavigate } from 'react-router';
import { mockListings, formatPrice, getCityName, type ChatMessage } from '../lib/mock-data';

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'مرحباً! أنا مساعدك الذكي في البحث عن العقارات. كيف يمكنني مساعدتك اليوم؟',
      timestamp: new Date().toISOString(),
      suggestions: [
        'أبحث عن فيلا في الرياض',
        'شقة بسعر 800 ألف',
        'عقار بجوار البحر في جدة',
        'أريد رؤية أفضل العروض',
      ],
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = (userMessage: string): ChatMessage => {
    const messageLower = userMessage.toLowerCase();
    
    // Search for properties based on user query
    let relevantListings = mockListings;
    
    if (messageLower.includes('فيلا') || messageLower.includes('villa')) {
      relevantListings = mockListings.filter(l => l.property_type === 'Villa');
    }
    
    if (messageLower.includes('شقة') || messageLower.includes('apartment')) {
      relevantListings = mockListings.filter(l => l.property_type === 'Apartment');
    }
    
    if (messageLower.includes('الرياض') || messageLower.includes('riyadh')) {
      relevantListings = relevantListings.filter(l => l.city_id === '1');
    }
    
    if (messageLower.includes('جدة') || messageLower.includes('jeddah')) {
      relevantListings = relevantListings.filter(l => l.city_id === '2');
    }

    // Price range detection
    if (messageLower.includes('800') || messageLower.includes('٨٠٠')) {
      relevantListings = relevantListings.filter(l => l.price >= 600000 && l.price <= 1000000);
    }
    
    if (messageLower.includes('مليون') || messageLower.includes('million')) {
      relevantListings = relevantListings.filter(l => l.price >= 1000000);
    }

    // Generate contextual response
    let responseText = '';
    const hasResults = relevantListings.length > 0;

    if (hasResults) {
      const limitedListings = relevantListings.slice(0, 3);
      responseText = `عثرت على ${relevantListings.length} عقار يطابق معاييرك. إليك أفضل الخيارات:`;
      
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toISOString(),
        listings: limitedListings,
        suggestions: [
          'أريد رؤية المزيد من التفاصيل',
          'هل يمكن ترتيب زيارة؟',
          'أريد التفاوض على السعر',
          'ابحث عن خيارات أخرى',
        ],
      };
    } else {
      responseText = 'أفهم متطلباتك. دعني أساعدك في العثور على العقار المثالي. يمكنك أيضاً تقديم طلب عقار مخصص وسيتم توزيعه على المكاتب العقارية.';
      
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toISOString(),
        suggestions: [
          'ميزانيتي 800 ألف إلى مليون',
          'أفضل شمال الرياض',
          'أبحث عن 3 غرف نوم على الأقل',
          'أريد عقار بحديقة',
        ],
        hasNoDemandCTA: true,
      };
    }
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || inputValue.trim();
    if (!textToSend) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = generateAIResponse(textToSend);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen" style={{ background: 'linear-gradient(160deg, #f0f4ff 0%, #eef2ff 60%, #f5f0ff 100%)' }}>
      {/* Header */}
      <header className="sticky top-0 z-10 shadow-lg" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #312e81 100%)' }}>
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2" dir="ltr">
            {/* Left: nav buttons */}
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}
                className="text-white/70 hover:text-white hover:bg-white/10 text-xs px-2 py-1.5 h-auto">
                <LogOut className="w-3.5 h-3.5 mr-1" />
                <span className="hidden sm:inline">خروج</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/buyer/dashboard')}
                className="text-white/70 hover:text-white hover:bg-white/10 text-xs px-2 py-1.5 h-auto">
                <User className="w-3.5 h-3.5 mr-1" />
                <span className="hidden sm:inline">حسابي</span>
              </Button>
            </div>
            {/* Center: brand */}
            <div className="flex items-center gap-2.5 absolute left-1/2 -translate-x-1/2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-inner"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-white leading-none">الشات العقاري</h1>
                <p className="text-[10px] sm:text-xs text-blue-300 mt-0.5">مساعدك الذكي للعقارات</p>
              </div>
            </div>
            {/* Right: demand button */}
            <Button variant="ghost" size="sm" onClick={() => navigate('/demand')}
              className="text-white/70 hover:text-white hover:bg-white/10 text-xs px-2 py-1.5 h-auto">
              <MessageSquare className="w-3.5 h-3.5 mr-1" />
              <span className="hidden sm:inline">طلب عقار</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-5 sm:py-7">
        <div className="max-w-3xl mx-auto space-y-5 sm:space-y-7">
          {messages.map((message) => (
            <div
              key={message.id}
              dir="ltr"
              className={`flex gap-3 items-start ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md mt-0.5"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}

              <div className={`flex-1 max-w-xl flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                {/* Bubble */}
                <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                  message.role === 'user'
                    ? 'text-white rounded-tr-sm'
                    : 'bg-white border border-gray-100 rounded-tl-sm'
                }`} style={message.role === 'user' ? { background: 'linear-gradient(135deg, #2563eb, #4f46e5)' } : {}}>
                  <p className="text-sm sm:text-base leading-relaxed" dir="rtl">{message.content}</p>
                </div>

                {/* Property cards */}
                {message.listings && message.listings.length > 0 && (
                  <div className="mt-3 w-full space-y-3">
                    {message.listings.map((listing) => (
                      <div
                        key={listing.id}
                        className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer border border-gray-100"
                        onClick={() => navigate(`/listings/${listing.id}`)}
                      >
                        <div className="relative">
                          <img
                            src={listing.images[0]}
                            alt={listing.property_type}
                            className="w-full h-44 sm:h-52 object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                          <span className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                            {formatPrice(listing.price)}
                          </span>
                          {listing.quality_score >= 90 && (
                            <span className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                              ⭐ مميز
                            </span>
                          )}
                          <div className="absolute bottom-3 right-3" dir="rtl">
                            <h3 className="text-white font-bold text-sm sm:text-base drop-shadow-md">{listing.property_type}</h3>
                            <p className="text-white/85 text-xs drop-shadow">{listing.address}</p>
                          </div>
                        </div>
                        <div className="px-4 py-3 flex items-center justify-between" dir="rtl">
                          <div className="flex gap-3 text-xs sm:text-sm text-gray-600">
                            <span><span className="font-semibold text-gray-800">{listing.bedrooms}</span> غرف</span>
                            <span className="text-gray-300">|</span>
                            <span><span className="font-semibold text-gray-800">{listing.area}</span> م²</span>
                            <span className="text-gray-300">|</span>
                            <span>{getCityName(listing.city_id)}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Suggestion pills */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3" dir="rtl">
                    {message.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        className="bg-white border border-blue-200 text-blue-700 text-xs sm:text-sm px-3 py-1.5 rounded-full hover:bg-blue-50 hover:border-blue-400 transition-colors shadow-sm font-medium"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {/* No-results demand CTA */}
                {message.hasNoDemandCTA && (
                  <div className="mt-3 w-full">
                    <button
                      onClick={() => navigate('/demand')}
                      className="w-full text-white font-semibold py-3 px-4 rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #16a34a, #059669)' }}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span dir="rtl">أنشئ طلب عقار مخصص الآن</span>
                    </button>
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                <div className="w-9 h-9 rounded-2xl bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div dir="ltr" className="flex gap-3 items-start">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1.5 items-center h-5">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 border-t border-gray-200/80 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]"
        style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)' }}>
        <div className="max-w-3xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex gap-2 items-center">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="ابحث عن عقارك المثالي... (مثال: فيلا في الرياض)"
              className="flex-1 text-right rounded-2xl border-gray-200 bg-gray-50 focus:bg-white text-sm py-5 px-4"
              dir="rtl"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputValue.trim()}
              className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-white shadow-md hover:shadow-lg hover:scale-105 disabled:opacity-40 disabled:scale-100 transition-all"
              style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
          <p className="text-[11px] text-gray-400 text-center mt-2">
            مدعوم بالذكاء الاصطناعي • الشات العقاري
          </p>
        </div>
      </div>
    </div>
  );
}
