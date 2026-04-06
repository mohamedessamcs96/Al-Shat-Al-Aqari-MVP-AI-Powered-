import { Shield, Award, Users, CheckCircle } from 'lucide-react';
import type { AboutBlockData, Theme } from '../../lib/page-builder-types';

interface Props {
  data: AboutBlockData;
  theme: Theme;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Shield, Award, Users, CheckCircle,
};

export function AboutBlock({ data, theme }: Props) {
  const hasImage = data.imageUrl && data.imagePosition !== 'none';
  const isTop = data.imagePosition === 'top';
  const isRight = data.imagePosition === 'right';

  return (
    <div className="py-12 px-4 max-w-5xl mx-auto" dir="rtl">
      {isTop && hasImage && (
        <div className="mb-8 rounded-2xl overflow-hidden max-h-64">
          <img src={data.imageUrl} alt={data.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className={`${!isTop && hasImage ? 'grid grid-cols-1 lg:grid-cols-2 gap-10 items-center' : ''}`}>
        {/* Image – left position */}
        {!isTop && hasImage && !isRight && (
          <div className="rounded-2xl overflow-hidden shadow-lg order-2 lg:order-1">
            <img src={data.imageUrl} alt={data.title} className="w-full h-72 object-cover" />
          </div>
        )}

        {/* Text */}
        <div className={`${!isTop && hasImage ? 'order-1 lg:order-2' : ''}`}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: theme.textColor }}>{data.title}</h2>
          <p className="text-base leading-relaxed mb-6 whitespace-pre-line" style={{ color: theme.mutedColor }}>
            {data.content}
          </p>

          {/* Highlights */}
          {data.highlights && data.highlights.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {data.highlights.map((h, i) => {
                const Icon = ICON_MAP[h.icon] || CheckCircle;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-3 rounded-xl"
                    style={{ background: `${theme.primaryColor}10` }}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" style={{ color: theme.primaryColor }} />
                    <span className="text-sm font-medium" style={{ color: theme.textColor }}>{h.text}</span>
                  </div>
                );
              })}
            </div>
          )}

          {data.showCTA && data.ctaText && (
            <a
              href={data.ctaUrl || '#contact'}
              className="inline-flex items-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background: theme.primaryColor }}
            >
              {data.ctaText}
            </a>
          )}
        </div>

        {/* Image – right position */}
        {!isTop && hasImage && isRight && (
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <img src={data.imageUrl} alt={data.title} className="w-full h-72 object-cover" />
          </div>
        )}
      </div>
    </div>
  );
}
