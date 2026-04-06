import { X, Trash2, Eye, EyeOff } from 'lucide-react';
import type { Block, Theme } from '../../lib/page-builder-types';
import type {
  HeroBlockData, LinksBlockData, PropertiesBlockData, AboutBlockData,
  StatsBlockData, ContactFormBlockData, SocialsBlockData, DividerBlockData,
  LeadCaptureBlockData, TestimonialsBlockData,
} from '../../lib/page-builder-types';
import { BLOCK_CATALOG } from '../../lib/page-builder-defaults';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Props {
  block: Block;
  theme: Theme;
  onUpdate: (patch: Record<string, unknown>) => void;
  onUpdateBlock: (patch: Partial<Block>) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function BlockSettingsPanel({ block, theme, onUpdate, onUpdateBlock, onDelete, onClose }: Props) {
  const catalog = BLOCK_CATALOG.find((c) => c.type === block.type);

  return (
    <div className="flex flex-col h-full" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: catalog?.color || '#94a3b8' }} />
          <h3 className="font-semibold text-sm text-gray-800">{catalog?.nameAr || block.type}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500"
            onClick={() => onUpdateBlock({ visible: !block.visible })}
            title={block.visible ? 'إخفاء' : 'إظهار'}
          >
            {block.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
          <button
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-50 text-red-400"
            onClick={onDelete}
            title="حذف"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {block.type === 'hero' && <HeroSettings data={block.data as HeroBlockData} onUpdate={onUpdate} />}
        {block.type === 'links' && <LinksSettings data={block.data as LinksBlockData} onUpdate={onUpdate} />}
        {block.type === 'properties' && <PropertiesSettings data={block.data as PropertiesBlockData} onUpdate={onUpdate} />}
        {block.type === 'about' && <AboutSettings data={block.data as AboutBlockData} onUpdate={onUpdate} />}
        {block.type === 'stats' && <StatsSettings data={block.data as StatsBlockData} onUpdate={onUpdate} />}
        {block.type === 'contact-form' && <ContactFormSettings data={block.data as ContactFormBlockData} onUpdate={onUpdate} />}
        {block.type === 'socials' && <SocialsSettings data={block.data as SocialsBlockData} onUpdate={onUpdate} />}
        {block.type === 'divider' && <DividerSettings data={block.data as DividerBlockData} onUpdate={onUpdate} />}
        {block.type === 'lead-capture' && <LeadCaptureSettings data={block.data as LeadCaptureBlockData} onUpdate={onUpdate} />}
        {block.type === 'testimonials' && <TestimonialsSettings data={block.data as TestimonialsBlockData} onUpdate={onUpdate} />}
      </div>
    </div>
  );
}

// ─── Section helpers ──────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-2.5 uppercase tracking-wide">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs text-gray-600 mb-1 block">{label}</Label>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-gray-100" />;
}

// ─── Block-specific settings ──────────────────────────────────────────────────
function HeroSettings({ data, onUpdate }: { data: HeroBlockData; onUpdate: (p: Record<string, unknown>) => void }) {
  return (
    <>
      <Section title="المحتوى">
        <Field label="اسم المكتب">
          <Input value={data.officeName} onChange={(e) => onUpdate({ officeName: e.target.value })} className="h-8 text-sm" />
        </Field>
        <Field label="الشعار/الوصف">
          <Input value={data.tagline} onChange={(e) => onUpdate({ tagline: e.target.value })} className="h-8 text-sm" />
        </Field>
        <Field label="رابط الشعار">
          <Input value={data.logoUrl} onChange={(e) => onUpdate({ logoUrl: e.target.value })} className="h-8 text-sm" placeholder="https://..." />
        </Field>
      </Section>
      <Divider />
      <Section title="الإعدادات">
        <ToggleField label="إظهار الإحصائيات" value={data.showStats} onChange={(v) => onUpdate({ showStats: v })} />
        <ToggleField label="إظهار التقييم" value={data.showRating} onChange={(v) => onUpdate({ showRating: v })} />
        <ToggleField label="شارة موثق" value={data.showVerified} onChange={(v) => onUpdate({ showVerified: v })} />
        <Field label="تدرج الهيدر">
          <Input value={data.heroBg || ''} onChange={(e) => onUpdate({ heroBg: e.target.value })} className="h-8 text-xs" placeholder="linear-gradient(...)" />
        </Field>
      </Section>
    </>
  );
}

