import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, MapPin, Bed, Bath, Maximize, Star, Phone, Mail, Calendar, MessageCircle, DollarSign, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { formatPrice } from '../lib/formatters';
import { listings as listingsApi } from '../lib/api-client';
import { logout as authLogout } from '../lib/auth';
import { toast } from 'sonner';

export function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [visitDate, setVisitDate] = useState('');
  const [visitNotes, setVisitNotes] = useState('');
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [listing, setListing] = useState<any | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [similarListings, setSimilarListings] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    listingsApi.get(id)
      .then(data => setListing(data))
      .catch(() => {});
    listingsApi.getSimilar(id)
      .then(data => setSimilarListings(Array.isArray(data) ? data : ((data as any)?.results ?? [])))
      .catch(() => {});
  }, [id]);

  const office = listing?.office ?? {};

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">العقار غير موجود</h2>
          <Button onClick={() => navigate('/chat')} className="mt-4">
            العودة للبحث
          </Button>
        </div>
      </div>
    );
  }

  const handleScheduleVisit = async () => {
    if (!visitDate) {
      toast.error('الرجاء اختيار تاريخ الزيارة');
      return;
    }
    try {
      await listingsApi.scheduleVisit(id!, visitDate, visitNotes);
      toast.success('تم إرسال طلب الزيارة بنجاح! سيتم التواصل معك قريباً.');
      setVisitDate('');
      setVisitNotes('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ');
    }
  };

  const handleSubmitOffer = async () => {
    if (!offerAmount) {
      toast.error('الرجاء إدخال قيمة العرض');
      return;
    }
    try {
      await listingsApi.startNegotiation(id!, Number(offerAmount), offerMessage);
      toast.success('تم إرسال عرضك بنجاح! سيقوم المكتب بمراجعته قريباً.');
      navigate('/buyer/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between" dir="ltr">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            رجوع
          </Button>
          <h1 className="text-lg font-semibold text-gray-900" dir="rtl">تفاصيل العقار</h1>
          <Button variant="ghost" size="sm" onClick={() => { authLogout(); navigate('/'); }}>
            <LogOut className="w-4 h-4 mr-2" />
            خروج
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="aspect-video bg-gray-900">
                <img
                  src={listing.images?.[selectedImage] ?? ''}
                  alt={listing.property_type}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 flex gap-2 overflow-x-auto">
                {(listing.images ?? []).map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === idx ? 'border-blue-600' : 'border-gray-200'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </Card>

            {/* Details */}
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4" dir="rtl">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{listing.property_type}</h2>
                  <div className="flex items-center gap-2 text-gray-600 mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>{listing.address}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-600">{formatPrice(listing.price)}</p>
                  <Badge className="mt-2 bg-green-100 text-green-700 border-green-200">
                    <Star className="w-3 h-3 ml-1" />
                    جودة {listing.quality_score}%
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 py-4 border-y">
                <div className="text-center" dir="rtl">
                  <Bed className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                  <p className="font-semibold text-gray-900">{listing.bedrooms}</p>
                  <p className="text-sm text-gray-500">غرف نوم</p>
                </div>
                <div className="text-center" dir="rtl">
                  <Bath className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                  <p className="font-semibold text-gray-900">{listing.bathrooms}</p>
                  <p className="text-sm text-gray-500">حمامات</p>
                </div>
                <div className="text-center" dir="rtl">
                  <Maximize className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                  <p className="font-semibold text-gray-900">{listing.area}</p>
                  <p className="text-sm text-gray-500">متر مربع</p>
                </div>
              </div>

              <Tabs defaultValue="description" className="mt-6">
                <TabsList className="w-full">
                  <TabsTrigger value="description" className="flex-1">الوصف</TabsTrigger>
                  <TabsTrigger value="features" className="flex-1">المميزات</TabsTrigger>
                  <TabsTrigger value="location" className="flex-1">الموقع</TabsTrigger>
                </TabsList>
                
                <TabsContent value="description" className="mt-4" dir="rtl">
                  <p className="text-gray-700 leading-relaxed">{listing.description}</p>
                  <div className="mt-4 flex gap-2">
                    <Badge variant="outline">المصدر: {listing.source_site}</Badge>
                    <Badge variant="outline">الحالة: {listing.status === 'active' ? 'متاح' : 'محجوز'}</Badge>
                  </div>
                </TabsContent>
                
                <TabsContent value="features" className="mt-4">
                  <div className="grid grid-cols-2 gap-3" dir="rtl">
                    {(listing.features ?? []).map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="location" className="mt-4" dir="rtl">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <span>{listing.address}</span>
                    </div>
                    <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">خريطة الموقع</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Sidebar - Office Info & Actions */}
          <div className="space-y-4">
            {/* Office Card */}
            <Card className="p-6">
              <div className="text-center" dir="rtl">
                <img
                  src={office.logo_url}
                  alt={office.name}
                  className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
                />
                <h3 className="font-bold text-gray-900">{office.name}</h3>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-gray-600">{office.rating} • {office.total_listings} عقار</span>
                </div>
                {office.verified && (
                  <Badge className="mt-2 bg-blue-100 text-blue-700 border-blue-200">موثق</Badge>
                )}
              </div>

              <div className="space-y-3 mt-4" dir="rtl">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{office.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="text-xs">{office.email}</span>
                </div>
              </div>

              <Button
                className="w-full mt-4 bg-green-600 hover:bg-green-700"
                onClick={() => window.open(`tel:${office.phone}`)}
              >
                <Phone className="w-4 h-4 ml-2" />
                اتصل الآن
              </Button>
            </Card>

            {/* Actions */}
            <Card className="p-6 space-y-3">
              {/* Schedule Visit */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Calendar className="w-4 h-4 ml-2" />
                    حجز موعد زيارة
                  </Button>
                </DialogTrigger>
                <DialogContent dir="rtl">
                  <DialogHeader>
                    <DialogTitle>حجز موعد لزيارة العقار</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="visit-date">تاريخ ووقت الزيارة</Label>
                      <Input
                        id="visit-date"
                        type="datetime-local"
                        value={visitDate}
                        onChange={(e) => setVisitDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="visit-notes">ملاحظات (اختياري)</Label>
                      <Textarea
                        id="visit-notes"
                        value={visitNotes}
                        onChange={(e) => setVisitNotes(e.target.value)}
                        placeholder="أي ملاحظات أو أسئلة خاصة..."
                        className="mt-1"
                      />
                    </div>
                    <Button onClick={handleScheduleVisit} className="w-full">
                      تأكيد الموعد
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Make Offer */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <DollarSign className="w-4 h-4 ml-2" />
                    تقديم عرض
                  </Button>
                </DialogTrigger>
                <DialogContent dir="rtl">
                  <DialogHeader>
                    <DialogTitle>تقديم عرض للشراء</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="offer-amount">قيمة العرض (ريال سعودي)</Label>
                      <Input
                        id="offer-amount"
                        type="number"
                        value={offerAmount}
                        onChange={(e) => setOfferAmount(e.target.value)}
                        placeholder={`السعر المطلوب: ${(listing.price ?? 0).toLocaleString()}`}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="offer-message">رسالة للبائع</Label>
                      <Textarea
                        id="offer-message"
                        value={offerMessage}
                        onChange={(e) => setOfferMessage(e.target.value)}
                        placeholder="اذكر تفاصيل عرضك..."
                        className="mt-1"
                      />
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-700">
                        السعر الحالي: {formatPrice(listing.price)}
                      </p>
                    </div>
                    <Button onClick={handleSubmitOffer} className="w-full">
                      إرسال العرض
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/chat')}
              >
                <MessageCircle className="w-4 h-4 ml-2" />
                التحدث مع المساعد
              </Button>
            </Card>

            {/* Similar Properties */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-3" dir="rtl">عقارات مشابهة</h3>
              <div className="space-y-3">
                {similarListings.slice(0, 2).map((similar: any) => (
                    <div
                      key={similar.id}
                      onClick={() => navigate(`/listings/${similar.id}`)}
                      className="flex gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      <img
                        src={similar.images?.[0] ?? ''}
                        alt={similar.property_type}
                        className="w-16 h-16 rounded object-cover"
                      />
                      <div className="flex-1" dir="rtl">
                        <p className="font-medium text-sm text-gray-900">{similar.property_type}</p>
                        <p className="text-xs text-gray-600">{formatPrice(similar.price)}</p>
                        <p className="text-xs text-gray-500">{similar.bedrooms} غرف • {similar.area} م²</p>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
