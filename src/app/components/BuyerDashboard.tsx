import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Home, MessageSquare, Calendar, DollarSign, Heart, ArrowLeft, Clock, CheckCircle, XCircle, LogOut, User } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { formatPrice } from '../lib/formatters';
import { buyers as buyersApi } from '../lib/api-client';
import { getUser, logout as authLogout } from '../lib/auth';
import { toast } from 'sonner';

export function BuyerDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') ?? 'visits');
  const buyerId = getUser()?.id ?? '';
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    phone: '',
    whatsapp: '',
    address: '',
    website: '',
    logo_url: '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [visits, setVisits] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [negotiations, setNegotiations] = useState<any[]>([]);

  useEffect(() => {
    if (!buyerId) return;
    buyersApi.getProfile(buyerId)
      .then((data: any) => {
        const d = data?.data ?? data;
        setProfile({
          name: d?.name ?? '',
          bio: d?.bio ?? '',
          phone: d?.phone ?? '',
          whatsapp: d?.whatsapp ?? '',
          address: d?.address ?? '',
          website: d?.website ?? '',
          logo_url: d?.logo_url ?? '',
        });
      })
      .catch(() => {});
    buyersApi.listVisits(buyerId)
      .then(data => setVisits(Array.isArray(data) ? data : ((data as any)?.results ?? [])))
      .catch(() => {});
    buyersApi.listNegotiations(buyerId)
      .then(data => setNegotiations(Array.isArray(data) ? data : ((data as any)?.results ?? [])))
      .catch(() => {});
  }, [buyerId]);

  const handleSaveProfile = async () => {
    if (!buyerId) return;
    setIsSavingProfile(true);
    try {
      await buyersApi.updateProfile(buyerId, profile);
      toast.success('تم حفظ الملف الشخصي بنجاح!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Saved listings are managed locally (favourites not yet backed by API)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [savedListings] = useState<any[]>([]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between" dir="ltr">
          <Button variant="ghost" onClick={() => navigate('/chat')}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            رجوع
          </Button>
          <h1 className="text-xl font-bold text-gray-900" dir="rtl">لوحة التحكم</h1>
          <Button variant="ghost" size="sm" onClick={() => { authLogout(); navigate('/'); }}>
            <LogOut className="w-4 h-4 mr-2" />
            خروج
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between" dir="rtl">
              <div>
                <p className="text-sm text-gray-600">العقارات المحفوظة</p>
                <p className="text-2xl font-bold text-gray-900">{savedListings.length}</p>
              </div>
              <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between" dir="rtl">
              <div>
                <p className="text-sm text-gray-600">الزيارات المجدولة</p>
                <p className="text-2xl font-bold text-gray-900">{visits.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between" dir="rtl">
              <div>
                <p className="text-sm text-gray-600">العروض النشطة</p>
                <p className="text-2xl font-bold text-gray-900">{negotiations.length}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between" dir="rtl">
              <div>
                <p className="text-sm text-gray-600">المحادثات</p>
                <p className="text-2xl font-bold text-gray-900">5</p>
              </div>
              <MessageSquare className="w-8 h-8 text-purple-500" />
            </div>
          </Card>
        </div>

        {/* Analytics Overview */}
        <Card className="p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-6" dir="rtl">ملخص النشاط</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Donut Chart */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-32 h-32 rounded-full border-8 border-gray-200 flex items-center justify-center"
                   style={{
                     background: 'conic-gradient(#3b82f6 0deg, #3b82f6 90deg, #8b5cf6 90deg, #8b5cf6 252deg, #10b981 252deg, #10b981 360deg)'
                   }}>
                <div className="w-24 h-24 rounded-full bg-white flex flex-col items-center justify-center">
                  <p className="text-xs text-gray-600">الرضا</p>
                  <p className="text-xl font-bold text-gray-900">88%</p>
                </div>
              </div>
              <div className="space-y-2 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3b82f6' }}></div>
                  <span>زيارات: 35%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#8b5cf6' }}></div>
                  <span>عروض: 44%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10b981' }}></div>
                  <span>محفوظ: 21%</span>
                </div>
              </div>
            </div>

            {/* Trend Chart */}
            <div>
              <p className="text-sm text-gray-600 mb-4" dir="rtl">الاتجاهات</p>
              <div className="h-32">
                <svg width="100%" height="100%" viewBox="0 0 240 100">
                  <polyline
                    points="10,70 40,60 70,50 100,40 130,45 160,35 190,30 220,25"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                  />
                  <circle cx="10" cy="70" r="2" fill="#3b82f6" />
                  <circle cx="40" cy="60" r="2" fill="#3b82f6" />
                  <circle cx="70" cy="50" r="2" fill="#3b82f6" />
                  <circle cx="100" cy="40" r="2" fill="#3b82f6" />
                  <circle cx="130" cy="45" r="2" fill="#3b82f6" />
                  <circle cx="160" cy="35" r="2" fill="#3b82f6" />
                  <circle cx="190" cy="30" r="2" fill="#3b82f6" />
                  <circle cx="220" cy="25" r="2" fill="#3b82f6" />
                </svg>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs mt-3">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-gray-600">الأدنى</p>
                  <p className="font-semibold">24</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-gray-600">المتوسط</p>
                  <p className="font-semibold">61</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-gray-600">الأعلى</p>
                  <p className="font-semibold">98</p>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div>
              <p className="text-sm text-gray-600 mb-4" dir="rtl">المقاييس الرئيسية</p>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-gray-600">الاستفسارات</p>
                  <p className="text-2xl font-bold text-blue-600">187</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-gray-600">معدل الاستجابة</p>
                  <p className="text-2xl font-bold text-purple-600">85%</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-gray-600">الزيارات المكتملة</p>
                  <p className="text-2xl font-bold text-green-600">12</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="visits">الزيارات</TabsTrigger>
            <TabsTrigger value="negotiations">العروض والتفاوض</TabsTrigger>
            <TabsTrigger value="saved">المحفوظات</TabsTrigger>
            <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
          </TabsList>

          {/* Visits Tab */}
          <TabsContent value="visits" className="mt-6">
            <div className="space-y-4">
              {visits.map((visit: any) => {
                const listing = visit.listing ?? {};
                if (!visit.id) return null;

                return (
                  <Card key={visit.id} className="p-6">
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
                          <Badge
                            className={
                              visit.status === 'confirmed'
                                ? 'bg-green-100 text-green-700 border-green-200'
                                : visit.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                : 'bg-gray-100 text-gray-700 border-gray-200'
                            }
                          >
                            {visit.status === 'confirmed' && <CheckCircle className="w-3 h-3 ml-1" />}
                            {visit.status === 'pending' && <Clock className="w-3 h-3 ml-1" />}
                            {visit.status === 'confirmed' ? 'مؤكد' : visit.status === 'pending' ? 'قيد الانتظار' : 'مكتمل'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(visit.scheduled_at).toLocaleDateString('ar-SA')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(visit.scheduled_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                        {visit.notes && (
                          <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">{visit.notes}</p>
                        )}
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" onClick={() => navigate(`/listings/${listing.id}`)}>
                            عرض التفاصيل
                          </Button>
                          {visit.status === 'pending' && (
                            <Button size="sm" variant="outline">
                              إلغاء الزيارة
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}

              {visits.length === 0 && (
                <Card className="p-12 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2" dir="rtl">لا توجد زيارات مجدولة</h3>
                  <p className="text-gray-600 mb-4" dir="rtl">ابدأ بالبحث عن عقارك المثالي</p>
                  <Button onClick={() => navigate('/chat')}>
                    <MessageSquare className="w-4 h-4 ml-2" />
                    ابدأ البحث
                  </Button>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Negotiations Tab */}
          <TabsContent value="negotiations" className="mt-6">
            <div className="space-y-4">
              {negotiations.map((negotiation: any) => {
                const listing = negotiation.listing ?? {};
                if (!negotiation.id) return null;

                const latestOffer = Array.isArray(negotiation.history) && negotiation.history.length > 0
                  ? negotiation.history[negotiation.history.length - 1]
                  : null;

                return (
                  <Card key={negotiation.id} className="p-6">
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
                            {negotiation.status === 'active' ? 'نشط' : 'منتهي'}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-4 p-3 bg-gray-50 rounded-lg">
                          <div className="text-center">
                            <p className="text-xs text-gray-600">السعر المطلوب</p>
                            <p className="font-semibold text-gray-900">{formatPrice(negotiation.listing_price)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-600">عرضك الحالي</p>
                            <p className="font-semibold text-blue-600">{formatPrice(negotiation.current_offer)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-600">الفرق</p>
                            <p className="font-semibold text-red-600">
                              {formatPrice(negotiation.listing_price - negotiation.current_offer)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 text-sm text-gray-600">
                          {latestOffer && (
                            <>
                              <p>آخر عرض من: {latestOffer.party === 'buyer' ? 'أنت' : 'البائع'}</p>
                              {latestOffer.message && (
                                <p className="mt-1 bg-blue-50 p-2 rounded">{latestOffer.message}</p>
                              )}
                            </>
                          )}
                        </div>

                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            onClick={() => navigate(`/buyer/negotiations/${negotiation.id}`)}
                          >
                            عرض التفاوض
                          </Button>
                          <Button size="sm" variant="outline">
                            عرض مضاد
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}

              {negotiations.length === 0 && (
                <Card className="p-12 text-center">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2" dir="rtl">لا توجد عروض نشطة</h3>
                  <p className="text-gray-600 mb-4" dir="rtl">ابدأ بتقديم عرض على عقار</p>
                  <Button onClick={() => navigate('/chat')}>
                    <MessageSquare className="w-4 h-4 ml-2" />
                    ابدأ البحث
                  </Button>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Saved Listings Tab */}
          <TabsContent value="saved" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedListings.map((listing) => (
                <Card
                  key={listing.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/listings/${listing.id}`)}
                >
                  <div className="relative">
                    <img
                      src={listing.images[0]}
                      alt={listing.property_type}
                      className="w-full h-48 object-cover"
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute top-2 right-2 rounded-full w-8 h-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                    </Button>
                  </div>
                  <div className="p-4" dir="rtl">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{listing.property_type}</h3>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                        {formatPrice(listing.price)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{listing.address}</p>
                    <div className="flex gap-3 text-sm text-gray-600">
                      <span>{listing.bedrooms} غرف</span>
                      <span>•</span>
                      <span>{listing.bathrooms} حمام</span>
                      <span>•</span>
                      <span>{listing.area} م²</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {savedListings.length === 0 && (
              <Card className="p-12 text-center">
                <Heart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2" dir="rtl">لا توجد عقارات محفوظة</h3>
                <p className="text-gray-600 mb-4" dir="rtl">احفظ العقارات المفضلة لديك للوصول إليها بسهولة</p>
                <Button onClick={() => navigate('/chat')}>
                  <MessageSquare className="w-4 h-4 ml-2" />
                  ابدأ البحث
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            <Card className="p-6 max-w-2xl mx-auto">
              <div className="flex items-center gap-3 mb-6" dir="rtl">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">الملف الشخصي</h3>
              </div>
              <div className="space-y-4" dir="rtl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>الاسم</Label>
                    <Input
                      value={profile.name}
                      onChange={e => setProfile({ ...profile, name: e.target.value })}
                      placeholder="الاسم الكامل"
                      className="mt-1 text-right"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <Label>رقم الجوال</Label>
                    <Input
                      value={profile.phone}
                      onChange={e => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="+966501234567"
                      className="mt-1"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>واتساب</Label>
                    <Input
                      value={profile.whatsapp}
                      onChange={e => setProfile({ ...profile, whatsapp: e.target.value })}
                      placeholder="+966501234567"
                      className="mt-1"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <Label>الموقع الإلكتروني</Label>
                    <Input
                      value={profile.website}
                      onChange={e => setProfile({ ...profile, website: e.target.value })}
                      placeholder="https://"
                      className="mt-1"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div>
                  <Label>العنوان</Label>
                  <Input
                    value={profile.address}
                    onChange={e => setProfile({ ...profile, address: e.target.value })}
                    placeholder="المدينة، الشارع"
                    className="mt-1 text-right"
                    dir="rtl"
                  />
                </div>
                <div>
                  <Label>نبذة</Label>
                  <Textarea
                    value={profile.bio}
                    onChange={e => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="اكتب نبذة عنك..."
                    className="mt-1 text-right resize-none"
                    dir="rtl"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>رابط الصورة الشخصية</Label>
                  <Input
                    value={profile.logo_url}
                    onChange={e => setProfile({ ...profile, logo_url: e.target.value })}
                    placeholder="https://..."
                    className="mt-1"
                    dir="ltr"
                  />
                </div>
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                  className="w-full bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isSavingProfile ? 'جارٍ الحفظ...' : 'حفظ الملف الشخصي'}
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
