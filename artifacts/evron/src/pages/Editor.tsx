import { useState, useEffect } from "react";
import { GripVertical, Eye, EyeOff, Save, CheckCircle, ArrowLeft } from "lucide-react";
import { useGetEditorConfig, useSaveEditorConfig, getGetEditorConfigQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

interface Section {
  id: string;
  type: string;
  order: number;
  visible: boolean;
  data: Record<string, unknown>;
}

const SECTION_META: Record<string, { label: string; description: string; icon: string }> = {
  hero: { label: "Hero Banner", description: "Main brand banner with laptop lifestyle image", icon: "🖼" },
  categories: { label: "Categories Grid", description: "Browse by category section", icon: "☰" },
  featured: { label: "Featured Products", description: "Highlighted products with deals", icon: "⭐" },
  "new-arrivals": { label: "New Arrivals", description: "Latest products added to Evron", icon: "✨" },
  promo: { label: "Promotional Banner", description: "Sale/offer call-to-action banner", icon: "%" },
};

export default function Editor() {
  const { data: config, isLoading } = useGetEditorConfig();
  const saveConfig = useSaveEditorConfig();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [sections, setSections] = useState<Section[]>([]);
  const [saved, setSaved] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  useEffect(() => {
    if (config) {
      setSections([...config.sections].sort((a, b) => a.order - b.order));
    }
  }, [config]);

  function toggleVisible(id: string) {
    setSections(prev => prev.map(s => s.id === id ? { ...s, visible: !s.visible } : s));
    setSaved(false);
  }

  function handleDragStart(idx: number) { setDragIdx(idx); }
  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    setDragOverIdx(idx);
  }
  function handleDrop(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) { setDragIdx(null); setDragOverIdx(null); return; }
    const next = [...sections];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(idx, 0, moved);
    setSections(next.map((s, i) => ({ ...s, order: i })));
    setDragIdx(null);
    setDragOverIdx(null);
    setSaved(false);
  }
  function handleDragEnd() { setDragIdx(null); setDragOverIdx(null); }

  function handleSave() {
    const payload = sections.map((s, i) => ({ ...s, order: i }));
    saveConfig.mutate(
      { data: { sections: payload } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetEditorConfigQueryKey() });
          setSaved(true);
          toast({ title: "Layout saved!", description: "Your homepage layout has been updated." });
          setTimeout(() => setSaved(false), 3000);
        },
      }
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8 w-full flex-1">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 flex-wrap">
          <Link href="/">
            <button className="p-2 rounded-xl border border-border hover:border-primary transition-colors" data-testid="button-back-editor">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Page Editor</h1>
            <p className="text-muted-foreground text-sm">Drag and drop to reorder homepage sections. Toggle to show/hide them.</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saveConfig.isPending}
            className="gap-2"
            data-testid="button-save-layout"
          >
            {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saveConfig.isPending ? "Saving..." : saved ? "Saved!" : "Save Layout"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor panel */}
          <div>
            <h2 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Homepage Sections</h2>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
              </div>
            ) : (
              <div className="space-y-2">
                {sections.map((section, idx) => {
                  const meta = SECTION_META[section.type] ?? { label: section.type, description: "", icon: "□" };
                  const isDragging = dragIdx === idx;
                  const isDragOver = dragOverIdx === idx;
                  return (
                    <div
                      key={section.id}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={e => handleDragOver(e, idx)}
                      onDrop={e => handleDrop(e, idx)}
                      onDragEnd={handleDragEnd}
                      className={`bg-white rounded-2xl border-2 transition-all p-4 flex items-center gap-4 select-none cursor-grab active:cursor-grabbing ${
                        isDragging ? "opacity-40 scale-95" : ""
                      } ${isDragOver ? "border-primary shadow-md" : "border-border hover:border-muted-foreground/30"} ${
                        !section.visible ? "opacity-60" : ""
                      }`}
                      data-testid={`editor-section-${section.id}`}
                    >
                      <GripVertical className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                        {meta.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{meta.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{meta.description}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {section.visible ? (
                          <Eye className="w-4 h-4 text-primary" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        )}
                        <Switch
                          checked={section.visible}
                          onCheckedChange={() => toggleVisible(section.id)}
                          data-testid={`switch-section-${section.id}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Preview panel */}
          <div>
            <h2 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Live Preview</h2>
            <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
              <div className="bg-secondary px-4 py-2 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-primary/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 bg-secondary-foreground/10 rounded-full h-5 mx-4" />
              </div>
              <div className="p-4 space-y-2 max-h-[600px] overflow-y-auto">
                {sections.filter(s => s.visible).map(section => {
                  const meta = SECTION_META[section.type] ?? { label: section.type, icon: "□" };
                  return (
                    <div key={section.id} className="rounded-xl overflow-hidden border border-border">
                      {section.type === "hero" ? (
                        <div className="bg-gradient-to-r from-secondary to-secondary/60 p-6 text-white text-center">
                          <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">Pakistan's Premium Marketplace</p>
                          <p className="text-2xl font-black">EVRON</p>
                          <p className="text-white/70 text-xs italic">The trust we build</p>
                        </div>
                      ) : (
                        <div className="bg-muted/50 p-3 flex items-center gap-3">
                          <span className="text-lg">{meta.icon}</span>
                          <span className="text-sm font-medium text-muted-foreground">{meta.label}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
                {sections.filter(s => s.visible).length === 0 && (
                  <div className="py-12 text-center text-muted-foreground text-sm">
                    All sections hidden. Enable sections to preview.
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              This preview reflects your current layout. Save to apply changes to the live site.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
