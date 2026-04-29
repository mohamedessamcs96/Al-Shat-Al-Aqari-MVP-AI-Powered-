import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft, Save, Eye, Plus, Trash2, GripVertical,
  Link2, Instagram, Twitter, Youtube, Facebook,
  Phone, Globe, MessageCircle, Linkedin,
  Check, Palette, User, X as XIcon, Upload,
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
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-2xl border-2 transition-all cursor-pointer ${
        selected
          ? 'border-indigo-400 bg-indigo-50/80 shadow-md shadow-indigo-100'
          : isOver
          ? 'border-indigo-200 bg-indigo-50/40'
          : 'border-transparent bg-white hover:border-slate-200 hover:shadow-sm'
      } ${!link.active ? 'opacity-40' : ''}`}
    >
      <span className="text-slate-200 hover:text-slate-400 cursor-grab active:cursor-grabbing flex-shrink-0 transition-colors">
        <GripVertical className="w-4 h-4" />
      </span>
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
        style={{ background: selected ? '#6366f1' : '#f1f5f9' }}
      >
        <IconForKey iconKey={link.icon} className={`w-4 h-4 ${selected ? 'text-white' : 'text-slate-500'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate leading-tight">
          {link.title || <span className="text-slate-300 font-normal">بدون عنوان</span>}
        </p>
        <p className="text-[11px] text-slate-400 truncate mt-0.5">{link.url || 'أضف الرابط...'}</p>
      </div>
      <button
        onClick={e => { e.stopPropagation(); onDelete(); }}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 flex-shrink-0"
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
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarUploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!officeId) return;

    // Load office profile first to use as fallback for name/logo
    const officeProfilePromise = officesApi.getById(officeId)
      .then((data: any) => {
        const d = data?.data ?? data;
        if (d?.slug) setOfficeSlug(d.slug);
        return d;
      })
      .catch(() => null);

    officesApi.getLinktree(officeId)
      .then(async (data: any) => {
        const d = data?.data ?? data;
        const hasProfile = d?.profile && (d.profile.name || d.profile.avatar);

        if (hasProfile) {
          setProfile({ name: d.profile.name ?? '', bio: d.profile.bio ?? '', avatar: d.profile.avatar ?? '' });
        } else {
          // First-time setup: seed from office profile
          const office = await officeProfilePromise;
          if (office) {
            setProfile(prev => ({
              name: office.name ?? prev.name,
              bio: office.bio ?? prev.bio,
              avatar: office.logo_url ?? office.logo ?? office.avatar ?? prev.avatar,
            }));
          }
        }

        if (d?.links && Array.isArray(d.links)) setLinks(d.links);
        if (d?.appearance) {
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
      .catch(async (_err) => {
        console.warn('[linktree] load error', _err);
        // No linktree yet — still seed name/logo from office profile
        const office = await officeProfilePromise;
        if (office) {
          setProfile(prev => ({
            name: office.name ?? prev.name,
            bio: office.bio ?? prev.bio,
            avatar: office.logo_url ?? office.logo ?? office.avatar ?? prev.avatar,
          }));
        }
      });
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
      <div className="min-h-screen bg-slate-50 flex flex-col" style={{ fontFamily: 'Cairo, sans-serif' }}>

        {/* ── Top bar ── */}
        <header className="bg-white border-b border-slate-200 shadow-sm z-20 flex-shrink-0 h-14">
          <div className="flex items-center justify-between h-full px-4" dir="rtl">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/office/dashboard')}
                className="text-slate-500 hover:text-slate-800 gap-1.5 h-8 px-2">
                <ArrowLeft className="w-4 h-4" />
                رجوع
              </Button>
              <div className="w-px h-5 bg-slate-200" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
                  <Link2 className="w-3.5 h-3.5 text-white" />
                </div>
                <h1 className="font-bold text-slate-900 text-sm tracking-tight">صفحة الروابط</h1>
              </div>
              {isDirty && (
                <span className="text-[11px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-semibold border border-amber-200 leading-none py-1">
                  ● غير محفوظ
                </span>
              )}
            </div>
            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs border-slate-200 text-slate-600"
                onClick={() => {
                  const slug = officeSlug || officeId;
                  if (slug) window.open(`https://al-shat-al-aqari-mvp.vercel.app/office/${slug}?preview=1`, '_blank');
                }}>
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">معاينة</span>
              </Button>
              <Button size="sm"
                className="gap-1.5 h-8 text-xs bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-sm shadow-indigo-200 border-0"
                onClick={async () => {
                  if (!officeId) { navigate('/login'); return; }
                  try {
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
                    if (msg.includes('405') || msg.includes('Method Not Allowed') || msg.includes('غير مسموح')) {
                      toast.error('الخادم لا يدعم هذه العملية بعد');
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

        {/* ── Main layout ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ═══ LEFT PANEL ═══ */}
          <aside className="w-[310px] bg-white border-l border-slate-200 flex flex-col flex-shrink-0 overflow-hidden shadow-[-2px_0_8px_rgba(0,0,0,0.04)]" dir="rtl">

            {/* Pill tabs */}
            <div className="p-3 border-b border-slate-100 flex-shrink-0">
              <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                {([
                  { key: 'links' as const, icon: <Link2 className="w-3.5 h-3.5" />, label: 'الروابط' },
                  { key: 'profile' as const, icon: <User className="w-3.5 h-3.5" />, label: 'الملف' },
                  { key: 'appearance' as const, icon: <Palette className="w-3.5 h-3.5" />, label: 'المظهر' },
                ]).map(t => (
                  <button
                    key={t.key}
                    onClick={() => setLeftTab(t.key)}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                      leftTab === t.key
                        ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {t.icon}{t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Links tab ── */}
            {leftTab === 'links' && (
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
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
                    <div className="mt-2 p-4 bg-gradient-to-br from-indigo-50 to-violet-50/50 rounded-2xl border-2 border-indigo-200/70 space-y-3.5">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-1 h-4 bg-indigo-500 rounded-full" />
                        <p className="text-xs font-bold text-indigo-700 tracking-wide">تعديل الرابط</p>
                        <button
                          onClick={() => setSelectedLinkId(null)}
                          className="mr-auto w-6 h-6 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-400 hover:text-indigo-600 flex items-center justify-center transition-colors"
                        >
                          <XIcon className="w-3 h-3" />
                        </button>
                      </div>
                      <div>
                        <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">العنوان</Label>
                        <Input
                          className="mt-1.5 text-sm h-9 bg-white border-slate-200 focus:border-indigo-400"
                          value={selectedLink.title}
                          onChange={e => updateLink(selectedLink.id, { title: e.target.value })}
                          placeholder="مثال: واتساب"
                          dir="rtl"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">الرابط</Label>
                        <Input
                          className="mt-1.5 text-sm h-9 bg-white border-slate-200 focus:border-indigo-400"
                          value={selectedLink.url}
                          onChange={e => updateLink(selectedLink.id, { url: e.target.value })}
                          placeholder="https://..."
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">الأيقونة</Label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {ICON_OPTIONS.map(opt => (
                            <button
                              key={opt.key}
                              onClick={() => updateLink(selectedLink.id, { icon: opt.key })}
                              className={`flex items-center gap-1.5 px-2 py-2 rounded-xl border text-xs font-medium transition-all ${
                                selectedLink.icon === opt.key
                                  ? 'border-indigo-400 bg-indigo-600 text-white shadow-sm'
                                  : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50'
                              }`}
                            >
                              <opt.Icon className="w-3.5 h-3.5 flex-shrink-0" />
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-indigo-200/50">
                        <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">إظهار الرابط</Label>
                        <button
                          onClick={() => updateLink(selectedLink.id, { active: !selectedLink.active })}
                          className={`w-10 h-6 rounded-full relative transition-colors ${selectedLink.active ? 'bg-indigo-500' : 'bg-slate-200'}`}
                        >
                          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${selectedLink.active ? 'right-1' : 'left-1'}`} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 border-t border-slate-100 flex-shrink-0">
                  <button
                    onClick={addLink}
                    className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-sm text-slate-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50/50 transition-all flex items-center justify-center gap-2 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    إضافة رابط جديد
                  </button>
                </div>
              </div>
            )}

            {/* ── Profile tab ── */}
            {leftTab === 'profile' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {/* Avatar */}
                <div className="flex flex-col items-center gap-3 pt-2">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-indigo-200 flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-50 to-violet-50 shadow-inner">
                      {profile.avatar
                        ? <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                        : <User className="w-8 h-8 text-indigo-200" />
                      }
                    </div>
                    <button
                      type="button"
                      disabled={isUploadingAvatar || !officeId}
                      onClick={() => avatarUploadRef.current?.click()}
                      className="absolute -bottom-2 -left-2 w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md shadow-indigo-200 transition-colors disabled:opacity-50"
                      title="رفع صورة"
                    >
                      <Upload className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {profile.avatar && (
                    <button type="button" onClick={() => setProf({ avatar: '' })}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors">
                      حذف الصورة
                    </button>
                  )}
                  {isUploadingAvatar && <p className="text-xs text-indigo-500 animate-pulse">جاري الرفع...</p>}
                </div>
                <input
                  ref={avatarUploadRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={async e => {
                    const file = e.target.files?.[0];
                    if (!file || !officeId) return;
                    setIsUploadingAvatar(true);
                    try {
                      const url = await officesApi.uploadLinktreeAvatar(officeId, file);
                      setProf({ avatar: url });
                      toast.success('تم رفع الصورة بنجاح');
                    } catch (err: any) {
                      toast.error(err?.message ?? 'فشل رفع الصورة');
                    } finally {
                      setIsUploadingAvatar(false);
                      e.target.value = '';
                    }
                  }}
                />

                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">اسم المكتب</Label>
                  <Input
                    className="text-sm h-10 bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-400"
                    value={profile.name}
                    onChange={e => setProf({ name: e.target.value })}
                    dir="rtl"
                    placeholder="اسم مكتبك العقاري"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">نبذة قصيرة</Label>
                  <Textarea
                    className="text-sm resize-none bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-400"
                    value={profile.bio}
                    onChange={e => setProf({ bio: e.target.value })}
                    rows={3}
                    dir="rtl"
                    placeholder="أضف وصفاً مختصراً لمكتبك..."
                  />
                  <div className="flex justify-between">
                    <p className="text-[11px] text-slate-400">{profile.bio.length}/100 حرف</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Appearance tab ── */}
            {leftTab === 'appearance' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-5">

                <div className="space-y-2.5">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">الخلفية</p>
                  <div className="grid grid-cols-4 gap-2">
                    {BG_PRESETS.map(bg => (
                      <button
                        key={bg.key}
                        onClick={() => setApp({ bg: bg.key })}
                        className={`h-14 rounded-2xl transition-all relative overflow-hidden ${
                          appearance.bg === bg.key
                            ? 'ring-2 ring-indigo-500 ring-offset-2 scale-95'
                            : 'hover:scale-95 opacity-80 hover:opacity-100'
                        }`}
                        style={bg.style}
                        title={bg.label}
                      >
                        {appearance.bg === bg.key && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                            <Check className="w-4 h-4 text-white drop-shadow-md" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="w-full h-px bg-slate-100" />

                <div className="space-y-2.5">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">لون الأزرار</p>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_SWATCHES.map(c => (
                      <button
                        key={c}
                        onClick={() => setApp({ btnColor: c })}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          appearance.btnColor === c ? 'border-indigo-600 scale-110 shadow-md' : 'border-white shadow hover:scale-110'
                        }`}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full border-2 border-white shadow-md" style={{ background: appearance.btnColor }} />
                    <input
                      type="text"
                      value={appearance.btnColor}
                      onChange={e => setApp({ btnColor: e.target.value })}
                      className="text-xs border border-slate-200 rounded-xl px-3 py-2 w-28 font-mono bg-slate-50 focus:outline-none focus:border-indigo-400"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="w-full h-px bg-slate-100" />

                <div className="space-y-2.5">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">شكل الأزرار</p>
                  <div className="grid grid-cols-2 gap-2">
                    {BTN_STYLES.map(s => (
                      <button
                        key={s.key}
                        onClick={() => setApp({ btnStyle: s.key })}
                        className={`py-2.5 rounded-xl border-2 text-xs font-semibold transition-all ${
                          appearance.btnStyle === s.key
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                            : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">حواف الأزرار</p>
                  <div className="grid grid-cols-4 gap-2">
                    {BTN_RADII.map(r => (
                      <button
                        key={r.key}
                        onClick={() => setApp({ btnRadius: r.key })}
                        className={`py-2.5 border-2 text-xs font-semibold transition-all ${
                          appearance.btnRadius === r.key
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white'
                        }`}
                        style={{ borderRadius: r.radius }}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="w-full h-px bg-slate-100" />

                <div className="space-y-2.5">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">الخط</p>
                  <div className="grid grid-cols-3 gap-2">
                    {FONTS.map(f => (
                      <button
                        key={f.key}
                        onClick={() => setApp({ font: f.key })}
                        className={`py-2.5 rounded-xl border-2 text-xs font-semibold transition-all ${
                          appearance.font === f.key
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white'
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
          <main
            className="flex-1 overflow-auto flex flex-col items-center justify-start py-8 px-4"
            style={{
              background: '#eef0f5',
              backgroundImage: 'radial-gradient(circle, #c7d2e8 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          >
            <p className="text-xs text-slate-400 font-semibold mb-4 tracking-widest uppercase">معاينة مباشرة</p>

            {/* Phone mockup */}
            <div className="relative">
              {/* Outer shell */}
              <div className="bg-slate-900 rounded-[3rem] p-2.5 shadow-2xl ring-1 ring-slate-700">
                {/* Status bar notch */}
                <div className="flex justify-center mb-1">
                  <div className="w-20 h-5 bg-slate-800 rounded-full flex items-center justify-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                    <div className="w-8 h-1.5 rounded-full bg-slate-700" />
                  </div>
                </div>
                {/* Screen */}
                <div className="w-[360px] rounded-[2.25rem] overflow-hidden" style={{ height: '680px' }}>
                  <Preview profile={profile} links={links} appearance={appearance} />
                </div>
              </div>
              {/* Side buttons */}
              <div className="absolute top-20 -right-1 w-1 h-10 bg-slate-700 rounded-l-full" />
              <div className="absolute top-36 -left-1 w-1 h-8 bg-slate-700 rounded-r-full" />
              <div className="absolute top-48 -left-1 w-1 h-8 bg-slate-700 rounded-r-full" />
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
          <div className="relative flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPreviewOpen(false)}
              className="absolute -top-4 -left-4 z-10 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <XIcon className="w-4 h-4" />
            </button>
            <div className="bg-gray-900 rounded-[3rem] p-3 shadow-2xl ring-4 ring-gray-700">
              <div className="flex justify-center mb-1.5">
                <div className="w-24 h-5 bg-gray-800 rounded-full" />
              </div>
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
