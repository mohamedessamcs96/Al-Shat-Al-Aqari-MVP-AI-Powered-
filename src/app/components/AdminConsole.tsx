import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, BarChart3, Users, Building2, AlertCircle, TrendingUp, Settings, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { admin as adminApi } from '../lib/api-client';
import { logout as authLogout } from '../lib/auth';

export function AdminConsole() {
  const navigate = useNavigate();
  const [filterCity, setFilterCity] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stats, setStats] = useState<Record<string, any>>({
    totalUsers: 0, totalOffices: 0, totalListings: 0,
    activeUsers: 0, newSignups: 0, platformRevenue: 0,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [offices, setOffices] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [incidents, setIncidents] = useState<any[]>([]);

  useEffect(() => {
    adminApi.getAnalytics()
      .then(data => setStats(data as any))
      .catch(() => {});
    adminApi.listOffices()
      .then(data => setOffices(data as any[]))
      .catch(() => {});
    adminApi.listCompliance()
      .then(data => setIncidents(data as any[]))
      .catch(() => {});
  }, []);

  const handleUpdateRanking = async (officeId: string, newRank: number) => {
    try {
      await adminApi.setOfficeRanking(officeId, newRank);
      toast.success(`تم تحديث ترتيب المكتب إلى ${newRank}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ');
    }
  };

  const handleSuspendOffice = async (officeId: string) => {
    try {
      await adminApi.suspendOffice(officeId);
      setOffices(prev => prev.map((o: any) => o.id === officeId ? { ...o, suspended: true } : o));
      toast.success('تم إيقاف المكتب مؤقتاِ');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/chat')}>
            <ArrowLeft className="w-5 h-5 ml-2" />
            رجوع
          </Button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">لوحة التحكم الإدارية</h1>
            <p className="text-sm text-gray-500">إدارة المنصة والامتثال</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-red-100 text-red-700 border-red-200">
              {incidents.filter((i: any) => i.status !== 'resolved').length} تنبيهات
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => { authLogout(); navigate('/'); }}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="p-4">
            <p className="text-sm text-gray-600">إجمالي المستخدمين</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-1">↑ 2.3% هذا الأسبوع</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">المكاتب المسجلة</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalOffices}</p>
            <p className="text-xs text-green-600 mt-1">↑ 12 جديد</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">العقارات المدرجة</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalListings.toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-1">↑ 456 هذا الأسبوع</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">المستخدمون النشطون</p>
            <p className="text-2xl font-bold text-gray-900">{stats.activeUsers.toLocaleString()}</p>
            <p className="text-xs text-blue-600 mt-1">{Math.round((stats.activeUsers / stats.totalUsers) * 100)}% من الإجمالي</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">المستخدمون الجدد</p>
            <p className="text-2xl font-bold text-gray-900">{stats.newSignups}</p>
            <p className="text-xs text-green-600 mt-1">اليوم</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">إيرادات المنصة</p>
            <p className="text-2xl font-bold text-gray-900">${(stats.platformRevenue / 1000).toFixed(0)}K</p>
            <p className="text-xs text-green-600 mt-1">هذا الشهر</p>
          </Card>
        </div>

        <Tabs defaultValue="offices">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="offices">المكاتب</TabsTrigger>
            <TabsTrigger value="compliance">
              الامتثال و التنبيهات
              <Badge className="ml-2 bg-red-100 text-red-700">{incidents.filter((i: any) => i.status !== 'resolved').length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="ranking">الترتيب والأداء</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          </TabsList>

          {/* Offices Tab */}
          <TabsContent value="offices" className="space-y-6 mt-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">المكاتب المسجلة</h2>
                <Input
                  placeholder="البحث عن مكتب..."
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className="w-64"
                  dir="rtl"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b" dir="rtl">
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">المكتب</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">المدينة</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">العقارات</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">العملاء</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">الاشتراك</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offices.map((office: any) => (
                      <tr key={office.id} className="border-b hover:bg-gray-50" dir="rtl">
                        <td className="py-3 px-4 font-medium text-gray-900">{office.name}</td>
                        <td className="py-3 px-4 text-gray-600">{office.city}</td>
                        <td className="py-3 px-4 text-gray-600">{office.listings}</td>
                        <td className="py-3 px-4 text-gray-600">{office.leads}</td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              office.subscribed
                                ? 'bg-green-100 text-green-700 border-green-200'
                                : 'bg-gray-100 text-gray-700 border-gray-200'
                            }
                          >
                            {office.subscribed ? 'مشترك' : 'مجاني'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSuspendOffice(office.id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            إيقاف
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6 mt-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">التنبيهات والانتهاكات</h2>
              <div className="space-y-4">
                {incidents.map((incident: any) => (
                  <div key={incident.id} className="p-4 border rounded-lg hover:bg-gray-50" dir="rtl">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <AlertCircle
                            className={
                              incident.type === 'spam'
                                ? 'w-5 h-5 text-yellow-600'
                                : incident.type === 'fraud'
                                ? 'w-5 h-5 text-red-600'
                                : 'w-5 h-5 text-orange-600'
                            }
                          />
                          <p className="font-semibold text-gray-900">
                            {incident.type === 'spam'
                              ? 'بريد عشوائي'
                              : incident.type === 'fraud'
                              ? 'احتيال'
                              : 'إساءة استخدام'}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">المكتب: {incident.office}</p>
                        <p className="text-xs text-gray-500 mt-1">{incident.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            incident.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                              : incident.status === 'investigating'
                              ? 'bg-blue-100 text-blue-700 border-blue-200'
                              : 'bg-green-100 text-green-700 border-green-200'
                          }
                        >
                          {incident.status === 'pending'
                            ? 'قيد الانتظار'
                            : incident.status === 'investigating'
                            ? 'قيد التحقيق'
                            : 'تم حله'}
                        </Badge>
                        <Button size="sm" variant="outline">
                          عرض
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Ranking Tab */}
          <TabsContent value="ranking" className="space-y-6 mt-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4" dir="rtl">خوارزمية الترتيب والأداء</h2>
              <div className="space-y-6">
                {offices.map((office: any) => (
                  <div key={office.id} className="p-4 border rounded-lg" dir="rtl">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{office.name}</p>
                        <p className="text-sm text-gray-600">{office.city}</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                        الترتيب #{office.rank}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-600">جودة الإعلان</p>
                        <Progress value={85} className="mt-1" />
                        <p className="text-sm font-semibold text-gray-900 mt-1">85%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">معدل الاستجابة</p>
                        <Progress value={92} className="mt-1" />
                        <p className="text-sm font-semibold text-gray-900 mt-1">92%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">رضا العملاء</p>
                        <Progress value={88} className="mt-1" />
                        <p className="text-sm font-semibold text-gray-900 mt-1">88%</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Input type="number" min="1" placeholder="رقم الترتيب الجديد" className="w-32" dir="rtl" />
                      <Button
                        size="sm"
                        onClick={() => handleUpdateRanking(office.id, 1)}
                      >
                        تحديث الترتيب
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 mt-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4" dir="rtl">إعدادات المنصة</h2>
              <div className="space-y-6" dir="rtl">
                <div>
                  <Label>رسم عمولة المنصة (%)</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input type="number" defaultValue="5" min="0" max="100" className="w-24" />
                    <span className="text-sm text-gray-600">الرسم الحالي: 5%</span>
                  </div>
                </div>

                <div>
                  <Label>الحد الأدنى لسعر الإعلان (ر.س)</Label>
                  <Input type="number" defaultValue="50000" className="mt-2" />
                </div>

                <div>
                  <Label>الحد الأقصى للعقارات لكل مكتب (مجاني)</Label>
                  <Input type="number" defaultValue="10" className="mt-2" />
                </div>

                <div>
                  <Label>وقت انتهاء صلاحية الجلسة (دقيقة)</Label>
                  <Input type="number" defaultValue="30" className="mt-2" />
                </div>

                <div className="pt-4 border-t">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Settings className="w-4 h-4 ml-2" />
                    حفظ الإعدادات
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
