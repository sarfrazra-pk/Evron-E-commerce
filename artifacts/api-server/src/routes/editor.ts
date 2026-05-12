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
  { sectionId: "page-about", type: "page-about", order: 100, visible: false, data: { heading: "About Evron", tagline: "The trust we build", mission: "Our mission is to deliver quality products to every corner of Pakistan at prices that everyone can afford — backed by a shopping experience built on trust, transparency and care.", story: "Evron was founded with a simple belief: online shopping in Pakistan should be easy, honest and reliable. We started as a small team passionate about connecting people with great products, and we have grown into a marketplace that thousands of customers trust every day.", values: "We believe in honest pricing, real product images, fast delivery and genuine customer support. No hidden fees, no fake reviews — just straightforward shopping.", team: "Our team is made up of people who love what they do — from our customer support agents who go the extra mile, to our warehouse staff who pack every order with care." } },
  { sectionId: "page-contact", type: "page-contact", order: 101, visible: false, data: { heading: "Contact Us", subtext: "We are here to help. Reach out to us anytime and we will get back to you as soon as possible.", email: "support@evron.pk", phone: "+92 300 0000000", address: "Karachi, Pakistan", hours: "Monday – Saturday: 9am – 6pm", extraInfo: "For order issues, please include your order number in the message so we can help you faster." } },
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
