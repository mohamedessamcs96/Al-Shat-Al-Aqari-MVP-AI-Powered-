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

  // ── Resolved display values — office logo/name as fallback when linktree profile is empty ──
  const avatarSrc = profile.avatar || office?.logo_url || office?.logo || office?.avatar || '';
  const displayName = profile.name || office?.name || '';

  const iconBg = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.07)';
  const cardBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.72)';
  const cardBorder = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.06)';
  const dividerColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  return (
    <div className="min-h-[100dvh] relative overflow-hidden" style={{ ...bgStyle, fontFamily }} dir="rtl">

      {/* Noise texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '200px' }}
      />

      {/* Background orbs */}
      <div className="absolute pointer-events-none"
        style={{ top: '-20%', left: '50%', width: 700, height: 700, borderRadius: '50%', background: appearance.btnColor, opacity: 0.22, filter: 'blur(130px)', transform: 'translateX(-50%)' }} />
      <div className="absolute pointer-events-none"
        style={{ bottom: '-15%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: appearance.btnColor, opacity: 0.14, filter: 'blur(110px)' }} />
      <div className="absolute pointer-events-none"
        style={{ bottom: '-10%', left: '-10%', width: 350, height: 350, borderRadius: '50%', background: isDark ? '#fff' : '#000', opacity: 0.04, filter: 'blur(90px)' }} />

      {/* Owner controls */}
      {isOwner && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
          <button
            onClick={() => setQrOpen(true)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.25)', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}
            title="QR Code"
          >
            <QrCode className="w-4 h-4" style={{ color: textColor }} />
          </button>
          <button
            onClick={() => navigate('/office/linktree')}
            className="h-10 px-4 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.25)', color: textColor, boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}
          >
            <Edit3 className="w-3.5 h-3.5" />
            تعديل
          </button>
        </div>
      )}

      {/* Page scroll container */}
      <div className="relative flex flex-col items-center min-h-[100dvh] px-4 py-10 sm:py-16">

        {/* Avatar — floats above the card */}
        <div className="relative z-10 mb-[-44px]">
          {/* Glow halo */}
          <div className="absolute inset-[-8px] rounded-full pointer-events-none"
            style={{ background: `radial-gradient(circle, ${appearance.btnColor}55 0%, transparent 70%)`, filter: 'blur(8px)' }} />
          {/* Ring border */}
          <div className="absolute inset-[-4px] rounded-full pointer-events-none"
            style={{ border: `2px solid ${appearance.btnColor}60`, borderRadius: '50%' }} />
          {/* Avatar circle */}
          <div
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden relative flex items-center justify-center"
            style={{
              border: '3px solid rgba(255,255,255,0.35)',
              background: `linear-gradient(145deg, ${appearance.btnColor}33, rgba(255,255,255,0.08))`,
              boxShadow: `0 8px 32px rgba(0,0,0,0.35), 0 0 0 6px ${appearance.btnColor}20`,
            }}
          >
            {avatarSrc
              ? <img src={avatarSrc} alt={displayName} className="w-full h-full object-cover" />
              : <span className="text-3xl sm:text-4xl font-black select-none" style={{ color: textColor }}>
                  {displayName?.[0]?.toUpperCase() || '؟'}
                </span>
            }
          </div>
        </div>

        {/* Glass card */}
        <div
          className="w-full max-w-sm rounded-3xl overflow-hidden relative"
          style={{
            background: cardBg,
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            border: `1px solid ${cardBorder}`,
            boxShadow: isDark
              ? '0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)'
              : '0 24px 80px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.9)',
          }}
        >
          {/* Card header: name + bio */}
          <div className="pt-14 pb-6 px-6 text-center">
            <h1
              className="text-xl sm:text-2xl font-black tracking-tight leading-snug mb-1"
              style={{ color: textColor }}
            >
              {displayName || 'اسم المكتب'}
            </h1>
            {profile.bio && (
              <p className="text-xs sm:text-sm leading-relaxed mt-2" style={{ color: subColor }}>
                {profile.bio}
              </p>
            )}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: dividerColor, marginInline: '1rem' }} />

          {/* Links */}
          <div className="p-4 space-y-2.5">
            {activeLinks.map((link, i) => (
              <a
                key={link.id}
                href={link.url || '#'}
                target={link.url ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="group w-full flex items-center gap-3 px-4 py-3.5 font-bold text-sm relative overflow-hidden"
                style={{
                  ...getBtnStyle(),
                  transition: 'transform 0.15s ease, box-shadow 0.2s ease',
                  animationDelay: `${i * 60}ms`,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px) scale(1.015)';
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 10px 28px ${appearance.btnColor}55`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.transform = '';
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = (getBtnStyle() as any).boxShadow ?? '';
                }}
              >
                {/* Shine on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: 'linear-gradient(110deg, transparent 38%, rgba(255,255,255,0.12) 50%, transparent 62%)' }} />
                {/* Icon */}
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 relative z-10"
                  style={{ background: iconBg, color: (getBtnStyle() as any).color }}
                >
                  <LinkIcon iconKey={link.icon} className="w-4 h-4" />
                </div>
                {/* Title */}
                <span className="flex-1 text-center relative z-10 font-bold tracking-wide">{link.title}</span>
                {/* Chevron */}
                <ChevronLeft className="w-4 h-4 flex-shrink-0 opacity-40 relative z-10 group-hover:opacity-70 transition-opacity" />
              </a>
            ))}
            {activeLinks.length === 0 && (
              <p className="text-center text-sm py-12" style={{ color: subColor, opacity: 0.5 }}>
                لم يتم إضافة روابط بعد
              </p>
            )}
          </div>

          {/* Card footer */}
          <div style={{ height: 1, background: dividerColor, margin: '0 1rem' }} />
          <div className="py-4 text-center">
            <span
              className="text-[10px] font-medium tracking-widest uppercase"
              style={{ color: subColor, opacity: 0.55 }}
            >
              الشات العقاري
            </span>
          </div>
        </div>

        {/* Bottom spacer */}
        <div className="h-10" />
      </div>

      {/* QR Dialog */}
      {isOwner && (
        <QRDialog
          open={qrOpen}
          onClose={() => setQrOpen(false)}
          url={pageUrl}
          officeName={displayName || office?.name || ''}
          logoUrl={avatarSrc || office?.logo_url}
        />
      )}
    </div>
  );
}

