import {
  Instagram, Twitter, Facebook, Linkedin, Youtube,
  Globe, Phone, Mail, MessageCircle,
} from 'lucide-react';
import type { SocialsBlockData, SocialPlatform, Theme } from '../../lib/page-builder-types';

interface Props {
  data: SocialsBlockData;
  theme: Theme;
}

interface PlatformInfo {
  label: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PLATFORMS: Record<SocialPlatform, PlatformInfo> = {
  instagram: { label: 'Instagram', color: '#e1306c', icon: Instagram },
  twitter: { label: 'Twitter', color: '#1da1f2', icon: Twitter },
  x: { label: 'X', color: '#000000', icon: Twitter },
  facebook: { label: 'Facebook', color: '#1877f2', icon: Facebook },
  linkedin: { label: 'LinkedIn', color: '#0a66c2', icon: Linkedin },
  youtube: { label: 'YouTube', color: '#ff0000', icon: Youtube },
  snapchat: { label: 'Snapchat', color: '#fffc00', icon: MessageCircle },
  tiktok: { label: 'TikTok', color: '#010101', icon: MessageCircle },
  whatsapp: { label: 'WhatsApp', color: '#25d366', icon: MessageCircle },
  website: { label: 'موقع ويب', color: '#3b82f6', icon: Globe },
  phone: { label: 'اتصال', color: '#10b981', icon: Phone },
  email: { label: 'بريد إلكتروني', color: '#8b5cf6', icon: Mail },
};

const SIZE_MAP = {
  sm: { icon: 'w-4 h-4', container: 'w-8 h-8 text-xs' },
  md: { icon: 'w-5 h-5', container: 'w-10 h-10 text-sm' },
  lg: { icon: 'w-6 h-6', container: 'w-12 h-12 text-base' },
};

const ALIGN_MAP = { left: 'justify-start', center: 'justify-center', right: 'justify-end' };

export function SocialsBlock({ data, theme }: Props) {
  const size = SIZE_MAP[data.size] || SIZE_MAP.md;
  const justify = ALIGN_MAP[data.alignment] || 'justify-center';

  return (
    <div className="py-8 px-4 max-w-3xl mx-auto" dir="rtl">
      {data.title && (
        <h2 className="text-xl font-bold text-center mb-6" style={{ color: theme.textColor }}>
          {data.title}
        </h2>
      )}

      <div className={`flex flex-wrap gap-3 ${justify}`}>
        {data.links.map((link) => {
          const pInfo = PLATFORMS[link.platform] || { label: link.label || link.platform, color: '#666', icon: Globe };
          const Icon = pInfo.icon;
          const label = link.label || pInfo.label;

          if (data.style === 'icons') {
            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                title={label}
                className={`${size.container} rounded-2xl flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg`}
                style={{ background: `${pInfo.color}18`, color: pInfo.color }}
              >
                <Icon className={size.icon} />
              </a>
            );
          }

          if (data.style === 'pills') {
            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:opacity-80 hover:scale-105"
                style={{ background: `${pInfo.color}18`, color: pInfo.color }}
              >
                <Icon className={size.icon} />
                {label}
              </a>
            );
          }

          // buttons
          return (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
              style={{ background: pInfo.color }}
            >
              <Icon className={size.icon} />
              {label}
            </a>
          );
        })}
      </div>
    </div>
  );
}
