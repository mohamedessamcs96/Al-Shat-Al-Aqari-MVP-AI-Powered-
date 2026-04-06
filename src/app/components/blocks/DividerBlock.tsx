import type { DividerBlockData, Theme } from '../../lib/page-builder-types';

interface Props {
  data: DividerBlockData;
  theme: Theme;
}

const SPACING_MAP = {
  sm: 'py-4',
  md: 'py-8',
  lg: 'py-12',
  xl: 'py-16',
};

export function DividerBlock({ data, theme }: Props) {
  const py = SPACING_MAP[data.spacing] || 'py-8';

  if (data.style === 'none') {
    return <div className={py} />;
  }

  return (
    <div className={`${py} px-8 max-w-5xl mx-auto`}>
      {data.text ? (
        <div className="relative flex items-center gap-4">
          <div className="flex-1 h-px" style={{ background: data.color || `${theme.mutedColor}40` }} />
          <span className="text-sm font-medium px-4" style={{ color: theme.mutedColor }}>{data.text}</span>
          <div className="flex-1 h-px" style={{ background: data.color || `${theme.mutedColor}40` }} />
        </div>
      ) : data.style === 'gradient' ? (
        <div
          className="h-px w-full"
          style={{ background: `linear-gradient(to right, transparent, ${data.color || theme.primaryColor}, transparent)` }}
        />
      ) : data.style === 'dots' ? (
        <div className="flex justify-center gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: data.color || `${theme.mutedColor}60` }} />
          ))}
        </div>
      ) : data.style === 'double' ? (
        <div className="space-y-1.5">
          <div className="h-px w-full" style={{ background: data.color || `${theme.mutedColor}40` }} />
          <div className="h-px w-full" style={{ background: data.color || `${theme.mutedColor}40` }} />
        </div>
      ) : data.style === 'dashes' ? (
        <div
          className="h-px w-full"
          style={{ borderTop: `2px dashed ${data.color || `${theme.mutedColor}50`}` }}
        />
      ) : (
        <div className="h-px w-full" style={{ background: data.color || `${theme.mutedColor}30` }} />
      )}
    </div>
  );
}
