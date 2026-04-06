import { THEMES, BACKGROUNDS } from '../../lib/page-builder-defaults';
import type { Theme, Background } from '../../lib/page-builder-types';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Props {
  theme: Theme;
  background: Background;
  onUpdateTheme: (patch: Partial<Theme>) => void;
  onUpdateBackground: (patch: Partial<Background>) => void;
}

const FONT_OPTIONS: { value: Theme['fontFamily']; label: string }[] = [
  { value: 'cairo', label: 'Cairo' },
  { value: 'tajawal', label: 'Tajawal' },
  { value: 'noto-kufi', label: 'Noto Kufi' },
  { value: 'inter', label: 'Inter' },
  { value: 'poppins', label: 'Poppins' },
];

const BUTTON_STYLES: { value: Theme['buttonStyle']; label: string }[] = [
  { value: 'filled', label: 'ممتلئ' },
  { value: 'outline', label: 'محاط' },
  { value: 'ghost', label: 'شفاف' },
  { value: 'soft', label: 'ناعم' },
];

const BUTTON_RADIUS: { value: Theme['buttonRadius']; label: string }[] = [
  { value: 'none', label: 'مربع' },
  { value: 'sm', label: 'حواف صغيرة' },
  { value: 'md', label: 'حواف متوسطة' },
  { value: 'lg', label: 'حواف كبيرة' },
  { value: 'full', label: 'دائري' },
];

const PRESET_GRADIENTS = [
  { label: 'أزرق كلاسيك', value: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 45%, #312e81 100%)' },
  { label: 'أخضر زمردي', value: 'linear-gradient(135deg, #022c22 0%, #065f46 50%, #047857 100%)' },
  { label: 'بنفسجي فاخر', value: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)' },
  { label: 'ذهبي', value: 'linear-gradient(135deg, #78350f 0%, #92400e 50%, #b45309 100%)' },
  { label: 'وردي غروبي', value: 'linear-gradient(135deg, #831843 0%, #be185d 50%, #db2777 100%)' },
  { label: 'رمادي أنيق', value: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)' },
];

export function ThemeEditorPanel({ theme, background, onUpdateTheme, onUpdateBackground }: Props) {
  return (
    <div className="space-y-6 pb-6">
      {/* Preset themes */}
      <div>
        <Label className="text-xs font-semibold text-gray-500 mb-2 block">أثمة جاهزة</Label>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(THEMES).map(([key, t]) => (
            <button
              key={key}
              className="h-9 rounded-lg border-2 transition-all hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${t.primaryColor}, ${t.secondaryColor})`,
                borderColor: theme.primaryColor === t.primaryColor ? '#3b82f6' : 'transparent',
              }}
              onClick={() => onUpdateTheme(t)}
              title={key}
            />
          ))}
        </div>
      </div>

      <Divider />

      {/* Colors */}
      <div>
        <Label className="text-xs font-semibold text-gray-500 mb-3 block">الألوان</Label>
        <div className="space-y-2.5">
          <ColorRow label="اللون الأساسي" value={theme.primaryColor} onChange={(v) => onUpdateTheme({ primaryColor: v })} />
          <ColorRow label="اللون الثانوي" value={theme.secondaryColor} onChange={(v) => onUpdateTheme({ secondaryColor: v })} />
          <ColorRow label="لون التمييز" value={theme.accentColor} onChange={(v) => onUpdateTheme({ accentColor: v })} />
          <ColorRow label="لون الخلفية" value={theme.bgColor} onChange={(v) => onUpdateTheme({ bgColor: v })} />
          <ColorRow label="لون البطاقات" value={theme.cardBgColor} onChange={(v) => onUpdateTheme({ cardBgColor: v })} />
          <ColorRow label="لون النص" value={theme.textColor} onChange={(v) => onUpdateTheme({ textColor: v })} />
        </div>
      </div>

      <Divider />

      {/* Typography */}
      <div>
        <Label className="text-xs font-semibold text-gray-500 mb-2 block">الخط</Label>
        <Select value={theme.fontFamily} onValueChange={(v) => onUpdateTheme({ fontFamily: v as Theme['fontFamily'] })}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_OPTIONS.map((f) => (
              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Buttons */}
      <div>
        <Label className="text-xs font-semibold text-gray-500 mb-2 block">أسلوب الأزرار</Label>
        <div className="grid grid-cols-2 gap-2">
          {BUTTON_STYLES.map((s) => (
            <button
              key={s.value}
              className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${theme.buttonStyle === s.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
              onClick={() => onUpdateTheme({ buttonStyle: s.value })}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-xs font-semibold text-gray-500 mb-2 block">استدارة الأزرار</Label>
        <div className="grid grid-cols-3 gap-1.5">
          {BUTTON_RADIUS.map((r) => (
            <button
              key={r.value}
              className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${theme.buttonRadius === r.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
              onClick={() => onUpdateTheme({ buttonRadius: r.value })}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <Divider />

      {/* Background */}
      <div>
        <Label className="text-xs font-semibold text-gray-500 mb-2 block">خلفية الصفحة</Label>
        <div className="grid grid-cols-2 gap-1.5 mb-3">
          {(['color', 'gradient', 'image'] as const).map((type) => (
            <button
              key={type}
              className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${background.type === type ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
              onClick={() => onUpdateBackground({ type })}
            >
              {type === 'color' ? 'لون ثابت' : type === 'gradient' ? 'تدرج' : 'صورة'}
            </button>
          ))}
        </div>

        {background.type === 'color' && (
          <ColorRow label="لون الخلفية" value={background.color || '#f8fafc'} onChange={(v) => onUpdateBackground({ color: v })} />
        )}

        {background.type === 'gradient' && (
          <>
            <p className="text-xs text-gray-400 mb-2">تدرجات جاهزة</p>
            <div className="grid grid-cols-3 gap-1.5">
              {PRESET_GRADIENTS.map((g) => (
                <button
                  key={g.value}
                  className="h-10 rounded-lg border-2 transition-all hover:scale-105"
                  style={{
                    background: g.value,
                    borderColor: background.gradient === g.value ? '#3b82f6' : 'transparent',
                  }}
                  onClick={() => onUpdateBackground({ gradient: g.value })}
                  title={g.label}
                />
              ))}
            </div>
            <Input
              className="mt-2 text-xs h-8"
              value={background.gradient || ''}
              onChange={(e) => onUpdateBackground({ gradient: e.target.value })}
              placeholder="custom gradient CSS..."
            />
          </>
        )}

        {background.type === 'image' && (
          <div>
            <Input
              className="text-xs h-8"
              value={background.imageUrl || ''}
              onChange={(e) => onUpdateBackground({ imageUrl: e.target.value })}
              placeholder="https://... رابط الصورة"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-gray-600 flex-1">{label}</span>
      <div className="flex items-center gap-1.5">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-7 h-7 rounded border border-gray-200 cursor-pointer"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 h-7 text-xs font-mono"
        />
      </div>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-gray-100" />;
}
