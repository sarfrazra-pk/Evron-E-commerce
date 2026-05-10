import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, cartItemsTable } from "@workspace/db";
import {
  AddToCartBody,
  UpdateCartItemParams,
  UpdateCartItemBody,
  RemoveFromCartParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function getSessionId(req: { headers: Record<string, string | string[] | undefined>; ip?: string }): string {
  const cookie = req.headers["x-session-id"];
  if (typeof cookie === "string" && cookie) return cookie;
  return req.ip ?? "default-session";
}

async function buildCart(sessionId: string) {
  const items = await db
    .select()
    .from(cartItemsTable)
    .where(eq(cartItemsTable.sessionId, sessionId));

  const total = items.reduce((sum, item) => sum + parseFloat(String(item.price)) * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items: items.map(i => ({
      productId: i.productId,
      productName: i.productName,
      price: parseFloat(String(i.price)),
      quantity: i.quantity,
      selectedColor: i.selectedColor,
      image: i.image,
    })),
    total: Math.round(total * 100) / 100,
    itemCount,
  };
}

router.get("/cart", async (req, res): Promise<void> => {
  const sessionId = getSessionId(req as any);
  const cart = await buildCart(sessionId);
  res.json(cart);
});

router.post("/cart/items", async (req, res): Promise<void> => {
  const parsed = AddToCartBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const sessionId = getSessionId(req as any);
  const { productId, quantity, selectedColor } = parsed.data;

  const [existing] = await db
    .select()
    .from(cartItemsTable)
    .where(and(eq(cartItemsTable.sessionId, sessionId), eq(cartItemsTable.productId, productId)));

  if (existing) {
    await db
      .update(cartItemsTable)
      .set({ quantity: existing.quantity + quantity })
      .where(eq(cartItemsTable.id, existing.id));
  } else {
    const { productsTable } = await import("@workspace/db");
    const { eq: eqOp } = await import("drizzle-orm");
    const [product] = await db.select().from(productsTable).where(eqOp(productsTable.id, productId));
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    await db.insert(cartItemsTable).values({
      sessionId,
      productId,
      productName: product.name,
      price: product.price,
      quantity,
      selectedColor,
      image: product.images[0] ?? "",
    });
  }

  const cart = await buildCart(sessionId);
  res.json(cart);
});

router.patch("/cart/items/:productId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const params = UpdateCartItemParams.safeParse({ productId: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateCartItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const sessionId = getSessionId(req as any);

  if (parsed.data.quantity <= 0) {
    await db
      .delete(cartItemsTable)
      .where(and(eq(cartItemsTable.sessionId, sessionId), eq(cartItemsTable.productId, params.data.productId)));
  } else {
    await db
      .update(cartItemsTable)
      .set({ quantity: parsed.data.quantity })
      .where(and(eq(cartItemsTable.sessionId, sessionId), eq(cartItemsTable.productId, params.data.productId)));
  }

  const cart = await buildCart(sessionId);
  res.json(cart);
});

router.delete("/cart/items/:productId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const params = RemoveFromCartParams.safeParse({ productId: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const sessionId = getSessionId(req as any);

  await db
    .delete(cartItemsTable)
    .where(and(eq(cartItemsTable.sessionId, sessionId), eq(cartItemsTable.productId, params.data.productId)));

  const cart = await buildCart(sessionId);
  res.json(cart);
});

export default router;
