import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Phone, Mail, MessageSquare, Filter, Search, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { mockDemandRequests, getCityName, formatPrice } from '../lib/mock-data';
import { toast } from 'sonner';

export function OfficeLeads() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [selectedLead, setSelectedLead] = useState<string | null>(null);

  const handleRespond = () => {
    if (!responseMessage.trim()) {
      toast.error('الرجاء كتابة رسالة');
      return;
    }
    toast.success('تم إرسال الرد بنجاح!');
    setResponseMessage('');
    setSelectedLead(null);
  };

  const filteredLeads = mockDemandRequests.filter(lead =>
    lead.buyer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.property_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/office/dashboard')}>
            <ArrowLeft className="w-5 h-5 ml-2" />
            رجوع
          </Button>
          <h1 className="text-xl font-bold text-gray-900">إدارة العملاء المحتملين</h1>
          <div className="w-20" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-gray-600" dir="rtl">إجمالي العملاء</p>
            <p className="text-2xl font-bold text-gray-900">{mockDemandRequests.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600" dir="rtl">عملاء جدد</p>
            <p className="text-2xl font-bold text-green-600">
              {mockDemandRequests.filter(l => l.validation_status === 'pending').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600" dir="rtl">عملاء عاجلون</p>
            <p className="text-2xl font-bold text-red-600">
              {mockDemandRequests.filter(l => l.intent_level === 'urgent').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600" dir="rtl">معدل الاستجابة</p>
            <p className="text-2xl font-bold text-blue-600">85%</p>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="p-4 mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن عميل أو نوع عقار..."
                className="pl-10 text-right"
                dir="rtl"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 ml-2" />
              تصفية
            </Button>
          </div>
        </Card>

        {/* Leads Tabs */}
        <Tabs defaultValue="all">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="all">الكل ({mockDemandRequests.length})</TabsTrigger>
            <TabsTrigger value="new">
              جديد ({mockDemandRequests.filter(l => l.validation_status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="urgent">
              عاجل ({mockDemandRequests.filter(l => l.intent_level === 'urgent').length})
            </TabsTrigger>
            <TabsTrigger value="responded">تم الرد</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="space-y-4">
              {filteredLeads.map((lead) => (
                <Card key={lead.id} className="p-6">
                  <div className="flex items-start justify-between" dir="rtl">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold text-gray-900 text-lg">{lead.buyer_name}</h3>
                        <Badge
                          className={
                            lead.intent_level === 'urgent'
                              ? 'bg-red-100 text-red-700 border-red-200'
                              : lead.intent_level === 'serious'
                              ? 'bg-orange-100 text-orange-700 border-orange-200'
                              : 'bg-blue-100 text-blue-700 border-blue-200'
                          }
                        >
                          {lead.intent_level === 'urgent' ? 'عاجل' : lead.intent_level === 'serious' ? 'جاد' : 'تصفح'}
                        </Badge>
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          <Clock className="w-3 h-3 ml-1" />
                          معدل استجابة: 85%
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">نوع العقار</p>
                          <p className="font-medium text-gray-900">{lead.property_type}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">المدينة</p>
                          <p className="font-medium text-gray-900">{getCityName(lead.city_id)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">الميزانية</p>
                          <p className="font-medium text-gray-900">
                            {formatPrice(lead.budget_min)} - {formatPrice(lead.budget_max)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">الحد الأدنى للغرف</p>
                          <p className="font-medium text-gray-900">{lead.bedrooms_min} غرف</p>
                        </div>
                      </div>

                      {lead.notes && (
                        <div className="bg-blue-50 p-3 rounded-lg mb-4">
                          <p className="text-sm text-gray-700">{lead.notes}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>تم الإرسال: {new Date(lead.created_at).toLocaleDateString('ar-SA')}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 mr-4">
                      <Dialog open={selectedLead === lead.id} onOpenChange={(open) => !open && setSelectedLead(null)}>
                        <DialogTrigger asChild>
                          <Button size="sm" onClick={() => setSelectedLead(lead.id)}>
                            <MessageSquare className="w-4 h-4 ml-2" />
                            الرد
                          </Button>
                        </DialogTrigger>
                        <DialogContent dir="rtl">
                          <DialogHeader>
                            <DialogTitle>الرد على {lead.buyer_name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm text-gray-700">
                                يبحث عن {lead.property_type} في {getCityName(lead.city_id)}
                              </p>
                              <p className="text-sm text-gray-700 mt-1">
                                الميزانية: {formatPrice(lead.budget_min)} - {formatPrice(lead.budget_max)}
                              </p>
                            </div>
                            <div>
                              <Label htmlFor="response-message">رسالتك</Label>
                              <Textarea
                                id="response-message"
                                value={responseMessage}
                                onChange={(e) => setResponseMessage(e.target.value)}
                                placeholder="مرحباً، لدينا عدة عقارات تناسب متطلباتك..."
                                rows={6}
                                className="mt-1"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={handleRespond} className="flex-1">
                                إرسال
                              </Button>
                              <Button variant="outline" className="flex-1" onClick={() => setSelectedLead(null)}>
                                إلغاء
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button size="sm" variant="outline">
                        <Phone className="w-4 h-4 ml-2" />
                        اتصال
                      </Button>

                      <Button size="sm" variant="outline">
                        <Mail className="w-4 h-4 ml-2" />
                        بريد
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {filteredLeads.length === 0 && (
                <Card className="p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2" dir="rtl">لا توجد عملاء محتملين</h3>
                  <p className="text-gray-600" dir="rtl">سيظهر هنا العملاء الذين يبحثون عن عقارات</p>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="new" className="mt-6">
            <div className="space-y-4">
              {filteredLeads
                .filter(l => l.validation_status === 'pending')
                .map((lead) => (
                  <Card key={lead.id} className="p-6">
                    {/* Same content as above */}
                    <p dir="rtl">عميل جديد: {lead.buyer_name}</p>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="urgent" className="mt-6">
            <div className="space-y-4">
              {filteredLeads
                .filter(l => l.intent_level === 'urgent')
                .map((lead) => (
                  <Card key={lead.id} className="p-6">
                    {/* Same content as above */}
                    <p dir="rtl">عميل عاجل: {lead.buyer_name}</p>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="responded" className="mt-6">
            <Card className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2" dir="rtl">لا توجد ردود بعد</h3>
              <p className="text-gray-600" dir="rtl">ابدأ بالرد على العملاء المحتملين</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
