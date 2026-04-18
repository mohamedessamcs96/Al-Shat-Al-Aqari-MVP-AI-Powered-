import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Calendar, Clock, CheckCircle2, XCircle, Loader2, LogOut, MapPin, User } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { offices as officesApi, visits as visitsApi } from '../lib/api-client';
import { getUser, logout as authLogout } from '../lib/auth';
import { toast } from 'sonner';

function statusBadge(status: string) {
  switch (status) {
    case 'confirmed': return <Badge className="bg-green-100 text-green-700">مؤكد</Badge>;
    case 'pending':   return <Badge className="bg-amber-100 text-amber-700">قيد الانتظار</Badge>;
    case 'cancelled': return <Badge className="bg-red-100 text-red-700">ملغى</Badge>;
    default:          return <Badge variant="secondary">{status}</Badge>;
  }
}

function formatDate(dt: string) {
  if (!dt) return '—';
  try {
    return new Date(dt).toLocaleString('ar-SA', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return dt;
  }
}

export function OfficeVisits() {
  const navigate = useNavigate();
  const officeId = getUser()?.id || '';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    if (!officeId) { setLoading(false); return; }
    officesApi.listVisits(officeId)
      .then((data) => setVisits(Array.isArray(data) ? data : ((data as any)?.results ?? [])))
      .catch(() => toast.error('تعذّر تحميل بيانات الزيارات'))
      .finally(() => setLoading(false));
  }, [officeId]);

  const handleConfirm = async (visitId: string) => {
    setActionId(visitId);
    try {
      await visitsApi.confirm(visitId);
      setVisits(prev => prev.map(v => v.id === visitId ? { ...v, status: 'confirmed' } : v));
      toast.success('تم تأكيد الزيارة');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setActionId(null);
    }
  };

  const handleCancel = async (visitId: string) => {
    setActionId(visitId);
    try {
      await visitsApi.cancel(visitId);
      setVisits(prev => prev.map(v => v.id === visitId ? { ...v, status: 'cancelled' } : v));
      toast.success('تم إلغاء الزيارة');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setActionId(null);
    }
  };

  const byStatus = (status: string) => visits.filter(v => v.status === status);

  const VisitCard = ({ visit }: { visit: any }) => (
    <Card className="p-5 mb-4" dir="rtl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {statusBadge(visit.status)}
            <span className="text-xs text-gray-400"># {visit.id}</span>
          </div>
          <h3 className="font-semibold text-gray-900 truncate">
            {visit.listing?.address ?? visit.listing_address ?? 'عقار'}
          </h3>
          <div className="mt-2 flex flex-col gap-1 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4 text-gray-400" />
              {visit.buyer?.name ?? visit.buyer_name ?? 'مشتري'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              {formatDate(visit.scheduled_at)}
            </span>
            {visit.notes && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-gray-400" />
                {visit.notes}
              </span>
            )}
          </div>
        </div>
        {visit.status === 'pending' && (
          <div className="flex gap-2 shrink-0">
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={actionId === visit.id}
              onClick={() => handleConfirm(visit.id)}
            >
              {actionId === visit.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span className="mr-1">تأكيد</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              disabled={actionId === visit.id}
              onClick={() => handleCancel(visit.id)}
            >
              {actionId === visit.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              <span className="mr-1">إلغاء</span>
            </Button>
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between" dir="ltr">
          <Button variant="ghost" onClick={() => navigate('/office/dashboard')}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            رجوع
          </Button>
          <h1 className="text-xl font-bold text-gray-900" dir="rtl">إدارة الزيارات</h1>
          <Button variant="ghost" size="sm" onClick={() => { authLogout(); navigate('/'); }}>
            <LogOut className="w-4 h-4 mr-2" />
            خروج
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 text-center">
            <p className="text-xs text-gray-500 mb-1" dir="rtl">إجمالي الزيارات</p>
            <p className="text-2xl font-bold text-gray-900">{visits.length}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs text-gray-500 mb-1" dir="rtl">قيد الانتظار</p>
            <p className="text-2xl font-bold text-amber-600">{byStatus('pending').length}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs text-gray-500 mb-1" dir="rtl">مؤكدة</p>
            <p className="text-2xl font-bold text-green-600">{byStatus('confirmed').length}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs text-gray-500 mb-1" dir="rtl">ملغاة</p>
            <p className="text-2xl font-bold text-red-600">{byStatus('cancelled').length}</p>
          </Card>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : visits.length === 0 ? (
          <Card className="p-12 text-center">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500" dir="rtl">لا توجد زيارات حتى الآن</p>
          </Card>
        ) : (
          <Tabs defaultValue="all">
            <TabsList className="w-full grid grid-cols-4 mb-6">
              <TabsTrigger value="all">الكل ({visits.length})</TabsTrigger>
              <TabsTrigger value="pending">انتظار ({byStatus('pending').length})</TabsTrigger>
              <TabsTrigger value="confirmed">مؤكدة ({byStatus('confirmed').length})</TabsTrigger>
              <TabsTrigger value="cancelled">ملغاة ({byStatus('cancelled').length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {visits.map(v => <VisitCard key={v.id} visit={v} />)}
            </TabsContent>
            <TabsContent value="pending">
              {byStatus('pending').length === 0
                ? <p className="text-center text-gray-400 py-10" dir="rtl">لا توجد زيارات قيد الانتظار</p>
                : byStatus('pending').map(v => <VisitCard key={v.id} visit={v} />)}
            </TabsContent>
            <TabsContent value="confirmed">
              {byStatus('confirmed').length === 0
                ? <p className="text-center text-gray-400 py-10" dir="rtl">لا توجد زيارات مؤكدة</p>
                : byStatus('confirmed').map(v => <VisitCard key={v.id} visit={v} />)}
            </TabsContent>
            <TabsContent value="cancelled">
              {byStatus('cancelled').length === 0
                ? <p className="text-center text-gray-400 py-10" dir="rtl">لا توجد زيارات ملغاة</p>
                : byStatus('cancelled').map(v => <VisitCard key={v.id} visit={v} />)}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
