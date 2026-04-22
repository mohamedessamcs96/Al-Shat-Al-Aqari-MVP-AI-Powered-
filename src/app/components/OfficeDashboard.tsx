import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  Building2, TrendingUp, Users, Eye, MessageSquare, ArrowRight,
  Plus, BarChart3, Settings, CreditCard, Star, MapPin, Phone,
  Mail, CheckCircle2, Bell, LogOut, ChevronRight, Home, Megaphone,
  QrCode, Download, Copy, Check, ExternalLink,
  Search, Filter, Clock, Play, Pause, Target, X,
  ArrowUpRight, Activity, Zap, Link2,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { PageAnalyticsDashboard } from './PageAnalyticsDashboard';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { formatPrice, getCityName } from '../lib/formatters';
import { offices as officesApi } from '../lib/api-client';
import { getUser, getOfficeIdFromToken, getOfficeIdFromRawResponse, setUser, logout as authLogout } from '../lib/auth';
import { toast } from 'sonner';

function DashSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 80 + 10}`
  ).join(' ');
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-10">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="3"
        strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
    </svg>
  );
}


export function OfficeDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get('tab');
    const valid = ['overview','listings','leads','campaigns','performance','profile','subscription'];
    return valid.includes(tab ?? '') ? tab! : 'overview';
  });
  const [qrCopied, setQrCopied] = useState(false);
  const qrRef = useRef<SVGSVGElement>(null);

  // Leads state
  const [leadsSearch, setLeadsSearch] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [leadsSubTab, setLeadsSubTab] = useState('all');

  // Campaigns state
  const [campaignName, setCampaignName] = useState('');
  const [selectedListing, setSelectedListing] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('');
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false);

  // Subscription state
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [currentPlan, setCurrentPlan] = useState('professional');

  // Office profile state
  const [profileName, setProfileName] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileWhatsapp, setProfileWhatsapp] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [profileWebsite, setProfileWebsite] = useState('');
  const [profileLogoUrl, setProfileLogoUrl] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const officeId = (() => {
    const stored = getUser()?.id;
    if (stored) return stored;
    const fromToken = getOfficeIdFromToken();
    if (fromToken) { setUser({ id: fromToken }); return fromToken; }
    const fromRaw = getOfficeIdFromRawResponse();
    if (fromRaw) { setUser({ id: fromRaw }); return fromRaw; }
    return '';
  })();
  const [apiAnalytics, setApiAnalytics] = useState<any>(null);
  const [apiOffice, setApiOffice] = useState<Record<string, unknown> | null>(null);
  const [apiListings, setApiListings] = useState<any[] | null>(null);
  const [apiLeads, setApiLeads] = useState<any[] | null>(null);
  const [apiCampaigns, setApiCampaigns] = useState<any[] | null>(null);

  // Fetch office data from API, fall back to mock data on error
  useEffect(() => {
    if (!officeId) return; // not logged in yet – skip all requests
    const toArr = (d: unknown): any[] => {
      if (Array.isArray(d)) return d;
      const r = d as any;
      return Array.isArray(r?.data) ? r.data
        : Array.isArray(r?.results) ? r.results
        : Array.isArray(r?.data?.results) ? r.data.results
        : [];
    };
    officesApi.getById(officeId)
      .then((d) => {
        setApiOffice(d);
        const o = d as Record<string, unknown>;
        setProfileName(String(o.name ?? ''));
        setProfileBio(String(o.bio ?? ''));
        setProfilePhone(String(o.phone ?? ''));
        setProfileWhatsapp(String(o.whatsapp ?? ''));
        setProfileAddress(String(o.address ?? ''));
        setProfileWebsite(String(o.website ?? ''));
        setProfileLogoUrl(String(o.logo_url ?? ''));
      })
      .catch(() => {});
    officesApi.getAnalytics(officeId)
      .then((d) => setApiAnalytics(d))
      .catch(() => {});
    officesApi.listListings(officeId)
      .then((d) => setApiListings(toArr(d)))
      .catch(() => setApiListings([]));
    officesApi.listLeads(officeId)
      .then((d) => setApiLeads(toArr(d)))
      .catch(() => setApiLeads([]));
    officesApi.listCampaigns(officeId)
      .then((d) => setApiCampaigns(toArr(d)))
      .catch(() => setApiCampaigns([]));
  }, [officeId]);

  // Derive display data from API
  const office = apiOffice
    ? {
        id: officeId,
        name: String((apiOffice as Record<string,unknown>).name ?? 'المكتب'),
        slug: String((apiOffice as Record<string,unknown>).slug ?? ''),
        city_id: String((apiOffice as Record<string,unknown>).city_id ?? ''),
        verified: Boolean((apiOffice as Record<string,unknown>).verified ?? true),
        phone: String((apiOffice as Record<string,unknown>).phone ?? ''),
        email: String((apiOffice as Record<string,unknown>).email ?? ''),
        logo_url: String((apiOffice as Record<string,unknown>).logo_url ?? ''),
        rating: Number((apiOffice as Record<string,unknown>).rating ?? 0),
      }
    : { id: officeId, name: 'المكتب', slug: '', city_id: '', verified: false, phone: '', email: '', logo_url: '', rating: 0 };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const officeListings: any[] = apiListings ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leadsData: any[] = apiLeads ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const campaignsData: any[] = apiCampaigns ?? [];

  // KPI values from API analytics
  const totalViews = apiAnalytics?.views ?? apiAnalytics?.total_views ?? 0;
  const totalLeads = apiAnalytics?.leads ?? apiAnalytics?.total_leads ?? leadsData.length;
  const conversionRate = apiAnalytics?.conversion_rate ?? 0;
  const inquiries = apiAnalytics?.inquiries ?? 0;
  const visits = apiAnalytics?.visits ?? apiAnalytics?.total_visits ?? 0;
  const trendPoints: number[] = Array.isArray(apiAnalytics?.monthly_trends) ? apiAnalytics.monthly_trends : [];

  // Helper accessors for typed display
  const pendingLeadsCount = leadsData.filter(l => l.validation_status === 'pending').length;
  const urgentLeadsCount = leadsData.filter(l => l.intent_level === 'urgent').length;
  const activeCampaignsCount = campaignsData.filter(c => c.status === 'active').length;

  const pageUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/office/${office.slug}`
    : `/office/${office.slug}`;

  const handleQrCopy = () => {
    navigator.clipboard.writeText(pageUrl);
    setQrCopied(true);
    setTimeout(() => setQrCopied(false), 2000);
  };

  const handleRespond = async () => {
    if (!responseMessage.trim()) { toast.error('الرجاء كتابة رسالة'); return; }
    try {
      await officesApi.respondToLead(officeId, selectedLead!);
      toast.success('تم إرسال الرد بنجاح!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ');
    }
    setResponseMessage('');
    setSelectedLead(null);
  };

  const handleSaveProfile = async () => {
    if (!officeId) return;
    setIsSavingProfile(true);
    try {
      await officesApi.update(officeId, {
        name: profileName,
        bio: profileBio,
        phone: profilePhone,
        whatsapp: profileWhatsapp,
        address: profileAddress,
        website: profileWebsite,
        logo_url: profileLogoUrl,
      });
      toast.success('تم حفظ الملف الشخصي بنجاح');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل في حفظ الملف الشخصي');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleToggleCampaign = async (campaignId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      const updated = await officesApi.updateCampaign(officeId, campaignId, { status: newStatus });
      setApiCampaigns(prev => (prev ?? []).map(c =>
        (c as Record<string, unknown>).id === campaignId ? updated : c
      ));
      toast.success(`تم ${newStatus === 'active' ? 'تفعيل' : 'إيقاف'} الحملة`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ');
    }
  };

  const handleCreateCampaign = async () => {
    if (!campaignName || !selectedListing) { toast.error('الرجاء ملء جميع الحقول المطلوبة'); return; }
    try {
      const newCampaign = await officesApi.createCampaign(officeId, {
        name: campaignName,
        listing: selectedListing,
        audience_filter: audienceFilter,
      });
      setApiCampaigns(prev => [newCampaign, ...(prev ?? [])]);
      toast.success('تم إنشاء الحملة بنجاح!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ');
    }
    setCampaignName(''); setSelectedListing(''); setAudienceFilter('');
    setIsCampaignDialogOpen(false);
  };

  const handleUpgradePlan = (planId: string) => {
    setCurrentPlan(planId);
    toast.success(`تم الترقية إلى خطة ${subPlans.find(p => p.id === planId)?.name}!`);
  };

  const subPlans = [
    {
      id: 'starter', name: 'ستارتر', monthlyPrice: 299, annualPrice: 2990, description: 'للمكاتب الناشئة',
      features: [
        { name: 'عقارات غير محدودة', included: true },
        { name: 'حملات تسويقية', included: false },
        { name: 'إدارة العملاء المحتملين', included: true },
        { name: 'تقارير متقدمة', included: false },
        { name: 'صفحة مكتب مخصصة', included: true },
        { name: 'دعم 24/7', included: false },
      ],
    },
    {
      id: 'professional', name: 'احترافي', monthlyPrice: 799, annualPrice: 7990, description: 'الأكثر شيوعاً', popular: true,
      features: [
        { name: 'عقارات غير محدودة', included: true },
        { name: 'حملات تسويقية', included: true },
        { name: 'إدارة العملاء المحتملين', included: true },
        { name: 'تقارير متقدمة', included: true },
        { name: 'صفحة مكتب مخصصة', included: true },
        { name: 'دعم الأولوية', included: true },
      ],
    },
    {
      id: 'enterprise', name: 'مؤسسي', monthlyPrice: 1999, annualPrice: 19990, description: 'للمكاتب الكبيرة',
      features: [
        { name: 'عقارات غير محدودة', included: true },
        { name: 'حملات تسويقية', included: true },
        { name: 'إدارة العملاء المحتملين', included: true },
        { name: 'تقارير متقدمة', included: true },
        { name: 'صفحة مكتب مخصصة', included: true },
        { name: 'دعم 24/7 مخصص', included: true },
      ],
    },
  ];

  const filteredLeads = leadsData.filter(l => {
    const name = String(l.buyer_name ?? '').toLowerCase();
    const type = String(l.property_type ?? '').toLowerCase();
    return name.includes(leadsSearch.toLowerCase()) || type.includes(leadsSearch.toLowerCase());
  });

  const handleQrDownload = () => {
    const svg = qrRef.current;
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const canvas = document.createElement('canvas');
    const size = 600;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      const a = document.createElement('a');
      a.download = `qr-${office.slug}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgStr)));
  };

  const stats = [
    { label: 'إجمالي العقارات', value: officeListings.length, delta: '+3 هذا الشهر', positive: true, sparkColor: '#3b82f6', sparkData: [1,1,2,2,2,2,3,2,3,3,2,3,3,2,3], icon: <Building2 className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'المشاهدات', value: totalViews.toLocaleString(), delta: apiAnalytics ? '' : '—', positive: true, sparkColor: '#8b5cf6', sparkData: trendPoints.length ? trendPoints : [], icon: <Eye className="w-5 h-5" />, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'العملاء المحتملون', value: totalLeads, delta: '', positive: true, sparkColor: '#10b981', sparkData: [], icon: <Users className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'معدل التحويل', value: conversionRate ? `${conversionRate}%` : '—', delta: '', positive: true, sparkColor: '#f97316', sparkData: [], icon: <TrendingUp className="w-5 h-5" />, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* ─── Top Nav ─── */}
      <header className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 hidden sm:block">الشات العقاري</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors relative">
              <Bell className="w-4 h-4 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <Button size="sm" variant="ghost" className="text-gray-600 gap-1" onClick={() => { authLogout(); navigate('/'); }}>
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">خروج</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* ─── Company Hero Card ─── */}
        <Card className="mb-0 overflow-hidden border-0 shadow-md">
          {/* Banner */}
          <div className="h-24 sm:h-32 bg-gradient-to-l from-blue-600 via-indigo-600 to-purple-700 relative">
            <div
              className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, white 10px, white 11px)' }}
            />
          </div>

          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 sm:-mt-12">
              {/* Logo */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-white flex-shrink-0">
                <img
                  src={office.logo_url}
                  alt={office.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Name & meta */}
              <div className="flex-1 sm:pb-2">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{office.name}</h1>
                  {office.verified && (
                    <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      موثق
                    </span>
                  )}
                  <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white border-0 text-xs px-2">
                    ⭐ Premium
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    {getCityName(office.city_id)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
                    {office.rating} تقييم ممتاز
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                    {office.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                    {office.email}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 sm:pb-2 flex-shrink-0">
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => navigate('/office/linktree')}>
                  <Link2 className="w-3.5 h-3.5" />
                  صفحة الروابط
                </Button>
                <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700" onClick={() => navigate('/office/listings')}>
                  <Plus className="w-3.5 h-3.5" />
                  إضافة عقار
                </Button>
              </div>
            </div>

          </div>
        </Card>

        {/* ─── Sticky Tab Nav ─── */}
        <div className="sticky top-14 z-10 bg-white border-b border-t border-gray-200 mb-6 shadow-sm overflow-x-auto">
          <div className="flex">
            {[
              { label: 'لوحة التحكم', icon: <Home className="w-4 h-4" />, tab: 'overview', badge: 0 },
              { label: 'عقاراتي', icon: <Building2 className="w-4 h-4" />, tab: 'listings', badge: officeListings.length },
              { label: 'العملاء', icon: <Users className="w-4 h-4" />, tab: 'leads', badge: pendingLeadsCount },
              { label: 'الحملات', icon: <Megaphone className="w-4 h-4" />, tab: 'campaigns', badge: activeCampaignsCount },
              { label: 'الأداء', icon: <BarChart3 className="w-4 h-4" />, tab: 'performance', badge: 0 },
              { label: 'الملف الشخصي', icon: <Settings className="w-4 h-4" />, tab: 'profile', badge: 0 },
              { label: 'الاشتراك', icon: <CreditCard className="w-4 h-4" />, tab: 'subscription', badge: 0 },
            ].map((item) => (
              <button
                key={item.tab}
                onClick={() => setActiveTab(item.tab)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
                  activeTab === item.tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {item.icon}
                {item.label}
                {item.badge > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                    activeTab === item.tab ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                  }`}>{item.badge}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Stats Grid ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-4 sm:p-5 border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="flex items-start justify-between mb-2">
                <div className={`${stat.bg} ${stat.color} p-2 rounded-xl`}>{stat.icon}</div>
                <span className={`text-xs font-semibold flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${
                  stat.positive ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'
                }`}>
                  <ArrowUpRight className="w-3 h-3" />
                  {stat.delta}
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-3">{stat.value}</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 mb-1">{stat.label}</p>
              <DashSparkline data={stat.sparkData} color={stat.sparkColor} />
            </Card>
          ))}
        </div>

        {/* ─── Tabs Content ─── */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Hidden triggers – navigation is via pills above */}
          <TabsList className="hidden">
            <TabsTrigger value="overview" />
            <TabsTrigger value="listings" />
            <TabsTrigger value="performance" />
            <TabsTrigger value="leads" />
            <TabsTrigger value="campaigns" />
            <TabsTrigger value="subscription" />
            <TabsTrigger value="profile" />
          </TabsList>

          {/* ── Overview ── */}
          <TabsContent value="overview" className="mt-0 space-y-4">
            {/* Welcome Banner */}
            <div
              className="flex flex-col sm:flex-row items-center gap-4 p-5 rounded-2xl text-white"
              style={{ background: 'linear-gradient(135deg, #1e40af 0%, #4f46e5 100%)' }}
              dir="rtl"
            >
              <div className="flex-1">
                <p className="text-xs text-blue-200 font-medium mb-0.5 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> لوحة التحكم
                </p>
                <h2 className="text-lg font-extrabold">مرحباً، {office.name}!</h2>
                <p className="text-blue-100 text-sm mt-0.5">
                  لديك{' '}
                  <span className="font-bold text-white">{pendingLeadsCount} عملاء جدد</span>
                  {' '}و{' '}
                  <span className="font-bold text-white">{activeCampaignsCount} حملات نشطة</span>
                  {' '}الآن.
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setActiveTab('leads')}
                  className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-white/30 whitespace-nowrap"
                >عرض العملاء</button>
                <button
                  onClick={() => setActiveTab('campaigns')}
                  className="bg-white text-indigo-700 text-sm font-semibold px-4 py-2 rounded-xl transition-colors hover:bg-blue-50 whitespace-nowrap"
                >الحملات</button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Recent Leads */}
              <Card className="p-5 border-0 shadow-sm">
                <div className="flex items-center justify-between mb-4" dir="rtl">
                  <h3 className="font-semibold text-gray-900">أحدث العملاء المحتملين</h3>
                  <button
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    onClick={() => setActiveTab('leads')}
                  >
                    <ChevronRight className="w-3.5 h-3.5" /> عرض الكل
                  </button>
                </div>
                <div className="space-y-2.5">
                  {leadsData.slice(0, 3).map((demand) => (
                    <div
                      key={demand.id}
                      className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {demand.buyer_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{demand.buyer_name}</p>
                          <p className="text-xs text-gray-500">
                            {demand.property_type} · {getCityName(demand.city_id)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatPrice(demand.budget_min)} – {formatPrice(demand.budget_max)}
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={
                          demand.intent_level === 'urgent'
                            ? 'bg-red-100 text-red-700 border-red-200 text-xs'
                            : demand.intent_level === 'serious'
                            ? 'bg-orange-100 text-orange-700 border-orange-200 text-xs'
                            : 'bg-blue-100 text-blue-700 border-blue-200 text-xs'
                        }
                      >
                        {demand.intent_level === 'urgent' ? 'عاجل' : demand.intent_level === 'serious' ? 'جاد' : 'تصفح'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Active Campaigns */}
              <Card className="p-5 border-0 shadow-sm">
                <div className="flex items-center justify-between mb-4" dir="rtl">
                  <h3 className="font-semibold text-gray-900">الحملات النشطة</h3>
                  <button
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    onClick={() => setActiveTab('campaigns')}
                  >
                    <ChevronRight className="w-3.5 h-3.5" /> عرض الكل
                  </button>
                </div>
                <div className="space-y-3">
                  {campaignsData.filter((c) => c.status === 'active').map((campaign) => (
                    <div key={campaign.id} className="p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{campaign.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{campaign.audience_filter}</p>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">نشط</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: 'تم الإرسال', value: campaign.sent_count },
                          { label: 'النقرات', value: campaign.click_count },
                          { label: 'عملاء', value: campaign.lead_count },
                        ].map(item => (
                          <div key={item.label} className="text-center p-2 bg-white rounded-lg">
                            <p className="text-gray-500 text-xs">{item.label}</p>
                            <p className="font-semibold text-gray-900 text-sm mt-0.5">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="p-5 border-0 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 text-right">إجراءات سريعة</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: <Plus className="w-5 h-5 text-blue-600" />, label: 'إضافة عقار جديد', bg: 'bg-blue-50', onClick: () => setActiveTab('listings') },
                  { icon: <BarChart3 className="w-5 h-5 text-purple-600" />, label: 'إنشاء حملة تسويقية', bg: 'bg-purple-50', onClick: () => setActiveTab('campaigns') },
                  { icon: <MessageSquare className="w-5 h-5 text-green-600" />, label: 'الرد على العملاء', bg: 'bg-green-50', onClick: () => setActiveTab('leads') },
                ].map(action => (
                  <button
                    key={action.label}
                    onClick={action.onClick}
                    className="flex items-center justify-end gap-3 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all"
                    dir="rtl"
                  >
                    <span className="font-medium text-gray-700 text-sm">{action.label}</span>
                    <div className={`${action.bg} p-2.5 rounded-xl flex-shrink-0`}>{action.icon}</div>
                  </button>
                ))}
              </div>
            </Card>

            {/* ── Recent Activity ── */}
            <Card className="p-5 border-0 shadow-sm">
              <div className="flex items-center justify-between mb-4" dir="rtl">
                <h3 className="font-semibold text-gray-900">النشاط الأخير</h3>
                <Activity className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-sm text-gray-400 text-center py-4" dir="rtl">لا يوجد نشاط حديث</p>
            </Card>

            {/* QR Code card */}
            <Card className="p-5 border-0 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* QR Code */}
                <div className="p-3 bg-white rounded-2xl border shadow-sm shrink-0">
                  <QRCodeSVG
                    ref={qrRef}
                    value={pageUrl}
                    size={140}
                    level="H"
                    includeMargin={false}
                    imageSettings={{
                      src: office.logo_url,
                      x: undefined,
                      y: undefined,
                      height: 30,
                      width: 30,
                      excavate: true,
                    }}
                  />
                </div>

                {/* Info + actions */}
                <div className="flex-1 text-center sm:text-right">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <QrCode className="w-4 h-4 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">رمز QR لصفحة المكتب</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">
                    شارك هذا الرمز في طباعاتك وإعلاناتك ليصل العملاء مباشرةً لصفحتك
                  </p>
                  <p className="text-xs text-gray-400 mb-4 break-all">{pageUrl}</p>

                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700" onClick={handleQrDownload}>
                      <Download className="w-3.5 h-3.5" />
                      تحميل PNG
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={handleQrCopy}>
                      {qrCopied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {qrCopied ? 'تم النسخ!' : 'نسخ الرابط'}
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => navigate(`/office/${office.slug}`)}>
                      <ExternalLink className="w-3.5 h-3.5" />
                      معاينة الصفحة
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* ── Listings ── */}
          <TabsContent value="listings" className="mt-0">
            <div className="flex items-center justify-between mb-4" dir="rtl">
              <h3 className="font-semibold text-gray-900">عقاراتي ({officeListings.length})</h3>
              <Button size="sm" className="gap-1 bg-blue-600 hover:bg-blue-700" onClick={() => navigate('/office/listings')}>
                <Plus className="w-4 h-4" /> إضافة عقار
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {officeListings.map((listing) => (
                <Card key={listing.id} className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative">
                    {listing.images?.[0] && (
                      <img src={listing.images[0]} alt={listing.property_type} className="w-full h-44 object-cover" />
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-emerald-500 text-white border-0 text-xs">
                        {listing.status === 'active' ? 'نشط' : 'معلق'}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4" dir="rtl">
                    <h4 className="font-semibold text-gray-900 mb-1">{listing.property_type}</h4>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                      <MapPin className="w-3 h-3" /> {listing.address}
                    </p>
                    <p className="text-lg font-bold text-blue-600 mb-3">{formatPrice(listing.price)}</p>
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>{listing.quality_score}%</span>
                        <span>جودة الإعلان</span>
                      </div>
                      <Progress value={listing.quality_score} className="h-1.5" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      <span>م² {listing.area}</span>
                      <span>·</span>
                      <span>{listing.bedrooms} غرف</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">الاستفسارات</p>
                        <p className="font-semibold text-gray-900 mt-0.5">12</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">المشاهدات</p>
                        <p className="font-semibold text-gray-900 mt-0.5">234</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 text-xs bg-blue-600 hover:bg-blue-700"
                        onClick={() => navigate(`/listings/${listing.id}`)}
                      >
                        عرض
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 text-xs">تعديل</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── Performance ── */}
          <TabsContent value="performance" className="mt-0 space-y-4">
            {/* Page builder analytics */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2" dir="rtl">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                تحليلات صفحة المكتب العامة
              </h3>
              <PageAnalyticsDashboard officeId={officeId} />
            </div>
            <div className="h-px bg-gray-100" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'الاستفسارات', value: inquiries ? String(inquiries) : '—', delta: '', green: true },
                { label: 'الزيارات', value: visits ? String(visits) : '—', delta: '', green: false },
                { label: 'المشاهدات', value: totalViews ? totalViews.toLocaleString() : '—', delta: '', green: true },
                { label: 'معدل التحويل', value: conversionRate ? `${conversionRate}%` : '—', delta: '', green: false, blue: true },
              ].map(m => (
                <Card key={m.label} className="p-4 border-0 shadow-sm">
                  <p className="text-xs text-gray-500 mb-1">{m.label}</p>
                  <p className={`text-3xl font-bold mb-1 ${m.blue ? 'text-blue-600' : 'text-gray-900'}`}>{m.value}</p>
                  <p className={`text-xs ${m.green ? 'text-green-600' : 'text-gray-500'}`}>{m.delta}</p>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Donut */}
              <Card className="p-5 border-0 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-5">توزيع الأداء</h3>
                <div className="flex items-center justify-center mb-6">
                  <div
                    className="relative w-36 h-36 rounded-full flex items-center justify-center"
                    style={{ background: 'conic-gradient(#3b82f6 0deg 126deg, #8b5cf6 126deg 252deg, #10b981 252deg 360deg)', padding: '8px' }}
                  >
                    <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center shadow-inner">
                      <p className="text-xs text-gray-500">نسبة التحويل</p>
                      <p className="text-2xl font-bold text-gray-900">{conversionRate ? `${conversionRate}%` : '—'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2.5 text-sm">
                  {[
                    { color: '#3b82f6', label: 'المشاهدات', value: totalViews ? totalViews.toLocaleString() : '—' },
                    { color: '#8b5cf6', label: 'الاستفسارات', value: inquiries ? String(inquiries) : '—' },
                    { color: '#10b981', label: 'الزيارات', value: visits ? String(visits) : '—' },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: row.color }} />
                        <span className="text-gray-600">{row.label}</span>
                      </div>
                      <span className="font-semibold text-gray-900">{row.value}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Trend chart */}
              <Card className="p-5 border-0 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-5">الاتجاهات الشهرية</h3>
                {trendPoints.length >= 2 ? (
                  <div className="h-36 mb-4">
                    <svg width="100%" height="100%" viewBox="0 0 300 120" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {(() => {
                        const max = Math.max(...trendPoints);
                        const min = Math.min(...trendPoints);
                        const range = max - min || 1;
                        const pts = trendPoints.map((v, i) => {
                          const x = 10 + (i / (trendPoints.length - 1)) * 280;
                          const y = 10 + (1 - (v - min) / range) * 100;
                          return [x, y] as [number, number];
                        });
                        const lineStr = pts.map(([x, y]) => `${x},${y}`).join(' ');
                        const areaStr = `${pts[0][0]},120 ` + lineStr + ` ${pts[pts.length-1][0]},120`;
                        return (
                          <>
                            <polygon points={areaStr} fill="url(#areaGrad)" />
                            <polyline points={lineStr} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                            {pts.map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="3.5" fill="white" stroke="#3b82f6" strokeWidth="2" />)}
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                ) : (
                  <div className="h-36 flex items-center justify-center text-gray-400 text-sm">لا توجد بيانات كافية</div>
                )}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { label: 'الأدنى', v: trendPoints.length ? Math.min(...trendPoints).toLocaleString() : '—' },
                    { label: 'المتوسط', v: trendPoints.length ? Math.round(trendPoints.reduce((a,b)=>a+b,0)/trendPoints.length).toLocaleString() : '—' },
                    { label: 'الأعلى', v: trendPoints.length ? Math.max(...trendPoints).toLocaleString() : '—' },
                  ].map(item => (
                    <div key={item.label} className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">{item.label}</p>
                      <p className="font-semibold text-gray-900 mt-0.5">{item.v}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Per-listing table */}
            <Card className="p-5 border-0 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">أداء العقارات</h3>
              {officeListings.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">لا توجد عقارات بعد</p>
              ) : (
              <div className="space-y-2">
                {officeListings.map((listing, idx) => (
                  <div key={listing.id} className="flex items-center gap-4 p-3 rounded-xl border hover:bg-gray-50 transition-colors">
                    <span className="text-xs font-bold text-gray-400 w-5 text-center shrink-0">#{idx + 1}</span>
                    {listing.images?.[0] && (
                      <img src={listing.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{listing.property_type}</p>
                      <p className="text-xs text-gray-500 truncate">{listing.address}</p>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="p-5 border-0 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">التوزيع حسب نوع العقار</h3>
                {(() => {
                  const counts: Record<string, number> = {};
                  officeListings.forEach(l => { counts[l.property_type] = (counts[l.property_type] ?? 0) + 1; });
                  const total = officeListings.length || 1;
                  const rows = Object.entries(counts).map(([l, v]) => ({ l, v: Math.round((v / total) * 100) }));
                  return rows.length === 0
                    ? <p className="text-sm text-gray-400 text-center py-4">لا توجد بيانات</p>
                    : <div className="space-y-3">{rows.map(row => (
                        <div key={row.l}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">{row.l}</span>
                            <span className="font-medium text-gray-900">{row.v}%</span>
                          </div>
                          <Progress value={row.v} className="h-2" />
                        </div>
                      ))}</div>;
                })()}
              </Card>

              <Card className="p-5 border-0 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">التوزيع حسب المدينة</h3>
                {(() => {
                  const counts: Record<string, number> = {};
                  officeListings.forEach(l => {
                    const city = l.city_name ?? l.city ?? l.city_id ?? 'أخرى';
                    counts[city] = (counts[city] ?? 0) + 1;
                  });
                  const total = officeListings.length || 1;
                  const rows = Object.entries(counts).map(([l, v]) => ({ l, v: Math.round((v / total) * 100) }));
                  return rows.length === 0
                    ? <p className="text-sm text-gray-400 text-center py-4">لا توجد بيانات</p>
                    : <div className="space-y-3">{rows.map(row => (
                        <div key={row.l}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">{row.l}</span>
                            <span className="font-medium text-gray-900">{row.v}%</span>
                          </div>
                          <Progress value={row.v} className="h-2" />
                        </div>
                      ))}</div>;
                })()}
              </Card>
            </div>
          </TabsContent>

          {/* ── Leads ── */}
          <TabsContent value="leads" className="mt-0 space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'إجمالي العملاء', value: leadsData.length, color: 'text-gray-900' },
                { label: 'عملاء جدد', value: pendingLeadsCount, color: 'text-green-600' },
                { label: 'عملاء عاجلون', value: urgentLeadsCount, color: 'text-red-600' },
                { label: 'معدل الاستجابة', value: '85%', color: 'text-blue-600' },
              ].map(s => (
                <Card key={s.label} className="p-4 border-0 shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                </Card>
              ))}
            </div>

            {/* Search */}
            <Card className="p-4 border-0 shadow-sm">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={leadsSearch}
                    onChange={(e) => setLeadsSearch(e.target.value)}
                    placeholder="ابحث عن عميل أو نوع عقار..."
                    className="pr-10 text-right rounded-xl"
                    dir="rtl"
                  />
                </div>
                <Button variant="outline" className="gap-1.5 rounded-xl">
                  <Filter className="w-4 h-4" />
                  تصفية
                </Button>
              </div>
            </Card>

            {/* Sub-tabs */}
            <div className="flex gap-2 flex-wrap">
              {[
                { label: `الكل (${leadsData.length})`, value: 'all' },
                { label: `جديد (${pendingLeadsCount})`, value: 'new' },
                { label: `عاجل (${urgentLeadsCount})`, value: 'urgent' },
                { label: 'تم الرد', value: 'responded' },
              ].map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setLeadsSubTab(tab.value)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    leadsSubTab === tab.value ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Leads list */}
            <div className="space-y-3">
              {filteredLeads
                .filter(l =>
                  leadsSubTab === 'all' ? true :
                  leadsSubTab === 'new' ? l.validation_status === 'pending' :
                  leadsSubTab === 'urgent' ? l.intent_level === 'urgent' :
                  false
                )
                .map((lead) => (
                  <Card key={lead.id} className="p-5 border-0 shadow-sm">
                    <div className="flex items-start justify-between" dir="rtl">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <h3 className="font-semibold text-gray-900">{lead.buyer_name}</h3>
                          <Badge className={
                            lead.intent_level === 'urgent' ? 'bg-red-100 text-red-700 border-red-200 text-xs' :
                            lead.intent_level === 'serious' ? 'bg-orange-100 text-orange-700 border-orange-200 text-xs' :
                            'bg-blue-100 text-blue-700 border-blue-200 text-xs'
                          }>
                            {lead.intent_level === 'urgent' ? 'عاجل' : lead.intent_level === 'serious' ? 'جاد' : 'تصفح'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3 text-sm">
                          <div><p className="text-gray-500">نوع العقار</p><p className="font-medium text-gray-900">{lead.property_type}</p></div>
                          <div><p className="text-gray-500">المدينة</p><p className="font-medium text-gray-900">{getCityName(lead.city_id)}</p></div>
                          <div><p className="text-gray-500">الميزانية</p><p className="font-medium text-gray-900">{formatPrice(lead.budget_min)} – {formatPrice(lead.budget_max)}</p></div>
                          <div><p className="text-gray-500">الغرف</p><p className="font-medium text-gray-900">{lead.bedrooms_min}+ غرف</p></div>
                        </div>
                        {lead.notes && <div className="bg-blue-50 p-3 rounded-xl text-sm text-gray-700 mb-3">{lead.notes}</div>}
                        <p className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(lead.created_at).toLocaleDateString('ar-SA')}</p>
                      </div>
                      <div className="flex flex-col gap-2 mr-4 shrink-0">
                        <Dialog open={selectedLead === lead.id} onOpenChange={(open) => !open && setSelectedLead(null)}>
                          <DialogTrigger asChild>
                            <Button size="sm" className="gap-1.5" onClick={() => setSelectedLead(lead.id)}>
                              <MessageSquare className="w-3.5 h-3.5" />
                              الرد
                            </Button>
                          </DialogTrigger>
                          <DialogContent dir="rtl">
                            <DialogHeader><DialogTitle>الرد على {lead.buyer_name}</DialogTitle></DialogHeader>
                            <div className="space-y-4 mt-4">
                              <div className="bg-gray-50 p-3 rounded-xl text-sm text-gray-700">
                                يبحث عن {lead.property_type} في {getCityName(lead.city_id)}<br />
                                الميزانية: {formatPrice(lead.budget_min)} – {formatPrice(lead.budget_max)}
                              </div>
                              <div>
                                <Label>رسالتك</Label>
                                <Textarea value={responseMessage} onChange={(e) => setResponseMessage(e.target.value)} placeholder="مرحباً، لدينا عدة عقارات تناسب متطلباتك..." rows={5} className="mt-1" />
                              </div>
                              <div className="flex gap-2">
                                <Button onClick={handleRespond} className="flex-1">إرسال</Button>
                                <Button variant="outline" className="flex-1" onClick={() => setSelectedLead(null)}>إلغاء</Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button size="sm" variant="outline" className="gap-1.5"><Phone className="w-3.5 h-3.5" />اتصال</Button>
                        <Button size="sm" variant="outline" className="gap-1.5"><Mail className="w-3.5 h-3.5" />بريد</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              {filteredLeads.length === 0 && (
                <Card className="p-12 text-center border-0 shadow-sm">
                  <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">لا توجد نتائج</p>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* ── Campaigns ── */}
          <TabsContent value="campaigns" className="mt-0 space-y-4">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">الحملات التسويقية</h3>
              <Dialog open={isCampaignDialogOpen} onOpenChange={setIsCampaignDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4" />
                    حملة جديدة
                  </Button>
                </DialogTrigger>
                <DialogContent dir="rtl">
                  <DialogHeader><DialogTitle>إنشاء حملة تسويقية جديدة</DialogTitle></DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>اسم الحملة</Label>
                      <Input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} placeholder="مثال: حملة الفلل الفاخرة" className="mt-1" />
                    </div>
                    <div>
                      <Label>اختر العقار</Label>
                      <Select value={selectedListing} onValueChange={setSelectedListing}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="اختر عقار للترويج له" /></SelectTrigger>
                        <SelectContent>
                          {officeListings.slice(0, 5).map((l) => (
                            <SelectItem key={String(l.id)} value={String(l.id)}>{String(l.property_type)} - {String(l.address)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>استهداف الجمهور</Label>
                      <Textarea value={audienceFilter} onChange={(e) => setAudienceFilter(e.target.value)} placeholder="مثال: ميزانية 1-2 مليون، مدينة الرياض، 3+ غرف" className="mt-1" rows={3} />
                    </div>
                    <div className="bg-blue-50 p-3 rounded-xl text-sm text-blue-700">
                      سيتم إرسال الحملة تلقائياً للعملاء المحتملين المطابقين للمعايير
                    </div>
                    <Button onClick={handleCreateCampaign} className="w-full">إنشاء الحملة</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'إجمالي الحملات', value: campaignsData.length, color: 'text-gray-900', Icon: Target },
                { label: 'الحملات النشطة', value: activeCampaignsCount, color: 'text-green-600', Icon: Play },
                { label: 'إجمالي الوصول', value: campaignsData.reduce((s: number, c: Record<string, unknown>) => s + Number(c.sent_count ?? 0), 0), color: 'text-gray-900', Icon: Users },
                { label: 'إجمالي العملاء', value: campaignsData.reduce((s: number, c: Record<string, unknown>) => s + Number(c.lead_count ?? 0), 0), color: 'text-orange-600', Icon: BarChart3 },
              ].map(s => (
                <Card key={s.label} className="p-4 border-0 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <s.Icon className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </Card>
              ))}
            </div>

            {/* Campaigns list */}
            <div className="space-y-3">
              {campaignsData.map((campaign) => {
                const campaignListingId = String(campaign.listing_id ?? '');
                const listing = officeListings.find(l => l.id === campaignListingId);
                const sentCount = Number(campaign.sent_count ?? 0);
                const clickCount = Number(campaign.click_count ?? 0);
                const leadCount = Number(campaign.lead_count ?? 0);
                const clickRate = sentCount > 0 ? (clickCount / sentCount) * 100 : 0;
                const conversionRate = clickCount > 0 ? (leadCount / clickCount) * 100 : 0;
                return (
                  <Card key={campaign.id} className="p-5 border-0 shadow-sm">
                    <div className="flex items-start justify-between mb-4" dir="rtl">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                          <Badge className={
                            campaign.status === 'active' ? 'bg-green-100 text-green-700 border-green-200 text-xs' :
                            campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-700 border-yellow-200 text-xs' :
                            campaign.status === 'completed' ? 'bg-blue-100 text-blue-700 border-blue-200 text-xs' :
                            'bg-gray-100 text-gray-700 border-gray-200 text-xs'
                          }>
                            {campaign.status === 'active' ? 'نشط' : campaign.status === 'paused' ? 'متوقف' : campaign.status === 'completed' ? 'مكتمل' : 'مسودة'}
                          </Badge>
                        </div>
                        {listing && (
                          <div className="flex items-center gap-3 mb-3">
                            <img src={listing.images[0]} alt="" className="w-14 h-14 rounded-xl object-cover" />
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{listing.property_type}</p>
                              <p className="text-xs text-gray-500">{listing.address}</p>
                            </div>
                          </div>
                        )}
                        <div className="bg-gray-50 p-3 rounded-xl text-sm mb-4">
                          <span className="font-medium">الاستهداف:</span> {campaign.audience_filter}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">معدل النقر</span><span className="font-medium">{clickRate.toFixed(1)}%</span></div>
                            <Progress value={clickRate} className="h-1.5" />
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">معدل التحويل</span><span className="font-medium">{conversionRate.toFixed(1)}%</span></div>
                            <Progress value={conversionRate} className="h-1.5" />
                          </div>
                          <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                            <div className="p-2 bg-blue-50 rounded-lg"><p className="text-gray-500">إرسال</p><p className="font-semibold text-blue-600">{campaign.sent_count}</p></div>
                            <div className="p-2 bg-purple-50 rounded-lg"><p className="text-gray-500">نقرات</p><p className="font-semibold text-purple-600">{campaign.click_count}</p></div>
                            <div className="p-2 bg-green-50 rounded-lg"><p className="text-gray-500">عملاء</p><p className="font-semibold text-green-600">{campaign.lead_count}</p></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 mr-4 shrink-0">
                        {campaign.status === 'active' && (
                          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handleToggleCampaign(campaign.id, campaign.status)}>
                            <Pause className="w-3.5 h-3.5" />إيقاف
                          </Button>
                        )}
                        {campaign.status === 'paused' && (
                          <Button size="sm" className="gap-1.5" onClick={() => handleToggleCampaign(campaign.id, campaign.status)}>
                            <Play className="w-3.5 h-3.5" />تفعيل
                          </Button>
                        )}
                        {campaign.status === 'draft' && (
                          <Button size="sm" className="gap-1.5"><Play className="w-3.5 h-3.5" />بدء الحملة</Button>
                        )}
                        <Button size="sm" variant="outline" className="gap-1.5">
                          <BarChart3 className="w-3.5 h-3.5" />التقرير
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* ── Subscription ── */}
          <TabsContent value="subscription" className="mt-0 space-y-5">
            {/* Current plan summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="p-5 border-0 shadow-sm lg:col-span-2">
                <h3 className="font-semibold text-gray-900 mb-4" dir="rtl">خطتك الحالية</h3>
                <div className="space-y-4" dir="rtl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">الخطة</p>
                      <p className="text-2xl font-bold text-gray-900">{subPlans.find(p => p.id === currentPlan)?.name}</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">نشطة</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'السعر الشهري', value: `${subPlans.find(p => p.id === currentPlan)?.monthlyPrice} ر.س` },
                      { label: 'تاريخ التجديد', value: '15 أبريل 2026' },
                      { label: 'الحالة', value: 'مدفوع', green: true },
                    ].map(item => (
                      <div key={item.label} className="p-3 bg-gray-50 rounded-xl text-center">
                        <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                        <p className={`font-bold text-sm ${'green' in item ? 'text-green-600' : 'text-gray-900'}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <CreditCard className="w-4 h-4" />
                      تحديث بيانات الدفع
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                      إلغاء الاشتراك
                    </Button>
                  </div>
                </div>
              </Card>
              <Card className="p-5 border-0 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4" dir="rtl">معلومات الفواتير</h3>
                <div className="space-y-3 text-sm" dir="rtl">
                  <div><p className="text-gray-500">الاسم</p><p className="font-medium">Prime Real Estate</p></div>
                  <div><p className="text-gray-500">البريد الإلكتروني</p><p className="font-medium">info@prime.com</p></div>
                  <div><p className="text-gray-500">العنوان</p><p className="font-medium">الرياض، السعودية</p></div>
                  <Button variant="outline" size="sm" className="w-full">تعديل البيانات</Button>
                </div>
              </Card>
            </div>

            {/* Plans */}
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5" dir="rtl">
                <h3 className="font-semibold text-gray-900">خطط الاشتراك</h3>
                <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
                  {['monthly', 'annual'].map(cycle => (
                    <button
                      key={cycle}
                      onClick={() => setBillingCycle(cycle)}
                      className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                        billingCycle === cycle ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {cycle === 'monthly' ? 'شهري' : 'سنوي'}
                      {cycle === 'annual' && <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">16%</span>}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {subPlans.map((plan) => {
                  const isActive = currentPlan === plan.id;
                  const price = billingCycle === 'monthly' ? plan.monthlyPrice : Math.round(plan.annualPrice / 12);
                  return (
                    <div
                      key={plan.id}
                      className={`relative bg-white rounded-2xl p-5 flex flex-col ${
                        plan.popular ? 'border-2 border-blue-500 shadow-xl shadow-blue-100' : 'border border-gray-200 shadow-sm'
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow">الأكثر شيوعاً</span>
                        </div>
                      )}
                      <div className="text-right mb-4">
                        <h4 className="text-lg font-bold text-gray-900">{plan.name}</h4>
                        <p className="text-sm text-gray-500">{plan.description}</p>
                      </div>
                      <div className="text-right mb-5">
                        <div className="flex items-baseline justify-end gap-1">
                          <span className="text-3xl font-extrabold text-gray-900">{price.toLocaleString()}</span>
                          <span className="text-gray-500 text-sm">ر.س / شهر</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleUpgradePlan(plan.id)}
                        className={`w-full mb-4 h-10 rounded-xl font-semibold ${
                          isActive ? 'bg-green-600 hover:bg-green-700' : plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''
                        }`}
                        variant={isActive || plan.popular ? 'default' : 'outline'}
                      >
                        {isActive ? 'الخطة الحالية' : 'الاختيار'}
                      </Button>
                      <div className="space-y-2">
                        {plan.features.map((f, i) => (
                          <div key={i} className="flex items-center justify-end gap-2" dir="rtl">
                            <span className={`text-sm ${f.included ? 'text-gray-800' : 'text-gray-400'}`}>{f.name}</span>
                            {f.included ? <Check className="w-4 h-4 text-green-500 shrink-0" /> : <X className="w-4 h-4 text-gray-300 shrink-0" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Invoice history */}
            <Card className="p-5 border-0 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4" dir="rtl">سجل الفواتير</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b" dir="rtl">
                      {['التاريخ', 'الوصف', 'المبلغ', 'الحالة', 'الإجراء'].map(h => (
                        <th key={h} className="text-right py-3 px-3 font-semibold text-gray-700">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { date: '2026-03-15', desc: 'اشتراك احترافي - مارس', amount: 799 },
                      { date: '2026-02-15', desc: 'اشتراك احترافي - فبراير', amount: 799 },
                      { date: '2026-01-15', desc: 'اشتراك احترافي - يناير', amount: 799 },
                    ].map((inv, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50" dir="rtl">
                        <td className="py-3 px-3 text-gray-500">{inv.date}</td>
                        <td className="py-3 px-3 font-medium text-gray-900">{inv.desc}</td>
                        <td className="py-3 px-3 font-semibold text-gray-900">{inv.amount} ر.س</td>
                        <td className="py-3 px-3"><Badge className="bg-green-100 text-green-700 border-green-200 text-xs">مدفوع</Badge></td>
                        <td className="py-3 px-3"><Button variant="outline" size="sm" className="text-xs">تحميل PDF</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* ── Office Profile ── */}
          <TabsContent value="profile" className="mt-0 space-y-5">
            <Card className="p-6 border-0 shadow-sm" dir="rtl">
              <h2 className="text-lg font-bold text-gray-900 mb-6">الملف الشخصي للمكتب</h2>
              <div className="space-y-4">
                <div>
                  <Label className="block mb-1 text-sm font-medium text-gray-700">اسم المكتب</Label>
                  <Input
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                    placeholder="اسم المكتب"
                  />
                </div>
                <div>
                  <Label className="block mb-1 text-sm font-medium text-gray-700">نبذة تعريفية</Label>
                  <Textarea
                    value={profileBio}
                    onChange={e => setProfileBio(e.target.value)}
                    placeholder="نبذة عن المكتب..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="block mb-1 text-sm font-medium text-gray-700">رقم الهاتف</Label>
                    <Input
                      value={profilePhone}
                      onChange={e => setProfilePhone(e.target.value)}
                      placeholder="+966501234567"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <Label className="block mb-1 text-sm font-medium text-gray-700">واتساب</Label>
                    <Input
                      value={profileWhatsapp}
                      onChange={e => setProfileWhatsapp(e.target.value)}
                      placeholder="+966501234567"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div>
                  <Label className="block mb-1 text-sm font-medium text-gray-700">العنوان</Label>
                  <Input
                    value={profileAddress}
                    onChange={e => setProfileAddress(e.target.value)}
                    placeholder="العنوان الكامل للمكتب"
                  />
                </div>
                <div>
                  <Label className="block mb-1 text-sm font-medium text-gray-700">الموقع الإلكتروني</Label>
                  <Input
                    value={profileWebsite}
                    onChange={e => setProfileWebsite(e.target.value)}
                    placeholder="https://example.com"
                    dir="ltr"
                  />
                </div>
                <div>
                  <Label className="block mb-1 text-sm font-medium text-gray-700">رابط الشعار</Label>
                  <Input
                    value={profileLogoUrl}
                    onChange={e => setProfileLogoUrl(e.target.value)}
                    placeholder="https://..."
                    dir="ltr"
                  />
                </div>
                <div className="pt-2">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSavingProfile ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
