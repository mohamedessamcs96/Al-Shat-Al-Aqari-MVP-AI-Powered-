// ─── Page Builder Type System ───────────────────────────────────────────────
// Block-based JSON configuration for the Linktree-style real estate page builder

export type BlockType =
  | 'hero'
  | 'links'
  | 'properties'
  | 'about'
  | 'stats'
  | 'contact-form'
  | 'socials'
  | 'divider'
  | 'testimonials'
  | 'lead-capture';

export type FontFamily = 'cairo' | 'tajawal' | 'noto-kufi' | 'inter' | 'poppins';
export type ButtonStyle = 'filled' | 'outline' | 'ghost' | 'soft';
export type ButtonRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';
export type LayoutMode = 'list' | 'grid' | 'cards';
export type BackgroundType = 'color' | 'gradient' | 'image' | 'pattern';

// ─── Theme ───────────────────────────────────────────────────────────────────
export interface Theme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  bgColor: string;
  cardBgColor: string;
  textColor: string;
  mutedColor: string;
  fontFamily: FontFamily;
  buttonStyle: ButtonStyle;
  buttonRadius: ButtonRadius;
  customCss?: string;
}

// ─── Background ──────────────────────────────────────────────────────────────
export interface Background {
  type: BackgroundType;
  color?: string;
  gradient?: string;   // valid CSS gradient e.g. "linear-gradient(135deg, #667eea, #764ba2)"
  imageUrl?: string;
  overlay?: string;    // rgba overlay color
  pattern?: 'dots' | 'grid' | 'diagonal' | 'none';
}

// ─── Block Data Interfaces ────────────────────────────────────────────────────

export interface HeroBlockData {
  logoUrl: string;
  officeName: string;
  tagline: string;
  coverImageUrl?: string;
  showStats: boolean;
  stats: Array<{ value: string; label: string }>;
  showRating: boolean;
  rating?: number;
  showVerified: boolean;
  textAlign: 'left' | 'center' | 'right';
  heroBg?: string;    // override gradient for hero section
}

export interface LinkItem {
  id: string;
  label: string;
  url: string;
  icon?: string;      // lucide icon name
  style?: ButtonStyle;
  color?: string;
  bgColor?: string;
  isExternal?: boolean;
}

export interface LinksBlockData {
  title?: string;
  links: LinkItem[];
  layout: 'list' | 'grid';
  columns?: 1 | 2 | 3;
  buttonStyle: ButtonStyle;
  buttonRadius: ButtonRadius;
  spacing: 'tight' | 'normal' | 'loose';
}

export interface PropertyFilter {
  type?: string[];
  priceMin?: number;
  priceMax?: number;
  city?: string;
  bedrooms?: number;
  status?: 'active' | 'sold' | 'all';
}

export interface PropertiesBlockData {
  title: string;
  subtitle?: string;
  displayMode: 'grid' | 'list' | 'masonry';
  columns: 1 | 2 | 3 | 4;
  maxItems: number;
  showPrice: boolean;
  showArea: boolean;
  showBedrooms: boolean;
  showFilters: boolean;
  filter: PropertyFilter;
  cardStyle: 'default' | 'minimal' | 'overlay' | 'detailed';
  showViewAll: boolean;
  viewAllUrl?: string;
}

export interface AboutBlockData {
  title: string;
  content: string;
  imageUrl?: string;
  imagePosition: 'left' | 'right' | 'top' | 'none';
  showCTA: boolean;
  ctaText?: string;
  ctaUrl?: string;
  highlights?: Array<{ icon: string; text: string }>;
}

export interface StatItem {
  value: string;
  label: string;
  icon?: string;
  color?: string;
  prefix?: string;
  suffix?: string;
}

export interface StatsBlockData {
  title?: string;
  stats: StatItem[];
  columns: 2 | 3 | 4;
  style: 'minimal' | 'card' | 'gradient' | 'icon';
  bgColor?: string;
  animated?: boolean;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'select' | 'textarea';
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export interface ContactFormBlockData {
  title: string;
  subtitle?: string;
  fields: FormField[];
  submitText: string;
  successMessage: string;
  showWhatsApp: boolean;
  whatsappNumber?: string;
  showCallButton: boolean;
  callNumber?: string;
  showEmail?: boolean;
  emailAddress?: string;
}

export type SocialPlatform =
  | 'whatsapp' | 'instagram' | 'twitter' | 'x'
  | 'facebook' | 'linkedin' | 'youtube'
  | 'snapchat' | 'tiktok' | 'website' | 'phone' | 'email';

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  url: string;
  label?: string;
}

export interface SocialsBlockData {
  title?: string;
  links: SocialLink[];
  style: 'icons' | 'pills' | 'buttons';
  size: 'sm' | 'md' | 'lg';
  alignment: 'left' | 'center' | 'right';
  showLabels?: boolean;
}

export interface DividerBlockData {
  style: 'line' | 'dots' | 'dashes' | 'double' | 'gradient' | 'none';
  spacing: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  text?: string;
}

export interface LeadCaptureBlockData {
  title: string;
  subtitle?: string;
  style: 'banner' | 'card' | 'inline';
  fields: Array<'name' | 'phone' | 'email' | 'message' | 'budget' | 'area'>;
  ctaText: string;
  bgColor?: string;
  incentive?: string;
  successMessage?: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role?: string;
  rating: number;
  comment: string;
  date?: string;
  avatar?: string;
}

export interface TestimonialsBlockData {
  title: string;
  testimonials: TestimonialItem[];
  displayMode: 'grid' | 'carousel' | 'masonry';
  columns: 1 | 2 | 3;
}

// ─── Block Union ─────────────────────────────────────────────────────────────
export type BlockData =
  | HeroBlockData
  | LinksBlockData
  | PropertiesBlockData
  | AboutBlockData
  | StatsBlockData
  | ContactFormBlockData
  | SocialsBlockData
  | DividerBlockData
  | LeadCaptureBlockData
  | TestimonialsBlockData;

export interface Block {
  id: string;
  type: BlockType;
  order: number;
  visible: boolean;
  data: BlockData;
}

// ─── SEO & Analytics ──────────────────────────────────────────────────────────
export interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
}

export interface BlockAnalytics {
  blockId: string;
  blockType: BlockType;
  impressions: number;
  clicks: number;
}

export interface PageAnalytics {
  totalViews: number;
  uniqueVisitors: number;
  totalClicks: number;
  totalLeads: number;
  topSources: Array<{ source: string; count: number }>;
  blockStats: BlockAnalytics[];
}

// ─── Full Page Config ─────────────────────────────────────────────────────────
export interface PageConfig {
  id: string;
  officeId: string;
  slug: string;
  publishedAt?: string;
  updatedAt: string;
  theme: Theme;
  background: Background;
  blocks: Block[];
  seo: SEOConfig;
  analytics: PageAnalytics;
}

// ─── Templates ───────────────────────────────────────────────────────────────
export interface PageTemplate {
  id: string;
  name: string;
  nameAr: string;
  description?: string;
  thumbnail?: string;
  theme: Theme;
  background: Background;
  blocks: Omit<Block, 'id'>[];
}

// ─── Editor State ─────────────────────────────────────────────────────────────
export interface EditorState {
  pageConfig: PageConfig;
  selectedBlockId: string | null;
  activeTab: 'blocks' | 'theme' | 'settings';
  isDirty: boolean;
  previewMode: boolean;
  devicePreview: 'desktop' | 'tablet' | 'mobile';
}
