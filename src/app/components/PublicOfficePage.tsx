import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  QrCode, Download, Copy, Check, ArrowLeft,
  BarChart3, Eye, MousePointerClick, UserPlus,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { offices as officesApi, pages as pagesApi } from '../lib/api-client';
import { BlockRenderer } from './blocks/BlockRenderer';
import type { PageConfig } from '../lib/page-builder-types';

// ─── Analytics mini-bar (shown to office owner in shared preview) ─────────────
function AnalyticsBar({ analytics }: { analytics: PageConfig['analytics'] }) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="flex items-center gap-4 bg-gray-900/90 backdrop-blur-md text-white text-xs font-medium px-5 py-2.5 rounded-full shadow-xl border border-white/10">
        <span className="flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-blue-400" />
          {analytics.totalViews.toLocaleString()} مشاهدة
        </span>
        <span className="w-px h-4 bg-white/20" />
        <span className="flex items-center gap-1.5">
          <MousePointerClick className="w-3.5 h-3.5 text-green-400" />
          {analytics.totalClicks.toLocaleString()} نقرة
        </span>
        <span className="w-px h-4 bg-white/20" />
        <span className="flex items-center gap-1.5">
          <UserPlus className="w-3.5 h-3.5 text-purple-400" />
          {analytics.totalLeads.toLocaleString()} عميل
        </span>
      </div>
    </div>
  );
}

// ─── QR Dialog ────────────────────────────────────────────────────────────────
function QRDialog({ open, onClose, url, officeName, logoUrl }: {
  open: boolean;
  onClose: () => void;
  url: string;
  officeName: string;
  logoUrl?: string;
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
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
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
            <QRCodeSVG
              ref={qrRef}
              value={url}
              size={200}
              level="H"
              includeMargin={false}
              imageSettings={logoUrl ? { src: logoUrl, height: 40, width: 40, excavate: true } : undefined}
            />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-900">{officeName}</p>
            <p className="text-xs text-gray-500 mt-0.5 break-all">{url}</p>
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
  );
}

// ─── Main public page component ───────────────────────────────────────────────
export function PublicOfficePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [qrOpen, setQrOpen] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [office, setOffice] = useState<any | null>(null);
  const [pageConfig, setPageConfig] = useState<PageConfig | null>(null);

  useEffect(() => {
    if (!slug) return;
    // Try slug first, fall back to ID lookup (allows preview via officeId)
    officesApi.getBySlug(slug)
      .then((data: any) => setOffice(data?.data ?? data))
      .catch(() => {
        officesApi.getById(slug)
          .then((data: any) => setOffice(data?.data ?? data))
          .catch(() => setOffice(null));
      });
    // Unwrap API envelope and ensure required structure
    pagesApi.getPublicPage(slug)
      .then((data: any) => {
        // unwrap API envelope: { success, data: {...} } or raw config
        const raw = data?.data ?? data;
        if (raw && typeof raw === 'object') {
          setPageConfig({
            theme: {},
            background: {},
            analytics: { totalViews: 0, totalClicks: 0, totalLeads: 0 },
            ...raw,
            blocks: Array.isArray(raw.blocks) ? raw.blocks : [],
          } as PageConfig);
        } else {
          setPageConfig(null);
        }
      })
      .catch(() => setPageConfig(null));
  }, [slug]);

  const pageUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/office/${slug}`
    : `/office/${slug}`;

  // Track page view
  useEffect(() => {
    if (office) {
      console.log('[analytics] page_view', { officId: office.id, slug });
    }
  }, [office, slug]);

  if (!office || !pageConfig) {
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

  const sortedBlocks = [...(pageConfig.blocks ?? [])]
    .filter((b) => b.visible)
    .sort((a, b) => a.order - b.order);

  // Page background style
  const pageBgStyle: React.CSSProperties = (() => {
    const bg = pageConfig.background ?? {};
    if (bg.type === 'gradient' && bg.gradient) return { background: bg.gradient };
    if (bg.type === 'image' && bg.imageUrl) return {
      backgroundImage: `url(${bg.imageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
    return { background: bg.color || pageConfig.theme?.bgColor || '#fff' };
  })();

  return (
    <div
      className="min-h-screen"
      style={{
        ...pageBgStyle,
        fontFamily: `${pageConfig.theme.fontFamily === 'cairo' ? 'Cairo' : pageConfig.theme.fontFamily === 'tajawal' ? 'Tajawal' : 'Inter'}, sans-serif`,
        color: pageConfig.theme.textColor,
      }}
    >
      {/* ── Floating action bar (top-right) ── */}
      <div className="fixed top-4 right-4 z-50 flex gap-2" dir="rtl">
        <button
          onClick={() => setQrOpen(true)}
          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all hover:scale-110"
          style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)' }}
          title="QR Code"
        >
          <QrCode className="w-5 h-5 text-gray-700" />
        </button>
        <button
          onClick={() => setShowAnalytics((v) => !v)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all hover:scale-110 ${showAnalytics ? 'bg-blue-600 text-white' : ''}`}
          style={showAnalytics ? {} : { background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)' }}
          title="تحليلات"
        >
          <BarChart3 className={`w-5 h-5 ${showAnalytics ? 'text-white' : 'text-gray-700'}`} />
        </button>
        <button
          onClick={() => navigate('/office/page-builder')}
          className="h-10 px-4 rounded-xl text-xs font-semibold shadow-lg transition-all hover:scale-105"
          style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', color: pageConfig.theme.primaryColor }}
        >
          تعديل الصفحة
        </button>
      </div>

      {/* ── Rendered blocks ── */}
      {sortedBlocks.map((block) => (
        <BlockRenderer
          key={block.id}
          block={block}
          theme={pageConfig.theme}
          officeId={office.id}
        />
      ))}

      {/* ── Footer ── */}
      <footer className="pt-8 pb-6 text-center" style={{ borderTop: `1px solid ${pageConfig.theme.mutedColor}20` }}>
        <p className="text-xs" style={{ color: pageConfig.theme.mutedColor }}>
          مدعوم بـ{' '}
          <a
            href="/"
            className="font-semibold hover:underline"
            style={{ color: pageConfig.theme.primaryColor }}
          >
            الشات العقاري
          </a>
        </p>
      </footer>

      {/* QR Dialog */}
      <QRDialog
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        url={pageUrl}
        officeName={office.name}
        logoUrl={office.logo_url}
      />

      {/* Analytics bar */}
      {showAnalytics && pageConfig.analytics && <AnalyticsBar analytics={pageConfig.analytics} />}
    </div>
  );
}
