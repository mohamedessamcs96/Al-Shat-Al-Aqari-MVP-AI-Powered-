import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import {
  QrCode, Download, Copy, Check, Edit3,
  Link2, Instagram, Twitter, Youtube, Facebook,
  Phone, Globe, MessageCircle, Linkedin, ChevronLeft,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { offices as officesApi } from '../lib/api-client';
import { getUser } from '../lib/auth';

// ─── Linktree rendering constants (mirrored from LinktreeEditor) ──────────────
const BG_PRESETS: { key: string; style: React.CSSProperties }[] = [
  { key: 'indigo-dark', style: { background: 'linear-gradient(135deg,#0e2057 0%,#312e81 100%)' } },
  { key: 'emerald',     style: { background: 'linear-gradient(135deg,#064e3b 0%,#065f46 100%)' } },
  { key: 'rose',        style: { background: 'linear-gradient(135deg,#881337 0%,#be185d 100%)' } },
  { key: 'amber',       style: { background: 'linear-gradient(135deg,#78350f 0%,#b45309 100%)' } },
  { key: 'slate',       style: { background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)' } },
  { key: 'sky',         style: { background: 'linear-gradient(135deg,#0369a1 0%,#0891b2 100%)' } },
  { key: 'warm-white',  style: { background: '#f8fafc' } },
  { key: 'purple-pink', style: { background: 'linear-gradient(135deg,#6d28d9 0%,#db2777 100%)' } },
];

const BTN_RADII: { key: string; radius: string }[] = [
  { key: 'none', radius: '0px' },
  { key: 'sm',   radius: '8px' },
  { key: 'lg',   radius: '16px' },
  { key: 'full', radius: '9999px' },
];

const ICON_MAP: Record<string, React.ElementType> = {
  link: Link2, whatsapp: MessageCircle, instagram: Instagram,
  twitter: Twitter, youtube: Youtube, facebook: Facebook,
  linkedin: Linkedin, phone: Phone, website: Globe,
};

function LinkIcon({ iconKey, className }: { iconKey: string; className?: string }) {
  const Icon = ICON_MAP[iconKey] ?? Link2;
  return <Icon className={className} />;
}

// ─── QR Dialog ────────────────────────────────────────────────────────────────
function QRDialog({ open, onClose, url, officeName, logoUrl }: {
  open: boolean; onClose: () => void; url: string; officeName: string; logoUrl?: string;
}) {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<SVGSVGElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const svg = qrRef.current;
    if (!svg) return;
    const svgStr = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const size = 400;
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      const a = document.createElement('a');
      a.download = `qr-${officeName}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgStr)));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-center">رمز QR لصفحة المكتب</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-5 py-2">
          <div className="p-4 bg-white rounded-2xl shadow-inner border">
            <QRCodeSVG ref={qrRef} value={url} size={200} level="H" includeMargin={false}
              imageSettings={logoUrl ? { src: logoUrl, height: 40, width: 40, excavate: true } : undefined} />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-900">{officeName}</p>
            <p className="text-xs text-gray-500 mt-0.5 break-all">{url}</p>
          </div>
          <div className="flex gap-2 w-full">
            <Button className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700" onClick={handleDownload}>
              <Download className="w-4 h-4" /> تحميل PNG
            </Button>
            <Button variant="outline" className="flex-1 gap-2" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'تم النسخ!' : 'نسخ الرابط'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main public page component ───────────────────────────────────────────────
export function PublicOfficePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPreviewMode = searchParams.get('preview') === '1';
  const [qrOpen, setQrOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [office, setOffice] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [linktree, setLinktree] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }

    // If the logged-in user owns this slug, use their stored ID directly —
    // avoids ID mismatch between getBySlug response and saved linktree.
    const storedUser = getUser();
    const storedOid = (storedUser?.slug === slug) ? storedUser?.id : null;

    const fetchLinktree = (oid: string, officeData: any) => {
      setOffice(officeData);
      officesApi.getLinktree(oid)
        .then((ltData: any) => {
          const d = ltData?.data ?? ltData ?? {};
          setLinktree(d);
        })
        .catch((_err) => {
          console.warn('[public page] getLinktree failed', _err);
          setLinktree({});
        })
        .finally(() => setLoading(false));
    };

    officesApi.getBySlug(slug)
      .then((data: any) => {
        const raw = data?.data ?? data;
        // Try every possible ID field returned by the API
        const oid = storedOid
          ?? raw?.id
          ?? raw?.user?.id
          ?? raw?.office_id
          ?? raw?.data?.id
          ?? '';
        if (oid) {
          fetchLinktree(oid, raw);
        } else {
          setOffice(raw);
          setLinktree({});
          setLoading(false);
        }
      })
      .catch(() => {
        // getBySlug failed — if owner is previewing, we still have their ID
        if (storedOid) {
          fetchLinktree(storedOid, { name: storedUser?.name ?? '', id: storedOid, slug });
        } else {
          setOffice(null);
          setLoading(false);
        }
      });
  }, [slug]);

  const PRODUCTION_URL = 'https://al-shat-al-aqari-mvp.vercel.app';
  const pageUrl = `${PRODUCTION_URL}/office/${slug}`;

  // Show edit controls only to the office owner (never in preview mode)
  const storedUser = getUser();
  const isOwner = !isPreviewMode && (storedUser?.slug === slug || storedUser?.id === (office as any)?.id);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center" dir="rtl">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!office) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">المكتب غير موجود</h2>
          <p className="text-gray-500 mb-6">لم يتم العثور على صفحة بهذا الرابط</p>
          <Button onClick={() => navigate('/chat')}>العودة للرئيسية</Button>
        </div>
      </div>
    );
  }

  // ── Extract linktree data with API field name fallbacks ──────────────────────
  const profile = linktree?.profile ?? { name: office?.name ?? '', bio: '', avatar: '' };
  const links: Array<{ id: string; title: string; url: string; icon: string; active: boolean }> =
    Array.isArray(linktree?.links) ? linktree.links : [];
  const rawApp = linktree?.appearance ?? {};
  const appearance = {
    bg:        rawApp.background   ?? rawApp.bg        ?? 'indigo-dark',
    btnStyle:  rawApp.buttonStyle  ?? rawApp.btnStyle  ?? 'filled',
    btnRadius: rawApp.buttonRadius ?? rawApp.btnRadius ?? 'full',
    btnColor:  rawApp.buttonColor  ?? rawApp.btnColor  ?? '#6366f1',
    font:      rawApp.font         ?? 'cairo',
  };

  const bgStyle = BG_PRESETS.find(b => b.key === appearance.bg)?.style ?? BG_PRESETS[0].style;
  const isDark = appearance.bg !== 'warm-white';
  const textColor   = isDark ? '#ffffff'       : '#111827';
  const subColor    = isDark ? 'rgba(255,255,255,0.6)' : '#6b7280';
  const btnRadiusVal = BTN_RADII.find(r => r.key === appearance.btnRadius)?.radius ?? '9999px';
  const fontFamily  = appearance.font === 'cairo' ? 'Cairo, sans-serif'
    : appearance.font === 'tajawal' ? 'Tajawal, sans-serif' : 'Inter, sans-serif';

  const getBtnStyle = (): React.CSSProperties => {
    const c = appearance.btnColor;
    switch (appearance.btnStyle) {
      case 'outline': return { background: 'transparent', color: isDark ? '#fff' : c, borderRadius: btnRadiusVal, border: `2px solid ${isDark ? 'rgba(255,255,255,0.5)' : c}` };
      case 'soft':    return { background: `${c}22`, color: isDark ? '#fff' : c, borderRadius: btnRadiusVal, border: 'none' };
      case 'shadow':  return { background: '#fff', color: c, borderRadius: btnRadiusVal, border: 'none', boxShadow: `0 4px 14px ${c}44` };
      default:        return { background: c, color: '#fff', borderRadius: btnRadiusVal, border: 'none' };
    }
  };

  const activeLinks = links.filter(l => l.active);

  const iconBg = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.07)';

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ ...bgStyle, fontFamily }} dir="rtl">

      {/* Noise texture for depth */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '160px' }}
      />

      {/* Decorative orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ width: 600, height: 600, borderRadius: '50%', background: appearance.btnColor, opacity: 0.18, filter: 'blur(120px)', transform: 'translate(-50%, -55%)' }} />
      <div className="absolute bottom-0 right-0 pointer-events-none"
        style={{ width: 400, height: 400, borderRadius: '50%', background: appearance.btnColor, opacity: 0.12, filter: 'blur(100px)', transform: 'translate(35%, 40%)' }} />
      <div className="absolute bottom-0 left-0 pointer-events-none"
        style={{ width: 300, height: 300, borderRadius: '50%', background: isDark ? '#ffffff' : '#000000', opacity: 0.04, filter: 'blur(80px)', transform: 'translate(-30%, 30%)' }} />

      {/* Floating owner action bar */}
      {isOwner && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
          <button
            onClick={() => setQrOpen(true)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}
            title="QR Code"
          >
            <QrCode className="w-4 h-4" style={{ color: textColor }} />
          </button>
          <button
            onClick={() => navigate('/office/linktree')}
            className="h-10 px-4 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
            style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', color: textColor, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}
          >
            <Edit3 className="w-3.5 h-3.5" />
            تعديل
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="relative flex flex-col items-center min-h-screen px-5">

        {/* Top spacer */}
        <div className="h-16 sm:h-20" />

        {/* Avatar with layered glow rings */}
        <div className="relative mb-6 flex-shrink-0">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full"
            style={{ boxShadow: `0 0 0 2px rgba(255,255,255,0.2), 0 0 0 10px ${appearance.btnColor}35, 0 0 60px ${appearance.btnColor}40`, borderRadius: '50%' }} />
          {/* Avatar circle */}
          <div
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden relative z-10 flex items-center justify-center"
            style={{ border: '3px solid rgba(255,255,255,0.3)', background: `linear-gradient(135deg, ${appearance.btnColor}44, rgba(255,255,255,0.1))`, boxShadow: '0 16px 48px rgba(0,0,0,0.3)' }}
          >
            {profile.avatar
              ? <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
              : <span className="text-4xl sm:text-5xl font-black" style={{ color: textColor, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>{profile.name?.[0] || '؟'}</span>
            }
          </div>
        </div>

        {/* Name */}
        <h1 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight text-center leading-tight"
          style={{ color: textColor, textShadow: '0 2px 12px rgba(0,0,0,0.25)' }}>
          {profile.name || office.name || 'اسم المكتب'}
        </h1>

        {/* Bio */}
        {profile.bio ? (
          <p className="text-sm sm:text-base text-center max-w-xs sm:max-w-sm mb-10 leading-relaxed" style={{ color: subColor }}>
            {profile.bio}
          </p>
        ) : (
          <div className="mb-10" />
        )}

        {/* Links */}
        <div className="w-full max-w-sm space-y-3">
          {activeLinks.map((link, i) => (
            <a
              key={link.id}
              href={link.url || '#'}
              target={link.url ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="group w-full flex items-center gap-3 px-4 py-4 font-bold text-sm relative overflow-hidden"
              style={{
                ...getBtnStyle(),
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                animationDelay: `${i * 50}ms`,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px) scale(1.01)';
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 12px 32px ${appearance.btnColor}60`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.transform = 'none';
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = (getBtnStyle() as any).boxShadow ?? '';
              }}
            >
              {/* Shine sweep on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)' }} />
              {/* Icon badge */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 relative z-10"
                style={{ background: iconBg, color: (getBtnStyle() as any).color }}
              >
                <LinkIcon iconKey={link.icon} className="w-4 h-4" />
              </div>
              {/* Title — centred over the icon using absolute positioning trick */}
              <span className="flex-1 text-center relative z-10 text-sm font-bold tracking-wide">{link.title}</span>
              {/* Chevron */}
              <ChevronLeft className="w-4 h-4 flex-shrink-0 opacity-50 relative z-10 group-hover:opacity-80 transition-opacity" />
            </a>
          ))}
          {activeLinks.length === 0 && (
            <p className="text-center text-sm py-16" style={{ color: subColor, opacity: 0.45 }}>
              لم يتم إضافة روابط بعد
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-14 pb-8">
          <div
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-medium tracking-wide"
            style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', color: subColor, border: '1px solid rgba(255,255,255,0.1)' }}
          >
            مدعوم بـ الشات العقاري
          </div>
        </div>
      </div>

      {/* QR Dialog */}
      {isOwner && (
        <QRDialog
          open={qrOpen}
          onClose={() => setQrOpen(false)}
          url={pageUrl}
          officeName={profile.name || office.name || ''}
          logoUrl={office.logo_url}
        />
      )}
    </div>
  );
}

