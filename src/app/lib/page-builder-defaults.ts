const uuidv4 = () => crypto.randomUUID();

import type {
  PageConfig, PageTemplate, Theme, Background, Block,
  HeroBlockData, LinksBlockData, PropertiesBlockData, AboutBlockData,
  StatsBlockData, ContactFormBlockData, SocialsBlockData, LeadCaptureBlockData,
  DividerBlockData, TestimonialsBlockData,
} from './page-builder-types';

// ─── Built-in Themes ──────────────────────────────────────────────────────────
export const THEMES: Record<string, Theme> = {
  classic: {
    primaryColor: '#1e40af',
    secondaryColor: '#1e3a8a',
    accentColor: '#3b82f6',
    bgColor: '#f8fafc',
    cardBgColor: '#ffffff',
    textColor: '#0f172a',
    mutedColor: '#64748b',
    fontFamily: 'cairo',
    buttonStyle: 'filled',
    buttonRadius: 'lg',
  },
  emerald: {
    primaryColor: '#065f46',
    secondaryColor: '#047857',
    accentColor: '#10b981',
    bgColor: '#f0fdf4',
    cardBgColor: '#ffffff',
    textColor: '#022c22',
    mutedColor: '#6b7280',
    fontFamily: 'cairo',
    buttonStyle: 'filled',
    buttonRadius: 'lg',
  },
  luxe: {
    primaryColor: '#7c3aed',
    secondaryColor: '#5b21b6',
    accentColor: '#a78bfa',
    bgColor: '#0f0f1a',
    cardBgColor: '#1a1a2e',
    textColor: '#f8f8ff',
    mutedColor: '#94a3b8',
    fontFamily: 'tajawal',
    buttonStyle: 'soft',
    buttonRadius: 'full',
  },
  golden: {
    primaryColor: '#92400e',
    secondaryColor: '#78350f',
    accentColor: '#f59e0b',
    bgColor: '#fffbeb',
    cardBgColor: '#ffffff',
    textColor: '#1c1917',
    mutedColor: '#78716c',
    fontFamily: 'cairo',
    buttonStyle: 'outline',
    buttonRadius: 'md',
  },
  slate: {
    primaryColor: '#334155',
    secondaryColor: '#1e293b',
    accentColor: '#64748b',
    bgColor: '#f1f5f9',
    cardBgColor: '#ffffff',
    textColor: '#0f172a',
    mutedColor: '#475569',
    fontFamily: 'inter',
    buttonStyle: 'filled',
    buttonRadius: 'md',
  },
};

// ─── Built-in Backgrounds ─────────────────────────────────────────────────────
export const BACKGROUNDS: Record<string, Background> = {
  light: { type: 'color', color: '#f8fafc' },
  dark: { type: 'color', color: '#0f172a' },
  heroBlue: {
    type: 'gradient',
    gradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #312e81 100%)',
  },
  emeraldGrad: {
    type: 'gradient',
    gradient: 'linear-gradient(135deg, #022c22 0%, #065f46 50%, #047857 100%)',
  },
  luxePurple: {
    type: 'gradient',
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
  },
  sunsetGold: {
    type: 'gradient',
    gradient: 'linear-gradient(135deg, #78350f 0%, #92400e 50%, #b45309 100%)',
  },
  dotPattern: {
    type: 'color',
    color: '#f8fafc',
    pattern: 'dots',
  },
  gridPattern: {
    type: 'color',
    color: '#ffffff',
    pattern: 'grid',
  },
};

// ─── Default block factories ──────────────────────────────────────────────────
export function makeHeroBlock(officeData?: Partial<HeroBlockData>): Block {
  return {
    id: uuidv4(),
    type: 'hero',
    order: 0,
    visible: true,
    data: {
      logoUrl: officeData?.logoUrl || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200',
      officeName: officeData?.officeName || 'مكتبك العقاري',
      tagline: officeData?.tagline || 'خبراء العقارات في خدمتكم',
      showStats: true,
      stats: [
        { value: '50+', label: 'عقار' },
        { value: '10+', label: 'سنوات' },
        { value: '500+', label: 'عميل' },
      ],
      showRating: true,
      rating: 4.8,
      showVerified: true,
      textAlign: 'center',
      heroBg: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 45%, #312e81 100%)',
    } as HeroBlockData,
  };
}

