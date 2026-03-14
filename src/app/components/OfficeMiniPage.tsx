import { useParams, useNavigate } from 'react-router';
import { Phone, Mail, MapPin, Star, Building2, MessageSquare, QrCode } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { mockOffices, mockListings, formatPrice, getCityName } from '../lib/mock-data';

export function OfficeMiniPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const office = mockOffices.find(o => o.slug === slug);
  const officeListings = office ? mockListings.filter(l => l.office_id === office.id) : [];

  if (!office) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">المكتب غير موجود</h2>
          <Button onClick={() => navigate('/chat')} className="mt-4">
            العودة للرئيسية
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <img
              src={office.logo_url}
              alt={office.name}
              className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-lg object-cover"
            />
            <h1 className="text-4xl font-bold mb-2" dir="rtl">{office.name}</h1>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(office.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-white/90">({office.rating})</span>
            </div>
            {office.verified && (
              <Badge className="bg-white/20 text-white border-white/40 backdrop-blur">
                ✓ مكتب موثق
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 mb-6">
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" dir="rtl">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">اتصل بنا</p>
                <p className="font-semibold text-gray-900">{office.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Mail className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                <p className="font-semibold text-gray-900 text-sm">{office.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <Building2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">عدد العقارات</p>
                <p className="font-semibold text-gray-900">{office.total_listings} عقار</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button className="flex-1 bg-green-600 hover:bg-green-700">
              <Phone className="w-4 h-4 ml-2" />
              اتصل الآن
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => navigate('/chat')}>
              <MessageSquare className="w-4 h-4 ml-2" />
              تحدث مع المساعد
            </Button>
            <Button variant="outline" size="icon">
              <QrCode className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Listings */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900" dir="rtl">عقاراتنا</h2>
          <Badge variant="outline">{officeListings.length} عقار متاح</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {officeListings.map((listing) => (
            <Card
              key={listing.id}
              className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer bg-white"
              onClick={() => navigate(`/listings/${listing.id}`)}
            >
              <div className="relative">
                <img
                  src={listing.images[0]}
                  alt={listing.property_type}
                  className="w-full h-48 object-cover"
                />
                <Badge className="absolute top-3 right-3 bg-blue-600 text-white">
                  {formatPrice(listing.price)}
                </Badge>
                {listing.quality_score >= 90 && (
                  <Badge className="absolute top-3 left-3 bg-green-600 text-white">
                    ⭐ مميز
                  </Badge>
                )}
              </div>

              <div className="p-5" dir="rtl">
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{listing.property_type}</h3>
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                  <MapPin className="w-4 h-4" />
                  <span>{listing.address}</span>
                </div>

                <div className="flex gap-4 text-sm text-gray-600 mb-4">
                  <span>{listing.bedrooms} غرف</span>
                  <span>•</span>
                  <span>{listing.bathrooms} حمام</span>
                  <span>•</span>
                  <span>{listing.area} م²</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {listing.features.slice(0, 3).map((feature, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>

                <Button className="w-full" size="sm">
                  عرض التفاصيل
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {officeListings.length === 0 && (
          <Card className="p-12 text-center bg-white">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2" dir="rtl">لا توجد عقارات متاحة حالياً</h3>
            <p className="text-gray-600" dir="rtl">يرجى التواصل مع المكتب مباشرة</p>
          </Card>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-600" dir="rtl">
            © 2026 {office.name} • مدعوم بمنصة الشات العقاري
          </p>
        </div>
      </div>
    </div>
  );
}
