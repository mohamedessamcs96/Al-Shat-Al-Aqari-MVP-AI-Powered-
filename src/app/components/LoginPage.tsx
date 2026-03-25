import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  Building2, User, Mail, Lock, Phone, ShieldCheck,
  ChevronLeft, MapPin, Bot, MessageSquare, UserPlus,
  LogIn, ArrowLeft, Eye, EyeOff, AlertTriangle,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';

type Role = 'buyer' | 'office';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminRoute = location.pathname === '/admin/login';

  const [activeRole, setActiveRole] = useState<Role | null>(null);

  // Buyer
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerName, setBuyerName] = useState('');
  // Office
  const [officeEmail, setOfficeEmail] = useState('');
  const [officePassword, setOfficePassword] = useState('');
  const [showOfficePass, setShowOfficePass] = useState(false);
  const [registerOfficeName, setRegisterOfficeName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [showRegisterPass, setShowRegisterPass] = useState(false);
  // Admin
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);

  const handleBuyerLogin = () => {
    if (!buyerPhone) { toast.error('الرجاء إدخال رقم الهاتف'); return; }
    toast.success('تم تسجيل الدخول بنجاح!');
    navigate('/chat');
  };

  const handleBuyerRegister = () => {
    if (!buyerName || !buyerPhone) { toast.error('الرجاء ملء جميع الحقول'); return; }
    toast.success('تم إنشاء حسابك بنجاح! مرحباً بك');
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
      icon: <User className="w-6 h-6 text-blue-600" />,
      iconBg: 'bg-blue-50',
      title: 'دخول العملاء',
      desc: 'ابحث عن عقارك المثالي',
      hoverBorder: 'hover:border-blue-400',
      hoverBg: 'hover:bg-blue-50/40',
      activeBorder: 'border-blue-400',
      activeBg: 'bg-blue-50/40',
    },
    {
      id: 'office' as Role,
      icon: <Building2 className="w-6 h-6 text-indigo-600" />,
      iconBg: 'bg-indigo-50',
      title: 'المكاتب العقارية',
      desc: 'إدارة وتسويق عقاراتك',
      hoverBorder: 'hover:border-indigo-400',
      hoverBg: 'hover:bg-indigo-50/40',
      activeBorder: 'border-indigo-400',
      activeBg: 'bg-indigo-50/40',
    },
  ];

  // ── Admin-only route view ──
  if (isAdminRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 ring-1 ring-red-500/30 mb-4">
              <ShieldCheck className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">لوحة الإدارة</h1>
            <p className="text-slate-400 text-sm mt-1">وصول مقتصر على المسؤولين</p>
          </div>
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-7 space-y-5">
            <div className="rounded-xl bg-red-950/40 border border-red-900/40 p-3 flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-xs text-red-400">هذه الصفحة مخصصة للمسؤولين فقط</p>
            </div>
            <FieldWithIcon icon={<Lock className="w-4 h-4 text-slate-500" />} className="bg-slate-800 border-slate-700">
              <Input
                type={showAdminPass ? 'text' : 'password'}
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                placeholder="كلمة المرور"
                className="pr-10 pl-10 text-right rounded-xl bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-red-500"
                dir="rtl"
              />
              <button
                type="button"
                onClick={() => setShowAdminPass((v) => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </FieldWithIcon>
            <p className="text-xs text-slate-500 text-right -mt-2">للاختبار: admin123</p>
            <Button
              onClick={handleAdminLogin}
              className="w-full bg-red-600 hover:bg-red-700 rounded-xl h-11 font-semibold shadow-lg shadow-red-900/30"
            >
              <ShieldCheck className="w-4 h-4 ml-2" />
              دخول الإدارة
            </Button>
            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center justify-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors pt-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              العودة للصفحة الرئيسية
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left Hero Panel ── */}
      <div
        className="hidden lg:flex w-1/2 xl:w-[58%] flex-col justify-between p-12 xl:p-16 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg,#0a0f1e 0%,#0e2057 45%,#1a1060 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-purple-700/10 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        {/* Top content */}
        <div className="relative z-10" dir="rtl">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20 flex items-center justify-center shadow-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">الشات العقاري</span>
          </div>

          {/* Headline */}
          <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-5">
            ابحث عن عقارك المثالي
            <br />
            <span className="text-blue-300">بمساعدة الذكاء الاصطناعي</span>
          </h2>
          <p className="text-slate-300 text-lg mb-12 leading-relaxed max-w-md">
            منصة عقارية ذكية تربط المشترين بأفضل المكاتب العقارية في المملكة
          </p>

          {/* Features */}
          <div className="space-y-5">
            {[
              { Icon: Bot, title: 'مساعد ذكي', desc: 'يفهم احتياجاتك ويقترح العقارات المناسبة', color: 'text-blue-400' },
              { Icon: Building2, title: 'آلاف العقارات', desc: 'من مكاتب موثوقة في جميع المدن السعودية', color: 'text-indigo-400' },
              { Icon: MessageSquare, title: 'تفاوض مباشر', desc: 'تواصل وتفاوض مع أصحاب العقارات بسهولة', color: 'text-purple-400' },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/8 ring-1 ring-white/10 flex items-center justify-center shrink-0">
                  <f.Icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{f.title}</p>
                  <p className="text-slate-400 text-sm mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 grid grid-cols-3 gap-3" dir="rtl">
          {[
            { value: '500+', label: 'مكتب عقاري', Icon: Building2 },
            { value: '10K+', label: 'عقار متاح', Icon: MapPin },
            { value: '50K+', label: 'مستخدم نشط', Icon: User },
          ].map(({ value, label, Icon }) => (
            <div key={label} className="rounded-2xl bg-white/8 backdrop-blur-sm border border-white/10 p-4 text-center">
              <Icon className="w-4 h-4 text-blue-300 mx-auto mb-2" />
              <p className="text-xl font-bold text-white">{value}</p>
              <p className="text-blue-200/60 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Forms Panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 mb-4 shadow-lg shadow-blue-500/30">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900" dir="rtl">الشات العقاري</h1>
            <p className="text-gray-500 text-sm mt-1" dir="rtl">منصة البحث الذكي عن العقارات</p>
          </div>

          {/* Desktop welcome */}
          <div className="hidden lg:block mb-8" dir="rtl">
            <h2 className="text-2xl font-bold text-gray-900">مرحباً بك</h2>
            <p className="text-gray-500 mt-1">اختر طريقة الدخول للمتابعة</p>
          </div>

          {/* ── Role Selector ── */}
          {!activeRole && (
            <div className="space-y-3">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setActiveRole(role.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-200 ${role.hoverBorder} ${role.hoverBg}`}
                  dir="rtl"
                >
                  <div className={`${role.iconBg} p-3 rounded-xl shrink-0`}>{role.icon}</div>
                  <div className="text-right flex-1">
                    <p className="font-bold text-gray-900">{role.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{role.desc}</p>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-gray-300 shrink-0" />
                </button>
              ))}

              {/* Guest browse */}
              <div className="pt-1">
                <button
                  onClick={() => navigate('/chat')}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm text-gray-500 hover:text-blue-600 transition-colors rounded-xl hover:bg-blue-50/60 border border-dashed border-gray-200 hover:border-blue-200"
                >
                  <Bot className="w-4 h-4" />
                  تصفح بدون تسجيل
                </button>
              </div>
            </div>
          )}

          {/* ── Buyer Form ── */}
          {activeRole === 'buyer' && (
            <FormCard>
              <BackButton onClick={() => setActiveRole(null)} />
              <FormHeader
                icon={<User className="w-6 h-6 text-blue-600" />}
                bg="bg-blue-50"
                title="دخول العملاء"
                desc="ابدأ رحلة البحث عن عقارك"
              />
              <Tabs defaultValue="login">
                <TabsList className="grid w-full grid-cols-2 mb-5">
                  <TabsTrigger value="login" className="gap-1.5">
                    <LogIn className="w-3.5 h-3.5" />
                    دخول
                  </TabsTrigger>
                  <TabsTrigger value="register" className="gap-1.5">
                    <UserPlus className="w-3.5 h-3.5" />
                    حساب جديد
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <FieldWithIcon icon={<Phone className="w-4 h-4 text-gray-400" />}>
                    <Input
                      id="buyer-phone"
                      type="tel"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      placeholder="05xxxxxxxx"
                      className="pr-10 text-right rounded-xl"
                      dir="rtl"
                    />
                  </FieldWithIcon>
                  <Button
                    onClick={handleBuyerLogin}
                    className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-11 font-semibold shadow-sm shadow-blue-500/25 gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    دخول سريع
                  </Button>
                  <Divider />
                  <button
                    onClick={() => navigate('/chat')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-gray-500 hover:text-blue-600 transition-colors rounded-xl hover:bg-blue-50/60"
                  >
                    <Bot className="w-4 h-4" />
                    تصفح بدون تسجيل
                  </button>
                </TabsContent>

                <TabsContent value="register" className="space-y-4">
                  <FieldWithIcon icon={<User className="w-4 h-4 text-gray-400" />}>
                    <Input
                      type="text"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      placeholder="الاسم الكامل"
                      className="pr-10 text-right rounded-xl"
                      dir="rtl"
                    />
                  </FieldWithIcon>
                  <FieldWithIcon icon={<Phone className="w-4 h-4 text-gray-400" />}>
                    <Input
                      type="tel"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      placeholder="05xxxxxxxx"
                      className="pr-10 text-right rounded-xl"
                      dir="rtl"
                    />
                  </FieldWithIcon>
                  <Button
                    onClick={handleBuyerRegister}
                    className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-11 font-semibold shadow-sm shadow-blue-500/25 gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    إنشاء حساب
                  </Button>
                  <p className="text-xs text-center text-gray-400">بالتسجيل، أنت توافق على شروط الخدمة</p>
                </TabsContent>
              </Tabs>
            </FormCard>
          )}

          {/* ── Office Form ── */}
          {activeRole === 'office' && (
            <FormCard>
              <BackButton onClick={() => setActiveRole(null)} />
              <FormHeader
                icon={<Building2 className="w-6 h-6 text-indigo-600" />}
                bg="bg-indigo-50"
                title="المكاتب العقارية"
                desc="دخول وإدارة مكتبك"
              />
              <Tabs defaultValue="login">
                <TabsList className="grid w-full grid-cols-2 mb-5">
                  <TabsTrigger value="login" className="gap-1.5">
                    <LogIn className="w-3.5 h-3.5" />
                    دخول
                  </TabsTrigger>
                  <TabsTrigger value="register" className="gap-1.5">
                    <UserPlus className="w-3.5 h-3.5" />
                    تسجيل جديد
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="login" className="space-y-4">
                  <FieldWithIcon icon={<Mail className="w-4 h-4 text-gray-400" />}>
                    <Input
                      type="email"
                      value={officeEmail}
                      onChange={(e) => setOfficeEmail(e.target.value)}
                      placeholder="office@example.com"
                      className="pr-10 text-right rounded-xl"
                      dir="rtl"
                    />
                  </FieldWithIcon>
                  <FieldWithIcon icon={<Lock className="w-4 h-4 text-gray-400" />}>
                    <Input
                      type={showOfficePass ? 'text' : 'password'}
                      value={officePassword}
                      onChange={(e) => setOfficePassword(e.target.value)}
                      placeholder="••••••••"
                      className="pr-10 pl-10 text-right rounded-xl"
                      dir="rtl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOfficePass((v) => !v)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showOfficePass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </FieldWithIcon>
                  <Button
                    onClick={handleOfficeLogin}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl h-11 font-semibold shadow-sm shadow-indigo-500/25 gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    دخول المكتب
                  </Button>
                  <Button variant="link" className="w-full text-sm text-gray-400 h-fit py-1">نسيت كلمة المرور؟</Button>
                </TabsContent>
                <TabsContent value="register" className="space-y-3">
                  <FieldWithIcon icon={<Building2 className="w-4 h-4 text-gray-400" />}>
                    <Input
                      value={registerOfficeName}
                      onChange={(e) => setRegisterOfficeName(e.target.value)}
                      placeholder="اسم المكتب"
                      className="pr-10 text-right rounded-xl"
                      dir="rtl"
                    />
                  </FieldWithIcon>
                  <FieldWithIcon icon={<Mail className="w-4 h-4 text-gray-400" />}>
                    <Input
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="البريد الإلكتروني"
                      className="pr-10 text-right rounded-xl"
                      dir="rtl"
                    />
                  </FieldWithIcon>
                  <FieldWithIcon icon={<Phone className="w-4 h-4 text-gray-400" />}>
                    <Input
                      type="tel"
                      value={registerPhone}
                      onChange={(e) => setRegisterPhone(e.target.value)}
                      placeholder="رقم الهاتف"
                      className="pr-10 text-right rounded-xl"
                      dir="rtl"
                    />
                  </FieldWithIcon>
                  <FieldWithIcon icon={<Lock className="w-4 h-4 text-gray-400" />}>
                    <Input
                      type={showRegisterPass ? 'text' : 'password'}
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="كلمة المرور"
                      className="pr-10 pl-10 text-right rounded-xl"
                      dir="rtl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPass((v) => !v)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showRegisterPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </FieldWithIcon>
                  <Button
                    onClick={handleOfficeRegister}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl h-11 font-semibold shadow-sm shadow-indigo-500/25 gap-2 mt-1"
                  >
                    <UserPlus className="w-4 h-4" />
                    إنشاء حساب مكتب
                  </Button>
                  <p className="text-xs text-center text-gray-400 pt-1">بالتسجيل، أنت توافق على شروط الخدمة</p>
                </TabsContent>
              </Tabs>
            </FormCard>
          )}
        </div>
      </div>
    </div>
  );
}

function FormCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 p-7 border border-gray-100">
      {children}
    </div>
  );
}

function FormHeader({ icon, bg, title, desc }: { icon: React.ReactNode; bg: string; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-4 mb-7" dir="rtl">
      <div className={`${bg} p-3 rounded-2xl shrink-0`}>{icon}</div>
      <div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

function FieldWithIcon({
  icon,
  children,
  className,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="relative">
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">{icon}</div>
      {children}
    </div>
  );
}

function Divider() {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
      <div className="relative flex justify-center text-xs"><span className="px-3 bg-white text-gray-400">أو</span></div>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 mb-5 transition-colors">
      <ChevronLeft className="w-4 h-4" />
      رجوع
    </button>
  );
}