function LinksSettings({ data, onUpdate }: { data: LinksBlockData; onUpdate: (p: Record<string, unknown>) => void }) {
  return (
    <>
      <Section title="الروابط">
        <Field label="العنوان (اختياري)">
          <Input value={data.title || ''} onChange={(e) => onUpdate({ title: e.target.value })} className="h-8 text-sm" />
        </Field>
        <div className="bg-gray-50 rounded-xl p-3 space-y-2">
          {data.links.map((link, i) => (
            <div key={link.id} className="space-y-1.5">
              <Input
                value={link.label}
                onChange={(e) => {
                  const links = [...data.links];
                  links[i] = { ...links[i], label: e.target.value };
                  onUpdate({ links });
                }}
                className="h-7 text-xs"
                placeholder="نص الزر"
              />
              <Input
                value={link.url}
                onChange={(e) => {
                  const links = [...data.links];
                  links[i] = { ...links[i], url: e.target.value };
                  onUpdate({ links });
                }}
                className="h-7 text-xs"
                placeholder="https://..."
              />
            </div>
          ))}
          <button
            className="w-full py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded border border-dashed border-blue-200"
            onClick={() => onUpdate({ links: [...data.links, { id: crypto.randomUUID(), label: 'رابط جديد', url: '#' }] })}
          >
            + إضافة رابط
          </button>
        </div>
      </Section>
      <Divider />
      <Section title="المظهر">
        <SelectField
          label="تخطيط"
          value={data.layout}
          options={[{ value: 'list', label: 'قائمة' }, { value: 'grid', label: 'شبكة' }]}
          onChange={(v) => onUpdate({ layout: v })}
        />
        <SelectField
          label="أسلوب الأزرار"
          value={data.buttonStyle}
          options={[
            { value: 'filled', label: 'ممتلئ' },
            { value: 'outline', label: 'محاط' },
            { value: 'ghost', label: 'شفاف' },
            { value: 'soft', label: 'ناعم' },
          ]}
          onChange={(v) => onUpdate({ buttonStyle: v })}
        />
        <SelectField
          label="استدارة الأزرار"
          value={data.buttonRadius}
          options={[
            { value: 'none', label: 'مربع' }, { value: 'sm', label: 'صغير' },
            { value: 'md', label: 'متوسط' }, { value: 'lg', label: 'كبير' }, { value: 'full', label: 'دائري' },
          ]}
          onChange={(v) => onUpdate({ buttonRadius: v })}
        />
        <SelectField
          label="التباعد"
          value={data.spacing}
          options={[{ value: 'tight', label: 'ضيق' }, { value: 'normal', label: 'عادي' }, { value: 'loose', label: 'واسع' }]}
          onChange={(v) => onUpdate({ spacing: v })}
        />
      </Section>
    </>
  );
}

function PropertiesSettings({ data, onUpdate }: { data: PropertiesBlockData; onUpdate: (p: Record<string, unknown>) => void }) {
  return (
    <>
      <Section title="العنوان">
        <Field label="عنوان القسم">
          <Input value={data.title} onChange={(e) => onUpdate({ title: e.target.value })} className="h-8 text-sm" />
        </Field>
        <Field label="وصف القسم">
          <Input value={data.subtitle || ''} onChange={(e) => onUpdate({ subtitle: e.target.value })} className="h-8 text-sm" />
        </Field>
      </Section>
      <Divider />
      <Section title="العرض">
        <SelectField
          label="نمط العرض"
          value={data.displayMode}
          options={[{ value: 'grid', label: 'شبكة' }, { value: 'list', label: 'قائمة' }]}
          onChange={(v) => onUpdate({ displayMode: v })}
        />
        <SelectField
          label="عدد الأعمدة"
          value={String(data.columns)}
          options={[{ value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }]}
          onChange={(v) => onUpdate({ columns: parseInt(v) })}
        />
        <SelectField
          label="أسلوب البطاقة"
          value={data.cardStyle}
          options={[
            { value: 'default', label: 'افتراضي' }, { value: 'minimal', label: 'مبسط' },
            { value: 'overlay', label: 'طبقة فوقية' }, { value: 'detailed', label: 'تفصيلي' },
          ]}
          onChange={(v) => onUpdate({ cardStyle: v })}
        />
        <Field label="أقصى عدد للعقارات">
          <Input
            type="number"
            min={1} max={20}
            value={data.maxItems}
            onChange={(e) => onUpdate({ maxItems: parseInt(e.target.value) || 6 })}
            className="h-8 text-sm"
          />
        </Field>
      </Section>
      <Divider />
      <Section title="الخيارات">
        <ToggleField label="إظهار السعر" value={data.showPrice} onChange={(v) => onUpdate({ showPrice: v })} />
        <ToggleField label="إظهار المساحة" value={data.showArea} onChange={(v) => onUpdate({ showArea: v })} />
        <ToggleField label="إظهار الغرف" value={data.showBedrooms} onChange={(v) => onUpdate({ showBedrooms: v })} />
        <ToggleField label="إظهار التصفية" value={data.showFilters} onChange={(v) => onUpdate({ showFilters: v })} />
        <ToggleField label="رابط عرض الكل" value={data.showViewAll} onChange={(v) => onUpdate({ showViewAll: v })} />
      </Section>
    </>
  );
}

