import { useState } from 'react';
import { CheckCircle2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import type { LeadCaptureBlockData, Theme } from '../../lib/page-builder-types';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface Props {
  data: LeadCaptureBlockData;
  theme: Theme;
  isEditing?: boolean;
}

const FIELD_CONFIG: Record<string, { label: string; type: string; placeholder: string }> = {
  name: { label: 'الاسم', type: 'text', placeholder: 'اسمك الكامل' },
  phone: { label: 'الجوال', type: 'tel', placeholder: '05xxxxxxxx' },
  email: { label: 'البريد', type: 'email', placeholder: 'email@example.com' },
  message: { label: 'الرسالة', type: 'text', placeholder: 'ما الذي تبحث عنه؟' },
  budget: { label: 'الميزانية', type: 'text', placeholder: 'مثال: 500,000 ريال' },
  area: { label: 'المنطقة', type: 'text', placeholder: 'الرياض، جدة...' },
};

export function LeadCaptureBlock({ data, theme, isEditing }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) return;
    const phone = values['phone'];
    if (!phone?.trim()) {
      toast.error('يرجى إدخال رقم الجوال');
      return;
    }
    setSubmitted(true);
  };

  const bgColor = data.bgColor || theme.primaryColor;
  const isCard = data.style === 'card';
  const isBanner = data.style === 'banner';

  if (submitted) {
    return (
      <div className="py-12 px-4">
        <div
          className="max-w-2xl mx-auto p-8 rounded-2xl text-center text-white"
          style={{ background: bgColor }}
        >
          <CheckCircle2 className="w-14 h-14 mx-auto mb-4 opacity-90" />
          <h3 className="text-xl font-bold mb-2">تم استلام طلبك!</h3>
          <p className="opacity-80">{data.successMessage || 'سنتواصل معك خلال 24 ساعة.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${isBanner ? 'py-14 px-4' : 'py-10 px-4'}`}
      style={isBanner ? { background: bgColor } : {}}
      dir="rtl"
    >
      <div className="max-w-3xl mx-auto">
        <div
          className={`${isCard ? 'p-8 rounded-2xl shadow-xl' : ''}`}
          style={isCard ? { background: bgColor } : {}}
        >
          <div className="text-center mb-8">
            {data.incentive && (
              <span
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
                style={isBanner || isCard
                  ? { background: 'rgba(255,255,255,0.15)', color: '#fff' }
                  : { background: `${theme.primaryColor}15`, color: theme.primaryColor }
                }
              >
                <Zap className="w-3.5 h-3.5" />
                {data.incentive}
              </span>
            )}
            <h2
              className="text-2xl font-bold mb-2"
              style={{ color: isBanner || isCard ? '#fff' : theme.textColor }}
            >
              {data.title}
            </h2>
            {data.subtitle && (
              <p
                className="text-sm"
                style={{ color: isBanner || isCard ? 'rgba(255,255,255,0.75)' : theme.mutedColor }}
              >
                {data.subtitle}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            {data.fields.map((fieldKey) => {
              const fc = FIELD_CONFIG[fieldKey as string] || { label: fieldKey, type: 'text', placeholder: '' };
              return (
                <div key={fieldKey} className="flex-1">
                  <Input
                    type={fc.type}
                    placeholder={fc.placeholder}
                    value={values[fieldKey] || ''}
                    onChange={(e) => setValues((p) => ({ ...p, [fieldKey]: e.target.value }))}
                    dir="rtl"
                    className={`h-12 ${isBanner || isCard ? 'bg-white/95 border-0 text-gray-900 placeholder:text-gray-500' : ''}`}
                  />
                </div>
              );
            })}

            <button
              type="submit"
              className="h-12 px-8 rounded-xl font-semibold text-sm whitespace-nowrap transition-all hover:opacity-90 hover:-translate-y-0.5"
              style={isBanner || isCard
                ? { background: '#fff', color: bgColor }
                : { background: theme.primaryColor, color: '#fff' }
              }
            >
              {data.ctaText || 'إرسال'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
