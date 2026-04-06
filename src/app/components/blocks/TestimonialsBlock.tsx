import { Star, Quote } from 'lucide-react';
import type { TestimonialsBlockData, Theme } from '../../lib/page-builder-types';

interface Props {
  data: TestimonialsBlockData;
  theme: Theme;
}

const COLS_MAP: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
};

export function TestimonialsBlock({ data, theme }: Props) {
  return (
    <div className="py-12 px-4 max-w-6xl mx-auto" dir="rtl">
      <h2 className="text-2xl font-bold text-center mb-8" style={{ color: theme.textColor }}>
        {data.title}
      </h2>

      <div className={`grid ${COLS_MAP[data.columns] || 'grid-cols-1 sm:grid-cols-3'} gap-5`}>
        {data.testimonials.map((t) => (
          <div
            key={t.id}
            className="p-6 rounded-2xl relative"
            style={{
              background: theme.cardBgColor,
              border: `1px solid ${theme.mutedColor}22`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <Quote
              className="absolute top-4 left-4 w-8 h-8 opacity-10"
              style={{ color: theme.primaryColor }}
            />

            {/* Stars */}
            <div className="flex gap-0.5 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                />
              ))}
            </div>

            <p className="text-sm leading-relaxed mb-5" style={{ color: theme.mutedColor }}>
              "{t.comment}"
            </p>

            <div className="flex items-center gap-3">
              {t.avatar ? (
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background: theme.primaryColor }}
                >
                  {t.name.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-semibold text-sm" style={{ color: theme.textColor }}>{t.name}</p>
                {t.role && <p className="text-xs" style={{ color: theme.mutedColor }}>{t.role}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