export function makeLinksBlock(): Block {
  return {
    id: uuidv4(),
    type: 'links',
    order: 1,
    visible: true,
    data: {
      title: 'روابط سريعة',
      links: [
        { id: uuidv4(), label: 'واتساب', url: 'https://wa.me/966500000000', icon: 'MessageCircle' },
        { id: uuidv4(), label: 'اتصل بنا', url: 'tel:+966500000000', icon: 'Phone' },
        { id: uuidv4(), label: 'موقعنا الإلكتروني', url: '#', icon: 'Globe' },
      ],
      layout: 'list',
      columns: 1,
      buttonStyle: 'filled',
      buttonRadius: 'lg',
      spacing: 'normal',
    } as LinksBlockData,
  };
}

export function makePropertiesBlock(): Block {
  return {
    id: uuidv4(),
    type: 'properties',
    order: 2,
    visible: true,
    data: {
      title: 'عقاراتنا',
      subtitle: 'اكتشف أفضل العقارات المتاحة لدينا',
      displayMode: 'grid',
      columns: 3,
      maxItems: 6,
      showPrice: true,
      showArea: true,
      showBedrooms: true,
      showFilters: true,
      filter: { status: 'active' },
      cardStyle: 'default',
      showViewAll: true,
    } as PropertiesBlockData,
  };
}

export function makeAboutBlock(): Block {
  return {
    id: uuidv4(),
    type: 'about',
    order: 3,
    visible: true,
    data: {
      title: 'من نحن',
      content: 'نحن مكتب عقاري متخصص في بيع وشراء وتأجير العقارات السكنية والتجارية. نقدم خدمات احترافية بخبرة تزيد عن 10 سنوات في السوق العقاري.',
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600',
      imagePosition: 'right',
      showCTA: true,
      ctaText: 'تواصل معنا',
      ctaUrl: '#contact',
      highlights: [
        { icon: 'Shield', text: 'مرخص رسمياً' },
        { icon: 'Award', text: 'أفضل مكتب 2024' },
        { icon: 'Users', text: 'فريق محترف' },
      ],
    } as AboutBlockData,
  };
}

export function makeStatsBlock(): Block {
  return {
    id: uuidv4(),
    type: 'stats',
    order: 4,
    visible: true,
    data: {
      title: 'أرقامنا',
      stats: [
        { value: '500', suffix: '+', label: 'عميل راضٍ', icon: 'Users', color: '#3b82f6' },
        { value: '50', suffix: '+', label: 'عقار مباع', icon: 'Home', color: '#10b981' },
        { value: '10', suffix: '+', label: 'سنوات خبرة', icon: 'Award', color: '#f59e0b' },
        { value: '4.8', label: 'تقييم المتوسط', icon: 'Star', color: '#8b5cf6' },
      ],
      columns: 4,
      style: 'card',
      animated: true,
    } as StatsBlockData,
  };
}

export function makeContactFormBlock(): Block {
  return {
    id: uuidv4(),
    type: 'contact-form',
    order: 5,
    visible: true,
    data: {
      title: 'تواصل معنا',
      subtitle: 'يسعدنا مساعدتك في إيجاد العقار المناسب',
      fields: [
        { name: 'name', label: 'الاسم الكامل', type: 'text', required: true, placeholder: 'أدخل اسمك' },
        { name: 'phone', label: 'رقم الجوال', type: 'phone', required: true, placeholder: '05xxxxxxxx' },
        { name: 'email', label: 'البريد الإلكتروني', type: 'email', required: false, placeholder: '' },
        { name: 'message', label: 'الرسالة', type: 'textarea', required: false, placeholder: 'أخبرنا بما تبحث عنه...' },
      ],
      submitText: 'إرسال',
      successMessage: 'شكراً! سنتواصل معك قريباً.',
      showWhatsApp: true,
      whatsappNumber: '966500000000',
      showCallButton: true,
      callNumber: '+966500000000',
    } as ContactFormBlockData,
  };
}

