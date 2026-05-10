import { useEffect, useState } from "react";
import { useSearch } from "wouter";
import { Search as SearchIcon } from "lucide-react";
import { useSearchProducts } from "@workspace/api-client-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Search() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const q = params.get("q") ?? "";
  const [sortBy, setSortBy] = useState("rating");

  const { data: results, isLoading } = useSearchProducts(
    { q, sortBy },
    { query: { enabled: !!q } }
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <SearchIcon className="w-6 h-6 text-primary" />
              Search Results
            </h1>
            {q && (
              <p className="text-muted-foreground mt-1">
                {isLoading ? "Searching..." : `${results?.total ?? 0} results for `}
                {!isLoading && <span className="font-semibold text-foreground">"{q}"</span>}
              </p>
            )}
          </div>
          {results && results.products.length > 0 && (
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              data-testid="select-search-sort"
            >
              <option value="rating">Top Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          )}
        </div>

        {!q ? (
          <div className="py-24 text-center">
            <SearchIcon className="w-16 h-16 text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Start searching</h3>
            <p className="text-muted-foreground">Use the search bar above to find products</p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
          </div>
        ) : results?.products.length === 0 ? (
          <div className="py-24 text-center">
            <SearchIcon className="w-16 h-16 text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground">No products match "{q}". Try different keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {results?.products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
