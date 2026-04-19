import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft, Eye, Save, Rocket, Smartphone, Monitor, Tablet,
  Plus, Trash2, EyeOff, GripVertical, ChevronDown, ChevronUp,
  Palette, Layout, Settings2, LayoutTemplate, Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import type { Block, BlockType, Theme, Background, PageConfig } from '../lib/page-builder-types';
import { BLOCK_CATALOG, PAGE_TEMPLATES, THEMES, BACKGROUNDS, makeDefaultPageConfig } from '../lib/page-builder-defaults';
import {
  makeHeroBlock, makeLinksBlock, makePropertiesBlock, makeAboutBlock,
  makeStatsBlock, makeContactFormBlock, makeSocialsBlock, makeLeadCaptureBlock,
  makeDividerBlock, makeTestimonialsBlock,
} from '../lib/page-builder-defaults';
import { BlockRenderer } from './blocks/BlockRenderer';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { offices as officesApi } from '../lib/api-client';
import { getUser } from '../lib/auth';
import { BlockSettingsPanel } from './page-builder/BlockSettingsPanel';
import { ThemeEditorPanel } from './page-builder/ThemeEditorPanel';

const DRAG_TYPE = 'BLOCK_ROW';

// ─── helpers ─────────────────────────────────────────────────────────────────
function makeBlock(type: BlockType): Block {
  switch (type) {
    case 'hero': return makeHeroBlock();
    case 'links': return makeLinksBlock();
    case 'properties': return makePropertiesBlock();
    case 'about': return makeAboutBlock();
    case 'stats': return makeStatsBlock();
    case 'contact-form': return makeContactFormBlock();
    case 'socials': return makeSocialsBlock();
    case 'lead-capture': return makeLeadCaptureBlock();
    case 'divider': return makeDividerBlock();
    case 'testimonials': return makeTestimonialsBlock();
    default: return makeLinksBlock();
  }
}

// ─── Draggable block row in sidebar ──────────────────────────────────────────
interface DraggableRowProps {
  block: Block;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleVisible: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onReorder: (dragIndex: number, hoverIndex: number) => void;
  isFirst: boolean;
  isLast: boolean;
}

