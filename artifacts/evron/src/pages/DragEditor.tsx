import { useState, useEffect, useRef, useCallback } from "react";
import { GripVertical, Eye, EyeOff, ChevronDown, ChevronUp, Lock, Unlock, Save, CheckCircle, RotateCcw, Pencil, X } from "lucide-react";
import { useGetEditorConfig, useSaveEditorConfig, getGetEditorConfigQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface SectionData extends Record<string, unknown> {
  heroTitle?: string;
  heroSlogan?: string;
  heroSubtitle?: string;
  promoHeading?: string;
  promoSubheading?: string;
  promoCtaText?: string;
}

interface Section {
  id: string;
  type: string;
  order: number;
  visible: boolean;
  data: SectionData;
}

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */
const ADMIN_PASSWORD = "evron2026";

const SECTION_META: Record<string, { label: string; icon: string; color: string; editableFields: EditableField[] }> = {
  hero: {
    label: "Hero Banner",
    icon: "🖼️",
    color: "from-indigo-500/10 to-purple-500/10 border-indigo-200",
    editableFields: [
      { key: "heroTitle", label: "Main Title", placeholder: "EVRON", type: "text" },
      { key: "heroSlogan", label: "Slogan", placeholder: "The trust we build", type: "text" },
      { key: "heroSubtitle", label: "Subtitle", placeholder: "Pakistan's Premium Marketplace", type: "text" },
    ],
  },
  categories: {
    label: "Categories Grid",
    icon: "☰",
    color: "from-green-500/10 to-emerald-500/10 border-green-200",
    editableFields: [],
  },
  featured: {
    label: "Featured Products",
    icon: "⭐",
    color: "from-amber-500/10 to-yellow-500/10 border-amber-200",
    editableFields: [],
  },
  "new-arrivals": {
    label: "New Arrivals",
    icon: "✨",
    color: "from-sky-500/10 to-cyan-500/10 border-sky-200",
    editableFields: [],
  },
  promo: {
    label: "Promo Banner",
    icon: "🏷️",
    color: "from-rose-500/10 to-pink-500/10 border-rose-200",
    editableFields: [
      { key: "promoHeading", label: "Heading", placeholder: "Up to 50% Off", type: "text" },
      { key: "promoSubheading", label: "Subheading", placeholder: "On selected items", type: "text" },
      { key: "promoCtaText", label: "Button Text", placeholder: "Grab the Deals", type: "text" },
    ],
  },
};

interface EditableField {
  key: string;
  label: string;
  placeholder: string;
  type: "text" | "textarea";
}

/* ─────────────────────────────────────────────
   Password Gate
───────────────────────────────────────────── */
function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  function tryUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem("evron-builder-auth", "1");
      onUnlock();
    } else {
      setError(true);
      setShake(true);
      setPw("");
      setTimeout(() => setShake(false), 600);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className={`bg-white rounded-2xl shadow-2xl p-10 w-full max-w-sm transition-all ${shake ? "animate-bounce" : ""}`}>
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            EV<span className="text-amber-500">R</span>ON Builder
          </h1>
          <p className="text-slate-500 text-sm mt-1">Admin access only</p>
        </div>
        <form onSubmit={tryUnlock} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={pw}
              onChange={e => { setPw(e.target.value); setError(false); }}
              autoFocus
              placeholder="Enter admin password"
              className={`w-full px-4 py-3 rounded-xl border-2 text-sm focus:outline-none transition-colors ${error ? "border-red-400 bg-red-50" : "border-slate-200 focus:border-amber-400"}`}
              data-testid="input-password"
            />
            {error && <p className="text-red-500 text-xs mt-1">Incorrect password. Try again.</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors"
            data-testid="button-unlock"
          >
            Unlock Builder
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Inline text editor
───────────────────────────────────────────── */
function InlineEdit({ value, placeholder, onChange }: { value: string; placeholder: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <input
      ref={ref}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white/80 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
    />
  );
}

/* ─────────────────────────────────────────────
   Section card
───────────────────────────────────────────── */
function SectionCard({
  section,
  index,
  total,
  expanded,
  onToggleExpand,
  onToggleVisible,
  onFieldChange,
  onMoveUp,
  onMoveDown,
  dragHandleProps,
  isDragOver,
}: {
  section: Section;
  index: number;
  total: number;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleVisible: () => void;
  onFieldChange: (key: string, value: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  dragHandleProps: React.HTMLAttributes<HTMLDivElement>;
  isDragOver: boolean;
}) {
  const meta = SECTION_META[section.type] ?? { label: section.type, icon: "□", color: "border-slate-200", editableFields: [] };

  return (
    <div
      className={`rounded-2xl border-2 bg-gradient-to-r ${meta.color} transition-all duration-150 ${isDragOver ? "ring-2 ring-amber-400 ring-offset-2 scale-[1.01]" : ""} ${!section.visible ? "opacity-60" : ""}`}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Drag handle */}
        <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing p-1 rounded-lg hover:bg-black/5 transition-colors flex-shrink-0">
          <GripVertical className="w-5 h-5 text-slate-400" />
        </div>

        <span className="text-xl flex-shrink-0">{meta.icon}</span>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-slate-800">{meta.label}</p>
          <p className="text-xs text-slate-500">Section {index + 1} of {total}</p>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Move up/down */}
          <button onClick={onMoveUp} disabled={index === 0} className="p-1.5 rounded-lg hover:bg-black/10 disabled:opacity-30 transition-colors" title="Move up">
            <ChevronUp className="w-4 h-4" />
          </button>
          <button onClick={onMoveDown} disabled={index === total - 1} className="p-1.5 rounded-lg hover:bg-black/10 disabled:opacity-30 transition-colors" title="Move down">
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Visibility */}
          <div className="flex items-center gap-1.5 ml-1 pl-2 border-l border-slate-200">
            {section.visible ? <Eye className="w-3.5 h-3.5 text-slate-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
            <Switch checked={section.visible} onCheckedChange={onToggleVisible} />
          </div>

          {/* Expand if has editable fields */}
          {meta.editableFields.length > 0 && (
            <button onClick={onToggleExpand} className="ml-1 p-1.5 rounded-lg hover:bg-black/10 transition-colors" title="Edit content">
              <Pencil className={`w-4 h-4 transition-colors ${expanded ? "text-amber-600" : "text-slate-400"}`} />
            </button>
          )}
        </div>
      </div>

      {/* Expanded content editor */}
      {expanded && meta.editableFields.length > 0 && (
        <div className="px-4 pb-4 pt-1 border-t border-black/5 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider pt-1">Edit Content</p>
          {meta.editableFields.map(field => (
            <div key={field.key}>
              <label className="block text-xs font-medium text-slate-600 mb-1">{field.label}</label>
              <InlineEdit
                value={(section.data[field.key] as string) ?? ""}
                placeholder={field.placeholder}
                onChange={v => onFieldChange(field.key, v)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Builder
───────────────────────────────────────────── */
function Builder() {
  const { data: config, isLoading } = useGetEditorConfig();
  const saveConfig = useSaveEditorConfig();
  const queryClient = useQueryClient();

  const [sections, setSections] = useState<Section[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (config) setSections([...config.sections].sort((a, b) => a.order - b.order));
  }, [config]);

  const triggerAutoSave = useCallback((secs: Section[]) => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setSaveState("saving");
    autoSaveTimer.current = setTimeout(() => {
      const payload = secs.map((s, i) => ({ ...s, order: i }));
      saveConfig.mutate(
        { data: { sections: payload } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetEditorConfigQueryKey() });
            setSaveState("saved");
            setTimeout(() => setSaveState("idle"), 2500);
          },
        }
      );
    }, 800);
  }, [saveConfig, queryClient]);

  function updateSections(next: Section[]) {
    setSections(next);
    triggerAutoSave(next);
  }

  function toggleVisible(id: string) {
    updateSections(sections.map(s => s.id === id ? { ...s, visible: !s.visible } : s));
  }

  function setFieldValue(id: string, key: string, value: string) {
    updateSections(sections.map(s => s.id === id ? { ...s, data: { ...s.data, [key]: value } } : s));
  }

  function moveSection(from: number, to: number) {
    const next = [...sections];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    updateSections(next.map((s, i) => ({ ...s, order: i })));
  }

  function handleDragStart(idx: number) { setDragIdx(idx); }
  function handleDragOver(e: React.DragEvent, idx: number) { e.preventDefault(); setDragOverIdx(idx); }
  function handleDrop(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (dragIdx !== null && dragIdx !== idx) moveSection(dragIdx, idx);
    setDragIdx(null); setDragOverIdx(null);
  }
  function handleDragEnd() { setDragIdx(null); setDragOverIdx(null); }

  function resetToDefault() {
    const defaultOrder = ["hero", "categories", "featured", "promo", "new-arrivals"];
    const reset = defaultOrder.map((type, i) => {
      const existing = sections.find(s => s.type === type);
      return existing ? { ...existing, order: i, visible: true } : { id: type, type, order: i, visible: true, data: {} };
    });
    updateSections(reset);
  }

  function logout() {
    sessionStorage.removeItem("evron-builder-auth");
    window.location.reload();
  }

  /* ── Live preview rendering ── */
  const visibleSections = sections.filter(s => s.visible);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center gap-4 sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-3 flex-1">
          <div className="text-xl font-black tracking-tight">
            EV<span className="text-amber-400">R</span>ON
          </div>
          <span className="text-slate-400 text-sm font-medium">/ Page Builder</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Save status */}
          <div className={`flex items-center gap-2 text-sm transition-all ${saveState === "idle" ? "opacity-0" : "opacity-100"}`}>
            {saveState === "saving" && (
              <><div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /><span className="text-slate-300">Auto-saving…</span></>
            )}
            {saveState === "saved" && (
              <><CheckCircle className="w-4 h-4 text-green-400" /><span className="text-green-300">Saved!</span></>
            )}
          </div>

          <button onClick={resetToDefault} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm transition-colors" data-testid="button-reset">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>

          <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm transition-colors">
            View Site ↗
          </a>

          <button onClick={logout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm transition-colors" data-testid="button-logout">
            <Lock className="w-3.5 h-3.5" /> Lock
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left panel: section list ── */}
        <aside className="w-96 flex-shrink-0 bg-white border-r border-slate-200 overflow-y-auto">
          <div className="p-5 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 text-sm">Homepage Sections</h2>
            <p className="text-xs text-slate-500 mt-0.5">Drag to reorder · Toggle to show/hide · Click ✏️ to edit text</p>
          </div>
          <div className="p-4 space-y-2">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : (
              sections.map((section, idx) => (
                <div
                  key={section.id}
                  onDragOver={e => handleDragOver(e, idx)}
                  onDrop={e => handleDrop(e, idx)}
                  onDragEnd={handleDragEnd}
                >
                  <SectionCard
                    section={section}
                    index={idx}
                    total={sections.length}
                    expanded={expanded.has(section.id)}
                    onToggleExpand={() => setExpanded(prev => {
                      const next = new Set(prev);
                      next.has(section.id) ? next.delete(section.id) : next.add(section.id);
                      return next;
                    })}
                    onToggleVisible={() => toggleVisible(section.id)}
                    onFieldChange={(key, val) => setFieldValue(section.id, key, val)}
                    onMoveUp={() => moveSection(idx, idx - 1)}
                    onMoveDown={() => moveSection(idx, idx + 1)}
                    isDragOver={dragOverIdx === idx}
                    dragHandleProps={{
                      draggable: true,
                      onDragStart: () => handleDragStart(idx),
                    }}
                  />
                </div>
              ))
            )}
          </div>
        </aside>

        {/* ── Right panel: live preview ── */}
        <main className="flex-1 overflow-y-auto bg-slate-100 p-6">
          <div className="max-w-3xl mx-auto">
            <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              Live preview — changes auto-save to the database
            </div>
            <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-200">
              {/* Fake browser chrome */}
              <div className="bg-slate-800 px-4 py-2.5 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 bg-slate-700 rounded-md h-5 mx-6 flex items-center px-3">
                  <span className="text-slate-400 text-xs">evron.replit.app</span>
                </div>
              </div>

              {/* Preview content */}
              <div className="divide-y divide-slate-100">
                {visibleSections.length === 0 ? (
                  <div className="py-16 text-center text-slate-400">
                    <EyeOff className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="font-medium">All sections are hidden</p>
                    <p className="text-sm mt-1">Enable sections on the left to see the preview</p>
                  </div>
                ) : (
                  visibleSections.map(section => {
                    const meta = SECTION_META[section.type];
                    if (section.type === "hero") return (
                      <div key={section.id} className="bg-gradient-to-r from-slate-800 to-slate-700 p-10 text-white">
                        <p className="text-amber-400 text-xs font-bold uppercase tracking-[0.3em] mb-3">
                          {(section.data.heroSubtitle as string) || "Pakistan's Premium Marketplace"}
                        </p>
                        <h1 className="text-5xl font-black tracking-tight mb-2">
                          {(section.data.heroTitle as string) || "EVRON"}
                        </h1>
                        <p className="text-white/70 text-lg italic mb-6">
                          {(section.data.heroSlogan as string) || "The trust we build"}
                        </p>
                        <div className="flex gap-3">
                          <span className="bg-amber-500 text-slate-900 font-bold px-5 py-2 rounded-xl text-sm">Shop Now →</span>
                          <span className="bg-white/10 text-white border border-white/20 font-semibold px-5 py-2 rounded-xl text-sm">Featured Deals</span>
                        </div>
                      </div>
                    );
                    if (section.type === "promo") return (
                      <div key={section.id} className="bg-gradient-to-r from-slate-700 to-slate-600 p-8 text-white flex items-center justify-between gap-4">
                        <div>
                          <p className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">Limited Time Offer</p>
                          <h3 className="text-2xl font-black">{(section.data.promoHeading as string) || "Up to 50% Off"}</h3>
                          <p className="text-white/60 text-sm">{(section.data.promoSubheading as string) || "On selected electronics, fashion and more"}</p>
                        </div>
                        <span className="bg-amber-500 text-slate-900 font-bold px-6 py-2.5 rounded-xl text-sm flex-shrink-0">
                          {(section.data.promoCtaText as string) || "Grab the Deals"}
                        </span>
                      </div>
                    );
                    return (
                      <div key={section.id} className={`px-6 py-4 flex items-center gap-3 bg-gradient-to-r ${meta?.color ?? ""}`}>
                        <span className="text-2xl">{meta?.icon ?? "□"}</span>
                        <div>
                          <p className="font-semibold text-sm text-slate-700">{meta?.label ?? section.type}</p>
                          <p className="text-xs text-slate-500">Dynamic content from database</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Section count summary */}
            <div className="mt-4 flex gap-4 text-xs text-slate-500">
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                {visibleSections.length} visible
              </span>
              <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full font-medium">
                {sections.length - visibleSections.length} hidden
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Export: auth-gated entry
───────────────────────────────────────────── */
export default function DragEditor() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("evron-builder-auth") === "1");

  if (!authed) return <PasswordGate onUnlock={() => setAuthed(true)} />;
  return <Builder />;
}
