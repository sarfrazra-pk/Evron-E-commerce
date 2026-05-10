import { Router, type IRouter } from "express";
import { eq, like, and, gte, lte, or, ilike, desc, asc, sql } from "drizzle-orm";
import { db, productsTable, categoriesTable } from "@workspace/db";
import {
  ListProductsQueryParams,
  CreateProductBody,
  GetProductParams,
  UpdateProductParams,
  UpdateProductBody,
  DeleteProductParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/products", async (req, res): Promise<void> => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { categoryId, featured, newArrival, limit, offset, sortBy, minPrice, maxPrice } = parsed.data;

  const conditions = [];
  if (categoryId != null) conditions.push(eq(productsTable.categoryId, categoryId));
  if (featured != null) conditions.push(eq(productsTable.isFeatured, featured));
  if (newArrival != null) conditions.push(eq(productsTable.isNewArrival, newArrival));
  if (minPrice != null) conditions.push(gte(productsTable.price, String(minPrice)));
  if (maxPrice != null) conditions.push(lte(productsTable.price, String(maxPrice)));

  let orderBy = desc(productsTable.createdAt);
  if (sortBy === "price_asc") orderBy = asc(productsTable.price);
  else if (sortBy === "price_desc") orderBy = desc(productsTable.price);
  else if (sortBy === "rating") orderBy = desc(productsTable.rating);
  else if (sortBy === "name") orderBy = asc(productsTable.name);

  const products = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      description: productsTable.description,
      price: productsTable.price,
      originalPrice: productsTable.originalPrice,
      categoryId: productsTable.categoryId,
      categoryName: categoriesTable.name,
      colors: productsTable.colors,
      images: productsTable.images,
      rating: productsTable.rating,
      reviewCount: productsTable.reviewCount,
      stock: productsTable.stock,
      isFeatured: productsTable.isFeatured,
      isNewArrival: productsTable.isNewArrival,
      createdAt: productsTable.createdAt,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(orderBy)
    .limit(limit ?? 50)
    .offset(offset ?? 0);

  res.json(products.map(p => ({
    ...p,
    price: parseFloat(String(p.price)),
    originalPrice: p.originalPrice != null ? parseFloat(String(p.originalPrice)) : null,
    rating: parseFloat(String(p.rating)),
    createdAt: String(p.createdAt),
  })));
});

router.post("/products", async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [product] = await db.insert(productsTable).values({
    ...parsed.data,
    price: String(parsed.data.price),
    originalPrice: parsed.data.originalPrice != null ? String(parsed.data.originalPrice) : undefined,
  }).returning();

  const [category] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, product.categoryId));

  res.status(201).json({
    ...product,
    categoryName: category?.name ?? null,
    price: parseFloat(String(product.price)),
    originalPrice: product.originalPrice != null ? parseFloat(String(product.originalPrice)) : null,
    rating: parseFloat(String(product.rating)),
    createdAt: String(product.createdAt),
  });
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetProductParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [product] = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      description: productsTable.description,
      price: productsTable.price,
      originalPrice: productsTable.originalPrice,
      categoryId: productsTable.categoryId,
      categoryName: categoriesTable.name,
      colors: productsTable.colors,
      images: productsTable.images,
      rating: productsTable.rating,
      reviewCount: productsTable.reviewCount,
      stock: productsTable.stock,
      isFeatured: productsTable.isFeatured,
      isNewArrival: productsTable.isNewArrival,
      createdAt: productsTable.createdAt,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.id, params.data.id));

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json({
    ...product,
    price: parseFloat(String(product.price)),
    originalPrice: product.originalPrice != null ? parseFloat(String(product.originalPrice)) : null,
    rating: parseFloat(String(product.rating)),
    createdAt: String(product.createdAt),
  });
});

router.patch("/products/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateProductParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.price != null) updateData.price = String(parsed.data.price);
  if (parsed.data.originalPrice != null) updateData.originalPrice = String(parsed.data.originalPrice);

  const [product] = await db
    .update(productsTable)
    .set(updateData)
    .where(eq(productsTable.id, params.data.id))
    .returning();

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const [category] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, product.categoryId));

  res.json({
    ...product,
    categoryName: category?.name ?? null,
    price: parseFloat(String(product.price)),
    originalPrice: product.originalPrice != null ? parseFloat(String(product.originalPrice)) : null,
    rating: parseFloat(String(product.rating)),
    createdAt: String(product.createdAt),
  });
});

router.delete("/products/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteProductParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(productsTable).where(eq(productsTable.id, params.data.id));
  res.sendStatus(204);
});

router.get("/stats", async (_req, res): Promise<void> => {
  const [totalProducts] = await db.select({ count: sql<number>`count(*)::int` }).from(productsTable);
  const [totalCategories] = await db.select({ count: sql<number>`count(*)::int` }).from(categoriesTable);
  const [featuredCount] = await db.select({ count: sql<number>`count(*)::int` }).from(productsTable).where(eq(productsTable.isFeatured, true));
  const [newArrivalsCount] = await db.select({ count: sql<number>`count(*)::int` }).from(productsTable).where(eq(productsTable.isNewArrival, true));

  res.json({
    totalProducts: totalProducts.count,
    totalCategories: totalCategories.count,
    featuredCount: featuredCount.count,
    newArrivalsCount: newArrivalsCount.count,
  });
});

router.get("/search", async (req, res): Promise<void> => {
  const parsed = SearchProductsQueryParamsHelper.safeParse(req.query);
  const q = typeof req.query.q === "string" ? req.query.q : "";
  const categoryId = req.query.categoryId ? parseInt(String(req.query.categoryId), 10) : undefined;
  const minPrice = req.query.minPrice ? parseFloat(String(req.query.minPrice)) : undefined;
  const maxPrice = req.query.maxPrice ? parseFloat(String(req.query.maxPrice)) : undefined;
  const sortBy = typeof req.query.sortBy === "string" ? req.query.sortBy : undefined;

  const conditions = [
    or(
      ilike(productsTable.name, `%${q}%`),
      ilike(productsTable.description, `%${q}%`)
    )
  ];
  if (categoryId != null) conditions.push(eq(productsTable.categoryId, categoryId));
  if (minPrice != null) conditions.push(gte(productsTable.price, String(minPrice)));
  if (maxPrice != null) conditions.push(lte(productsTable.price, String(maxPrice)));

  let orderBy = desc(productsTable.rating);
  if (sortBy === "price_asc") orderBy = asc(productsTable.price);
  else if (sortBy === "price_desc") orderBy = desc(productsTable.price);

  const products = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      description: productsTable.description,
      price: productsTable.price,
      originalPrice: productsTable.originalPrice,
      categoryId: productsTable.categoryId,
      categoryName: categoriesTable.name,
      colors: productsTable.colors,
      images: productsTable.images,
      rating: productsTable.rating,
      reviewCount: productsTable.reviewCount,
      stock: productsTable.stock,
      isFeatured: productsTable.isFeatured,
      isNewArrival: productsTable.isNewArrival,
      createdAt: productsTable.createdAt,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(20);

  res.json({
    query: q,
    products: products.map(p => ({
      ...p,
      price: parseFloat(String(p.price)),
      originalPrice: p.originalPrice != null ? parseFloat(String(p.originalPrice)) : null,
      rating: parseFloat(String(p.rating)),
      createdAt: String(p.createdAt),
    })),
    total: products.length,
    suggestions: [],
  });
});

// Inline helper to avoid import collision
const SearchProductsQueryParamsHelper = {
  safeParse: (data: unknown) => ({ success: true, data })
};

export default router;
