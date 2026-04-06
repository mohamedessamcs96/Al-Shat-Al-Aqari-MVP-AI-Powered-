import { Users, Home, Award, Star, TrendingUp, Building2 } from 'lucide-react';
import type { StatsBlockData, Theme } from '../../lib/page-builder-types';

interface Props {
  data: StatsBlockData;
  theme: Theme;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Users, Home, Award, Star, TrendingUp, Building2,
};

const COLS_MAP: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
};

export function StatsBlock({ data, theme }: Props) {
  return (
    <div
      className="py-10 px-4"
      style={{ background: data.bgColor || 'transparent' }}
      dir="rtl"
    >
      <div className="max-w-5xl mx-auto">
        {data.title && (
          <h2 className="text-2xl font-bold text-center mb-8" style={{ color: theme.textColor }}>
            {data.title}
          </h2>
        )}

        <div className={`grid ${COLS_MAP[data.columns] || 'grid-cols-2 sm:grid-cols-4'} gap-4`}>
          {data.stats.map((stat, idx) => {
            const Icon = stat.icon ? ICON_MAP[stat.icon] : null;
            const color = stat.color || theme.primaryColor;

            if (data.style === 'minimal') {
              return (
                <div key={idx} className="text-center p-4">
                  {Icon && <Icon className="w-8 h-8 mx-auto mb-3" style={{ color }} />}
                  <p className="text-3xl font-extrabold" style={{ color: theme.textColor }}>
                    {stat.prefix}{stat.value}{stat.suffix}
                  </p>
                  <p className="text-sm mt-1" style={{ color: theme.mutedColor }}>{stat.label}</p>
                </div>
              );
            }

            if (data.style === 'gradient') {
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl text-white text-center"
                  style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
                >
                  {Icon && <Icon className="w-8 h-8 mx-auto mb-3 opacity-80" />}
                  <p className="text-3xl font-extrabold">{stat.prefix}{stat.value}{stat.suffix}</p>
                  <p className="text-sm mt-1 opacity-75">{stat.label}</p>
                </div>
              );
            }

            if (data.style === 'icon') {
              return (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-4 rounded-2xl"
                  style={{ background: theme.cardBgColor, border: `1px solid ${theme.mutedColor}22` }}
                >
                  {Icon && (
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${color}18` }}>
                      <Icon className="w-6 h-6" style={{ color }} />
                    </div>
                  )}
                  <div>
                    <p className="text-2xl font-extrabold" style={{ color: theme.textColor }}>
                      {stat.prefix}{stat.value}{stat.suffix}
                    </p>
                    <p className="text-xs" style={{ color: theme.mutedColor }}>{stat.label}</p>
                  </div>
                </div>
              );
            }

            // 'card' (default)
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl text-center transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{
                  background: theme.cardBgColor,
                  border: `1px solid ${theme.mutedColor}22`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                {Icon && (
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ background: `${color}15` }}>
                    <Icon className="w-6 h-6" style={{ color }} />
                  </div>
                )}
                <p className="text-3xl font-extrabold" style={{ color: theme.textColor }}>
                  {stat.prefix}{stat.value}{stat.suffix}
                </p>
                <p className="text-sm mt-1" style={{ color: theme.mutedColor }}>{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