function AboutSettings({ data, onUpdate }: { data: AboutBlockData; onUpdate: (p: Record<string, unknown>) => void }) {
  return (
    <>
      <Section title="المحتوى">
        <Field label="العنوان">
          <Input value={data.title} onChange={(e) => onUpdate({ title: e.target.value })} className="h-8 text-sm" />
        </Field>
        <Field label="النص">
          <Textarea rows={4} value={data.content} onChange={(e) => onUpdate({ content: e.target.value })} className="text-sm" />
        </Field>
        <Field label="رابط الصورة">
          <Input value={data.imageUrl || ''} onChange={(e) => onUpdate({ imageUrl: e.target.value })} className="h-8 text-sm" placeholder="https://..." />
        </Field>
        <SelectField
          label="موضع الصورة"
          value={data.imagePosition}
          options={[{ value: 'right', label: 'يمين' }, { value: 'left', label: 'يسار' }, { value: 'top', label: 'أعلى' }, { value: 'none', label: 'بدون صورة' }]}
          onChange={(v) => onUpdate({ imagePosition: v })}
        />
      </Section>
      <Divider />
      <Section title="زر الإجراء">
        <ToggleField label="إظهار الزر" value={data.showCTA} onChange={(v) => onUpdate({ showCTA: v })} />
        {data.showCTA && (
          <>
            <Field label="نص الزر">
              <Input value={data.ctaText || ''} onChange={(e) => onUpdate({ ctaText: e.target.value })} className="h-8 text-sm" />
            </Field>
            <Field label="رابط الزر">
              <Input value={data.ctaUrl || ''} onChange={(e) => onUpdate({ ctaUrl: e.target.value })} className="h-8 text-sm" placeholder="#contact" />
            </Field>
          </>
        )}
      </Section>
    </>
  );
}

