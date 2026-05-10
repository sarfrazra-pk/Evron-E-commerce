import { useState } from "react";
import { useSearch } from "wouter";
import { SlidersHorizontal, X } from "lucide-react";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function Products() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const [categoryId, setCategoryId] = useState<number | undefined>(
    params.get("categoryId") ? Number(params.get("categoryId")) : undefined
  );
  const [featured, setFeatured] = useState<boolean | undefined>(
    params.get("featured") === "true" ? true : undefined
  );
  const [newArrival, setNewArrival] = useState<boolean | undefined>(
    params.get("newArrival") === "true" ? true : undefined
  );
  const [sortBy, setSortBy] = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data: categories } = useListCategories();
  const { data: products, isLoading } = useListProducts({
    categoryId,
    featured,
    newArrival,
    sortBy: sortBy === "newest" ? undefined : sortBy,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    limit: 50,
  });

  function clearFilters() {
    setCategoryId(undefined);
    setFeatured(undefined);
    setNewArrival(undefined);
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
  }

  const hasFilters = categoryId || featured || newArrival || minPrice || maxPrice;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">
              {featured ? "Featured Products" : newArrival ? "New Arrivals" : "All Products"}
            </h1>
            {products && <p className="text-muted-foreground text-sm mt-0.5">{products.length} products found</p>}
          </div>
          <div className="flex items-center gap-3">
            {hasFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters} className="gap-1">
                <X className="w-3 h-3" /> Clear filters
              </Button>
            )}
            <button
              onClick={() => setFiltersOpen(o => !o)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-white hover:border-primary transition-colors text-sm font-medium"
              data-testid="button-toggle-filters"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              data-testid="select-sort"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar filters */}
          {filtersOpen && (
            <aside className="w-64 flex-shrink-0 bg-white rounded-2xl border border-border p-5 h-fit sticky top-24 space-y-6">
              <div>
                <h3 className="font-semibold mb-3 text-sm">Category</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="cat" checked={!categoryId} onChange={() => setCategoryId(undefined)} className="accent-primary" />
                    <span className="text-sm">All Categories</span>
                  </label>
                  {categories?.map(cat => (
                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="cat" checked={categoryId === cat.id} onChange={() => setCategoryId(cat.id)} className="accent-primary" />
                      <span className="text-sm">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-sm">Type</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!featured} onChange={e => setFeatured(e.target.checked ? true : undefined)} className="accent-primary" />
                    <span className="text-sm">Featured</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!newArrival} onChange={e => setNewArrival(e.target.checked ? true : undefined)} className="accent-primary" />
                    <span className="text-sm">New Arrivals</span>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-sm">Price Range (Rs.)</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    data-testid="input-min-price"
                  />
                  <span className="text-muted-foreground">–</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    data-testid="input-max-price"
                  />
                </div>
              </div>
            </aside>
          )}

          {/* Grid */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(12)].map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
              </div>
            ) : products?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-4xl mb-4">&#8709;</p>
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-6">Try adjusting your filters</p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products?.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
