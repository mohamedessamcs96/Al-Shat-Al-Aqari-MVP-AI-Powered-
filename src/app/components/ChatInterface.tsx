import { useState, useRef, useEffect } from 'react';
import { Send, Home, Building2, User, MessageSquare, Sparkles } from 'lucide-react';
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
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
          <div className="flex items-center justify-between gap-2 mb-2 sm:mb-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl flex-shrink-0">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="hidden sm:block min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">الشات العقاري</h1>
                <p className="text-xs sm:text-sm text-gray-500 truncate">مساعدك الذكي للعقارات</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-end">
              <Button variant="ghost" size="sm" onClick={() => navigate('/buyer/dashboard')} className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2">
                <User className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 flex-shrink-0" />
                <span className="hidden sm:inline">لوحة التحكم</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/demand')} className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2">
                <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 flex-shrink-0" />
                <span className="hidden sm:inline">طلب</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/office/dashboard')} className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2">
                <Building2 className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 flex-shrink-0" />
                <span className="hidden sm:inline">مكتب</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <Avatar className="bg-gradient-to-br from-blue-600 to-indigo-600 border-2 border-white shadow-md">
                  <AvatarFallback className="bg-transparent">
                    <Sparkles className="w-5 h-5 text-white" />
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div className={`flex-1 max-w-2xl ${message.role === 'user' ? 'text-right' : ''}`}>
                <Card className={`p-4 ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-none shadow-md' 
                    : 'bg-white border shadow-sm'
                }`}>
                  <p className="whitespace-pre-wrap" dir="rtl">{message.content}</p>
                </Card>

                {/* Listings Results */}
                {message.listings && message.listings.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {message.listings.map((listing) => (
                      <Card
                        key={listing.id}
                        className="p-4 hover:shadow-md transition-shadow cursor-pointer bg-white"
                        onClick={() => navigate(`/listings/${listing.id}`)}
                      >
                        <div className="flex gap-4">
                          <img
                            src={listing.images[0]}
                            alt={listing.property_type}
                            className="w-32 h-24 object-cover rounded-lg"
                          />
                          <div className="flex-1" dir="rtl">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-gray-900">{listing.property_type}</h3>
                                <p className="text-sm text-gray-600">{listing.address}</p>
                              </div>
                              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                {formatPrice(listing.price)}
                              </Badge>
                            </div>
                            <div className="flex gap-4 mt-2 text-sm text-gray-600">
                              <span>{listing.bedrooms} غرف</span>
                              <span>•</span>
                              <span>{listing.area} م²</span>
                              <span>•</span>
                              <span>{getCityName(listing.city_id)}</span>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Badge variant="outline" className="text-xs">
                                جودة {listing.quality_score}%
                              </Badge>
                              {listing.features.slice(0, 2).map((feature, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3" dir="rtl">
                    {message.suggestions.map((suggestion, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        className="bg-white hover:bg-blue-50 border-blue-200"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}

                {/* No Results CTA - Demand Form */}
                {message.hasNoDemandCTA && (
                  <div className="mt-4">
                    <Button
                      onClick={() => navigate('/demand')}
                      className="w-full bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold"
                    >
                      <MessageSquare className="w-4 h-4 ml-2" />
                      أنشئ طلب عقار مخصص الآن
                    </Button>
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                <Avatar className="bg-gray-200">
                  <AvatarFallback>
                    <User className="w-5 h-5 text-gray-600" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 justify-start">
              <Avatar className="bg-gradient-to-br from-blue-600 to-indigo-600 border-2 border-white shadow-md">
                <AvatarFallback className="bg-transparent">
                  <Sparkles className="w-5 h-5 text-white" />
                </AvatarFallback>
              </Avatar>
              <Card className="p-4 bg-white">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t shadow-lg sticky bottom-0">
        <div className="max-w-4xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
          <div className="flex gap-1 sm:gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="ابحث... (مثال: فيلا في الرياض)"
              className="flex-1 text-right text-xs sm:text-sm py-2"
              dir="rtl"
            />
            <Button
              onClick={() => handleSend()}
              disabled={!inputValue.trim()}
              className="bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 flex-shrink-0"
              size="sm"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            مدعوم بالذكاء الاصطناعي • البحث الذكي
          </p>
        </div>
      </div>
    </div>
  );
}