export function makeSocialsBlock(): Block {
  return {
    id: uuidv4(),
    type: 'socials',
    order: 6,
    visible: true,
    data: {
      title: 'تابعنا',
      links: [
        { id: uuidv4(), platform: 'instagram', url: 'https://instagram.com/', label: 'Instagram' },
        { id: uuidv4(), platform: 'twitter', url: 'https://twitter.com/', label: 'X (Twitter)' },
        { id: uuidv4(), platform: 'facebook', url: 'https://facebook.com/', label: 'Facebook' },
        { id: uuidv4(), platform: 'youtube', url: 'https://youtube.com/', label: 'YouTube' },
      ],
      style: 'icons',
      size: 'lg',
      alignment: 'center',
      showLabels: false,
    } as SocialsBlockData,
  };
}

export function makeLeadCaptureBlock(): Block {
  return {
    id: uuidv4(),
    type: 'lead-capture',
    order: 7,
    visible: true,
    data: {
      title: 'ابحث عن عقارك المثالي',
      subtitle: 'أخبرنا بمتطلباتك وسنجد لك أفضل الخيارات',
      style: 'banner',
      fields: ['name', 'phone', 'budget'],
      ctaText: 'أرسل طلبك',
      bgColor: '#1e40af',
      incentive: 'استشارة مجانية',
      successMessage: 'تم استلام طلبك! سنتواصل معك خلال 24 ساعة.',
    } as LeadCaptureBlockData,
  };
}

export function makeDividerBlock(): Block {
  return {
    id: uuidv4(),
    type: 'divider',
    order: 99,
    visible: true,
    data: {
      style: 'gradient',
      spacing: 'md',
    } as DividerBlockData,
  };
}

export function makeTestimonialsBlock(): Block {
  return {
    id: uuidv4(),
    type: 'testimonials',
    order: 8,
    visible: true,
    data: {
      title: 'آراء عملائنا',
      testimonials: [
        {
          id: uuidv4(),
          name: 'أحمد الرشيد',
          role: 'مشتري',
          rating: 5,
          comment: 'خدمة ممتازة وفريق محترف. ساعدني في إيجاد الفيلا المثالية بأفضل سعر.',
          date: '2026-01-15',
        },
        {
          id: uuidv4(),
          name: 'سارة محمد',
          role: 'مستأجرة',
          rating: 5,
          comment: 'تعامل راقٍ وسريع في الإجراءات. أنصح الجميع بالتعامل معهم.',
          date: '2026-02-20',
        },
        {
          id: uuidv4(),
          name: 'خالد العمري',
          role: 'مستثمر',
          rating: 4,
          comment: 'معرفة واسعة بالسوق العقاري وتقديم اقتراحات استثمارية رائعة.',
          date: '2026-03-05',
        },
      ],
      displayMode: 'grid',
      columns: 3,
    } as TestimonialsBlockData,
  };
}

// ─── Block metadata (for the palette UI) ─────────────────────────────────────
export const BLOCK_CATALOG = [
  { type: 'hero' as const, nameAr: 'البطل / الهيدر', icon: 'LayoutTemplate', color: '#3b82f6', description: 'صورة غلاف، شعار، اسم المكتب' },
  { type: 'properties' as const, nameAr: 'العقارات', icon: 'Building2', color: '#10b981', description: 'بطاقات العقارات مع تصفية' },
  { type: 'links' as const, nameAr: 'الروابط', icon: 'Link', color: '#f59e0b', description: 'أزرار روابط قابلة للتخصيص' },
  { type: 'about' as const, nameAr: 'من نحن', icon: 'Info', color: '#8b5cf6', description: 'نص تعريفي مع صورة' },
  { type: 'stats' as const, nameAr: 'الإحصائيات', icon: 'BarChart3', color: '#ec4899', description: 'أرقام وإنجازات المكتب' },
  { type: 'contact-form' as const, nameAr: 'نموذج التواصل', icon: 'MessageSquare', color: '#06b6d4', description: 'نموذج واتساب وهاتف' },
  { type: 'lead-capture' as const, nameAr: 'استجذاب العملاء', icon: 'UserPlus', color: '#f97316', description: 'بانر جمع بيانات العملاء' },
  { type: 'socials' as const, nameAr: 'التواصل الاجتماعي', icon: 'Share2', color: '#6366f1', description: 'أيقونات وروابط السوشيال' },
  { type: 'testimonials' as const, nameAr: 'آراء العملاء', icon: 'Star', color: '#eab308', description: 'تقييمات وشهادات العملاء' },
  { type: 'divider' as const, nameAr: 'فاصل', icon: 'Minus', color: '#94a3b8', description: 'فاصل بين الأقسام' },
];

