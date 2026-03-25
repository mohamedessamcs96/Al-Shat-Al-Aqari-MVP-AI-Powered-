import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Check, X, CreditCard, AlertCircle, Calendar, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';

export function OfficeSubscription() {
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState('professional');
  const [billingCycle, setBillingCycle] = useState('monthly');

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

  const handleUpgrade = (planId: string) => {
    setCurrentPlan(planId);
    toast.success(`تم الترقية إلى خطة ${plans.find(p => p.id === planId)?.name}!`);
  };

  const handleCancelSubscription = () => {
    toast.success('تم إلغاء الاشتراك. سيتم إنهاء الخدمة في نهاية الدورة الحالية.');
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
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
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
                  <p className="text-lg font-bold text-gray-900">15 ابريل 2026</p>
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
                <Button variant="outline" onClick={handleCancelSubscription} className="text-red-600 hover:bg-red-50">
                  إلغاء الاشتراك
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900" dir="rtl">خطط الاشتراك</h2>
            <div className="flex gap-2">
              <Button
                variant={billingCycle === 'monthly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setBillingCycle('monthly')}
              >
                شهري
              </Button>
              <Button
                variant={billingCycle === 'annual' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setBillingCycle('annual')}
              >
                سنوي
                <Badge className="ml-2 bg-green-100 text-green-700 border-green-200">توفير 16%</Badge>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`p-6 relative ${plan.popular ? 'border-2 border-blue-600 shadow-lg' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute top-4 right-4 bg-blue-600">الأكثر شيوعاً</Badge>
                )}

                <h3 className="text-xl font-bold text-gray-900 mb-2" dir="rtl">{plan.name}</h3>
                <p className="text-sm text-gray-600 mb-4" dir="rtl">{plan.description}</p>

                <div className="mb-6">
                  <div className="text-3xl font-bold text-gray-900">
                    {billingCycle === 'monthly' ? plan.monthlyPrice : Math.round(plan.annualPrice / 12)}
                    <span className="text-lg text-gray-600 ml-1">ر.س</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1" dir="rtl">
                    {billingCycle === 'monthly' ? 'شهراً' : 'شهراً (بالسنة)'}
                  </p>
                </div>

                <Button
                  onClick={() => handleUpgrade(plan.id)}
                  className={`w-full mb-6 ${
                    currentPlan === plan.id
                      ? 'bg-green-600 hover:bg-green-700'
                      : plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : ''
                  }`}
                  variant={currentPlan === plan.id ? 'default' : plan.popular ? 'default' : 'outline'}
                >
                  {currentPlan === plan.id ? 'الخطة الحالية' : 'الاختيار'}
                </Button>

                <div className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
                      )}
                      <span className={feature.included ? 'text-gray-900' : 'text-gray-400'} dir="rtl">
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
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
