import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Send, TrendingDown, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { mockNegotiations, mockListings, formatPrice } from '../lib/mock-data';
import { toast } from 'sonner';

export function NegotiationView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newOffer, setNewOffer] = useState('');
  const [offerMessage, setOfferMessage] = useState('');

  const negotiation = mockNegotiations.find(n => n.id === id);
  const listing = negotiation ? mockListings.find(l => l.id === negotiation.listing_id) : null;

  if (!negotiation || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">التفاوض غير موجود</h2>
          <Button onClick={() => navigate('/buyer/dashboard')} className="mt-4">
            العودة
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmitOffer = () => {
    if (!newOffer) {
      toast.error('الرجاء إدخال قيمة العرض');
      return;
    }
    const offerValue = parseInt(newOffer);
    if (offerValue >= negotiation.listing_price) {
      toast.error('العرض يجب أن يكون أقل من السعر المطلوب');
      return;
    }
    toast.success('تم إرسال عرضك الجديد بنجاح!');
    setNewOffer('');
    setOfferMessage('');
  };

  const priceDifference = negotiation.listing_price - negotiation.current_offer;
  const differencePercentage = ((priceDifference / negotiation.listing_price) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/buyer/dashboard')}>
            <ArrowLeft className="w-5 h-5 ml-2" />
            رجوع
          </Button>
          <h1 className="text-xl font-bold text-gray-900">التفاوض على العقار</h1>
          <div className="w-20" />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Negotiation Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Summary */}
            <Card className="p-6">
              <div className="flex gap-4">
                <img
                  src={listing.images[0]}
                  alt={listing.property_type}
                  className="w-32 h-24 rounded-lg object-cover"
                />
                <div className="flex-1" dir="rtl">
                  <h2 className="font-semibold text-gray-900 text-lg">{listing.property_type}</h2>
                  <p className="text-sm text-gray-600">{listing.address}</p>
                  <div className="flex gap-3 mt-2 text-sm text-gray-600">
                    <span>{listing.bedrooms} غرف</span>
                    <span>•</span>
                    <span>{listing.bathrooms} حمام</span>
                    <span>•</span>
                    <span>{listing.area} م²</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Current Status */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4" dir="rtl">الوضع الحالي للتفاوض</h3>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">السعر المطلوب</p>
                  <p className="text-xl font-bold text-gray-900">{formatPrice(negotiation.listing_price)}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">عرضك الحالي</p>
                  <p className="text-xl font-bold text-green-600">{formatPrice(negotiation.current_offer)}</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">الفرق</p>
                  <p className="text-xl font-bold text-red-600">{formatPrice(priceDifference)}</p>
                  <p className="text-xs text-red-600 mt-1">{differencePercentage}%</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 p-3 bg-yellow-50 rounded-lg">
                <TrendingDown className="w-5 h-5 text-yellow-600" />
                <p className="text-sm text-yellow-700" dir="rtl">
                  في انتظار رد البائع على عرضك الأخير
                </p>
              </div>
            </Card>

            {/* Negotiation History */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4" dir="rtl">سجل التفاوض</h3>
              <div className="space-y-4">
                {negotiation.history.map((entry, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg ${
                      entry.party === 'buyer' ? 'bg-blue-50 mr-8' : 'bg-gray-50 ml-8'
                    }`}
                    dir="rtl"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Badge
                          className={
                            entry.party === 'buyer'
                              ? 'bg-blue-100 text-blue-700 border-blue-200'
                              : 'bg-gray-200 text-gray-700 border-gray-300'
                          }
                        >
                          {entry.party === 'buyer' ? 'أنت' : 'البائع'}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(entry.timestamp).toLocaleDateString('ar-SA')} • {new Date(entry.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{formatPrice(entry.offer)}</p>
                    </div>
                    {entry.message && (
                      <p className="text-sm text-gray-700 mt-2">{entry.message}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar - Make New Offer */}
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4" dir="rtl">تقديم عرض جديد</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="new-offer">قيمة العرض (ريال سعودي)</Label>
                  <Input
                    id="new-offer"
                    type="number"
                    value={newOffer}
                    onChange={(e) => setNewOffer(e.target.value)}
                    placeholder={negotiation.current_offer.toString()}
                    className="mt-1 text-right"
                    dir="rtl"
                  />
                  <p className="text-xs text-gray-500 mt-1" dir="rtl">
                    العرض الحالي: {formatPrice(negotiation.current_offer)}
                  </p>
                </div>

                <div>
                  <Label htmlFor="offer-msg">رسالة للبائع (اختياري)</Label>
                  <Textarea
                    id="offer-msg"
                    value={offerMessage}
                    onChange={(e) => setOfferMessage(e.target.value)}
                    placeholder="أضف أي تفاصيل أو تبريرات لعرضك..."
                    rows={4}
                    className="mt-1"
                    dir="rtl"
                  />
                </div>

                <Button onClick={handleSubmitOffer} className="w-full">
                  <Send className="w-4 h-4 ml-2" />
                  إرسال العرض
                </Button>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700" dir="rtl">
                    💡 نصيحة: قدم عرضاً معقولاً مع توضيح أسبابك لزيادة فرص القبول
                  </p>
                </div>
              </div>
            </Card>

            {/* Quick Suggestions */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-3" dir="rtl">اقتراحات سريعة</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  dir="rtl"
                  onClick={() => setNewOffer((negotiation.current_offer + 25000).toString())}
                >
                  زيادة 25,000 ريال
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  dir="rtl"
                  onClick={() => setNewOffer((negotiation.current_offer + 50000).toString())}
                >
                  زيادة 50,000 ريال
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  dir="rtl"
                  onClick={() => {
                    const midPoint = Math.floor((negotiation.listing_price + negotiation.current_offer) / 2);
                    setNewOffer(midPoint.toString());
                  }}
                >
                  نقطة المنتصف ({formatPrice(Math.floor((negotiation.listing_price + negotiation.current_offer) / 2))})
                </Button>
              </div>
            </Card>

            {/* Accept Listing Price */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-3" dir="rtl">قبول السعر المطلوب</h3>
              <p className="text-sm text-gray-600 mb-4" dir="rtl">
                إذا كنت مستعداً لدفع السعر الكامل، يمكنك إنهاء التفاوض الآن
              </p>
              <Button variant="outline" className="w-full" dir="rtl">
                <CheckCircle className="w-4 h-4 ml-2" />
                قبول السعر ({formatPrice(negotiation.listing_price)})
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
