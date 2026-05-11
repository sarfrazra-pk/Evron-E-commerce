import { Router, type IRouter } from "express";
import { asc } from "drizzle-orm";
import { db, editorSectionsTable } from "@workspace/db";
import { SaveEditorConfigBody } from "@workspace/api-zod";

const router: IRouter = Router();

const DEFAULT_SECTIONS = [
  { sectionId: "hero", type: "hero", order: 0, visible: true, data: { heroTitle: "EVRON", heroSlogan: "The trust we build", heroSubtitle: "Pakistan's Premium Marketplace" } },
  { sectionId: "categories", type: "categories", order: 1, visible: true, data: {} },
  { sectionId: "featured", type: "featured", order: 2, visible: true, data: { title: "Featured Products" } },
  { sectionId: "promo", type: "promo", order: 3, visible: true, data: { promoHeading: "Up to 50% Off", promoSubheading: "On selected electronics, fashion and more", promoCtaText: "Grab the Deals" } },
  { sectionId: "new-arrivals", type: "new-arrivals", order: 4, visible: true, data: { title: "New Arrivals" } },
  { sectionId: "theme", type: "theme", order: 99, visible: false, data: { primary: "#f59e0b", secondary: "#1e2d4f", background: "#f7f8fa" } },
];

async function ensureDefaultSections() {
  const existing = await db.select().from(editorSectionsTable);
  if (existing.length === 0) {
    await db.insert(editorSectionsTable).values(DEFAULT_SECTIONS);
  }
}

router.get("/editor/config", async (_req, res): Promise<void> => {
  await ensureDefaultSections();
  const sections = await db
    .select()
    .from(editorSectionsTable)
    .orderBy(asc(editorSectionsTable.order));

  res.json({
    id: 1,
    sections: sections.map(s => ({
      id: s.sectionId,
      type: s.type,
      order: s.order,
      visible: s.visible,
      data: s.data,
    })),
    updatedAt: String(sections[0]?.updatedAt ?? new Date()),
  });
});

router.put("/editor/config", async (req, res): Promise<void> => {
  const parsed = SaveEditorConfigBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await db.delete(editorSectionsTable);
  await db.insert(editorSectionsTable).values(
    parsed.data.sections.map(s => ({
      sectionId: s.id,
      type: s.type,
      order: s.order,
      visible: s.visible,
      data: s.data as Record<string, unknown>,
    }))
  );

  const sections = await db
    .select()
    .from(editorSectionsTable)
    .orderBy(asc(editorSectionsTable.order));

  res.json({
    id: 1,
    sections: sections.map(s => ({
      id: s.sectionId,
      type: s.type,
      order: s.order,
      visible: s.visible,
      data: s.data,
    })),
    updatedAt: String(sections[0]?.updatedAt ?? new Date()),
  });
});

export default router;
