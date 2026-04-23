import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  BarChart3, Users, Building2, AlertCircle, Settings, LogOut,
  Search, Check, X, ChevronRight, Shield, Layers, FileText,
  RefreshCw, Ban, Star, CreditCard, Inbox,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { admin as adminApi } from '../lib/api-client';
import { logout as authLogout } from '../lib/auth';

// ─── helpers ─────────────────────────────────────────────────────────────────
function toArr(d: unknown): any[] {
  if (Array.isArray(d)) return d;
  const a = d as any;
  return Array.isArray(a?.results) ? a.results : Array.isArray(a?.data) ? a.data : [];
}
function unwrap(d: unknown): any {
  const a = d as any;
  return a?.data ?? a;
}

// ─── stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <Card className="p-4 border-0 shadow-sm" dir="rtl">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </Card>
  );
}

// ─── nav tab ──────────────────────────────────────────────────────────────────
function NavTab({ active, onClick, icon, label, badge }: {
  active: boolean; onClick: () => void;
  icon: React.ReactNode; label: string; badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
        active
          ? 'border-indigo-600 text-indigo-700'
          : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
      }`}
    >
      {icon}
      {label}
      {!!badge && (
        <span className="ml-1 min-w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
          {badge}
        </span>
      )}
    </button>
  );
}

// ─── component ────────────────────────────────────────────────────────────────
export function AdminConsole() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('offices');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [analytics, setAnalytics] = useState<any>({});
  const [officeMetrics, setOfficeMetrics] = useState<any[]>([]);
  const [offices, setOffices] = useState<any[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [demands, setDemands] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [settingsDirty, setSettingsDirty] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // ranking input state per office
  const [rankInputs, setRankInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      adminApi.getAnalytics().then(d => setAnalytics(unwrap(d))),
      adminApi.getOfficeMetrics().then(d => setOfficeMetrics(toArr(d))),
      adminApi.listOffices().then(d => setOffices(toArr(d))),
      adminApi.listBuyers().then(d => setBuyers(toArr(d))),
      adminApi.listSubscriptions().then(d => setSubscriptions(toArr(d))),
      adminApi.listDemands().then(d => setDemands(toArr(d))),
      adminApi.listCompliance().then(d => setIncidents(toArr(d))),
      adminApi.getSettings().then(d => setSettings(unwrap(d))),
    ]).finally(() => setLoading(false));
  }, []);

  const handleSuspend = async (officeId: string) => {
    try {
      await adminApi.suspendOffice(officeId);
      setOffices(prev => prev.map(o => o.id === officeId ? { ...o, is_suspended: true, suspended: true } : o));
      toast.success('تم إيقاف المكتب');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ');
    }
  };

  const handleSetRanking = async (officeId: string) => {
    const val = Number(rankInputs[officeId]);
    if (!val || val < 0) { toast.error('أدخل قيمة صحيحة'); return; }
    try {
      await adminApi.setOfficeRanking(officeId, val);
      setOfficeMetrics(prev => prev.map(o => o.id === officeId ? { ...o, ranking_score: val } : o));
      toast.success('تم تحديث الترتيب');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ');
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      await adminApi.updateSettings(settings);
      toast.success('تم حفظ الإعدادات');
      setSettingsDirty(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const openIncidents = incidents.filter(i => i.status !== 'resolved').length;

  // ── derived stats ──────────────────────────────────────────────────────────
  const kpis = [
    { label: 'المكاتب', value: analytics.total_offices ?? analytics.totalOffices ?? offices.length, sub: 'مكتب مسجل', color: 'text-indigo-700' },
    { label: 'المشترون', value: analytics.total_buyers ?? analytics.totalUsers ?? buyers.length, sub: 'مستخدم نشط', color: 'text-blue-700' },
    { label: 'العقارات', value: analytics.total_listings ?? analytics.totalListings ?? '—', sub: 'مدرج', color: 'text-emerald-700' },
    { label: 'الاشتراكات', value: subscriptions.length || analytics.total_subscriptions ?? '—', sub: 'اشتراك نشط', color: 'text-amber-700' },
    { label: 'التنبيهات', value: openIncidents, sub: 'قيد المراجعة', color: openIncidents > 0 ? 'text-red-600' : 'text-gray-500' },
  ];

  const filteredOffices = offices.filter(o =>
    (o.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (o.city ?? '').toLowerCase().includes(search.toLowerCase())
  );
  const filteredBuyers = buyers.filter(b =>
    (b.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (b.phone ?? '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500" dir="rtl">جاري تحميل لوحة التحكم…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">

      {/* ─── Header ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-gray-900 leading-none">لوحة الإدارة</p>
              <p className="text-[10px] text-gray-400">الشات العقاري</p>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {openIncidents > 0 && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-full font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {openIncidents} تنبيه مفتوح
              </span>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5 text-gray-600"
              onClick={() => { authLogout(); navigate('/'); }}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">خروج</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* ─── KPI row ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {kpis.map(k => (
            <StatCard key={k.label} label={k.label} value={k.value} sub={k.sub} color={k.color} />
          ))}
        </div>

        {/* ─── Tab nav ─────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto border-b border-gray-100">
            <div className="flex px-2 min-w-max">
              {[
                { id: 'offices',       label: 'المكاتب',      icon: <Building2 className="w-4 h-4" />, badge: 0 },
                { id: 'buyers',        label: 'المشترون',     icon: <Users className="w-4 h-4" />, badge: 0 },
                { id: 'subscriptions', label: 'الاشتراكات',   icon: <CreditCard className="w-4 h-4" />, badge: 0 },
                { id: 'demands',       label: 'الطلبات',      icon: <Inbox className="w-4 h-4" />, badge: demands.length },
                { id: 'ranking',       label: 'الترتيب',      icon: <Star className="w-4 h-4" />, badge: 0 },
                { id: 'compliance',    label: 'الامتثال',     icon: <FileText className="w-4 h-4" />, badge: openIncidents },
                { id: 'settings',      label: 'الإعدادات',    icon: <Settings className="w-4 h-4" />, badge: 0 },
              ].map(t => (
                <NavTab
                  key={t.id}
                  active={activeTab === t.id}
                  onClick={() => { setActiveTab(t.id); setSearch(''); }}
                  icon={t.icon}
                  label={t.label}
                  badge={t.badge}
                />
              ))}
            </div>
          </div>

          <div className="p-6">

            {/* ── Search bar (shared) ─────────────────────── */}
            {['offices','buyers','demands','compliance'].includes(activeTab) && (
              <div className="relative mb-5">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input
                  placeholder="بحث…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pr-10 text-right rounded-xl h-10"
                  dir="rtl"
                />
              </div>
            )}

            {/* ══ OFFICES ═══════════════════════════════════════════════════ */}
            {activeTab === 'offices' && (
              <div className="space-y-3">
                {filteredOffices.length === 0 && (
                  <p className="text-center text-sm text-gray-400 py-8">لا توجد مكاتب</p>
                )}
                {filteredOffices.map((office: any) => {
                  const isSuspended = office.is_suspended ?? office.suspended ?? false;
                  return (
                    <div key={office.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {(office.name ?? '?')[0]}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900 text-sm">{office.name}</p>
                          {isSuspended && <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">موقوف</Badge>}
                          {office.verified && <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">موثق</Badge>}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                          {office.email ?? office.phone ?? office.city ?? '—'}
                        </p>
                      </div>
                      {/* Meta */}
                      <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500 flex-shrink-0">
                        <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" />{office.listings_count ?? office.listings ?? '—'} عقار</span>
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{office.leads_count ?? office.leads ?? '—'} عميل</span>
                      </div>
                      {/* Action */}
                      {!isSuspended && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50 gap-1.5 flex-shrink-0 text-xs"
                          onClick={() => handleSuspend(office.id)}
                        >
                          <Ban className="w-3.5 h-3.5" />
                          إيقاف
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ══ BUYERS ════════════════════════════════════════════════════ */}
            {activeTab === 'buyers' && (
              <div className="space-y-3">
                {filteredBuyers.length === 0 && (
                  <p className="text-center text-sm text-gray-400 py-8">لا يوجد مشترون</p>
                )}
                {filteredBuyers.map((b: any) => (
                  <div key={b.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {(b.name ?? '؟')[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{b.name ?? 'بدون اسم'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{b.phone ?? b.email ?? '—'}</p>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {b.created_at ? new Date(b.created_at).toLocaleDateString('ar-SA') : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* ══ SUBSCRIPTIONS ═════════════════════════════════════════════ */}
            {activeTab === 'subscriptions' && (
              <div className="space-y-3">
                {subscriptions.length === 0 && (
                  <p className="text-center text-sm text-gray-400 py-8">لا توجد اشتراكات</p>
                )}
                {subscriptions.map((s: any) => {
                  const isActive = s.status === 'active' || s.is_active;
                  return (
                    <div key={s.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                        <CreditCard className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 text-sm">{s.office_name ?? s.plan_name ?? 'اشتراك'}</p>
                          <Badge className={isActive ? 'bg-emerald-100 text-emerald-700 border-emerald-200 text-xs' : 'bg-gray-100 text-gray-600 text-xs'}>
                            {isActive ? 'نشط' : 'منتهي'}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{s.plan ?? s.plan_name ?? '—'} · {s.billing_cycle ?? '—'}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-800 flex-shrink-0">{s.price ? `${s.price} ر.س` : '—'}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ══ DEMANDS ═══════════════════════════════════════════════════ */}
            {activeTab === 'demands' && (
              <div className="space-y-3">
                {demands.length === 0 && (
                  <p className="text-center text-sm text-gray-400 py-8">لا توجد طلبات</p>
                )}
                {demands
                  .filter(d =>
                    (d.buyer_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
                    (d.property_type ?? '').toLowerCase().includes(search.toLowerCase())
                  )
                  .map((d: any) => (
                  <div key={d.id} className="p-4 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-semibold text-gray-900 text-sm">{d.buyer_name ?? 'طالب شراء'}</p>
                          <Badge className={
                            d.intent_level === 'urgent' ? 'bg-red-100 text-red-700 border-red-200 text-xs' :
                            d.intent_level === 'serious' ? 'bg-orange-100 text-orange-700 border-orange-200 text-xs' :
                            'bg-gray-100 text-gray-600 text-xs'
                          }>
                            {d.intent_level === 'urgent' ? 'عاجل' : d.intent_level === 'serious' ? 'جاد' : d.intent_level ?? '—'}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">
                          {d.property_type ?? '—'} · {d.budget_min ? `${d.budget_min.toLocaleString()}–${d.budget_max?.toLocaleString()} ر.س` : '—'}
                        </p>
                        {d.notes && <p className="text-xs text-gray-400 mt-1">{d.notes}</p>}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs flex-shrink-0"
                        onClick={async () => {
                          try {
                            await adminApi.distributeDemand(d.id, offices.map((o: any) => o.id));
                            toast.success('تم توزيع الطلب على المكاتب');
                          } catch (err) {
                            toast.error(err instanceof Error ? err.message : 'حدث خطأ');
                          }
                        }}
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                        توزيع
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ══ RANKING ═══════════════════════════════════════════════════ */}
            {activeTab === 'ranking' && (
              <div className="space-y-3">
                {officeMetrics.length === 0 && offices.length === 0 && (
                  <p className="text-center text-sm text-gray-400 py-8">لا توجد بيانات</p>
                )}
                {(officeMetrics.length > 0 ? officeMetrics : offices).map((o: any) => (
                  <div key={o.id} className="p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{o.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          الترتيب الحالي: <span className="font-bold text-indigo-600">{o.ranking_score ?? o.rank ?? '—'}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          placeholder="قيمة جديدة"
                          value={rankInputs[o.id] ?? ''}
                          onChange={e => setRankInputs(prev => ({ ...prev, [o.id]: e.target.value }))}
                          className="w-28 h-9 text-right rounded-xl text-sm"
                          dir="rtl"
                        />
                        <Button
                          size="sm"
                          className="bg-indigo-600 hover:bg-indigo-700 gap-1.5"
                          onClick={() => handleSetRanking(o.id)}
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          تحديث
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ══ COMPLIANCE ════════════════════════════════════════════════ */}
            {activeTab === 'compliance' && (
              <div className="space-y-3">
                {incidents.length === 0 && (
                  <div className="flex flex-col items-center gap-2 py-10">
                    <Check className="w-10 h-10 text-emerald-400" />
                    <p className="text-sm text-gray-400">لا توجد تنبيهات امتثال</p>
                  </div>
                )}
                {incidents
                  .filter(i =>
                    (i.office ?? i.office_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
                    (i.type ?? '').toLowerCase().includes(search.toLowerCase())
                  )
                  .map((i: any) => {
                    const isOpen = i.status !== 'resolved';
                    return (
                      <div key={i.id} className={`p-4 rounded-xl border transition-colors ${isOpen ? 'border-red-100 bg-red-50/30' : 'border-gray-100 hover:bg-gray-50'}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${i.type === 'fraud' ? 'text-red-600' : i.type === 'spam' ? 'text-yellow-600' : 'text-orange-500'}`} />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-gray-900 text-sm">
                                  {i.type === 'fraud' ? 'احتيال' : i.type === 'spam' ? 'بريد عشوائي' : i.type ?? 'انتهاك'}
                                </p>
                                <Badge className={
                                  i.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200 text-xs' :
                                  i.status === 'investigating' ? 'bg-blue-100 text-blue-700 border-blue-200 text-xs' :
                                  'bg-emerald-100 text-emerald-700 border-emerald-200 text-xs'
                                }>
                                  {i.status === 'pending' ? 'قيد الانتظار' : i.status === 'investigating' ? 'قيد التحقيق' : 'تم الحل'}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">المكتب: {i.office ?? i.office_name ?? '—'}</p>
                              {i.description && <p className="text-xs text-gray-400 mt-0.5">{i.description}</p>}
                              {i.date && <p className="text-[11px] text-gray-400 mt-1">{i.date}</p>}
                            </div>
                          </div>
                          {isOpen && (
                            <Button size="sm" variant="outline" className="flex-shrink-0 text-xs gap-1.5">
                              <X className="w-3.5 h-3.5" />
                              إغلاق
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* ══ SETTINGS ══════════════════════════════════════════════════ */}
            {activeTab === 'settings' && (
              <div className="max-w-lg space-y-5" dir="rtl">
                {[
                  { key: 'commission_rate', label: 'رسم العمولة (%)', type: 'number' },
                  { key: 'min_listing_price', label: 'الحد الأدنى لسعر الإعلان (ر.س)', type: 'number' },
                  { key: 'max_free_listings_per_office', label: 'الحد الأقصى للعقارات المجانية لكل مكتب', type: 'number' },
                ].map(field => (
                  <div key={field.key}>
                    <Label className="text-sm font-medium text-gray-700">{field.label}</Label>
                    <Input
                      type={field.type}
                      value={settings[field.key] ?? ''}
                      onChange={e => {
                        setSettings((prev: any) => ({ ...prev, [field.key]: e.target.value }));
                        setSettingsDirty(true);
                      }}
                      className="mt-1.5 rounded-xl h-11 text-right"
                      dir="ltr"
                    />
                  </div>
                ))}
                <div className="pt-2">
                  <Button
                    onClick={handleSaveSettings}
                    disabled={!settingsDirty || isSavingSettings}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl h-11 font-semibold gap-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    {isSavingSettings ? 'جارٍ الحفظ…' : 'حفظ الإعدادات'}
                  </Button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
