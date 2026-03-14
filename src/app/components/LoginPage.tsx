import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Building2, User, Mail, Lock, Phone } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';

export function LoginPage() {
  const navigate = useNavigate();
  const [buyerPhone, setBuyerPhone] = useState('');
  const [officeEmail, setOfficeEmail] = useState('');
  const [officePassword, setOfficePassword] = useState('');
  const [registerOfficeName, setRegisterOfficeName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const handleBuyerLogin = () => {
    if (!buyerPhone) {
      toast.error('الرجاء إدخال رقم الهاتف');
      return;
    }
    toast.success('تم تسجيل الدخول بنجاح!');
    navigate('/chat');
  };

  const handleOfficeLogin = () => {
    if (!officeEmail || !officePassword) {
      toast.error('الرجاء ملء جميع الحقول');
      return;
    }
    toast.success('مرحباً بك في لوحة التحكم!');
    navigate('/office/dashboard');
  };

  const handleOfficeRegister = () => {
    if (!registerOfficeName || !registerEmail || !registerPhone || !registerPassword) {
      toast.error('الرجاء ملء جميع الحقول');
      return;
    }
    toast.success('تم إنشاء الحساب بنجاح! مرحباً بك في الشات العقاري');
    navigate('/office/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-2xl mb-4">
            <Building2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2" dir="rtl"></h1>
          <p className="text-gray-600" dir="rtl">منصة البحث الذكي عن العقارات</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Buyer Login */}
          <Card className="p-8">
            <div className="text-center mb-6">
              <div className="inline-block bg-blue-100 p-3 rounded-full mb-3">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900" dir="rtl">دخول العملاء</h2>
              <p className="text-sm text-gray-600 mt-2" dir="rtl">
                ابحث عن عقارك المثالي بمساعدة الذكاء الاصطناعي
              </p>
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
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">أو</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/chat')}
              >
                تصفح بدون تسجيل
              </Button>

              <div className="bg-blue-50 p-4 rounded-lg mt-4">
                <p className="text-sm text-blue-700 text-center" dir="rtl">
                  💬 ابدأ الدردشة مع المساعد الذكي للبحث عن عقارك
                </p>
              </div>
            </div>
          </Card>

          {/* Office Login/Register */}
          <Card className="p-8">
            <div className="text-center mb-6">
              <div className="inline-block bg-indigo-100 p-3 rounded-full mb-3">
                <Building2 className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900" dir="rtl">المكاتب العقارية</h2>
              <p className="text-sm text-gray-600 mt-2" dir="rtl">
                سجل مكتبك وابدأ في الوصول لآلاف العملاء
              </p>
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
                    <Input
                      id="office-email"
                      type="email"
                      value={officeEmail}
                      onChange={(e) => setOfficeEmail(e.target.value)}
                      placeholder="office@example.com"
                      className="pr-10 text-right"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="office-password" className="text-right block">كلمة المرور</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="office-password"
                      type="password"
                      value={officePassword}
                      onChange={(e) => setOfficePassword(e.target.value)}
                      placeholder="••••••••"
                      className="pr-10 text-right"
                      dir="rtl"
                    />
                  </div>
                </div>

                <Button onClick={handleOfficeLogin} className="w-full bg-indigo-600 hover:bg-indigo-700">
                  دخول المكتب
                </Button>

                <Button variant="link" className="w-full text-sm">
                  نسيت كلمة المرور؟
                </Button>
              </TabsContent>

              <TabsContent value="register" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="register-name" className="text-right block">اسم المكتب</Label>
                  <Input
                    id="register-name"
                    value={registerOfficeName}
                    onChange={(e) => setRegisterOfficeName(e.target.value)}
                    placeholder="مكتب العقارات المتميز"
                    className="mt-1 text-right"
                    dir="rtl"
                  />
                </div>

                <div>
                  <Label htmlFor="register-email" className="text-right block">البريد الإلكتروني</Label>
                  <Input
                    id="register-email"
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="office@example.com"
                    className="mt-1 text-right"
                    dir="rtl"
                  />
                </div>

                <div>
                  <Label htmlFor="register-phone" className="text-right block">رقم الهاتف</Label>
                  <Input
                    id="register-phone"
                    type="tel"
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                    placeholder="05xxxxxxxx"
                    className="mt-1 text-right"
                    dir="rtl"
                  />
                </div>

                <div>
                  <Label htmlFor="register-password" className="text-right block">كلمة المرور</Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1 text-right"
                    dir="rtl"
                  />
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
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card className="p-6 text-center">
            <div className="text-4xl mb-2">🤖</div>
            <h3 className="font-semibold text-gray-900 mb-1" dir="rtl">بحث ذكي</h3>
            <p className="text-sm text-gray-600" dir="rtl">مساعد ذكاء اصطناعي يفهم متطلباتك</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-4xl mb-2">🏘️</div>
            <h3 className="font-semibold text-gray-900 mb-1" dir="rtl">آلاف العقارات</h3>
            <p className="text-sm text-gray-600" dir="rtl">مجموعة ضخمة من العقارات المتنوعة</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-4xl mb-2">⚡</div>
            <h3 className="font-semibold text-gray-900 mb-1" dir="rtl">تواصل مباشر</h3>
            <p className="text-sm text-gray-600" dir="rtl">تواصل فوري مع المكاتب العقارية</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