// ─── Default page config factory ─────────────────────────────────────────────
export function makeDefaultPageConfig(officeId: string, slug: string, officeName?: string, logoUrl?: string): PageConfig {
  const blocks: Block[] = [
    makeHeroBlock({ officeName: officeName || 'مكتبك العقاري', logoUrl }),
    makePropertiesBlock(),
    makeStatsBlock(),
    makeAboutBlock(),
    makeLeadCaptureBlock(),
    makeContactFormBlock(),
    makeSocialsBlock(),
  ].map((b, i) => ({ ...b, order: i }));

  return {
    id: uuidv4(),
    officeId,
    slug,
    updatedAt: new Date().toISOString(),
    theme: { ...THEMES.classic },
    background: { type: 'color', color: '#f8fafc' },
    blocks,
    seo: {
      title: officeName ? `${officeName} | الشات العقاري` : 'مكتب عقاري | الشات العقاري',
      description: 'اكتشف أفضل العقارات مع مكتبنا العقاري المتميز',
    },
    analytics: {
      totalViews: 0,
      uniqueVisitors: 0,
      totalClicks: 0,
      totalLeads: 0,
      topSources: [],
      blockStats: [],
    },
  };
}

// ─── Templates ────────────────────────────────────────────────────────────────
export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: 'template-classic',
    name: 'Classic',
    nameAr: 'كلاسيك',
    description: 'تصميم احترافي بألوان هادئة',
    theme: { ...THEMES.classic },
    background: { type: 'color', color: '#f8fafc' },
    blocks: [
      { type: 'hero', order: 0, visible: true, data: makeHeroBlock().data },
      { type: 'stats', order: 1, visible: true, data: makeStatsBlock().data },
      { type: 'properties', order: 2, visible: true, data: makePropertiesBlock().data },
      { type: 'about', order: 3, visible: true, data: makeAboutBlock().data },
      { type: 'contact-form', order: 4, visible: true, data: makeContactFormBlock().data },
      { type: 'socials', order: 5, visible: true, data: makeSocialsBlock().data },
    ],
  },
  {
    id: 'template-luxe',
    name: 'Luxe',
    nameAr: 'فاخر',
    description: 'تصميم فاخر بألوان بنفسجية داكنة',
    theme: { ...THEMES.luxe },
    background: BACKGROUNDS.luxePurple,
    blocks: [
      { type: 'hero', order: 0, visible: true, data: { ...makeHeroBlock().data, heroBg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)' } },
      { type: 'properties', order: 1, visible: true, data: { ...makePropertiesBlock().data, cardStyle: 'overlay' } },
      { type: 'lead-capture', order: 2, visible: true, data: makeLeadCaptureBlock().data },
      { type: 'stats', order: 3, visible: true, data: { ...makeStatsBlock().data, style: 'gradient' } as StatsBlockData },
      { type: 'testimonials', order: 4, visible: true, data: makeTestimonialsBlock().data },
      { type: 'contact-form', order: 5, visible: true, data: makeContactFormBlock().data },
      { type: 'socials', order: 6, visible: true, data: { ...makeSocialsBlock().data, style: 'pills' } as SocialsBlockData },
    ],
  },
  {
    id: 'template-minimal',
    name: 'Minimal',
    nameAr: 'مبسّط',
    description: 'تصميم بسيط وسريع التحميل',
    theme: { ...THEMES.slate },
    background: { type: 'color', color: '#ffffff' },
    blocks: [
      { type: 'hero', order: 0, visible: true, data: makeHeroBlock().data },
      { type: 'links', order: 1, visible: true, data: makeLinksBlock().data },
      { type: 'properties', order: 2, visible: true, data: { ...makePropertiesBlock().data, maxItems: 4, columns: 2 } },
      { type: 'contact-form', order: 3, visible: true, data: makeContactFormBlock().data },
    ],
  },
];

// ─── Mock page configs for existing offices ───────────────────────────────────
export const mockPageConfigs: Record<string, PageConfig> = {
  'office-1': makeDefaultPageConfig('office-1', 'prime-real-estate', 'Prime Real Estate', 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200'),
  'office-2': makeDefaultPageConfig('office-2', 'golden-key-properties', 'Golden Key Properties', 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=200'),
  'office-3': makeDefaultPageConfig('office-3', 'elite-homes', 'Elite Homes'),
};
