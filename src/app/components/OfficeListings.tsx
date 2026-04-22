import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, Edit2, Trash2, Eye, Search, X, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { ScrollArea } from './ui/scroll-area';
import { formatPrice, getCityName, setCitiesCache } from '../lib/formatters';
import { offices as officesApi, cities as citiesApi } from '../lib/api-client';
import { getUser, getOfficeIdFromToken, getOfficeIdFromRawResponse, setUser } from '../lib/auth';
import { toast } from 'sonner';

const EMPTY_LISTING = {
  property_type: '',
  address: '',
  price: '',
  area: '',
  bedrooms: '',
  bathrooms: '',
  description: '',
  status: 'active',
  city: '',
  features: [] as string[],
  images: [] as string[],
  source_site: '',
};

export function OfficeListings() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newListing, setNewListing] = useState({ ...EMPTY_LISTING });
  const [featureInput, setFeatureInput] = useState('');
  const [cityList, setCityList] = useState<{ id: string; name: string; name_ar?: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Edit state
  const [isEditOpen, setIsEditOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editTarget, setEditTarget] = useState<any>(null);
  const [editForm, setEditForm] = useState<{ price: string; status: string }>({ price: '', status: 'active' });

  // Robust listing ID extractor (API may vary)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getListingId = (listing: any): string =>
    listing?.id ?? listing?.uuid ?? listing?.listing_id ?? '';

  const officeId = (() => {
    const stored = getUser()?.id;
    if (stored) return stored;
    const fromToken = getOfficeIdFromToken();
    if (fromToken) { setUser({ id: fromToken }); return fromToken; }
    const fromRaw = getOfficeIdFromRawResponse();
    if (fromRaw) { setUser({ id: fromRaw }); return fromRaw; }
    return '';
  })();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [officeListings, setOfficeListings] = useState<any[]>([]);

  useEffect(() => {
    citiesApi.list()
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setCityList(list);
        setCitiesCache(list);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!officeId) return;
    officesApi.listListings(officeId)
      .then(data => {
        const raw = data as any;
        const list = Array.isArray(raw) ? raw
          : Array.isArray(raw?.data) ? raw.data
          : Array.isArray(raw?.results) ? raw.results
          : Array.isArray(raw?.data?.results) ? raw.data.results
          : [];
        setOfficeListings(list);
      })
      .catch(() => {});
  }, [officeId]);

  const handleImageFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setNewListing(prev => ({ ...prev, images: [...prev.images, url] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setNewListing(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const addFeature = () => {
    const trimmed = featureInput.trim();
    if (!trimmed || newListing.features.includes(trimmed)) return;
    setNewListing(prev => ({ ...prev, features: [...prev.features, trimmed] }));
    setFeatureInput('');
  };

  const removeFeature = (f: string) => {
    setNewListing(prev => ({ ...prev, features: prev.features.filter(x => x !== f) }));
  };

  const handleAddListing = async () => {
    if (!newListing.property_type || !newListing.address || !newListing.price) {
      toast.error('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }
    try {
      const created = await officesApi.createListing(officeId, {
        property_type: newListing.property_type,
        address: newListing.address,
        price: Number(newListing.price),
        area: Number(newListing.area),
        bedrooms: Number(newListing.bedrooms),
        bathrooms: Number(newListing.bathrooms),
        description: newListing.description,
        status: newListing.status,
        city: newListing.city || null,
        features: newListing.features,
        images: newListing.images,
        source_site: newListing.source_site,
      });
      const raw = created as any;
      const listing = raw?.data ?? raw;
      setOfficeListings(prev => [...prev, listing]);
      toast.success('تم إضافة العقار بنجاح!');
      setIsDialogOpen(false);
      setNewListing({ ...EMPTY_LISTING });
      setFeatureInput('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ');
    }
  };

  const handleDeleteListing = async (listing: any) => {
    const id = getListingId(listing);
    if (!id) { toast.error('معرّف العقار غير موجود'); return; }
    try {
      await officesApi.deleteListing(officeId, id);
      setOfficeListings(prev => prev.filter((l: any) => getListingId(l) !== id));
      toast.success('تم حذف العقار بنجاح!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ');
    }
  };

  const handleOpenEdit = (listing: any) => {
    setEditTarget(listing);
    setEditForm({ price: String(listing.price ?? ''), status: listing.status ?? 'active' });
    setIsEditOpen(true);
  };

  const handleUpdateListing = async () => {
    const id = getListingId(editTarget);
    if (!id) { toast.error('معرّف العقار غير موجود'); return; }
    try {
      const updated = await officesApi.updateListing(officeId, id, {
        price: Number(editForm.price),
        status: editForm.status,
      });
      const raw = updated as any;
      const listing = raw?.data ?? raw;
      setOfficeListings(prev =>
        prev.map((l: any) => getListingId(l) === id ? { ...l, ...listing } : l)
      );
      toast.success('تم تحديث العقار بنجاح!');
      setIsEditOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ');
    }
  };

  const filteredListings = officeListings.filter(listing => {
    const matchesSearch = 
      (listing.property_type ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (listing.address ?? listing.location ?? listing.city ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    
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
              <ScrollArea className="max-h-[75vh] pr-2">
              <div className="space-y-4 mt-4 pl-1">
                {/* Row 1: Type + City */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>نوع العقار *</Label>
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
                        <SelectItem value="Commercial">تجاري</SelectItem>
                        <SelectItem value="Warehouse">مستودع</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>المدينة</Label>
                    <Select value={newListing.city} onValueChange={(value) =>
                      setNewListing({...newListing, city: value})
                    }>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="اختر المدينة" />
                      </SelectTrigger>
                      <SelectContent>
                        {cityList.length > 0
                          ? cityList.map(c => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name_ar ?? c.name}
                            </SelectItem>
                          ))
                          : (
                            <div className="px-3 py-2 text-sm text-gray-400">جارٍ التحميل...</div>
                          )
                        }
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Row 2: Status + Source */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>الحالة</Label>
                    <Select value={newListing.status} onValueChange={(value) =>
                      setNewListing({...newListing, status: value})
                    }>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">نشط</SelectItem>
                        <SelectItem value="pending">معلق</SelectItem>
                        <SelectItem value="sold">مباع</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>المصدر (اختياري)</Label>
                    <Input
                      value={newListing.source_site}
                      onChange={(e) => setNewListing({...newListing, source_site: e.target.value})}
                      placeholder="رابط المصدر"
                      className="mt-1"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Row 3: Address */}
                <div>
                  <Label>العنوان *</Label>
                  <Input
                    value={newListing.address}
                    onChange={(e) => setNewListing({...newListing, address: e.target.value})}
                    placeholder="أدخل عنوان العقار"
                    className="mt-1 text-right"
                    dir="rtl"
                  />
                </div>

                {/* Row 4: Price + Area */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>السعر (ر.س) *</Label>
                    <Input
                      type="number"
                      min="0"
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
                      min="0"
                      value={newListing.area}
                      onChange={(e) => setNewListing({...newListing, area: e.target.value})}
                      placeholder="المساحة"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Row 5: Bedrooms + Bathrooms */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>عدد الغرف</Label>
                    <Input
                      type="number"
                      min="0"
                      value={newListing.bedrooms}
                      onChange={(e) => setNewListing({...newListing, bedrooms: e.target.value})}
                      placeholder="عدد الغرف"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>دورات المياه</Label>
                    <Input
                      type="number"
                      min="0"
                      value={newListing.bathrooms}
                      onChange={(e) => setNewListing({...newListing, bathrooms: e.target.value})}
                      placeholder="عدد دورات المياه"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Row 6: Description */}
                <div>
                  <Label>الوصف</Label>
                  <Textarea
                    value={newListing.description}
                    onChange={(e) => setNewListing({...newListing, description: e.target.value})}
                    placeholder="وصف العقار..."
                    className="mt-1 text-right resize-none"
                    dir="rtl"
                    rows={3}
                  />
                </div>

                {/* Row 7: Features */}
                <div>
                  <Label>المميزات</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }}
                      placeholder="مثال: مسبح، حديقة..."
                      className="flex-1 text-right"
                      dir="rtl"
                    />
                    <Button type="button" variant="outline" onClick={addFeature} className="shrink-0">إضافة</Button>
                  </div>
                  {newListing.features.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newListing.features.map(f => (
                        <span key={f} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                          {f}
                          <button type="button" onClick={() => removeFeature(f)} className="hover:text-red-500">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Row 8: Images */}
                <div>
                  <Label>الصور</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleImageFiles(e.target.files)}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-1 w-full border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center gap-2 text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
                  >
                    <Upload className="w-6 h-6" />
                    <span className="text-sm">اضغط لرفع الصور</span>
                    <span className="text-xs text-gray-400">JPG, PNG, WebP</span>
                  </button>
                  {newListing.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newListing.images.map((img, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={handleAddListing} className="flex-1 bg-gradient-to-br from-blue-600 to-indigo-600">
                    إضافة العقار
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                    إلغاء
                  </Button>
                </div>
              </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>

          {/* Edit listing dialog */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent dir="rtl" className="max-w-sm">
              <DialogHeader>
                <DialogTitle>تعديل العقار</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label>السعر (ر.س)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>الحالة</Label>
                  <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="pending">معلق</SelectItem>
                      <SelectItem value="sold">مباع</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleUpdateListing} className="flex-1 bg-gradient-to-br from-blue-600 to-indigo-600">
                    حفظ التعديلات
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setIsEditOpen(false)}>
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
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => handleOpenEdit(listing)}>
                    <Edit2 className="w-4 h-4 ml-2" />
                    تعديل
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate(`/listings/${getListingId(listing)}`)}
                  >
                    <Eye className="w-4 h-4 ml-2" />
                    عرض
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 text-red-600 hover:text-red-700 hover:border-red-300"
                    onClick={() => handleDeleteListing(listing)}
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
