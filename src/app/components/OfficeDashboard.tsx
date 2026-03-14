import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Building2, TrendingUp, Users, Eye, MessageSquare, ArrowLeft, Plus, BarChart3, Settings, CreditCard } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { mockListings, mockDemandRequests, mockCampaigns, formatPrice, getCityName } from '../lib/mock-data';

export function OfficeDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock office data - in real app, this would come from auth context
  const officeId = 'office-1';
  const officeListings = mockListings.filter(l => l.office_id === officeId);
  const totalViews = 1234;
  const totalLeads = 45;
  const conversionRate = 8.5;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/chat')}>
            <ArrowLeft className="w-5 h-5 ml-2" />
            رجوع
          </Button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">لوحة تحكم المكتب</h1>
            <p className="text-sm text-gray-500">Prime Real Estate</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => navigate('/office/listings')}>
              <Building2 className="w-4 h-4 ml-2" />
              العقارات
            </Button>
            <Button size="sm" onClick={() => navigate('/office/leads')}>
              <Users className="w-4 h-4 ml-2" />
              العملاء
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate('/office/campaigns')}>
              الحملات
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate('/office/mini-page-editor')}>
              <Settings className="w-4 h-4 ml-2" />
              ملفي
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate('/office/subscription')}>
              <CreditCard className="w-4 h-4 ml-2" />
              الاشتراك
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between" dir="rtl">
              <div>
                <p className="text-sm text-gray-600">إجمالي العقارات</p>
                <p className="text-3xl font-bold text-gray-900">{officeListings.length}</p>
                <p className="text-xs text-green-600 mt-1">+3 هذا الشهر</p>
              </div>
              <Building2 className="w-10 h-10 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between" dir="rtl">
              <div>
                <p className="text-sm text-gray-600">المشاهدات</p>
                <p className="text-3xl font-bold text-gray-900">{totalViews.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">+12% هذا الأسبوع</p>
              </div>
              <Eye className="w-10 h-10 text-purple-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between" dir="rtl">
              <div>
                <p className="text-sm text-gray-600">العملاء المحتملون</p>
                <p className="text-3xl font-bold text-gray-900">{totalLeads}</p>
                <p className="text-xs text-green-600 mt-1">+8 جديد</p>
              </div>
              <Users className="w-10 h-10 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between" dir="rtl">
              <div>
                <p className="text-sm text-gray-600">معدل التحويل</p>
                <p className="text-3xl font-bold text-gray-900">{conversionRate}%</p>
                <p className="text-xs text-green-600 mt-1">+2.3% هذا الشهر</p>
              </div>
              <TrendingUp className="w-10 h-10 text-orange-500" />
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="listings">عقاراتي</TabsTrigger>
            <TabsTrigger value="performance">الأداء</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Leads */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4" dir="rtl">
                  <h3 className="font-semibold text-gray-900">أحدث العملاء المحتملين</h3>
                  <Button size="sm" variant="ghost" onClick={() => navigate('/office/leads')}>
                    عرض الكل
                  </Button>
                </div>
                <div className="space-y-3">
                  {mockDemandRequests.slice(0, 3).map((demand) => (
                    <div key={demand.id} className="p-3 bg-gray-50 rounded-lg" dir="rtl">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{demand.buyer_name}</p>
                          <p className="text-sm text-gray-600">
                            {demand.property_type} في {getCityName(demand.city_id)}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            الميزانية: {formatPrice(demand.budget_min)} - {formatPrice(demand.budget_max)}
                          </p>
                        </div>
                        <Badge
                          className={
                            demand.intent_level === 'urgent'
                              ? 'bg-red-100 text-red-700 border-red-200'
                              : demand.intent_level === 'serious'
                              ? 'bg-orange-100 text-orange-700 border-orange-200'
                              : 'bg-blue-100 text-blue-700 border-blue-200'
                          }
                        >
                          {demand.intent_level === 'urgent' ? 'عاجل' : demand.intent_level === 'serious' ? 'جاد' : 'تصفح'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Active Campaigns */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4" dir="rtl">
                  <h3 className="font-semibold text-gray-900">الحملات النشطة</h3>
                  <Button size="sm" variant="ghost" onClick={() => navigate('/office/campaigns')}>
                    عرض الكل
                  </Button>
                </div>
                <div className="space-y-4">
                  {mockCampaigns
                    .filter(c => c.status === 'active')
                    .map((campaign) => (
                      <div key={campaign.id} className="p-3 bg-gray-50 rounded-lg" dir="rtl">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-gray-900">{campaign.name}</p>
                            <p className="text-xs text-gray-600 mt-1">{campaign.audience_filter}</p>
                          </div>
                          <Badge className="bg-green-100 text-green-700 border-green-200">نشط</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                          <div className="text-center p-2 bg-white rounded">
                            <p className="text-gray-600 text-xs">تم الإرسال</p>
                            <p className="font-semibold text-gray-900">{campaign.sent_count}</p>
                          </div>
                          <div className="text-center p-2 bg-white rounded">
                            <p className="text-gray-600 text-xs">النقرات</p>
                            <p className="font-semibold text-gray-900">{campaign.click_count}</p>
                          </div>
                          <div className="text-center p-2 bg-white rounded">
                            <p className="text-gray-600 text-xs">عملاء</p>
                            <p className="font-semibold text-gray-900">{campaign.lead_count}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4" dir="rtl">إجراءات سريعة</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Plus className="w-6 h-6" />
                  إضافة عقار جديد
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate('/office/campaigns')}>
                  <BarChart3 className="w-6 h-6" />
                  إنشاء حملة تسويقية
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate('/office/leads')}>
                  <MessageSquare className="w-6 h-6" />
                  الرد على العملاء
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings" className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900" dir="rtl">عقاراتي ({officeListings.length})</h3>
              <Button size="sm">
                <Plus className="w-4 h-4 ml-2" />
                إضافة عقار
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {officeListings.map((listing) => (
                <Card key={listing.id} className="overflow-hidden">
                  <img
                    src={listing.images[0]}
                    alt={listing.property_type}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4" dir="rtl">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{listing.property_type}</h4>
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        {listing.status === 'active' ? 'نشط' : 'معلق'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{listing.address}</p>
                    <p className="text-lg font-bold text-blue-600 mb-3">{formatPrice(listing.price)}</p>
                    
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>جودة الإعلان</span>
                        <span>{listing.quality_score}%</span>
                      </div>
                      <Progress value={listing.quality_score} className="h-2" />
                    </div>

                    <div className="flex gap-2 text-xs text-gray-600 mb-3">
                      <span>{listing.bedrooms} غرف</span>
                      <span>•</span>
                      <span>{listing.area} م²</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-gray-600">المشاهدات</p>
                        <p className="font-semibold text-gray-900">234</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-gray-600">الاستفسارات</p>
                        <p className="font-semibold text-gray-900">12</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="flex-1">تعديل</Button>
                      <Button size="sm" className="flex-1" onClick={() => navigate(`/listings/${listing.id}`)}>
                        عرض
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="mt-6 space-y-6">
            {/* KPI Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-6">
                <p className="text-sm text-gray-600" dir="rtl">الاستفسارات</p>
                <p className="text-4xl font-bold text-gray-900">187</p>
                <p className="text-xs text-green-600 mt-2">↑ 12% من الشهر الماضي</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-gray-600" dir="rtl">الزيارات</p>
                <p className="text-4xl font-bold text-gray-900">SAF</p>
                <p className="text-xs text-gray-600 mt-2">معايير الأداء</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-gray-600" dir="rtl">المشاهدات</p>
                <p className="text-4xl font-bold text-gray-900">12,563</p>
                <p className="text-xs text-green-600 mt-2">↑ 8% من الأسبوع الماضي</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-gray-600" dir="rtl">معدل التحويل</p>
                <p className="text-4xl font-bold text-blue-600">88%</p>
                <p className="text-xs text-gray-600 mt-2">من إجمالي المشاهدات</p>
              </Card>
            </div>

            {/* Performance Donut Chart Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-6" dir="rtl">توزيع الأداء</h3>
                <div className="flex items-center justify-center mb-8">
                  <div className="relative w-40 h-40 rounded-full border-8 border-gray-200 flex items-center justify-center"
                       style={{
                         background: 'conic-gradient(#3b82f6 0deg, #3b82f6 126deg, #8b5cf6 126deg, #8b5cf6 252deg, #10b981 252deg, #10b981 360deg)'
                       }}>
                    <div className="w-32 h-32 rounded-full bg-white flex flex-col items-center justify-center">
                      <p className="text-sm text-gray-600">نسبة النجاح</p>
                      <p className="text-2xl font-bold text-gray-900">88%</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3b82f6' }}></div>
                      <span>المشاهدات</span>
                    </div>
                    <span className="font-semibold">35%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#8b5cf6' }}></div>
                      <span>الاستفسارات</span>
                    </div>
                    <span className="font-semibold">44%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10b981' }}></div>
                      <span>الزيارات</span>
                    </div>
                    <span className="font-semibold">21%</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-6" dir="rtl">الاتجاهات</h3>
                <div className="space-y-6">
                  {/* Trend Chart */}
                  <div className="h-40">
                    <svg width="100%" height="100%" viewBox="0 0 300 120">
                      <polyline
                        points="10,80 40,70 70,60 100,50 130,55 160,45 190,40 220,35 250,38 280,30"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2"
                      />
                      <circle cx="10" cy="80" r="3" fill="#3b82f6" />
                      <circle cx="40" cy="70" r="3" fill="#3b82f6" />
                      <circle cx="70" cy="60" r="3" fill="#3b82f6" />
                      <circle cx="100" cy="50" r="3" fill="#3b82f6" />
                      <circle cx="130" cy="55" r="3" fill="#3b82f6" />
                      <circle cx="160" cy="45" r="3" fill="#3b82f6" />
                      <circle cx="190" cy="40" r="3" fill="#3b82f6" />
                      <circle cx="220" cy="35" r="3" fill="#3b82f6" />
                      <circle cx="250" cy="38" r="3" fill="#3b82f6" />
                      <circle cx="280" cy="30" r="3" fill="#3b82f6" />
                    </svg>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-gray-600">الأدنى</p>
                      <p className="font-semibold text-gray-900">245</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-gray-600">المتوسط</p>
                      <p className="font-semibold text-gray-900">612</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-gray-600">الأعلى</p>
                      <p className="font-semibold text-gray-900">987</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4" dir="rtl">أداء العقارات</h3>
              <div className="space-y-4">
                {officeListings.map((listing, idx) => (
                  <div key={listing.id} className="p-4 border rounded-lg" dir="rtl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={listing.images[0]}
                          alt={listing.property_type}
                          className="w-16 h-16 rounded object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{listing.property_type}</p>
                          <p className="text-sm text-gray-600">{listing.address}</p>
                        </div>
                      </div>
                      <Badge variant="outline">#{idx + 1}</Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">المشاهدات</p>
                        <p className="font-semibold text-gray-900">{Math.floor(Math.random() * 500 + 100)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">الاستفسارات</p>
                        <p className="font-semibold text-gray-900">{Math.floor(Math.random() * 30 + 5)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">الزيارات</p>
                        <p className="font-semibold text-gray-900">{Math.floor(Math.random() * 10 + 1)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">معدل التحويل</p>
                        <p className="font-semibold text-green-600">{(Math.random() * 15 + 5).toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4" dir="rtl">التوزيع حسب نوع العقار</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>فيلا</span>
                      <span>40%</span>
                    </div>
                    <Progress value={40} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>شقة</span>
                      <span>35%</span>
                    </div>
                    <Progress value={35} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>دوبلكس</span>
                      <span>25%</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4" dir="rtl">أفضل المدن أداءً</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>الرياض</span>
                      <span>65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>جدة</span>
                      <span>35%</span>
                    </div>
                    <Progress value={35} className="h-2" />
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
