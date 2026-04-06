import { ExternalLink, Phone, Mail, MessageCircle, Globe, Link, ArrowRight } from 'lucide-react';
import type { LinksBlockData, Theme } from '../../lib/page-builder-types';

interface Props {
  data: LinksBlockData;
  theme: Theme;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Phone, Mail, MessageCircle, Globe, Link, ExternalLink, ArrowRight,
};

function getButtonClasses(style: string, radius: string) {
  const radiusMap: Record<string, string> = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-xl',
    full: 'rounded-full',
  };
  const r = radiusMap[radius] || 'rounded-xl';
  return r;
}

interface Props {
  data: LinksBlockData;
  theme: Theme;
}

export function LinksBlock({ data, theme }: Props) {
  const spacingMap = { tight: 'gap-2', normal: 'gap-3', loose: 'gap-5' };
  const gap = spacingMap[data.spacing] || 'gap-3';
  const radius = getButtonClasses('', data.buttonRadius);

  const isGrid = data.layout === 'grid';
  const cols = data.columns || 1;
  const gridCols: Record<number, string> = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3' };

  return (
    <div className="py-8 px-4 max-w-2xl mx-auto" dir="rtl">
      {data.title && (
        <h2 className="text-xl font-bold mb-5 text-center" style={{ color: theme.textColor }}>
          {data.title}
        </h2>
      )}

      <div className={`${isGrid ? `grid ${gridCols[cols] || 'grid-cols-1'}` : 'flex flex-col'} ${gap}`}>
        {data.links.map((link) => {
          const Icon = link.icon ? ICON_MAP[link.icon] : null;
          const isWhatsApp = link.url.includes('wa.me') || link.icon === 'MessageCircle';

          let btnStyle: React.CSSProperties = {};
          let btnClass = `w-full flex items-center justify-center gap-3 py-3.5 px-6 font-semibold text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg ${radius}`;

          if (link.bgColor) {
            btnStyle = { background: link.bgColor, color: link.color || '#fff' };
          } else if (data.buttonStyle === 'filled') {
            btnStyle = { background: isWhatsApp ? '#16a34a' : theme.primaryColor, color: '#fff' };
          } else if (data.buttonStyle === 'outline') {
            btnStyle = { background: 'transparent', color: theme.primaryColor, border: `2px solid ${theme.primaryColor}` };
          } else if (data.buttonStyle === 'ghost') {
            btnStyle = { background: 'rgba(0,0,0,0.04)', color: theme.textColor };
          } else if (data.buttonStyle === 'soft') {
            btnStyle = { background: `${theme.primaryColor}18`, color: theme.primaryColor };
          }

          return (
            <a
              key={link.id}
              href={link.url}
              target={link.isExternal ? '_blank' : undefined}
              rel={link.isExternal ? 'noopener noreferrer' : undefined}
              className={btnClass}
              style={btnStyle}
            >
              {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
              <span>{link.label}</span>
              {link.isExternal && <ExternalLink className="w-3 h-3 opacity-60" />}
            </a>
          );
        })}
      </div>
    </div>
  );
}
