import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  QrCode, Download, Copy, Check, Edit3,
  Link2, Instagram, Twitter, Youtube, Facebook,
  Phone, Globe, MessageCircle, Linkedin,
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

  const pageUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/office/${slug}`
    : `/office/${slug}`;

  // Show edit controls only to the office owner
  const storedUser = getUser();
  const isOwner = storedUser?.slug === slug || storedUser?.id === (office as any)?.id;

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

  return (
    <div className="min-h-screen" style={{ ...bgStyle, fontFamily }} dir="rtl">

      {/* ── Floating action bar — owner only ── */}
      {isOwner && (
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <button
            onClick={() => setQrOpen(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all hover:scale-110"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}
            title="QR Code"
          >
            <QrCode className="w-5 h-5" style={{ color: textColor }} />
          </button>
          <button
            onClick={() => navigate('/office/linktree')}
            className="h-10 px-4 rounded-xl text-xs font-semibold shadow-lg transition-all hover:scale-105 flex items-center gap-1.5"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', color: textColor }}
          >
            <Edit3 className="w-3.5 h-3.5" />
            تعديل
          </button>
        </div>
      )}

      {/* ── Linktree content ── */}
      <div className="flex flex-col items-center py-16 px-5 min-h-screen">
        {/* Avatar */}
        <div
          className="w-24 h-24 rounded-full overflow-hidden border-4 shadow-xl mb-4 flex-shrink-0 flex items-center justify-center"
          style={{ borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.2)' }}
        >
          {profile.avatar
            ? <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
            : <span className="text-3xl font-bold" style={{ color: textColor }}>{profile.name?.[0] || '؟'}</span>
          }
        </div>

        {/* Name */}
        <h1 className="text-xl font-extrabold mb-1" style={{ color: textColor }}>
          {profile.name || office.name || 'اسم المكتب'}
        </h1>

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm text-center max-w-xs mb-6" style={{ color: subColor }}>
            {profile.bio}
          </p>
        )}
        {!profile.bio && <div className="mb-6" />}

        {/* Links */}
        <div className="w-full max-w-xs space-y-3">
          {activeLinks.map(link => (
            <a
              key={link.id}
              href={link.url || '#'}
              target={link.url ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-4 py-3.5 font-semibold text-sm transition-all hover:opacity-90 hover:scale-[1.02]"
              style={getBtnStyle()}
            >
              <LinkIcon iconKey={link.icon} className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-center">{link.title}</span>
            </a>
          ))}
          {activeLinks.length === 0 && (
            <p className="text-center text-sm py-6" style={{ color: subColor, opacity: 0.6 }}>
              لم يتم إضافة روابط بعد
            </p>
          )}
        </div>

        {/* Footer */}
        <p className="mt-auto pt-12 text-xs" style={{ color: subColor, opacity: 0.4 }}>
          مدعوم بـ الشات العقاري
        </p>
      </div>

      {/* QR Dialog — owner only */}
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

