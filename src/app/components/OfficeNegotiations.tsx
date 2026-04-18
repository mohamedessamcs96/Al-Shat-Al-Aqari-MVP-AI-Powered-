import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, TrendingUp, TrendingDown, CheckCircle2, XCircle, Loader2, LogOut, DollarSign, Home } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { offices as officesApi, negotiations as negotiationsApi } from '../lib/api-client';
import { getUser, logout as authLogout } from '../lib/auth';
import { toast } from 'sonner';

function statusBadge(status: string) {
  switch (status) {
    case 'accepted':  return <Badge className="bg-green-100 text-green-700">مقبول</Badge>;
    case 'pending':   return <Badge className="bg-amber-100 text-amber-700">قيد الانتظار</Badge>;
    case 'rejected':  return <Badge className="bg-red-100 text-red-700">مرفوض</Badge>;
    case 'countered': return <Badge className="bg-blue-100 text-blue-700">عرض مضاد</Badge>;
    default:          return <Badge variant="secondary">{status}</Badge>;
  }
}

function formatSAR(amount: number | undefined) {
  if (amount === undefined || amount === null) return '—';
  return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(amount);
}

export function OfficeNegotiations() {
  const navigate = useNavigate();
  const officeId = getUser()?.id || '';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [negotiations, setNegotiations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    if (!officeId) { setLoading(false); return; }
    officesApi.listNegotiations(officeId)
      .then((data) => setNegotiations(data as any[]))
      .catch(() => toast.error('تعذّر تحميل بيانات التفاوض'))
      .finally(() => setLoading(false));
  }, [officeId]);

  const handleAccept = async (negId: string) => {
    setActionId(negId);
    try {
      await negotiationsApi.accept(negId);
      setNegotiations(prev => prev.map(n => n.id === negId ? { ...n, status: 'accepted' } : n));
      toast.success('تم قبول عرض المشتري');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (negId: string) => {
    setActionId(negId);
    try {
      await negotiationsApi.reject(negId);
      setNegotiations(prev => prev.map(n => n.id === negId ? { ...n, status: 'rejected' } : n));
      toast.success('تم رفض عرض المشتري');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setActionId(null);
    }
  };

  const byStatus = (status: string) => negotiations.filter(n => n.status === status);

  const NegCard = ({ neg }: { neg: any }) => {
    const listingPrice  = neg.listing_price ?? neg.listing?.price ?? 0;
    const currentOffer  = neg.current_offer ?? neg.initial_offer ?? 0;
    const diff          = currentOffer - listingPrice;
    const isBelow       = diff < 0;

    return (
      <Card className="p-5 mb-4" dir="rtl">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {statusBadge(neg.status)}
              <span className="text-xs text-gray-400"># {neg.id}</span>
            </div>

            <h3 className="font-semibold text-gray-900 truncate flex items-center gap-1">
              <Home className="w-4 h-4 text-gray-400 shrink-0" />
              {neg.listing?.address ?? neg.listing_address ?? 'عقار'}
            </h3>

            <p className="text-sm text-gray-600 mt-1">
              المشتري: {neg.buyer?.name ?? neg.buyer_name ?? '—'}
            </p>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">سعر الطرح</p>
                <p className="font-bold text-gray-900">{formatSAR(listingPrice)}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">عرض المشتري</p>
                <p className="font-bold text-blue-700">{formatSAR(currentOffer)}</p>
              </div>
            </div>

            {listingPrice > 0 && currentOffer > 0 && (
              <div className={`mt-2 flex items-center gap-1 text-sm font-medium ${isBelow ? 'text-red-600' : 'text-green-600'}`}>
                {isBelow ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                {formatSAR(Math.abs(diff))} {isBelow ? 'أقل من سعر الطرح' : 'أعلى من سعر الطرح'}
              </div>
            )}
          </div>

          {neg.status === 'pending' && (
            <div className="flex flex-col gap-2 shrink-0">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={actionId === neg.id}
                onClick={() => handleAccept(neg.id)}
              >
                {actionId === neg.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span className="mr-1">قبول</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                disabled={actionId === neg.id}
                onClick={() => handleReject(neg.id)}
              >
                {actionId === neg.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                <span className="mr-1">رفض</span>
              </Button>
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between" dir="ltr">
          <Button variant="ghost" onClick={() => navigate('/office/dashboard')}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            رجوع
          </Button>
          <h1 className="text-xl font-bold text-gray-900" dir="rtl">إدارة التفاوض</h1>
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
            <p className="text-xs text-gray-500 mb-1" dir="rtl">إجمالي العروض</p>
            <p className="text-2xl font-bold text-gray-900">{negotiations.length}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs text-gray-500 mb-1" dir="rtl">قيد الانتظار</p>
            <p className="text-2xl font-bold text-amber-600">{byStatus('pending').length}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs text-gray-500 mb-1" dir="rtl">مقبولة</p>
            <p className="text-2xl font-bold text-green-600">{byStatus('accepted').length}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs text-gray-500 mb-1" dir="rtl">مرفوضة</p>
            <p className="text-2xl font-bold text-red-600">{byStatus('rejected').length}</p>
          </Card>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : negotiations.length === 0 ? (
          <Card className="p-12 text-center">
            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500" dir="rtl">لا توجد عروض تفاوض حتى الآن</p>
          </Card>
        ) : (
          <Tabs defaultValue="all">
            <TabsList className="w-full grid grid-cols-4 mb-6">
              <TabsTrigger value="all">الكل ({negotiations.length})</TabsTrigger>
              <TabsTrigger value="pending">انتظار ({byStatus('pending').length})</TabsTrigger>
              <TabsTrigger value="accepted">مقبولة ({byStatus('accepted').length})</TabsTrigger>
              <TabsTrigger value="rejected">مرفوضة ({byStatus('rejected').length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {negotiations.map(n => <NegCard key={n.id} neg={n} />)}
            </TabsContent>
            <TabsContent value="pending">
              {byStatus('pending').length === 0
                ? <p className="text-center text-gray-400 py-10" dir="rtl">لا توجد عروض قيد الانتظار</p>
                : byStatus('pending').map(n => <NegCard key={n.id} neg={n} />)}
            </TabsContent>
            <TabsContent value="accepted">
              {byStatus('accepted').length === 0
                ? <p className="text-center text-gray-400 py-10" dir="rtl">لا توجد عروض مقبولة</p>
                : byStatus('accepted').map(n => <NegCard key={n.id} neg={n} />)}
            </TabsContent>
            <TabsContent value="rejected">
              {byStatus('rejected').length === 0
                ? <p className="text-center text-gray-400 py-10" dir="rtl">لا توجد عروض مرفوضة</p>
                : byStatus('rejected').map(n => <NegCard key={n.id} neg={n} />)}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
