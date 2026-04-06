import { Shield, Star } from 'lucide-react';
import type { HeroBlockData, Theme } from '../../lib/page-builder-types';

interface Props {
  data: HeroBlockData;
  theme: Theme;
  isEditing?: boolean;
}

export function HeroBlock({ data, theme, isEditing }: Props) {
  const bg = data.heroBg || 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 45%, #312e81 100%)';

  return (
    <div
      className="relative overflow-hidden text-white"
      style={{ background: bg, paddingTop: '5rem', paddingBottom: '5rem' }}
    >
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 -translate-y-1/3 translate-x-1/3 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #60a5fa, transparent)' }} />
      <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-10 translate-y-1/3 -translate-x-1/4 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />

      <div className="relative max-w-4xl mx-auto px-6" style={{ textAlign: data.textAlign }}>
        {/* Logo */}
        {data.logoUrl && (
          <div className="inline-block mb-5 relative">
            <div className="absolute inset-0 rounded-full opacity-25 scale-125 animate-pulse"
              style={{ background: theme.accentColor }} />
            <img
              src={data.logoUrl}
              alt={data.officeName}
              className="relative w-24 h-24 rounded-full border-4 object-cover shadow-2xl"
              style={{ borderColor: 'rgba(255,255,255,0.8)' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.officeName)}&background=1e3a8a&color=fff&size=200`;
              }}
            />
          </div>
        )}

        {/* Name + badge */}
        <div className="flex items-center justify-center gap-3 mb-3 flex-wrap" dir="rtl">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{data.officeName}</h1>
          {data.showVerified && (
            <span className="inline-flex items-center gap-1 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
              <Shield className="w-3 h-3" />
              موثق
            </span>
          )}
        </div>

        {/* Tagline */}
        {data.tagline && (
          <p className="text-white/70 text-base sm:text-lg mb-6 max-w-xl mx-auto">{data.tagline}</p>
        )}

        {/* Rating */}
        {data.showRating && data.rating && (
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < Math.floor(data.rating!) ? 'fill-amber-400 text-amber-400' : 'text-white/25'}`}
                />
              ))}
            </div>
            <span className="text-white/70 text-sm">({data.rating})</span>
          </div>
        )}

        {/* Stats strip */}
        {data.showStats && data.stats.length > 0 && (
          <div
            className="inline-grid gap-3 max-w-sm mx-auto"
            style={{ gridTemplateColumns: `repeat(${data.stats.length}, 1fr)` }}
            dir="rtl"
          >
            {data.stats.map((stat, idx) => (
              <div
                key={idx}
                className="rounded-2xl py-3 px-2"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                <p className="text-xl sm:text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
