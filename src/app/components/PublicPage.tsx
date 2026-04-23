import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { pages as pagesApi } from '../lib/api-client';
import { BlockRenderer } from './blocks/BlockRenderer';
import type { Block, Theme, Background } from '../lib/page-builder-types';

interface PageConfig {
  theme: Theme;
  background: Background;
  seo?: { title?: string; description?: string };
  blocks: Block[];
  officeId?: string;
  slug?: string;
}

export function PublicPage() {
  const { slug } = useParams<{ slug: string }>();
  const [config, setConfig] = useState<PageConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) { setLoading(false); setNotFound(true); return; }

    pagesApi.getPublicPage(slug)
      .then((raw: any) => {
        // Unwrap possible envelope: { data: {...} }
        const data = raw?.data ?? raw;
        if (!data?.blocks) { setNotFound(true); return; }
        setConfig(data as PageConfig);

        // Update document title
        if (data?.seo?.title) document.title = data.seo.title;
        if (data?.seo?.description) {
          const meta = document.querySelector('meta[name="description"]');
          if (meta) meta.setAttribute('content', data.seo.description);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500" dir="rtl">جاري التحميل…</p>
        </div>
      </div>
    );
  }

  if (notFound || !config) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4" dir="rtl">
        <p className="text-2xl font-bold text-gray-700">الصفحة غير موجودة</p>
        <p className="text-sm text-gray-400">لم يتم نشر هذه الصفحة أو الرابط غير صحيح.</p>
        <Link to="/" className="mt-2 text-blue-600 underline text-sm">الرئيسية</Link>
      </div>
    );
  }

  const { theme, background, blocks, officeId } = config;

  const bgStyle = (() => {
    if (!background) return { backgroundColor: theme?.bgColor || '#ffffff' };
    if (background.type === 'gradient' && background.gradient)
      return { background: background.gradient };
    if (background.type === 'image' && background.imageUrl)
      return {
        backgroundImage: `url(${background.imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    return { backgroundColor: background.color || theme?.bgColor || '#ffffff' };
  })();

  const sortedBlocks = [...(blocks || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div
      className="min-h-screen"
      style={{
        ...bgStyle,
        fontFamily: theme?.fontFamily === 'cairo' ? 'Cairo, sans-serif'
          : theme?.fontFamily === 'tajawal' ? 'Tajawal, sans-serif'
          : theme?.fontFamily === 'noto-kufi' ? '"Noto Kufi Arabic", sans-serif'
          : 'inherit',
      }}
    >
      {background?.type === 'image' && background?.overlay && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{ backgroundColor: background.overlay }}
        />
      )}

      <div className="relative">
        {sortedBlocks.map((block) => (
          <BlockRenderer
            key={block.id}
            block={block}
            theme={theme}
            officeId={officeId}
            isEditing={false}
          />
        ))}
      </div>
    </div>
  );
}