function DraggableRow({
  block, index, isSelected, onSelect,
  onMoveUp, onMoveDown, onToggleVisible,
  onDelete, onDuplicate, onReorder, isFirst, isLast,
}: DraggableRowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const catalog = BLOCK_CATALOG.find((c) => c.type === block.type);

  const [, drag, dragPreview] = useDrag({
    type: DRAG_TYPE,
    item: { index },
  });

  const [{ isOver }, drop] = useDrop<{ index: number }, void, { isOver: boolean }>({
    accept: DRAG_TYPE,
    hover(item) {
      if (item.index !== index) {
        onReorder(item.index, index);
        item.index = index;
      }
    },
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`group flex items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : isOver
          ? 'border-blue-300 bg-blue-50/50'
          : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
      } ${!block.visible ? 'opacity-50' : ''}`}
      onClick={onSelect}
    >
      {/* Drag handle */}
      <div className="cursor-grab text-gray-300 hover:text-gray-500 p-0.5 flex-shrink-0" onMouseDown={(e) => e.stopPropagation()}>
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Color dot + name */}
      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: catalog?.color || '#94a3b8' }}
      />
      <span className="text-sm font-medium text-gray-700 flex-1 truncate">{catalog?.nameAr || block.type}</span>

      {/* Actions (visible on hover or when selected) */}
      <div className={`flex gap-0.5 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 text-gray-500"
          onClick={onToggleVisible}
          title={block.visible ? 'إخفاء' : 'إظهار'}
        >
          <EyeOff className="w-3 h-3" />
        </button>
        <button
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 text-gray-500"
          onClick={onDuplicate}
          title="نسخ"
        >
          <Copy className="w-3 h-3" />
        </button>
        <button
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-100 text-red-400"
          onClick={onDelete}
          title="حذف"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// ─── Device preview widths ────────────────────────────────────────────────────
const DEVICE_WIDTHS = { desktop: '100%', tablet: '768px', mobile: '390px' };

// ─── Main PageBuilder ─────────────────────────────────────────────────────────
export function PageBuilder() {
  const navigate = useNavigate();
  const officeUser = getUser();
  const officeId = officeUser?.id || '';

  // Load existing config or create default
  const [config, setConfig] = useState<PageConfig>(() =>
    makeDefaultPageConfig(officeId, '', '', '')
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [leftTab, setLeftTab] = useState<'blocks' | 'page' | 'theme' | 'templates'>('page');
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isDirty, setIsDirty] = useState(false);

  const selectedBlock = config.blocks.find((b) => b.id === selectedId) ?? null;
  const sortedBlocks = [...config.blocks].sort((a, b) => a.order - b.order);

  // ── Load existing config from API on mount ──────────────────────────────────
  useEffect(() => {
    if (!officeId) return;
    officesApi.getPage(officeId).then((data: any) => {
      const raw = data?.data ?? data;
      if (raw && typeof raw === 'object' && (Array.isArray(raw.blocks) || raw.theme || raw.slug)) {
        setConfig(prev => ({
          ...prev,
          ...raw,
          blocks: Array.isArray(raw.blocks) ? raw.blocks : prev.blocks,
          theme: raw.theme ? { ...prev.theme, ...raw.theme } : prev.theme,
          background: raw.background ? { ...prev.background, ...raw.background } : prev.background,
        }));
      }
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [officeId]);

  // ── block mutators ──────────────────────────────────────────────────────────
  const updateBlock = useCallback((id: string, patch: Partial<Block> | ((b: Block) => Partial<Block>)) => {
    setConfig((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) =>
        b.id === id ? { ...b, ...(typeof patch === 'function' ? patch(b) : patch) } : b
      ),
    }));
    setIsDirty(true);
  }, []);

  const updateBlockData = useCallback((id: string, dataPatch: Record<string, unknown>) => {
    setConfig((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) =>
        b.id === id ? { ...b, data: { ...b.data, ...dataPatch } } : b
      ),
    }));
    setIsDirty(true);
  }, []);

  const addBlock = (type: BlockType) => {
    const newBlock = makeBlock(type);
    newBlock.order = config.blocks.length;
    setConfig((prev) => ({ ...prev, blocks: [...prev.blocks, newBlock] }));
    setSelectedId(newBlock.id);
    setLeftTab('page');
    setIsDirty(true);
    toast.success(`تمت إضافة: ${BLOCK_CATALOG.find((c) => c.type === type)?.nameAr}`);
  };

  const deleteBlock = (id: string) => {
    setConfig((prev) => ({ ...prev, blocks: prev.blocks.filter((b) => b.id !== id) }));
    if (selectedId === id) setSelectedId(null);
    setIsDirty(true);
  };

  const duplicateBlock = (id: string) => {
    const block = config.blocks.find((b) => b.id === id);
    if (!block) return;
    const copy: Block = {
      ...block,
      id: crypto.randomUUID(),
      order: block.order + 0.5,
    };
    setConfig((prev) => ({
      ...prev,
      blocks: [...prev.blocks, copy].map((b, i) => ({ ...b, order: i })),
    }));
    setIsDirty(true);
  };

  const reorderBlocks = useCallback((dragIndex: number, hoverIndex: number) => {
    setConfig((prev) => {
      const sorted = [...prev.blocks].sort((a, b) => a.order - b.order);
      const [dragged] = sorted.splice(dragIndex, 1);
      sorted.splice(hoverIndex, 0, dragged);
      return { ...prev, blocks: sorted.map((b, i) => ({ ...b, order: i })) };
    });
    setIsDirty(true);
  }, []);

  const updateTheme = (patch: Partial<Theme>) => {
    setConfig((prev) => ({ ...prev, theme: { ...prev.theme, ...patch } }));
    setIsDirty(true);
  };

  const updateBackground = (patch: Partial<Background>) => {
    setConfig((prev) => ({ ...prev, background: { ...prev.background, ...patch } }));
    setIsDirty(true);
  };

  const applyTemplate = (templateId: string) => {
    const tpl = PAGE_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    setConfig((prev) => ({
      ...prev,
      theme: { ...tpl.theme },
      background: { ...tpl.background },
      blocks: tpl.blocks.map((b, i) => ({ ...b, id: crypto.randomUUID(), order: i })),
    }));
    setSelectedId(null);
    setIsDirty(true);
    toast.success(`تم تطبيق القالب: ${tpl.nameAr}`);
  };

  const handleSave = async () => {
    if (officeId) {
      try {
        await officesApi.savePage(officeId, config as unknown as Record<string, unknown>);
      } catch {
        // ignore save errors silently — user sees the toast regardless
      }
    }
    setIsDirty(false);
    toast.success('تم حفظ التغييرات!');
  };

  const handlePublish = async () => {
    if (officeId) {
      try {
        await officesApi.savePage(officeId, config as unknown as Record<string, unknown>);
        await officesApi.publishPage(officeId);
      } catch {
        // ignore
      }
    }
    setIsDirty(false);
    toast.success(' تم نشر الصفحة! يمكن للعملاء رؤيتها الآن.');
  };

  // ── computing page background style ────────────────────────────────────────
  const pageBgStyle: React.CSSProperties = (() => {
    const bg = config.background;
    if (bg.type === 'gradient' && bg.gradient) return { background: bg.gradient };
    if (bg.type === 'image' && bg.imageUrl) return {
      backgroundImage: `url(${bg.imageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
    return { background: bg.color || config.theme.bgColor };
  })();

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-100 flex flex-col" style={{ fontFamily: 'Cairo, sans-serif' }}>
        {/* ── Top Bar ── */}
        <header className="bg-white border-b shadow-sm z-20 flex-shrink-0">
          <div className="flex items-center justify-between px-4 py-3" dir="ltr">
            {/* Left */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/office/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">رجوع</span>
              </Button>
              <div className="h-5 w-px bg-gray-200" />
              <h1 className="font-bold text-gray-900 text-sm sm:text-base" dir="rtl">محرر صفحة المكتب</h1>
              {isDirty && <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">غير محفوظ</Badge>}
            </div>

            {/* Center – device toggle */}
            <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {(['desktop', 'tablet', 'mobile'] as const).map((d) => {
                const Icon = d === 'desktop' ? Monitor : d === 'tablet' ? Tablet : Smartphone;
                return (
                  <button
                    key={d}
                    onClick={() => setDevice(d)}
                    className={`w-8 h-7 flex items-center justify-center rounded-md transition-all ${device === d ? 'bg-white shadow text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => window.open(`/office/${config.slug}`, '_blank')}>
                <Eye className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">معاينة</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">حفظ</span>
              </Button>
              <Button size="sm" onClick={handlePublish} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Rocket className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">نشر</span>
              </Button>
            </div>
          </div>
        </header>

        {/* ── Main 3-panel layout ── */}
        <div className="flex flex-1 overflow-hidden">
          {/* ═══ LEFT PANEL ═══ */}
          <aside className="w-64 xl:w-72 border-r bg-white flex flex-col flex-shrink-0 overflow-hidden">
            <Tabs value={leftTab} onValueChange={(v) => setLeftTab(v as typeof leftTab)} className="flex flex-col flex-1 overflow-hidden">
              <TabsList className="grid grid-cols-4 m-2 flex-shrink-0">
                <TabsTrigger value="page" className="text-xs px-1">
                  <Layout className="w-3.5 h-3.5" />
                </TabsTrigger>
                <TabsTrigger value="blocks" className="text-xs px-1">
                  <Plus className="w-3.5 h-3.5" />
                </TabsTrigger>
                <TabsTrigger value="theme" className="text-xs px-1">
                  <Palette className="w-3.5 h-3.5" />
                </TabsTrigger>
                <TabsTrigger value="templates" className="text-xs px-1">
                  <LayoutTemplate className="w-3.5 h-3.5" />
                </TabsTrigger>
              </TabsList>

              {/* Page – block list */}
              <TabsContent value="page" className="flex-1 overflow-y-auto p-2 space-y-1.5 mt-0">
                <p className="text-xs font-semibold text-gray-400 px-1 pb-1" dir="rtl">الكتل ({sortedBlocks.length})</p>
                {sortedBlocks.map((block, index) => (
                  <DraggableRow
                    key={block.id}
                    block={block}
                    index={index}
                    isSelected={selectedId === block.id}
                    isFirst={index === 0}
                    isLast={index === sortedBlocks.length - 1}
                    onSelect={() => setSelectedId(block.id)}
                    onMoveUp={() => {
                      if (index > 0) reorderBlocks(index, index - 1);
                    }}
                    onMoveDown={() => {
                      if (index < sortedBlocks.length - 1) reorderBlocks(index, index + 1);
                    }}
                    onToggleVisible={() => updateBlock(block.id, { visible: !block.visible })}
                    onDelete={() => deleteBlock(block.id)}
                    onDuplicate={() => duplicateBlock(block.id)}
                    onReorder={reorderBlocks}
                  />
                ))}
                <button
                  className="w-full mt-2 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
                  onClick={() => setLeftTab('blocks')}
                >
                  <Plus className="w-4 h-4" />
                  إضافة كتلة
                </button>
              </TabsContent>

              {/* Blocks palette */}
              <TabsContent value="blocks" className="flex-1 overflow-y-auto p-2 space-y-1.5 mt-0" dir="rtl">
                <p className="text-xs font-semibold text-gray-400 px-1 pb-1">اختر نوع الكتلة</p>
                {BLOCK_CATALOG.map((item) => (
                  <button
                    key={item.type}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white hover:border-blue-300 hover:bg-blue-50 transition-all text-right"
                    onClick={() => addBlock(item.type)}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                      style={{ background: item.color }}>
                      +
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{item.nameAr}</p>
                      <p className="text-xs text-gray-400 truncate">{item.description}</p>
                    </div>
                  </button>
                ))}
              </TabsContent>

              {/* Theme */}
              <TabsContent value="theme" className="flex-1 overflow-y-auto p-3 mt-0" dir="rtl">
                <ThemeEditorPanel
                  theme={config.theme}
                  background={config.background}
                  onUpdateTheme={updateTheme}
                  onUpdateBackground={updateBackground}
                />
              </TabsContent>

              {/* Templates */}
              <TabsContent value="templates" className="flex-1 overflow-y-auto p-2 space-y-3 mt-0" dir="rtl">
                <p className="text-xs font-semibold text-gray-400 px-1 pb-1">اختر قالباً جاهزاً</p>
                {PAGE_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    className="w-full p-4 rounded-xl border border-gray-100 bg-white hover:border-blue-300 hover:bg-blue-50 transition-all text-right"
                    onClick={() => applyTemplate(tpl.id)}
                  >
                    <div
                      className="w-full h-14 rounded-lg mb-3"
                      style={{ background: tpl.background.gradient || tpl.background.color || tpl.theme.bgColor }}
                    />
                    <p className="text-sm font-bold text-gray-800">{tpl.nameAr}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{tpl.description}</p>
                  </button>
                ))}
              </TabsContent>
            </Tabs>
          </aside>

          {/* ═══ CENTER PREVIEW ═══ */}
          <main className="flex-1 overflow-auto bg-gray-200 flex flex-col items-center py-6 px-4">
            <div
              className="transition-all duration-300 overflow-y-auto rounded-xl shadow-2xl"
              style={{
                width: DEVICE_WIDTHS[device],
                maxWidth: '100%',
                minHeight: '80vh',
                ...pageBgStyle,
              }}
            >
              {sortedBlocks.map((block) => (
                <BlockRenderer
                  key={block.id}
                  block={block}
                  theme={config.theme}
                  officeId={config.officeId}
                  isEditing
                  isSelected={selectedId === block.id}
                  onClick={() => setSelectedId(block.id === selectedId ? null : block.id)}
                />
              ))}

              {sortedBlocks.length === 0 && (
                <div className="flex flex-col items-center justify-center h-96 text-center p-8" dir="rtl">
                  <LayoutTemplate className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-500 mb-2">الصفحة فارغة</h3>
                  <p className="text-sm text-gray-400 mb-6">ابدأ بإضافة كتل من القائمة الجانبية</p>
                  <Button onClick={() => setLeftTab('blocks')} className="bg-blue-600 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    إضافة كتلة
                  </Button>
                </div>
              )}
            </div>
          </main>

          {/* ═══ RIGHT PANEL – Block Settings ═══ */}
          <aside className="w-72 xl:w-80 border-l bg-white flex-shrink-0 overflow-y-auto">
            {selectedBlock ? (
              <BlockSettingsPanel
                block={selectedBlock}
                theme={config.theme}
                onUpdate={(patch: Record<string, unknown>) => updateBlockData(selectedBlock.id, patch)}
                onUpdateBlock={(patch: Partial<Block>) => updateBlock(selectedBlock.id, patch)}
                onDelete={() => deleteBlock(selectedBlock.id)}
                onClose={() => setSelectedId(null)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8" dir="rtl">
                <Settings2 className="w-12 h-12 text-gray-200 mb-3" />
                <h3 className="font-semibold text-gray-500 text-sm">اختر كتلة لتعديلها</h3>
                <p className="text-xs text-gray-400 mt-1">انقر على أي قسم في المعاينة المركزية</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </DndProvider>
  );
}
