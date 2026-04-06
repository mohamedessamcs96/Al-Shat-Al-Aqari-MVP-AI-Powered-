import { useState } from 'react';
import { Phone, Mail, MessageCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import type { ContactFormBlockData, Theme } from '../../lib/page-builder-types';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';

interface Props {
  data: ContactFormBlockData;
  theme: Theme;
  isEditing?: boolean;
}

export function ContactFormBlock({ data, theme, isEditing }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) return;
    // Validate required
    const missing = data.fields.filter((f) => f.required && !values[f.name]?.trim());
    if (missing.length > 0) {
      toast.error(`يرجى تعبئة: ${missing.map((f) => f.label).join('، ')}`);
      return;
    }
    setSubmitted(true);
    toast.success(data.successMessage || 'تم إرسال رسالتك بنجاح!');
  };

  return (
    <div className="py-12 px-4 max-w-2xl mx-auto" id="contact" dir="rtl">
      <h2 className="text-2xl font-bold text-center mb-2" style={{ color: theme.textColor }}>
        {data.title}
      </h2>
      {data.subtitle && (
        <p className="text-sm text-center mb-8" style={{ color: theme.mutedColor }}>{data.subtitle}</p>
      )}

      {/* Quick action buttons */}
      <div className="flex gap-3 mb-8">
        {data.showCallButton && data.callNumber && (
          <a
            href={`tel:${data.callNumber}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
            style={{ background: '#16a34a' }}
          >
            <Phone className="w-4 h-4" />
            اتصل الآن
          </a>
        )}
        {data.showWhatsApp && data.whatsappNumber && (
          <a
            href={`https://wa.me/${data.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
            style={{ background: '#25d366' }}
          >
            <MessageCircle className="w-4 h-4" />
            واتساب
          </a>
        )}
      </div>

      {/* Form */}
      {submitted ? (
        <div
          className="p-8 rounded-2xl text-center"
          style={{ background: theme.cardBgColor, border: `1px solid ${theme.mutedColor}22` }}
        >
          <CheckCircle2 className="w-14 h-14 mx-auto mb-4" style={{ color: theme.primaryColor }} />
          <h3 className="text-lg font-bold mb-2" style={{ color: theme.textColor }}>تم الإرسال!</h3>
          <p style={{ color: theme.mutedColor }}>{data.successMessage}</p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-4 text-sm underline"
            style={{ color: theme.primaryColor }}
          >
            إرسال رسالة أخرى
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="p-6 rounded-2xl space-y-4"
          style={{ background: theme.cardBgColor, border: `1px solid ${theme.mutedColor}22` }}
        >
          {data.fields.map((field) => (
            <div key={field.name}>
              <Label htmlFor={field.name} className="mb-1.5 block text-sm font-medium" style={{ color: theme.textColor }}>
                {field.label}
                {field.required && <span className="text-red-500 mr-1">*</span>}
              </Label>
              {field.type === 'textarea' ? (
                <Textarea
                  id={field.name}
                  placeholder={field.placeholder}
                  value={values[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  rows={3}
                  dir="rtl"
                />
              ) : field.type === 'select' ? (
                <select
                  id={field.name}
                  value={values[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  dir="rtl"
                >
                  <option value="">اختر...</option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <Input
                  id={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={values[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  dir="rtl"
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-semibold text-sm text-white mt-2 transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{ background: theme.primaryColor }}
          >
            {data.submitText || 'إرسال'}
          </button>
        </form>
      )}
    </div>
  );
}
