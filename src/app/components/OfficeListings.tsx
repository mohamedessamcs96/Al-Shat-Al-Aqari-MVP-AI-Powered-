import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, Edit2, Trash2, Eye, Search, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { mockListings, formatPrice, getCityName } from '../lib/mock-data';
import { toast } from 'sonner';

export function OfficeListings() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newListing, setNewListing] = useState({
    property_type: '',
    address: '',
    price: '',
    bedrooms: '',
    area: '',
    city_id: '1',
  });

  // Mock office data
  const officeId = 'office-1';
  const officeListings = mockListings.filter(l => l.office_id === officeId);

  const handleAddListing = () => {
    if (!newListing.property_type || !newListing.address || !newListing.price) {
      toast.error('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }
    toast.success('تم إضافة العقار بنجاح!');
    setIsDialogOpen(false);
    setNewListing({
      property_type: '',
      address: '',
      price: '',
      bedrooms: '',
      area: '',
      city_id: '1',
    });
  };

  const handleDeleteListing = (id: string) => {
    toast.success('تم حذف العقار بنجاح!');
  };

  const filteredListings = officeListings.filter(listing => {
    const matchesSearch = 
      listing.property_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || listing.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between" dir="ltr">
          <Button variant="ghost" onClick={() => navigate('/office/dashboard')}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            رجوع
          </Button>
          <h1 className="text-xl font-bold text-gray-900" dir="rtl">إدارة العقارات</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Plus className="w-4 h-4 ml-2" />
                إضافة عقار جديد
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl" className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>إضافة عقار جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>نوع العقار</Label>
                    <Select value={newListing.property_type} onValueChange={(value) => 
                      setNewListing({...newListing, property_type: value})
                    }>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="اختر النوع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Villa">فيلا</SelectItem>
                        <SelectItem value="Apartment">شقة</SelectItem>
                        <SelectItem value="Duplex">دوبلكس</SelectItem>
                        <SelectItem value="Land">أرض</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>المدينة</Label>
                    <Select value={newListing.city_id} onValueChange={(value) => 
                      setNewListing({...newListing, city_id: value})
                    }>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="اختر المدينة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">الرياض</SelectItem>
                        <SelectItem value="2">جدة</SelectItem>
                        <SelectItem value="3">الدمام</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>العنوان</Label>
                  <Input
                    value={newListing.address}
                    onChange={(e) => setNewListing({...newListing, address: e.target.value})}
                    placeholder="أدخل عنوان العقار"
                    className="mt-1 text-right"
                    dir="rtl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>السعر</Label>
                    <Input
                      type="number"
                      value={newListing.price}
                      onChange={(e) => setNewListing({...newListing, price: e.target.value})}
                      placeholder="السعر بالريال"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>المساحة (م²)</Label>
                    <Input
                      type="number"
                      value={newListing.area}
                      onChange={(e) => setNewListing({...newListing, area: e.target.value})}
                      placeholder="المساحة"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>عدد الغرف</Label>
                  <Input
                    type="number"
                    value={newListing.bedrooms}
                    onChange={(e) => setNewListing({...newListing, bedrooms: e.target.value})}
                    placeholder="عدد الغرف"
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleAddListing} className="flex-1 bg-gradient-to-br from-blue-600 to-indigo-600">
                    إضافة العقار
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                    إلغاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-gray-600" dir="rtl">إجمالي العقارات</p>
            <p className="text-2xl font-bold text-gray-900">{officeListings.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600" dir="rtl">عقارات نشطة</p>
            <p className="text-2xl font-bold text-green-600">
              {officeListings.filter(l => l.status === 'active').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600" dir="rtl">معلقة</p>
            <p className="text-2xl font-bold text-yellow-600">
              {officeListings.filter(l => l.status === 'pending').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600" dir="rtl">مباعة</p>
            <p className="text-2xl font-bold text-gray-600">
              {officeListings.filter(l => l.status === 'sold').length}
            </p>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="p-4 mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن عقار..."
                className="pr-10 text-right"
                dir="rtl"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="pending">معلق</SelectItem>
                <SelectItem value="sold">مباع</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredListings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <img
                src={listing.images[0]}
                alt={listing.property_type}
                className="w-full h-48 object-cover"
              />
              <div className="p-4" dir="rtl">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{listing.property_type}</h3>
                    <p className="text-sm text-gray-600">{listing.address}</p>
                  </div>
                  <Badge
                    className={
                      listing.status === 'active'
                        ? 'bg-green-100 text-green-700 border-green-200'
                        : listing.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                        : 'bg-gray-100 text-gray-700 border-gray-200'
                    }
                  >
                    {listing.status === 'active' ? 'نشط' : listing.status === 'pending' ? 'معلق' : 'مباع'}
                  </Badge>
                </div>

                <p className="text-lg font-bold text-blue-600 mb-3">{formatPrice(listing.price)}</p>

                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>جودة الإعلان</span>
                    <span>{listing.quality_score}%</span>
                  </div>
                  <Progress value={listing.quality_score} className="h-2" />
                </div>

                <div className="flex gap-2 text-xs text-gray-600 mb-3">
                  <span>{listing.bedrooms} غرف</span>
                  <span>•</span>
                  <span>{listing.area} م²</span>
                  <span>•</span>
                  <span>{getCityName(listing.city_id)}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <p className="text-gray-600">المشاهدات</p>
                    <p className="font-semibold text-gray-900">234</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <p className="text-gray-600">الاستفسارات</p>
                    <p className="font-semibold text-gray-900">12</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit2 className="w-4 h-4 ml-2" />
                    تعديل
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="w-4 h-4 ml-2" />
                    عرض
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleDeleteListing(listing.id)}
                  >
                    <Trash2 className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredListings.length === 0 && (
          <Card className="p-12 text-center">
            <Eye className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2" dir="rtl">لا توجد عقارات</h3>
            <p className="text-gray-600 mb-4" dir="rtl">ابدأ بإضافة عقاراتك الآن</p>
            <Button 
              className="bg-gradient-to-br from-blue-600 to-indigo-600"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة عقار جديد
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
