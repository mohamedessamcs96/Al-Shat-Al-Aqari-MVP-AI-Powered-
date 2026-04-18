import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Save, Eye, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { offices as officesApi } from '../lib/api-client';
import { getUser, logout as authLogout } from '../lib/auth';

export function MiniPageEditor() {
  const navigate = useNavigate();
  const officeId = getUser()?.id || '';
  const [officeName, setOfficeName] = useState('');
  const [officeBio, setOfficeBio] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [savedChanges, setSavedChanges] = useState(true);

  useEffect(() => {
    if (!officeId) return;
    officesApi.getById(officeId)
      .then((data: any) => {
        setOfficeName(data.name ?? '');
        setOfficeBio(data.bio ?? '');
        setPhone(data.phone ?? '');
        setEmail(data.email ?? '');
        setWhatsapp(data.whatsapp ?? '');
        setAddress(data.address ?? '');
        setWebsiteUrl(data.website ?? '');
      })
      .catch(() => {});
  }, [officeId]);

  const handleSave = async () => {
    if (!officeId) { toast.error('الرجاء تسجيل الدخول'); return; }
    try {
      await officesApi.update(officeId, { name: officeName, bio: officeBio, phone, email, whatsapp, address, website: websiteUrl });
      toast.success('تم حفظ التغييرات بنجاح!');
      setSavedChanges(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ');
    }
  };

  const handlePreview = () => {
    const slug = officeId;
    window.open(`/office/${slug}`, '_blank');
  };

  const handlePublish = async () => {
    if (!officeId) return;
    try {
      await officesApi.publishPage(officeId);
      toast.success('تم نشر الصفحة! سيرى العملاء التغييرات الآن');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ');
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">
              <Settings className="w-4 h-4 ml-2" />
              المعلومات الأساسية
            </TabsTrigger>
            <TabsTrigger value="appearance">معلومات التواصل</TabsTrigger>
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
