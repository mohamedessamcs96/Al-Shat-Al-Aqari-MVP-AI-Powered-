import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Save, Eye, Code, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';

export function MiniPageEditor() {
  const navigate = useNavigate();
  const [officeName, setOfficeName] = useState('Prime Real Estate');
  const [officeBio, setOfficeBio] = useState('مكتب عقاري متخصص في بيع وشراء العقارات السكنية والتجارية');
  const [phone, setPhone] = useState('0550123456');
  const [email, setEmail] = useState('info@prime.com');
  const [whatsapp, setWhatsapp] = useState('0550123456');
  const [address, setAddress] = useState('الرياض، حي النرجس');
  const [websiteUrl, setWebsiteUrl] = useState('www.prime-real-estate.com');
  const [htmlContent, setHtmlContent] = useState('');
  const [savedChanges, setSavedChanges] = useState(true);

  const handleSave = () => {
    toast.success('تم حفظ التغييرات بنجاح!');
    setSavedChanges(true);
  };

  const handlePreview = () => {
    toast.success('تم فتح معاينة الصفحة في علامة تبويب جديدة');
    window.open('/office/prime-real-estate', '_blank');
  };

  const handlePublish = () => {
    toast.success('تم نشر الصفحة! سيرى العملاء التغييرات الآن');
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
          <h1 className="text-xl font-bold text-gray-900" dir="rtl">محرر صفحة المكتب</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="w-4 h-4 ml-2" />
              معاينة
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 ml-2" />
              حفظ
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {!savedChanges && (
          <Card className="p-4 mb-6 bg-yellow-50 border-yellow-200">
            <p className="text-sm text-yellow-700" dir="rtl">
              ⚠️ لديك تغييرات لم تُحفظ. تأكد من حفظ التغييرات قبل المغادرة.
            </p>
          </Card>
        )}

        <Tabs defaultValue="basic">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">
              <Settings className="w-4 h-4 ml-2" />
              المعلومات الأساسية
            </TabsTrigger>
            <TabsTrigger value="appearance">معلومات التواصل</TabsTrigger>
            <TabsTrigger value="html">HTML مخصص</TabsTrigger>
          </TabsList>

          {/* Basic Information */}
          <TabsContent value="basic" className="space-y-6 mt-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4" dir="rtl">معلومات المكتب</h2>
              <div className="space-y-4" dir="rtl">
                <div>
                  <Label htmlFor="office-name">اسم المكتب</Label>
                  <Input
                    id="office-name"
                    value={officeName}
                    onChange={(e) => {
                      setOfficeName(e.target.value);
                      setSavedChanges(false);
                    }}
                    className="mt-1"
                    dir="rtl"
                  />
                </div>

                <div>
                  <Label htmlFor="office-bio">نبذة عن المكتب</Label>
                  <Textarea
                    id="office-bio"
                    value={officeBio}
                    onChange={(e) => {
                      setOfficeBio(e.target.value);
                      setSavedChanges(false);
                    }}
                    rows={4}
                    className="mt-1"
                    dir="rtl"
                  />
                </div>

                <div>
                  <Label htmlFor="address">العنوان</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      setSavedChanges(false);
                    }}
                    className="mt-1"
                    dir="rtl"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4" dir="rtl">الصورة الشخصية</h2>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
                  PR
                </div>
                <div>
                  <Button variant="outline">تحميل صورة</Button>
                  <p className="text-xs text-gray-500 mt-2">الحد الأقصى 5 MB، JPG أو PNG</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Contact Information */}
          <TabsContent value="appearance" className="space-y-6 mt-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4" dir="rtl">معلومات التواصل</h2>
              <div className="space-y-4" dir="rtl">
                <div>
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setSavedChanges(false);
                    }}
                    className="mt-1"
                    dir="rtl"
                  />
                </div>

                <div>
                  <Label htmlFor="whatsapp">رقم واتس أب</Label>
                  <Input
                    id="whatsapp"
                    value={whatsapp}
                    onChange={(e) => {
                      setWhatsapp(e.target.value);
                      setSavedChanges(false);
                    }}
                    className="mt-1"
                    dir="rtl"
                  />
                </div>

                <div>
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setSavedChanges(false);
                    }}
                    className="mt-1"
                    dir="rtl"
                  />
                </div>

                <div>
                  <Label htmlFor="website">موقع الويب (اختياري)</Label>
                  <Input
                    id="website"
                    value={websiteUrl}
                    onChange={(e) => {
                      setWebsiteUrl(e.target.value);
                      setSavedChanges(false);
                    }}
                    className="mt-1"
                    dir="rtl"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4" dir="rtl">وسائل التواصل الاجتماعي</h2>
              <div className="space-y-4" dir="rtl">
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input id="instagram" placeholder="@yourhandle" className="mt-1" dir="rtl" />
                </div>
                <div>
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input id="twitter" placeholder="@yourhandle" className="mt-1" dir="rtl" />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input id="linkedin" placeholder="company-name" className="mt-1" dir="rtl" />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Custom HTML */}
          <TabsContent value="html" className="space-y-6 mt-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Code className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900" dir="rtl">HTML مخصص</h2>
                <Badge className="bg-purple-100 text-purple-700 border-purple-200">للمستخدمين المتقدمين</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-4" dir="rtl">
                أضف HTML مخصص لتخصيص صفحتك بالكامل. يمكنك استخدام CSS و JavaScript محدود.
              </p>
              <Textarea
                value={htmlContent}
                onChange={(e) => {
                  setHtmlContent(e.target.value);
                  setSavedChanges(false);
                }}
                placeholder="أدخل HTML مخصص هنا..."
                rows={12}
                className="font-mono text-sm"
                dir="ltr"
              />
              <p className="text-xs text-gray-500 mt-2" dir="rtl">
                ملاحظة: سيتم فحص الكود للأمان. لا يُسمح بـ JavaScript الخطر أو عناصر غير آمنة.
              </p>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8 justify-center">
          <Button variant="outline" onClick={() => navigate('/office/dashboard')}>
            إلغاء
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 ml-2" />
            حفظ التغييرات
          </Button>
          <Button onClick={handlePublish} className="bg-green-600 hover:bg-green-700">
            نشر الصفحة
          </Button>
        </div>
      </div>
    </div>
  );
}
