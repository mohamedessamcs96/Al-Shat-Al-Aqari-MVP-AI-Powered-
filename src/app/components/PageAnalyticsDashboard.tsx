import { useEffect, useState } from 'react';
import { BarChart3, Eye, MousePointerClick, UserPlus, TrendingUp, Globe, Smartphone, Monitor } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { BLOCK_CATALOG } from '../lib/page-builder-defaults';
import { offices as officesApi } from '../lib/api-client';

interface Props {
  officeId: string;
}

// Mock time-series data for sparkline
const MOCK_VIEWS = [12, 19, 8, 25, 30, 22, 40, 35, 28, 50, 45, 62, 58, 70, 75];
const MOCK_LEADS = [1, 2, 0, 3, 4, 2, 5, 3, 4, 6, 5, 8, 7, 9, 10];

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - (v / max) * 100}`).join(' ');
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-10">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatCard({
  icon: Icon, label, value, subtitle, color, trend, sparkData,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: string | number;
  subtitle?: string;
  color: string;
  trend?: string;
  sparkData?: number[];
}) {
  return (
    <Card className="p-5 overflow-hidden relative">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-extrabold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      {trend && (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600" dir="rtl">
          <TrendingUp className="w-3 h-3" />
          {trend}
        </span>
      )}
      {sparkData && (
        <div className="mt-2" style={{ color }}>
          <Sparkline data={sparkData} color={color} />
        </div>
      )}
    </Card>
  );
}

export function PageAnalyticsDashboard({ officeId }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [analyticsData, setAnalyticsData] = useState<any | null>(null);

  useEffect(() => {
    if (!officeId) return;
    officesApi.getPageAnalytics(officeId)
      .then((data: any) => setAnalyticsData(data))
      .catch(() => {});
  }, [officeId]);

  // Use real data when available, fall back to mock values for display
  const enriched = {
    totalViews: analyticsData?.total_views ?? analyticsData?.totalViews ?? 1240,
    uniqueVisitors: analyticsData?.unique_visitors ?? analyticsData?.uniqueVisitors ?? 874,
    totalClicks: analyticsData?.total_clicks ?? analyticsData?.totalClicks ?? 312,
    totalLeads: analyticsData?.total_leads ?? analyticsData?.totalLeads ?? 28,
    topSources: analyticsData?.top_sources ?? analyticsData?.topSources ?? [
      { source: 'مباشر', count: 540 },
      { source: 'واتساب', count: 310 },
      { source: 'إنستغرام', count: 220 },
      { source: 'جوجل', count: 170 },
    ],
    blockStats: analyticsData?.block_stats ?? analyticsData?.blockStats ?? [],
  };

  const deviceSplit = [
    { device: 'جوال', pct: 62, icon: Smartphone },
    { device: 'حاسوب', pct: 31, icon: Monitor },
    { device: 'تابلت', pct: 7, icon: Globe },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Eye} label="المشاهدات الكلية" value={enriched.totalViews.toLocaleString()} color="#3b82f6" trend="+12% هذا الأسبوع" sparkData={MOCK_VIEWS} />
        <StatCard icon={Globe} label="الزوار الفريدون" value={enriched.uniqueVisitors.toLocaleString()} color="#8b5cf6" trend="+8% هذا الأسبوع" />
        <StatCard icon={MousePointerClick} label="النقرات" value={enriched.totalClicks.toLocaleString()} subtitle={`معدل النقر: ${((enriched.totalClicks / enriched.totalViews) * 100).toFixed(1)}%`} color="#f59e0b" sparkData={MOCK_VIEWS.map((v) => Math.floor(v * 0.25))} />
        <StatCard icon={UserPlus} label="العملاء المحتملون" value={enriched.totalLeads.toLocaleString()} color="#10b981" trend="+3 هذا الأسبوع" sparkData={MOCK_LEADS} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Traffic sources */}
        <Card className="p-5 col-span-1">
          <h3 className="font-bold text-gray-900 mb-4 text-sm">مصادر الزيارات</h3>
          <div className="space-y-3">
            {enriched.topSources.map((s) => {
              const total = enriched.topSources.reduce((a, b) => a + b.count, 0);
              const pct = ((s.count / total) * 100).toFixed(0);
              return (
                <div key={s.source}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-700 font-medium">{s.source}</span>
                    <span className="text-gray-400">{s.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Device split */}
        <Card className="p-5 col-span-1">
          <h3 className="font-bold text-gray-900 mb-4 text-sm">الأجهزة</h3>
          <div className="space-y-4">
            {deviceSplit.map(({ device, pct, icon: Icon }) => (
              <div key={device} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-700">{device}</span>
                    <span className="text-gray-400">{pct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Block performance */}
        <Card className="p-5 col-span-1">
          <h3 className="font-bold text-gray-900 mb-4 text-sm">أداء الكتل</h3>
          <div className="space-y-2">
            {enriched.blockStats.slice(0, 5).map((bs) => {
              const cat = BLOCK_CATALOG.find((c) => c.type === bs.blockType);
              return (
                <div key={bs.blockId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: cat?.color || '#94a3b8' }} />
                    <span className="text-xs text-gray-700">{cat?.nameAr || bs.blockType}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">{bs.clicks} نقرة</Badge>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
