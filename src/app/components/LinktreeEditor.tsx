import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft, Save, Eye, Plus, Trash2, GripVertical,
  Link2, Instagram, Twitter, Youtube, Facebook,
  Phone, Globe, MessageCircle, Linkedin,
  Check, Palette, User, X as XIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useRef } from 'react';
import { offices as officesApi } from '../lib/api-client';
import { getUser, getOfficeIdFromToken, getOfficeIdFromRawResponse, setUser } from '../lib/auth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

// ─── Types ────────────────────────────────────────────────────────────────────
interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: string;
  active: boolean;
}

interface Profile {
  name: string;
  bio: string;
  avatar: string;
}

interface Appearance {
  bg: string;        // preset key
  btnStyle: 'filled' | 'outline' | 'soft' | 'shadow';
  btnRadius: 'none' | 'sm' | 'lg' | 'full';
  btnColor: string;
  font: 'cairo' | 'tajawal' | 'inter';
}

// ─── Constants ────────────────────────────────────────────────────────────────
const BG_PRESETS: { key: string; label: string; style: React.CSSProperties }[] = [
  { key: 'indigo-dark', label: 'نيلي', style: { background: 'linear-gradient(135deg,#0e2057 0%,#312e81 100%)' } },
  { key: 'emerald', label: 'أخضر', style: { background: 'linear-gradient(135deg,#064e3b 0%,#065f46 100%)' } },
  { key: 'rose', label: 'وردي', style: { background: 'linear-gradient(135deg,#881337 0%,#be185d 100%)' } },
  { key: 'amber', label: 'ذهبي', style: { background: 'linear-gradient(135deg,#78350f 0%,#b45309 100%)' } },
  { key: 'slate', label: 'رمادي', style: { background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)' } },
  { key: 'sky', label: 'سماوي', style: { background: 'linear-gradient(135deg,#0369a1 0%,#0891b2 100%)' } },
  { key: 'warm-white', label: 'أبيض', style: { background: '#f8fafc' } },
  { key: 'purple-pink', label: 'بنفسجي', style: { background: 'linear-gradient(135deg,#6d28d9 0%,#db2777 100%)' } },
];

const ICON_OPTIONS = [
  { key: 'link', label: 'رابط', Icon: Link2 },
  { key: 'whatsapp', label: 'واتساب', Icon: MessageCircle },
  { key: 'instagram', label: 'إنستغرام', Icon: Instagram },
  { key: 'twitter', label: 'تويتر', Icon: Twitter },
  { key: 'youtube', label: 'يوتيوب', Icon: Youtube },
  { key: 'facebook', label: 'فيسبوك', Icon: Facebook },
  { key: 'linkedin', label: 'لينكدإن', Icon: Linkedin },
  { key: 'phone', label: 'هاتف', Icon: Phone },
  { key: 'website', label: 'موقع', Icon: Globe },
];

const BTN_STYLES: { key: Appearance['btnStyle']; label: string }[] = [
  { key: 'filled', label: 'ممتلئ' },
  { key: 'outline', label: 'محيط' },
  { key: 'soft', label: 'ناعم' },
  { key: 'shadow', label: 'ظل' },
];

const BTN_RADII: { key: Appearance['btnRadius']; label: string; radius: string }[] = [
  { key: 'none', label: 'حاد', radius: '0px' },
  { key: 'sm', label: 'خفيف', radius: '8px' },
  { key: 'lg', label: 'دائري', radius: '16px' },
  { key: 'full', label: 'كامل', radius: '9999px' },
];

const FONTS: { key: Appearance['font']; label: string }[] = [
  { key: 'cairo', label: 'Cairo' },
  { key: 'tajawal', label: 'Tajawal' },
  { key: 'inter', label: 'Inter' },
];

const COLOR_SWATCHES = ['#3b82f6','#6366f1','#8b5cf6','#ec4899','#f97316','#10b981','#f59e0b','#ef4444','#1e293b','#ffffff'];

const DRAG_TYPE = 'LINK_ROW';

// ─── Icon resolver ────────────────────────────────────────────────────────────
function IconForKey({ iconKey, className }: { iconKey: string; className?: string }) {
  const found = ICON_OPTIONS.find(o => o.key === iconKey);
  const Comp = found?.Icon ?? Link2;
  return <Comp className={className} />;
}

// ─── Draggable link row ───────────────────────────────────────────────────────
function DraggableLink({
  link, index, selected, onSelect, onReorder, onDelete,
}: {
  link: LinkItem;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onReorder: (from: number, to: number) => void;
  onDelete: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [, drag] = useDrag({ type: DRAG_TYPE, item: { index } });
  const [{ isOver }, drop] = useDrop<{ index: number }, void, { isOver: boolean }>({
    accept: DRAG_TYPE,
    hover(item) {
      if (item.index !== index) { onReorder(item.index, index); item.index = index; }
    },
    collect: m => ({ isOver: m.isOver() }),
  });
  drag(drop(ref));

  return (
    <div
      ref={ref}
      onClick={onSelect}
      className={`group flex items-center gap-3 px-3 py-3 rounded-2xl border transition-all cursor-pointer ${
        selected ? 'border-indigo-400 bg-indigo-50 shadow-sm' :
        isOver ? 'border-indigo-200 bg-indigo-50/40' :
        'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
      } ${!link.active ? 'opacity-50' : ''}`}
    >
      <span className="text-gray-300 hover:text-gray-500 cursor-grab flex-shrink-0">
        <GripVertical className="w-4 h-4" />
      </span>
      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
        <IconForKey iconKey={link.icon} className="w-3.5 h-3.5 text-gray-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{link.title || 'رابط بدون عنوان'}</p>
        <p className="text-xs text-gray-400 truncate">{link.url || 'أضف الرابط...'}</p>
      </div>
      <button
        onClick={e => { e.stopPropagation(); onDelete(); }}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-50 text-red-400 flex-shrink-0"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Preview card ─────────────────────────────────────────────────────────────
function Preview({ profile, links, appearance }: { profile: Profile; links: LinkItem[]; appearance: Appearance }) {
  const bg = BG_PRESETS.find(b => b.key === appearance.bg)?.style ?? BG_PRESETS[0].style;
  const isDark = appearance.bg !== 'warm-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const subColor = isDark ? 'text-white/60' : 'text-gray-500';
  const fontFamily = appearance.font === 'cairo' ? 'Cairo, sans-serif' :
    appearance.font === 'tajawal' ? 'Tajawal, sans-serif' : 'Inter, sans-serif';

  const btnRadiusVal = BTN_RADII.find(r => r.key === appearance.btnRadius)?.radius ?? '9999px';

  const getBtnStyle = (): React.CSSProperties => {
    switch (appearance.btnStyle) {
      case 'filled': return { background: appearance.btnColor, color: '#fff', borderRadius: btnRadiusVal, border: 'none' };
      case 'outline': return { background: 'transparent', color: isDark ? '#fff' : appearance.btnColor, borderRadius: btnRadiusVal, border: `2px solid ${isDark ? 'rgba(255,255,255,0.5)' : appearance.btnColor}` };
      case 'soft': return { background: `${appearance.btnColor}22`, color: isDark ? '#fff' : appearance.btnColor, borderRadius: btnRadiusVal, border: 'none' };
      case 'shadow': return { background: '#fff', color: appearance.btnColor, borderRadius: btnRadiusVal, border: 'none', boxShadow: `0 4px 14px ${appearance.btnColor}44` };
    }
  };

  return (
    <div
      className="w-full h-full rounded-2xl overflow-y-auto py-10 px-5 flex flex-col items-center"
      style={{ ...bg, fontFamily, minHeight: '100%' }}
      dir="rtl"
    >
      {/* Avatar */}
      <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/30 shadow-xl mb-3 bg-white/20 flex-shrink-0">
        {profile.avatar
          ? <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white/80">{profile.name?.[0] || '؟'}</div>
        }
      </div>
      <h2 className={`text-lg font-extrabold ${textColor} mb-1`}>{profile.name || 'اسم المكتب'}</h2>
      {profile.bio && <p className={`text-xs ${subColor} text-center max-w-xs mb-5`}>{profile.bio}</p>}

      {/* Links */}
      <div className="w-full max-w-xs space-y-3 mt-2">
        {links.filter(l => l.active).map(link => (
          <button
            key={link.id}
            className="w-full flex items-center gap-3 px-4 py-3 font-semibold text-sm transition-all"
            style={getBtnStyle()}
          >
            <IconForKey iconKey={link.icon} className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-center">{link.title}</span>
          </button>
        ))}
        {links.filter(l => l.active).length === 0 && (
          <p className={`text-center text-sm ${subColor} opacity-60`}>أضف روابطك لتظهر هنا</p>
        )}
      </div>

      <p className={`mt-10 text-[10px] ${subColor} opacity-40`}>الشات العقاري</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function LinktreeEditor() {
  const navigate = useNavigate();

  // Recover office ID: stored user → JWT decode → raw login response
  // (handles stale sessions created before auth_user was properly saved)
  const officeId = (() => {
    const stored = getUser()?.id;
    if (stored) return stored;
    const fromToken = getOfficeIdFromToken();
    if (fromToken) { setUser({ id: fromToken }); return fromToken; }
    const fromRaw = getOfficeIdFromRawResponse();
    if (fromRaw) { setUser({ id: fromRaw }); return fromRaw; }
    return '';
  })();

  const [profile, setProfile] = useState<Profile>({
    name: '',
    bio: '',
    avatar: '',
  });

  const [links, setLinks] = useState<LinkItem[]>([
    { id: '1', title: 'واتساب', url: '', icon: 'whatsapp', active: true },
    { id: '2', title: 'عقاراتنا', url: '', icon: 'link', active: true },
    { id: '3', title: 'إنستغرام', url: 'https://instagram.com', icon: 'instagram', active: true },
    { id: '4', title: 'اتصل بنا', url: '', icon: 'phone', active: true },
  ]);

  const [appearance, setAppearance] = useState<Appearance>({
    bg: 'indigo-dark',
    btnStyle: 'filled',
    btnRadius: 'lg',
    btnColor: '#6366f1',
    font: 'cairo',
  });
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [leftTab, setLeftTab] = useState<'profile' | 'links' | 'appearance'>('links');
  const [isDirty, setIsDirty] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [officeSlug, setOfficeSlug] = useState<string>(getUser()?.slug || '');

  useEffect(() => {
    if (!officeId) return;
    officesApi.getById(officeId)
      .then((d: any) => { if (d?.slug) setOfficeSlug(d.slug); })
      .catch(() => {});
    officesApi.getLinktree(officeId)
      .then((data: any) => {
        // Unwrap API envelope: { success, data: {...} } or flat
        const d = data?.data ?? data;
        if (d.profile) setProfile({ name: d.profile.name ?? '', bio: d.profile.bio ?? '', avatar: d.profile.avatar ?? '' });
        if (d.links && Array.isArray(d.links)) setLinks(d.links);
        if (d.appearance) {
          // Map API field names → internal state
          const a = d.appearance;
          setAppearance(prev => ({
            ...prev,
            bg: a.background ?? a.bg ?? prev.bg,
            btnStyle: a.buttonStyle ?? a.btnStyle ?? prev.btnStyle,
            btnRadius: a.buttonRadius ?? a.btnRadius ?? prev.btnRadius,
            btnColor: a.buttonColor ?? a.btnColor ?? prev.btnColor,
            font: a.font ?? prev.font,
          }));
        }
      })
      .catch((_err) => { console.warn('[linktree] load error', _err); });
  }, [officeId]);

  const selectedLink = links.find(l => l.id === selectedLinkId) ?? null;

  const addLink = () => {
    const newLink: LinkItem = { id: crypto.randomUUID(), title: '', url: '', icon: 'link', active: true };
    setLinks(prev => [...prev, newLink]);
    setSelectedLinkId(newLink.id);
    setLeftTab('links');
    setIsDirty(true);
  };

  const updateLink = (id: string, patch: Partial<LinkItem>) => {
    setLinks(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l));
    setIsDirty(true);
  };

  const deleteLink = (id: string) => {
    setLinks(prev => prev.filter(l => l.id !== id));
    if (selectedLinkId === id) setSelectedLinkId(null);
    setIsDirty(true);
  };

  const reorderLinks = useCallback((from: number, to: number) => {
    setLinks(prev => {
      const arr = [...prev];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
    setIsDirty(true);
  }, []);

  const setApp = (patch: Partial<Appearance>) => {
    setAppearance(prev => ({ ...prev, ...patch }));
    setIsDirty(true);
  };

  const setProf = (patch: Partial<Profile>) => {
    setProfile(prev => ({ ...prev, ...patch }));
    setIsDirty(true);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-100 flex flex-col" style={{ fontFamily: 'Cairo, sans-serif' }}>

        {/* ── Top bar ── */}
        <header className="bg-white border-b shadow-sm z-20 flex-shrink-0">
          <div className="flex items-center justify-between px-4 py-3" dir="rtl">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/office/dashboard')}>
                <ArrowLeft className="w-4 h-4 ml-1" />
                رجوع
              </Button>
              <div className="h-5 w-px bg-gray-200" />
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Link2 className="w-3 h-3 text-white" />
                </div>
                <h1 className="font-bold text-gray-900 text-sm">صفحة الروابط</h1>
              </div>
              {isDirty && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium border border-amber-200">غير محفوظ</span>}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setPreviewOpen(true)}>
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">معاينة</span>
              </Button>
              <Button size="sm" className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={async () => {
                if (!officeId) { navigate('/login'); return; }
                try {
                  // Map internal state → API field names
                  const apiAppearance = {
                    background: appearance.bg,
                    buttonStyle: appearance.btnStyle,
                    buttonRadius: appearance.btnRadius,
                    buttonColor: appearance.btnColor,
                    font: appearance.font,
                  };
                  await officesApi.saveLinktree(officeId, { profile, links, appearance: apiAppearance });
                  setIsDirty(false);
                  toast.success('تم حفظ التغييرات!');
                } catch (err) {
                  const msg = err instanceof Error ? err.message : 'فشل الحفظ';
                  // 405 means the backend endpoint isn't implemented yet
                  if (msg.includes('405') || msg.includes('Method Not Allowed') || msg.includes('غير مسموح')) {
                    toast.error('الخادم لا يدعم هذه العملية بعد — يرجى التواصل مع فريق التطوير');
                  } else {
                    toast.error(msg);
                  }
                }
              }}>
                <Save className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">حفظ</span>
              </Button>
            </div>
          </div>
        </header>

        {/* ── Main 2-panel layout ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ═══ LEFT PANEL ═══ */}
          <aside className="w-80 border-l bg-white flex flex-col flex-shrink-0 overflow-hidden" dir="rtl">

            {/* Tab pills */}
            <div className="flex border-b flex-shrink-0">
              {([
                { key: 'links' as const, icon: <Link2 className="w-3.5 h-3.5" />, label: 'الروابط' },
                { key: 'profile' as const, icon: <User className="w-3.5 h-3.5" />, label: 'الملف' },
                { key: 'appearance' as const, icon: <Palette className="w-3.5 h-3.5" />, label: 'المظهر' },
              ]).map(t => (
                <button
                  key={t.key}
                  onClick={() => setLeftTab(t.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold border-b-2 transition-all ${
                    leftTab === t.key ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {t.icon}{t.label}
                </button>
              ))}
            </div>

            {/* ── Links tab ── */}
            {leftTab === 'links' && (
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {links.map((link, index) => (
                    <DraggableLink
                      key={link.id}
                      link={link}
                      index={index}
                      selected={selectedLinkId === link.id}
                      onSelect={() => setSelectedLinkId(selectedLinkId === link.id ? null : link.id)}
                      onReorder={reorderLinks}
                      onDelete={() => deleteLink(link.id)}
                    />
                  ))}

                  {/* Expanded editor */}
                  {selectedLink && (
                    <div className="mt-2 p-4 bg-indigo-50 rounded-2xl border border-indigo-200 space-y-3">
                      <div>
                        <Label className="text-xs font-semibold text-gray-600">العنوان</Label>
                        <Input
                          className="mt-1 text-sm"
                          value={selectedLink.title}
                          onChange={e => updateLink(selectedLink.id, { title: e.target.value })}
                          placeholder="مثال: واتساب"
                          dir="rtl"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-gray-600">الرابط</Label>
                        <Input
                          className="mt-1 text-sm"
                          value={selectedLink.url}
                          onChange={e => updateLink(selectedLink.id, { url: e.target.value })}
                          placeholder="https://..."
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-gray-600 mb-2 block">الأيقونة</Label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {ICON_OPTIONS.map(opt => (
                            <button
                              key={opt.key}
                              onClick={() => updateLink(selectedLink.id, { icon: opt.key })}
                              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl border text-xs transition-all ${
                                selectedLink.icon === opt.key
                                  ? 'border-indigo-400 bg-indigo-100 text-indigo-700 font-semibold'
                                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                              }`}
                            >
                              <opt.Icon className="w-3 h-3 flex-shrink-0" />
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <Label className="text-xs font-semibold text-gray-600">إظهار</Label>
                        <button
                          onClick={() => updateLink(selectedLink.id, { active: !selectedLink.active })}
                          className={`w-10 h-6 rounded-full relative transition-colors ${selectedLink.active ? 'bg-indigo-500' : 'bg-gray-200'}`}
                        >
                          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${selectedLink.active ? 'right-1' : 'left-1'}`} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 border-t flex-shrink-0">
                  <button
                    onClick={addLink}
                    className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    إضافة رابط
                  </button>
                </div>
              </div>
            )}

            {/* ── Profile tab ── */}
            {leftTab === 'profile' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <Label className="text-xs font-semibold text-gray-600">رابط الصورة</Label>
                  <Input
                    className="mt-1 text-sm"
                    value={profile.avatar}
                    onChange={e => setProf({ avatar: e.target.value })}
                    placeholder="https://... أو اتركه فارغاً"
                    dir="ltr"
                  />
                  {profile.avatar && (
                    <img src={profile.avatar} alt="" className="mt-2 w-16 h-16 rounded-full object-cover border-2 border-indigo-200" />
                  )}
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-600">اسم المكتب</Label>
                  <Input
                    className="mt-1 text-sm"
                    value={profile.name}
                    onChange={e => setProf({ name: e.target.value })}
                    dir="rtl"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-600">نبذة قصيرة</Label>
                  <Textarea
                    className="mt-1 text-sm resize-none"
                    value={profile.bio}
                    onChange={e => setProf({ bio: e.target.value })}
                    rows={3}
                    dir="rtl"
                    placeholder="أضف وصفاً مختصراً لمكتبك..."
                  />
                  <p className="text-xs text-gray-400 mt-1">{profile.bio.length}/100 حرف</p>
                </div>
              </div>
            )}

            {/* ── Appearance tab ── */}
            {leftTab === 'appearance' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {/* Background */}
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">الخلفية</p>
                  <div className="grid grid-cols-4 gap-2">
                    {BG_PRESETS.map(bg => (
                      <button
                        key={bg.key}
                        onClick={() => setApp({ bg: bg.key })}
                        className={`h-12 rounded-xl border-2 transition-all relative ${
                          appearance.bg === bg.key ? 'border-indigo-500 scale-95' : 'border-transparent hover:scale-95'
                        }`}
                        style={bg.style}
                        title={bg.label}
                      >
                        {appearance.bg === bg.key && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white drop-shadow" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Button color */}
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">لون الأزرار</p>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_SWATCHES.map(c => (
                      <button
                        key={c}
                        onClick={() => setApp({ btnColor: c })}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${
                          appearance.btnColor === c ? 'border-gray-800 scale-110' : 'border-white shadow'
                        }`}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-7 h-7 rounded-full border shadow" style={{ background: appearance.btnColor }} />
                    <input
                      type="text"
                      value={appearance.btnColor}
                      onChange={e => setApp({ btnColor: e.target.value })}
                      className="text-xs border rounded-lg px-2 py-1 w-28 font-mono"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Button style */}
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">شكل الأزرار</p>
                  <div className="grid grid-cols-2 gap-2">
                    {BTN_STYLES.map(s => (
                      <button
                        key={s.key}
                        onClick={() => setApp({ btnStyle: s.key })}
                        className={`py-2 rounded-xl border text-xs font-semibold transition-all ${
                          appearance.btnStyle === s.key
                            ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Button radius */}
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">حواف الأزرار</p>
                  <div className="grid grid-cols-4 gap-2">
                    {BTN_RADII.map(r => (
                      <button
                        key={r.key}
                        onClick={() => setApp({ btnRadius: r.key })}
                        className={`py-2.5 border text-xs font-semibold transition-all ${
                          appearance.btnRadius === r.key
                            ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                        style={{ borderRadius: r.radius }}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font */}
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">الخط</p>
                  <div className="grid grid-cols-3 gap-2">
                    {FONTS.map(f => (
                      <button
                        key={f.key}
                        onClick={() => setApp({ font: f.key })}
                        className={`py-2 rounded-xl border text-xs font-semibold transition-all ${
                          appearance.font === f.key
                            ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                        style={{ fontFamily: f.key === 'cairo' ? 'Cairo' : f.key === 'tajawal' ? 'Tajawal' : 'Inter' }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </aside>

          {/* ═══ CENTER PREVIEW ═══ */}
          <main className="flex-1 bg-gray-200 overflow-auto flex flex-col items-center justify-start py-8 px-4">
            <p className="text-xs text-gray-400 font-medium mb-3 tracking-wide uppercase">معاينة مباشرة</p>
            <div className="w-[375px] max-w-full rounded-3xl overflow-hidden shadow-2xl ring-4 ring-gray-300/60" style={{ minHeight: '680px' }}>
              <Preview profile={profile} links={links} appearance={appearance} />
            </div>
          </main>

        </div>
      </div>

      {/* ── Preview Modal ── */}
      {previewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="relative flex flex-col items-center"
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setPreviewOpen(false)}
              className="absolute -top-4 -left-4 z-10 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <XIcon className="w-4 h-4" />
            </button>

            {/* Phone frame */}
            <div className="bg-gray-900 rounded-[3rem] p-3 shadow-2xl ring-4 ring-gray-700">
              {/* Notch */}
              <div className="flex justify-center mb-1.5">
                <div className="w-24 h-5 bg-gray-800 rounded-full" />
              </div>
              {/* Screen */}
              <div className="w-[360px] rounded-[2.25rem] overflow-hidden" style={{ height: '680px' }}>
                <Preview profile={profile} links={links} appearance={appearance} />
              </div>
            </div>

            <p className="text-white/50 text-xs mt-4">انقر خارج الإطار للإغلاق</p>
          </div>
        </div>
      )}
    </DndProvider>
  );
}
