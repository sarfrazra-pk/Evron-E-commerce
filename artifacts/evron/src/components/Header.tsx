import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, Search, X, Menu, ChevronDown } from "lucide-react";
import { useGetCart, useSearchProducts } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [, setLocation] = useLocation();
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: cart } = useGetCart();
  const { data: searchResults } = useSearchProducts(
    { q: query },
    { query: { enabled: query.length >= 2 } }
  );

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      setLocation(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
      setSearchOpen(false);
    }
  }

  const itemCount = cart?.itemCount ?? 0;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      {/* Top bar */}
      <div className="bg-secondary text-secondary-foreground text-xs py-1 text-center">
        Free delivery on orders over Rs. 2,000 &mdash; The trust we build
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <span className="text-2xl font-black tracking-tighter text-secondary">
            EV<span className="text-primary">R</span>ON
          </span>
        </Link>

        {/* Desktop Search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl relative" ref={dropdownRef}>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="search"
              placeholder="Search products, brands and categories..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-muted rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all"
              data-testid="input-search"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
          {/* Dropdown results */}
          {query.length >= 2 && searchResults && searchResults.products.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-xl shadow-lg z-50 overflow-hidden">
              {searchResults.products.slice(0, 5).map(p => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  onClick={() => setQuery("")}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors"
                >
                  <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">Rs. {p.price.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
              <button
                type="submit"
                className="w-full px-4 py-2.5 text-sm text-primary font-medium hover:bg-muted transition-colors border-t border-border text-left"
              >
                See all results for "{query}"
              </button>
            </div>
          )}
        </form>

        {/* Right actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Mobile search toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setSearchOpen(o => !o)}
            data-testid="button-mobile-search"
          >
            <Search className="w-5 h-5" />
          </button>

          <Link href="/cart">
            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors" data-testid="button-cart">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>
          </Link>

          <button className="md:hidden p-2 rounded-lg hover:bg-muted" onClick={() => setMenuOpen(o => !o)}>
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile search bar */}
      {searchOpen && (
        <div className="md:hidden px-4 pb-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              ref={searchRef}
              type="search"
              placeholder="Search Evron..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-muted rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </form>
        </div>
      )}

      {/* Nav links */}
      <nav className="hidden md:block border-t border-border bg-white">
        <div className="max-w-7xl mx-auto px-4 flex gap-6 text-sm font-medium py-2">
          <Link href="/products" className="text-foreground hover:text-primary transition-colors py-1">All Products</Link>
          <Link href="/category/1" className="text-foreground hover:text-primary transition-colors py-1">Electronics</Link>
          <Link href="/category/2" className="text-foreground hover:text-primary transition-colors py-1">Fashion</Link>
          <Link href="/category/3" className="text-foreground hover:text-primary transition-colors py-1">Home & Living</Link>
          <Link href="/category/4" className="text-foreground hover:text-primary transition-colors py-1">Beauty & Health</Link>
          <Link href="/category/5" className="text-foreground hover:text-primary transition-colors py-1">Sports</Link>
          <Link href="/products?featured=true" className="text-primary font-semibold transition-colors py-1">Featured Deals</Link>
        </div>
      </nav>
    </header>
  );
}