function StatsSettings({ data, onUpdate }: { data: StatsBlockData; onUpdate: (p: Record<string, unknown>) => void }) {
  return (
    <>
      <Section title="الإحصائيات">
        <Field label="العنوان">
          <Input value={data.title || ''} onChange={(e) => onUpdate({ title: e.target.value })} className="h-8 text-sm" />
        </Field>
        <SelectField
          label="أسلوب العرض"
          value={data.style}
          options={[
            { value: 'card', label: 'بطاقة' }, { value: 'minimal', label: 'مبسط' },
            { value: 'gradient', label: 'تدرج' }, { value: 'icon', label: 'أيقونة' },
          ]}
          onChange={(v) => onUpdate({ style: v })}
        />
        <SelectField
          label="عدد الأعمدة"
          value={String(data.columns)}
          options={[{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }]}
          onChange={(v) => onUpdate({ columns: parseInt(v) })}
        />
        <div className="space-y-2">
          {data.stats.map((stat, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-2 space-y-1.5">
              <Input
                value={stat.value}
                onChange={(e) => {
                  const stats = [...data.stats];
                  stats[i] = { ...stats[i], value: e.target.value };
                  onUpdate({ stats });
                }}
                className="h-7 text-xs"
                placeholder="القيمة"
              />
              <Input
                value={stat.suffix || ''}
                onChange={(e) => {
                  const stats = [...data.stats];
                  stats[i] = { ...stats[i], suffix: e.target.value };
                  onUpdate({ stats });
                }}
                className="h-7 text-xs"
                placeholder="اللاحقة (+، %...)"
              />
              <Input
                value={stat.label}
                onChange={(e) => {
                  const stats = [...data.stats];
                  stats[i] = { ...stats[i], label: e.target.value };
                  onUpdate({ stats });
                }}
                className="h-7 text-xs"
                placeholder="التسمية"
              />
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

function ContactFormSettings({ data, onUpdate }: { data: ContactFormBlockData; onUpdate: (p: Record<string, unknown>) => void }) {
  return (
    <>
      <Section title="المحتوى">
        <Field label="العنوان">
          <Input value={data.title} onChange={(e) => onUpdate({ title: e.target.value })} className="h-8 text-sm" />
        </Field>
        <Field label="الوصف">
          <Input value={data.subtitle || ''} onChange={(e) => onUpdate({ subtitle: e.target.value })} className="h-8 text-sm" />
        </Field>
        <Field label="نص زر الإرسال">
          <Input value={data.submitText} onChange={(e) => onUpdate({ submitText: e.target.value })} className="h-8 text-sm" />
        </Field>
        <Field label="رسالة النجاح">
          <Input value={data.successMessage} onChange={(e) => onUpdate({ successMessage: e.target.value })} className="h-8 text-sm" />
        </Field>
      </Section>
      <Divider />
      <Section title="الاتصال السريع">
        <ToggleField label="زر الاتصال" value={data.showCallButton} onChange={(v) => onUpdate({ showCallButton: v })} />
        {data.showCallButton && (
          <Field label="رقم الهاتف"><Input value={data.callNumber || ''} onChange={(e) => onUpdate({ callNumber: e.target.value })} className="h-8 text-sm" /></Field>
        )}
        <ToggleField label="زر واتساب" value={data.showWhatsApp} onChange={(v) => onUpdate({ showWhatsApp: v })} />
        {data.showWhatsApp && (
          <Field label="رقم واتساب"><Input value={data.whatsappNumber || ''} onChange={(e) => onUpdate({ whatsappNumber: e.target.value })} className="h-8 text-sm" placeholder="966500000000" /></Field>
        )}
      </Section>
    </>
  );
}

function SocialsSettings({ data, onUpdate }: { data: SocialsBlockData; onUpdate: (p: Record<string, unknown>) => void }) {
  return (
    <>
      <Section title="الروابط الاجتماعية">
        <Field label="العنوان">
          <Input value={data.title || ''} onChange={(e) => onUpdate({ title: e.target.value })} className="h-8 text-sm" />
        </Field>
        <div className="space-y-2">
          {data.links.map((link, i) => (
            <div key={link.id} className="bg-gray-50 rounded-lg p-2 space-y-1.5">
              <p className="text-xs text-gray-500 font-medium">{link.platform}</p>
              <Input
                value={link.url}
                onChange={(e) => {
                  const links = [...data.links];
                  links[i] = { ...links[i], url: e.target.value };
                  onUpdate({ links });
                }}
                className="h-7 text-xs"
                placeholder="https://..."
              />
            </div>
          ))}
        </div>
      </Section>
      <Divider />
      <Section title="المظهر">
        <SelectField
          label="أسلوب العرض"
          value={data.style}
          options={[{ value: 'icons', label: 'أيقونات' }, { value: 'pills', label: 'حبات' }, { value: 'buttons', label: 'أزرار' }]}
          onChange={(v) => onUpdate({ style: v })}
        />
        <SelectField
          label="الحجم"
          value={data.size}
          options={[{ value: 'sm', label: 'صغير' }, { value: 'md', label: 'متوسط' }, { value: 'lg', label: 'كبير' }]}
          onChange={(v) => onUpdate({ size: v })}
        />
        <SelectField
          label="المحاذاة"
          value={data.alignment}
          options={[{ value: 'right', label: 'يمين' }, { value: 'center', label: 'وسط' }, { value: 'left', label: 'يسار' }]}
          onChange={(v) => onUpdate({ alignment: v })}
        />
      </Section>
    </>
  );
}

function DividerSettings({ data, onUpdate }: { data: DividerBlockData; onUpdate: (p: Record<string, unknown>) => void }) {
  return (
    <Section title="الفاصل">
      <SelectField
        label="النمط"
        value={data.style}
        options={[
          { value: 'line', label: 'خط' }, { value: 'dots', label: 'نقاط' },
          { value: 'dashes', label: 'متقطع' }, { value: 'gradient', label: 'تدرج' },
          { value: 'double', label: 'مزدوج' }, { value: 'none', label: 'فراغ فقط' },
        ]}
        onChange={(v) => onUpdate({ style: v })}
      />
      <SelectField
        label="التباعد"
        value={data.spacing}
        options={[{ value: 'sm', label: 'صغير' }, { value: 'md', label: 'متوسط' }, { value: 'lg', label: 'كبير' }, { value: 'xl', label: 'كبير جداً' }]}
        onChange={(v) => onUpdate({ spacing: v })}
      />
      {data.style !== 'none' && (
        <Field label="نص (اختياري)">
          <Input value={data.text || ''} onChange={(e) => onUpdate({ text: e.target.value })} className="h-8 text-sm" placeholder="أو" />
        </Field>
      )}
    </Section>
  );
}

function LeadCaptureSettings({ data, onUpdate }: { data: LeadCaptureBlockData; onUpdate: (p: Record<string, unknown>) => void }) {
  const allFields = ['name', 'phone', 'email', 'message', 'budget', 'area'] as const;
  const LABELS: Record<string, string> = {
    name: 'الاسم', phone: 'الجوال', email: 'البريد', message: 'الرسالة', budget: 'الميزانية', area: 'المنطقة',
  };

  return (
    <>
      <Section title="المحتوى">
        <Field label="العنوان">
          <Input value={data.title} onChange={(e) => onUpdate({ title: e.target.value })} className="h-8 text-sm" />
        </Field>
        <Field label="الوصف">
          <Input value={data.subtitle || ''} onChange={(e) => onUpdate({ subtitle: e.target.value })} className="h-8 text-sm" />
        </Field>
        <Field label="نص الزر">
          <Input value={data.ctaText} onChange={(e) => onUpdate({ ctaText: e.target.value })} className="h-8 text-sm" />
        </Field>
        <Field label="الحافز (اختياري)">
          <Input value={data.incentive || ''} onChange={(e) => onUpdate({ incentive: e.target.value })} className="h-8 text-sm" placeholder="استشارة مجانية" />
        </Field>
      </Section>
      <Divider />
      <Section title="الحقول">
        <div className="grid grid-cols-2 gap-1.5">
          {allFields.map((f) => {
            const selected = data.fields.includes(f);
            return (
              <button
                key={f}
                className={`py-1.5 text-xs rounded-lg border transition-all ${selected ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                onClick={() => {
                  const fields = selected ? data.fields.filter((x: string) => x !== f) : [...data.fields, f];
                  onUpdate({ fields });
                }}
              >
                {LABELS[f]}
              </button>
            );
          })}
        </div>
      </Section>
      <Divider />
      <Section title="المظهر">
        <SelectField
          label="أسلوب العرض"
          value={data.style}
          options={[{ value: 'banner', label: 'بانر ملون' }, { value: 'card', label: 'بطاقة' }, { value: 'inline', label: 'مدمج' }]}
          onChange={(v) => onUpdate({ style: v })}
        />
        <Field label="لون الخلفية">
          <div className="flex gap-2">
            <input
              type="color"
              value={data.bgColor || '#1e40af'}
              onChange={(e) => onUpdate({ bgColor: e.target.value })}
              className="w-8 h-8 rounded border cursor-pointer"
            />
            <Input value={data.bgColor || '#1e40af'} onChange={(e) => onUpdate({ bgColor: e.target.value })} className="h-8 text-xs" />
          </div>
        </Field>
      </Section>
    </>
  );
}

function TestimonialsSettings({ data, onUpdate }: { data: TestimonialsBlockData; onUpdate: (p: Record<string, unknown>) => void }) {
  return (
    <>
      <Section title="الإعدادات">
        <Field label="العنوان">
          <Input value={data.title} onChange={(e) => onUpdate({ title: e.target.value })} className="h-8 text-sm" />
        </Field>
        <SelectField
          label="نمط العرض"
          value={data.displayMode}
          options={[{ value: 'grid', label: 'شبكة' }, { value: 'carousel', label: 'سلايدر' }]}
          onChange={(v) => onUpdate({ displayMode: v })}
        />
        <SelectField
          label="عدد الأعمدة"
          value={String(data.columns)}
          options={[{ value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' }]}
          onChange={(v) => onUpdate({ columns: parseInt(v) })}
        />
      </Section>
      <Divider />
      <Section title="التقييمات">
        {data.testimonials.map((t, i) => (
          <div key={t.id} className="bg-gray-50 rounded-xl p-3 space-y-2">
            <Input
              value={t.name}
              onChange={(e) => {
                const ts = [...data.testimonials];
                ts[i] = { ...ts[i], name: e.target.value };
                onUpdate({ testimonials: ts });
              }}
              className="h-7 text-xs"
              placeholder="الاسم"
            />
            <Textarea
              value={t.comment}
              onChange={(e) => {
                const ts = [...data.testimonials];
                ts[i] = { ...ts[i], comment: e.target.value };
                onUpdate({ testimonials: ts });
              }}
              rows={2}
              className="text-xs"
              placeholder="التعليق"
            />
          </div>
        ))}
      </Section>
    </>
  );
}

// ─── Reusable sub-controls ────────────────────────────────────────────────────
function ToggleField({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-600">{label}</span>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}

function SelectField({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (v: string) => void;
}) {
  return (
    <Field label={label}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-8 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}
