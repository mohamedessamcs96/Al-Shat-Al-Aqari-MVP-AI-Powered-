import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Check, X, CreditCard, AlertCircle, Calendar, LogOut, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { offices as officesApi } from '../lib/api-client';
import { getUser, logout as authLogout } from '../lib/auth';

export function OfficeSubscription() {
  const navigate = useNavigate();
  const officeId = getUser()?.id || '';
  const [currentPlan, setCurrentPlan] = useState('professional');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [renewalDate, setRenewalDate] = useState<string | null>(null);

  useEffect(() => {
    if (!officeId) return;
    officesApi.getSubscription(officeId)
      .then((data: any) => {
        if (data.plan_id) setCurrentPlan(data.plan_id);
        if (data.billing_cycle) setBillingCycle(data.billing_cycle);
        if (data.renewal_date ?? data.expires_at) setRenewalDate(data.renewal_date ?? data.expires_at);
      })
      .catch(() => {});
  }, [officeId]);

  const plans = [
    {
      id: 'starter',
      name: 'ستارتر',
      monthlyPrice: 299,
      annualPrice: 2990,
      description: 'للمكاتب الناشئة',
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
      id: 'professional',
      name: 'احترافي',
      monthlyPrice: 799,
      annualPrice: 7990,
      description: 'الأكثر شيوعاً',
      popular: true,
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
      id: 'enterprise',
      name: 'مؤسسي',
      monthlyPrice: 1999,
      annualPrice: 19990,
      description: 'للمكاتب الكبيرة',
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

  const handleUpgrade = async (planId: string) => {
    if (!officeId) return;
    setSubscriptionLoading(true);
    try {
      await officesApi.updateSubscription(officeId, planId, billingCycle);
      setCurrentPlan(planId);
      toast.success(`تم الترقية إلى خطة ${plans.find(p => p.id === planId)?.name}!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!officeId) return;
    setSubscriptionLoading(true);
    try {
      await officesApi.cancelSubscription(officeId);
      toast.success('تم إلغاء الاشتراك. سيتم إنهاء الخدمة في نهاية الدورة الحالية.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setSubscriptionLoading(false);
    }
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
          <h1 className="text-xl font-bold text-gray-900" dir="rtl">إدارة الاشتراك</h1>
          <Button variant="ghost" size="sm" onClick={() => { authLogout(); navigate('/'); }}>
            <LogOut className="w-4 h-4 mr-2" />
            خروج
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Current Plan */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-4" dir="rtl">خطتك الحالية</h2>
            <div className="space-y-4" dir="rtl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">الخطة</p>
                  <p className="text-2xl font-bold text-gray-900">{plans.find(p => p.id === currentPlan)?.name}</p>
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">نشطة</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">السعر الشهري</p>
                  <p className="text-lg font-bold text-gray-900">
                    {plans.find(p => p.id === currentPlan)?.monthlyPrice} ر.س
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">تاريخ التجديد</p>
                  <p className="text-lg font-bold text-gray-900">
                    {renewalDate ? new Date(renewalDate).toLocaleDateString('ar-SA') : '—'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">الحالة</p>
                  <p className="text-lg font-bold text-green-600">مدفوع</p>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline">
                  <CreditCard className="w-4 h-4 ml-2" />
                  تحديث بيانات الدفع
                </Button>
                <Button variant="outline" onClick={handleCancelSubscription} disabled={subscriptionLoading} className="text-red-600 hover:bg-red-50">
                  {subscriptionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'إلغاء الاشتراك'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Billing Info */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4" dir="rtl">معلومات الفواتير</h3>
            <div className="space-y-3" dir="rtl">
              <div>
                <p className="text-sm text-gray-600">الاسم</p>
                <p className="font-medium text-gray-900">Prime Real Estate</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                <p className="font-medium text-gray-900">info@prime.com</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">العنوان</p>
                <p className="font-medium text-gray-900">الرياض، السعودية</p>
              </div>
              <Button variant="outline" className="w-full">
                تعديل البيانات
              </Button>
            </div>
          </Card>
        </div>

        {/* Plans Comparison */}
        <div className="mb-8">
          {/* Section header + billing toggle */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6" dir="rtl">
            <h2 className="text-2xl font-bold text-gray-900">خطط الاشتراك</h2>

            {/* Pill toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                  billingCycle === 'monthly'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                شهري
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                  billingCycle === 'annual'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                سنوي
                <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  توفير 16%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map((plan) => {
              const isActive = currentPlan === plan.id;
              const price = billingCycle === 'monthly' ? plan.monthlyPrice : Math.round(plan.annualPrice / 12);

              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-2xl p-6 flex flex-col transition-all duration-200 ${
                    plan.popular
                      ? 'border-2 border-blue-500 shadow-xl shadow-blue-100'
                      : 'border border-gray-200 shadow-sm hover:shadow-md'
                  }`}
                >
                  {/* Popular badge — top-left overlap */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow">
                        الأكثر شيوعاً
                      </span>
                    </div>
                  )}

                  {/* Plan name & desc */}
                  <div className="text-right mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="text-right mb-6">
                    <div className="flex items-baseline justify-end gap-1.5">
                      <span className="text-4xl font-extrabold text-gray-900">{price.toLocaleString()}</span>
                      <span className="text-gray-500 font-medium">ر.س</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-0.5">شهراً</p>
                  </div>

                  {/* CTA */}
                  <Button
                    onClick={() => handleUpgrade(plan.id)}
                    className={`w-full mb-6 h-11 rounded-xl font-semibold text-sm ${
                      isActive
                        ? 'bg-green-600 hover:bg-green-700 shadow-sm shadow-green-200'
                        : plan.popular
                        ? 'bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200'
                        : ''
                    }`}
                    variant={isActive || plan.popular ? 'default' : 'outline'}
                  >
                    {isActive ? 'الخطة الحالية' : 'الاختيار'}
                  </Button>

                  {/* Features */}
                  <div className="space-y-2.5 flex-1">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center justify-end gap-2.5" dir="rtl">
                        <span className={`text-sm ${feature.included ? 'text-gray-800' : 'text-gray-400'}`}>
                          {feature.name}
                        </span>
                        {feature.included ? (
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-gray-300 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Invoice History */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4" dir="rtl">سجل الفواتير</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" dir="rtl">
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">التاريخ</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">الوصف</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">المبلغ</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">الحالة</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { date: '2026-03-15', desc: 'اشتراك احترافي - مارس', amount: 799, status: 'مدفوع' },
                  { date: '2026-02-15', desc: 'اشتراك احترافي - فبراير', amount: 799, status: 'مدفوع' },
                  { date: '2026-01-15', desc: 'اشتراك احترافي - يناير', amount: 799, status: 'مدفوع' },
                ].map((invoice, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50" dir="rtl">
                    <td className="py-3 px-4 text-gray-600">{invoice.date}</td>
                    <td className="py-3 px-4 text-gray-900 font-medium">{invoice.desc}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{invoice.amount} ر.س</td>
                    <td className="py-3 px-4">
                      <Badge className="bg-green-100 text-green-700 border-green-200">{invoice.status}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm">تحميل PDF</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
