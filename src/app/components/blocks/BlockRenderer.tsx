import type { Block, Theme } from '../../lib/page-builder-types';
import type { HeroBlockData, LinksBlockData, PropertiesBlockData, AboutBlockData, StatsBlockData, ContactFormBlockData, SocialsBlockData, DividerBlockData, LeadCaptureBlockData, TestimonialsBlockData } from '../../lib/page-builder-types';
import { HeroBlock } from './HeroBlock';
import { LinksBlock } from './LinksBlock';
import { PropertiesBlock } from './PropertiesBlock';
import { AboutBlock } from './AboutBlock';
import { StatsBlock } from './StatsBlock';
import { ContactFormBlock } from './ContactFormBlock';
import { SocialsBlock } from './SocialsBlock';
import { DividerBlock } from './DividerBlock';
import { LeadCaptureBlock } from './LeadCaptureBlock';
import { TestimonialsBlock } from './TestimonialsBlock';

interface Props {
  block: Block;
  theme: Theme;
  officeId?: string;
  isEditing?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

export function BlockRenderer({ block, theme, officeId, isEditing, isSelected, onClick }: Props) {
  if (!block.visible) return null;

  const wrapperClass = isEditing
    ? `relative cursor-pointer transition-all ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 rounded-lg' : 'hover:ring-2 hover:ring-blue-300 hover:ring-offset-1 hover:rounded-lg'}`
    : '';

  const inner = renderBlock(block, theme, officeId, isEditing);
  if (!inner) return null;

  if (!isEditing) return inner;

  return (
    <div className={wrapperClass} onClick={onClick}>
      {inner}
      {isSelected && (
        <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-md pointer-events-none z-10">
          محدد
        </div>
      )}
    </div>
  );
}

function renderBlock(block: Block, theme: Theme, officeId?: string, isEditing?: boolean) {
  switch (block.type) {
    case 'hero':
      return <HeroBlock data={block.data as HeroBlockData} theme={theme} isEditing={isEditing} />;
    case 'links':
      return <LinksBlock data={block.data as LinksBlockData} theme={theme} />;
    case 'properties':
      return <PropertiesBlock data={block.data as PropertiesBlockData} theme={theme} officeId={officeId} isEditing={isEditing} />;
    case 'about':
      return <AboutBlock data={block.data as AboutBlockData} theme={theme} />;
    case 'stats':
      return <StatsBlock data={block.data as StatsBlockData} theme={theme} />;
    case 'contact-form':
      return <ContactFormBlock data={block.data as ContactFormBlockData} theme={theme} isEditing={isEditing} />;
    case 'socials':
      return <SocialsBlock data={block.data as SocialsBlockData} theme={theme} />;
    case 'divider':
      return <DividerBlock data={block.data as DividerBlockData} theme={theme} />;
    case 'lead-capture':
      return <LeadCaptureBlock data={block.data as LeadCaptureBlockData} theme={theme} isEditing={isEditing} />;
    case 'testimonials':
      return <TestimonialsBlock data={block.data as TestimonialsBlockData} theme={theme} />;
    default:
      return null;
  }
}
