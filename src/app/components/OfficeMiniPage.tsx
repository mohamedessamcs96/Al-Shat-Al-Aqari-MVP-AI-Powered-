import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Phone, Mail, MapPin, Star, Building2, MessageSquare, QrCode, Download, Copy, Check, Shield } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { mockOffices, mockListings, formatPrice, getCityName } from '../lib/mock-data';

export function OfficeMiniPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [qrOpen, setQrOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<SVGSVGElement>(null);

  const office = mockOffices.find(o => o.slug === slug);
  const pageUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/office/${slug}`
    : `/office/${slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const svg = qrRef.current;
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const canvas = document.createElement('canvas');
    const size = 400;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      const a = document.createElement('a');
      a.download = `qr-${slug}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgStr)));
  };
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
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="relative overflow-hidden text-white py-20 sm:py-28"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 45%, #312e81 100%)' }}>
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 -translate-y-1/3 translate-x-1/3"
          style={{ background: 'radial-gradient(circle, #60a5fa, transparent)' }} />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-10 translate-y-1/3 -translate-x-1/4"
          style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />
        <div className="absolute top-1/2 left-1/2 w-[40rem] h-[40rem] rounded-full opacity-5 -translate-x-1/2 -translate-y-1/2"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          {/* Logo with glow ring */}
          <div className="relative inline-block mb-5">
            <div className="absolute inset-0 rounded-full bg-blue-400/25 scale-125 animate-pulse" />
            <img
              src={office.logo_url}
              alt={office.name}
              className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white/80 shadow-2xl object-cover"
            />
          </div>

          {/* Name + verified */}
          <div className="flex items-center justify-center gap-3 mb-3 flex-wrap" dir="rtl">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{office.name}</h1>
            {office.verified && (
              <span className="inline-flex items-center gap-1 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
                <Shield className="w-3 h-3" />
                موثق
              </span>
            )}
          </div>

          {/* Stars */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < Math.floor(office.rating) ? 'fill-amber-400 text-amber-400' : 'text-white/25'}`}
                />
              ))}
            </div>
            <span className="text-white/70 text-sm">({office.rating})</span>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto" dir="rtl">
            {[
              { value: office.total_listings, label: 'عقار' },
              { value: '10+', label: 'سنوات خبرة' },
              { value: '500+', label: 'عميل راضٍ' },
            ].map((stat, idx) => (
              <div key={idx} className="rounded-2xl py-3 px-2" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <p className="text-xl sm:text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-white/55 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Card */}
      <div className="max-w-4xl mx-auto px-4 -mt-10 mb-8 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100" dir="rtl">
            <div className="flex items-center gap-4 p-5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">اتصل بنا</p>
                <p className="font-semibold text-gray-900 text-sm">{office.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-5">
              <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">البريد الإلكتروني</p>
                <p className="font-semibold text-gray-900 text-sm truncate">{office.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">إجمالي العقارات</p>
                <p className="font-semibold text-gray-900 text-sm">{office.total_listings} عقار</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="px-5 pb-5 pt-3 flex gap-2 sm:gap-3" dir="rtl">
            <button
              className="flex-1 text-white font-semibold py-3 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
              style={{ background: 'linear-gradient(135deg, #16a34a, #059669)' }}
            >
              <Phone className="w-4 h-4" />
              اتصل الآن
            </button>
            <button
              onClick={() => navigate('/chat')}
              className="flex-1 bg-slate-50 border border-gray-200 text-gray-700 font-semibold py-3 rounded-2xl text-sm flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              تحدث مع المساعد
            </button>
            <button
              onClick={() => setQrOpen(true)}
              className="w-12 h-12 sm:w-auto sm:px-5 bg-slate-50 border border-gray-200 text-gray-700 rounded-2xl flex items-center justify-center hover:bg-slate-100 transition-colors gap-2"
            >
              <QrCode className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-medium">QR</span>
            </button>
          </div>
        </div>
      </div>

      {/* QR Dialog */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="max-w-sm" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-center">رمز QR لصفحة المكتب</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-5 py-2">
            <div className="p-4 bg-white rounded-2xl shadow-inner border">
              <QRCodeSVG
                ref={qrRef}
                value={pageUrl}
                size={200}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: office!.logo_url,
                  x: undefined,
                  y: undefined,
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-900">{office!.name}</p>
              <p className="text-xs text-gray-500 mt-0.5 break-all">{pageUrl}</p>
            </div>
            <div className="flex gap-2 w-full">
              <Button className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700" onClick={handleDownload}>
                <Download className="w-4 h-4" />
                تحميل PNG
              </Button>
              <Button variant="outline" className="flex-1 gap-2" onClick={handleCopy}>
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                {copied ? 'تم النسخ!' : 'نسخ الرابط'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Listings */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6" dir="rtl">
          <h2 className="text-2xl font-bold text-gray-900">عقاراتنا</h2>
          <span className="bg-blue-50 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full border border-blue-100">
            {officeListings.length} عقار
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {officeListings.map((listing) => (
            <div
              key={listing.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-100"
              onClick={() => navigate(`/listings/${listing.id}`)}
            >
              <div className="relative overflow-hidden">
                <img
                  src={listing.images[0]}
                  alt={listing.property_type}
                  className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  {formatPrice(listing.price)}
                </span>
                {listing.quality_score >= 90 && (
                  <span className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    ⭐ مميز
                  </span>
                )}
                <div className="absolute bottom-0 left-0 right-0 px-4 py-3" dir="rtl">
                  <h3 className="text-white font-bold text-base drop-shadow">{listing.property_type}</h3>
                  <div className="flex items-center gap-1 text-white/80 text-xs mt-0.5">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{listing.address}</span>
                  </div>
                </div>
                {/* Hover overlay CTA */}
                <div className="absolute inset-0 bg-blue-900/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="bg-white text-blue-700 font-bold text-sm px-5 py-2.5 rounded-full shadow-lg" dir="rtl">
                    عرض التفاصيل
                  </span>
                </div>
              </div>
              <div className="p-4" dir="rtl">
                <div className="flex gap-3 text-sm text-gray-600 mb-3">
                  <span><span className="font-semibold text-gray-900">{listing.bedrooms}</span> غرف</span>
                  <span className="text-gray-300">|</span>
                  <span><span className="font-semibold text-gray-900">{listing.bathrooms}</span> حمام</span>
                  <span className="text-gray-300">|</span>
                  <span><span className="font-semibold text-gray-900">{listing.area}</span> م²</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {listing.features.slice(0, 3).map((feature, idx) => (
                    <span key={idx} className="bg-slate-50 border border-slate-200 text-gray-600 text-xs px-2.5 py-1 rounded-full">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {officeListings.length === 0 && (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
            <Building2 className="w-14 h-14 text-gray-200 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-1" dir="rtl">لا توجد عقارات متاحة حالياً</h3>
            <p className="text-gray-500 text-sm" dir="rtl">يرجى التواصل مع المكتب مباشرة</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a8a)' }}>
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-white/50 text-sm" dir="rtl">
            © 2026 {office.name} • مدعوم بمنصة الشات العقاري
          </p>
        </div>
      </div>
    </div>
  );
}
