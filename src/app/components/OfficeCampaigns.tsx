import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, Plus, Play, Pause, BarChart3, Target, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { mockCampaigns, mockListings } from '../lib/mock-data';
import { toast } from 'sonner';

export function OfficeCampaigns() {
  const navigate = useNavigate();
  const [campaignName, setCampaignName] = useState('');
  const [selectedListing, setSelectedListing] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateCampaign = () => {
    if (!campaignName || !selectedListing) {
      toast.error('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }
    toast.success('تم إنشاء الحملة بنجاح!');
    setCampaignName('');
    setSelectedListing('');
    setAudienceFilter('');
    setIsDialogOpen(false);
  };

  const handleToggleCampaign = (campaignId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    toast.success(`تم ${newStatus === 'active' ? 'تفعيل' : 'إيقاف'} الحملة`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/office/dashboard')}>
            <ArrowRight className="w-5 h-5 mr-2" />
            رجوع
          </Button>
          <h1 className="text-xl font-bold text-gray-900">الحملات التسويقية</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 ml-2" />
                حملة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
              <DialogHeader>
                <DialogTitle>إنشاء حملة تسويقية جديدة</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="campaign-name">اسم الحملة</Label>
                  <Input
                    id="campaign-name"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="مثال: حملة الفلل الفاخرة"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="listing-select">اختر العقار</Label>
                  <Select value={selectedListing} onValueChange={setSelectedListing}>
                    <SelectTrigger id="listing-select" className="mt-1">
                      <SelectValue placeholder="اختر عقار للترويج له" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockListings.slice(0, 5).map((listing) => (
                        <SelectItem key={listing.id} value={listing.id}>
                          {listing.property_type} - {listing.address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="audience-filter">استهداف الجمهور</Label>
                  <Textarea
                    id="audience-filter"
                    value={audienceFilter}
                    onChange={(e) => setAudienceFilter(e.target.value)}
                    placeholder="مثال: ميزانية 1-2 مليون، مدينة الرياض، 3+ غرف"
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-700">
                    💡 سيتم إرسال الحملة تلقائياً للعملاء المحتملين المطابقين للمعايير
                  </p>
                </div>
                <Button onClick={handleCreateCampaign} className="w-full">
                  إنشاء الحملة
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between" dir="rtl">
              <div>
                <p className="text-sm text-gray-600">إجمالي الحملات</p>
                <p className="text-3xl font-bold text-gray-900">{mockCampaigns.length}</p>
              </div>
              <Target className="w-10 h-10 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between" dir="rtl">
              <div>
                <p className="text-sm text-gray-600">الحملات النشطة</p>
                <p className="text-3xl font-bold text-green-600">
                  {mockCampaigns.filter(c => c.status === 'active').length}
                </p>
              </div>
              <Play className="w-10 h-10 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between" dir="rtl">
              <div>
                <p className="text-sm text-gray-600">إجمالي الوصول</p>
                <p className="text-3xl font-bold text-gray-900">
                  {mockCampaigns.reduce((sum, c) => sum + c.sent_count, 0)}
                </p>
              </div>
              <Users className="w-10 h-10 text-purple-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between" dir="rtl">
              <div>
                <p className="text-sm text-gray-600">إجمالي العملاء</p>
                <p className="text-3xl font-bold text-orange-600">
                  {mockCampaigns.reduce((sum, c) => sum + c.lead_count, 0)}
                </p>
              </div>
              <BarChart3 className="w-10 h-10 text-orange-500" />
            </div>
          </Card>
        </div>

        {/* Campaigns List */}
        <div className="space-y-4">
          {mockCampaigns.map((campaign) => {
            const listing = mockListings.find(l => l.id === campaign.listing_id);
            const clickRate = campaign.sent_count > 0 ? (campaign.click_count / campaign.sent_count) * 100 : 0;
            const conversionRate = campaign.click_count > 0 ? (campaign.lead_count / campaign.click_count) * 100 : 0;

            return (
              <Card key={campaign.id} className="p-6">
                <div className="flex items-start justify-between mb-4" dir="rtl">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">{campaign.name}</h3>
                      <Badge
                        className={
                          campaign.status === 'active'
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : campaign.status === 'paused'
                            ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                            : campaign.status === 'completed'
                            ? 'bg-blue-100 text-blue-700 border-blue-200'
                            : 'bg-gray-100 text-gray-700 border-gray-200'
                        }
                      >
                        {campaign.status === 'active' ? 'نشط' : campaign.status === 'paused' ? 'متوقف' : campaign.status === 'completed' ? 'مكتمل' : 'مسودة'}
                      </Badge>
                    </div>

                    {listing && (
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={listing.images[0]}
                          alt={listing.property_type}
                          className="w-16 h-16 rounded object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{listing.property_type}</p>
                          <p className="text-sm text-gray-600">{listing.address}</p>
                        </div>
                      </div>
                    )}

                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">الاستهداف:</span> {campaign.audience_filter}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        مجدول: {new Date(campaign.scheduled_at).toLocaleDateString('ar-SA')}
                      </p>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600">معدل النقر</span>
                          <span className="font-semibold text-gray-900">{clickRate.toFixed(1)}%</span>
                        </div>
                        <Progress value={clickRate} className="h-2" />
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600">معدل التحويل</span>
                          <span className="font-semibold text-gray-900">{conversionRate.toFixed(1)}%</span>
                        </div>
                        <Progress value={conversionRate} className="h-2" />
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 bg-blue-50 rounded">
                          <p className="text-xs text-gray-600">إرسال</p>
                          <p className="font-semibold text-blue-600">{campaign.sent_count}</p>
                        </div>
                        <div className="p-2 bg-purple-50 rounded">
                          <p className="text-xs text-gray-600">نقرات</p>
                          <p className="font-semibold text-purple-600">{campaign.click_count}</p>
                        </div>
                        <div className="p-2 bg-green-50 rounded">
                          <p className="text-xs text-gray-600">عملاء</p>
                          <p className="font-semibold text-green-600">{campaign.lead_count}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mr-4">
                    {campaign.status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleCampaign(campaign.id, campaign.status)}
                      >
                        <Pause className="w-4 h-4 ml-2" />
                        إيقاف
                      </Button>
                    )}
                    {campaign.status === 'paused' && (
                      <Button
                        size="sm"
                        onClick={() => handleToggleCampaign(campaign.id, campaign.status)}
                      >
                        <Play className="w-4 h-4 ml-2" />
                        تفعيل
                      </Button>
                    )}
                    {campaign.status === 'draft' && (
                      <Button size="sm">
                        <Play className="w-4 h-4 ml-2" />
                        بدء الحملة
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <BarChart3 className="w-4 h-4 ml-2" />
                      التقرير
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}

          {mockCampaigns.length === 0 && (
            <Card className="p-12 text-center">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2" dir="rtl">لا توجد حملات بعد</h3>
              <p className="text-gray-600 mb-4" dir="rtl">ابدأ بإنشاء حملة تسويقية لعقاراتك</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 ml-2" />
                إنشاء حملة
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
