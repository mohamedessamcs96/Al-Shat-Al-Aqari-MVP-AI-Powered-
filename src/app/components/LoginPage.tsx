import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Building2, User, Mail, Lock, Phone, ShieldAlert, ArrowRight, ChevronLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';

type Role = 'buyer' | 'office' | 'admin';

export function LoginPage() {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState<Role | null>(null);

  // Buyer
  const [buyerPhone, setBuyerPhone] = useState('');
  // Office
  const [officeEmail, setOfficeEmail] = useState('');
  const [officePassword, setOfficePassword] = useState('');
  const [registerOfficeName, setRegisterOfficeName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  // Admin
  const [adminPassword, setAdminPassword] = useState('');

  const handleBuyerLogin = () => {
    if (!buyerPhone) { toast.error('الرجاء إدخال رقم الهاتف'); return; }
    toast.success('تم تسجيل الدخول بنجاح!');
    navigate('/chat');
  };

  const handleOfficeLogin = () => {
    if (!officeEmail || !officePassword) { toast.error('الرجاء ملء جميع الحقول'); return; }
    toast.success('مرحباً بك في لوحة التحكم!');
    navigate('/office/dashboard');
  };

  const handleOfficeRegister = () => {
    if (!registerOfficeName || !registerEmail || !registerPhone || !registerPassword) {
      toast.error('الرجاء ملء جميع الحقول'); return;
    }
    toast.success('تم إنشاء الحساب بنجاح! مرحباً بك في الشات العقاري');
    navigate('/office/dashboard');
  };

  const handleAdminLogin = () => {
    if (!adminPassword) { toast.error('الرجاء إدخال كلمة المرور'); return; }
    if (adminPassword === 'admin123') {
      toast.success('مرحباً بك في لوحة تحكم المنصة!');
      navigate('/admin/dashboard');
    } else {
      toast.error('كلمة المرور غير صحيحة');
    }
  };

  const roles = [
    {
      id: 'buyer' as Role,
      icon: <User className="w-8 h-8 text-blue-600" />,
      iconBg: 'bg-blue-100',
      title: 'دخول العملاء',
      desc: 'ابحث عن عقارك المثالي بمساعدة الذكاء الاصطناعي',
      accent: 'hover:border-blue-400 hover:shadow-blue-100',
    },
    {
      id: 'office' as Role,
      icon: <Building2 className="w-8 h-8 text-indigo-600" />,
      iconBg: 'bg-indigo-100',
      title: 'المكاتب العقارية',
      desc: 'سجل مكتبك وابدأ في الوصول لآلاف العملاء',
      accent: 'hover:border-indigo-400 hover:shadow-indigo-100',
    },
    {
      id: 'admin' as Role,
      icon: <ShieldAlert className="w-8 h-8 text-red-600" />,
      iconBg: 'bg-red-100',
      title: 'لوحة الإدارة',
      desc: 'إدارة المنصة والتحليلات والامتثال',
      accent: 'hover:border-red-400 hover:shadow-red-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-2xl mb-4">
            <Building2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1" dir="rtl">الشات العقاري</h1>
          <p className="text-gray-500" dir="rtl">منصة البحث الذكي عن العقارات</p>
        </div>

        {/* Role selector */}
        {!activeRole && (
          <Card className="p-6">
            <p className="text-center text-gray-600 mb-5 font-medium" dir="rtl">كيف تريد الدخول؟</p>
            <div className="space-y-3">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setActiveRole(role.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 bg-white transition-all duration-200 shadow-sm hover:shadow-md ${role.accent}`}
                  dir="rtl"
                >
                  <div className={`${role.iconBg} p-2.5 rounded-full shrink-0`}>{role.icon}</div>
                  <div className="text-right flex-1">
                    <p className="font-bold text-gray-900">{role.title}</p>
                    <p className="text-sm text-gray-500">{role.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 shrink-0 rotate-180" />
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Buyer form */}
        {activeRole === 'buyer' && (
          <Card className="p-6">
            <BackButton onClick={() => setActiveRole(null)} />
            <div className="text-center mb-6">
              <div className="inline-block bg-blue-100 p-3 rounded-full mb-3">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900" dir="rtl">دخول العملاء</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="buyer-phone" className="text-right block">رقم الهاتف</Label>
                <div className="relative mt-1">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="buyer-phone"
                    type="tel"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="05xxxxxxxx"
                    className="pr-10 text-right"
                    dir="rtl"
                  />
                </div>
              </div>
              <Button onClick={handleBuyerLogin} className="w-full bg-blue-600 hover:bg-blue-700">
                دخول سريع
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-400">أو</span>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={() => navigate('/chat')}>
                تصفح بدون تسجيل
              </Button>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700 text-center" dir="rtl">
                  💬 ابدأ الدردشة مع المساعد الذكي للبحث عن عقارك
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Office form */}
        {activeRole === 'office' && (
          <Card className="p-6">
            <BackButton onClick={() => setActiveRole(null)} />
            <div className="text-center mb-6">
              <div className="inline-block bg-indigo-100 p-3 rounded-full mb-3">
                <Building2 className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900" dir="rtl">المكاتب العقارية</h2>
            </div>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">دخول</TabsTrigger>
                <TabsTrigger value="register">تسجيل جديد</TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="office-email" className="text-right block">البريد الإلكتروني</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input id="office-email" type="email" value={officeEmail}
                      onChange={(e) => setOfficeEmail(e.target.value)}
                      placeholder="office@example.com" className="pr-10 text-right" dir="rtl" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="office-password" className="text-right block">كلمة المرور</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input id="office-password" type="password" value={officePassword}
                      onChange={(e) => setOfficePassword(e.target.value)}
                      placeholder="••••••••" className="pr-10 text-right" dir="rtl" />
                  </div>
                </div>
                <Button onClick={handleOfficeLogin} className="w-full bg-indigo-600 hover:bg-indigo-700">
                  دخول المكتب
                </Button>
                <Button variant="link" className="w-full text-sm">نسيت كلمة المرور؟</Button>
              </TabsContent>
              <TabsContent value="register" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="register-name" className="text-right block">اسم المكتب</Label>
                  <Input id="register-name" value={registerOfficeName}
                    onChange={(e) => setRegisterOfficeName(e.target.value)}
                    placeholder="مكتب العقارات المتميز" className="mt-1 text-right" dir="rtl" />
                </div>
                <div>
                  <Label htmlFor="register-email" className="text-right block">البريد الإلكتروني</Label>
                  <Input id="register-email" type="email" value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="office@example.com" className="mt-1 text-right" dir="rtl" />
                </div>
                <div>
                  <Label htmlFor="register-phone" className="text-right block">رقم الهاتف</Label>
                  <Input id="register-phone" type="tel" value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                    placeholder="05xxxxxxxx" className="mt-1 text-right" dir="rtl" />
                </div>
                <div>
                  <Label htmlFor="register-password" className="text-right block">كلمة المرور</Label>
                  <Input id="register-password" type="password" value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="••••••••" className="mt-1 text-right" dir="rtl" />
                </div>
                <Button onClick={handleOfficeRegister} className="w-full bg-indigo-600 hover:bg-indigo-700">
                  إنشاء حساب مكتب
                </Button>
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <p className="text-xs text-indigo-700 text-center" dir="rtl">
                    بالتسجيل، أنت توافق على شروط الخدمة وسياسة الخصوصية
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        )}

        {/* Admin form */}
        {activeRole === 'admin' && (
          <Card className="p-6">
            <BackButton onClick={() => setActiveRole(null)} />
            <div className="text-center mb-6">
              <div className="inline-block bg-red-100 p-3 rounded-full mb-3">
                <ShieldAlert className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900" dir="rtl">لوحة الإدارة</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="admin-password" className="text-right block">كلمة المرور</Label>
                <div className="relative mt-1">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input id="admin-password" type="password" value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••" className="pr-10 text-right" dir="rtl" />
                </div>
                <p className="text-xs text-gray-400 mt-1 text-right" dir="rtl">للاختبار: admin123</p>
              </div>
              <Button onClick={handleAdminLogin} className="w-full bg-red-600 hover:bg-red-700">
                دخول الإدارة
              </Button>
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-sm text-red-700 text-center" dir="rtl">
                  ⚠️ وصول مقتصر على المسؤولين فقط
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4 transition-colors"
    >
      <ChevronLeft className="w-4 h-4" />
      رجوع
    </button>
  );
}
