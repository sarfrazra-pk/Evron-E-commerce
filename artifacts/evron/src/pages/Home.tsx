import { Link } from "wouter";
import { ArrowRight, Truck, Shield, RefreshCw, Headphones } from "lucide-react";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

const HERO_IMAGE = "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1400&q=90";

export default function Home() {
  const { data: featured, isLoading: featuredLoading } = useListProducts({ featured: true, limit: 8 });
  const { data: newArrivals, isLoading: newLoading } = useListProducts({ newArrival: true, limit: 8 });
  const { data: categories, isLoading: catsLoading } = useListCategories();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* HERO BANNER */}
      <section className="relative w-full">
        <div className="mx-4 md:mx-8 lg:mx-12 mt-4 rounded-2xl overflow-hidden border-[3px] border-white shadow-2xl relative" style={{ minHeight: 480 }}>
          {/* Background lifestyle image */}
          <img
            src={HERO_IMAGE}
            alt="Evron — The trust we build"
            className="w-full h-full object-cover absolute inset-0"
            style={{ minHeight: 480 }}
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/85 via-secondary/50 to-transparent" />
          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center h-full px-10 py-16 md:py-24 min-h-[480px]">
            <p className="text-primary text-sm font-semibold uppercase tracking-[0.3em] mb-4">Pakistan's Premium Marketplace</p>
            <h1 className="text-white text-6xl md:text-8xl font-black tracking-tight leading-none mb-4">
              EVRON
            </h1>
            <p className="text-white/80 text-xl md:text-2xl italic font-light mb-8">
              The trust we build
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link href="/products">
                <button className="bg-primary text-primary-foreground font-semibold px-8 py-3 rounded-xl hover:bg-primary/90 transition-all hover:shadow-lg hover:scale-105 flex items-center gap-2" data-testid="button-shop-now">
                  Shop Now <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/products?featured=true">
                <button className="bg-white/10 text-white border border-white/30 font-semibold px-8 py-3 rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm" data-testid="button-featured-deals">
                  Featured Deals
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST FEATURES */}
      <section className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Truck, title: "Free Delivery", desc: "On orders over Rs. 2,000" },
          { icon: Shield, title: "Secure Payment", desc: "100% protected transactions" },
          { icon: RefreshCw, title: "Easy Returns", desc: "30-day hassle-free returns" },
          { icon: Headphones, title: "24/7 Support", desc: "Dedicated customer service" },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-center gap-3 bg-white rounded-xl p-4 border border-border shadow-sm">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">{title}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Shop by Category</h2>
          <Link href="/products" className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {catsLoading ? (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {categories?.map(cat => (
              <Link key={cat.id} href={`/category/${cat.id}`}>
                <div className="group bg-white rounded-2xl border border-border overflow-hidden hover:border-primary hover:shadow-md transition-all cursor-pointer" data-testid={`card-category-${cat.id}`}>
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-2 text-center">
                    <p className="text-xs font-semibold truncate">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">{cat.productCount} items</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* PROMOTIONAL BANNER */}
      <section className="max-w-7xl mx-auto px-4 mb-12">
        <div className="bg-gradient-to-r from-secondary to-secondary/80 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">Limited Time Offer</p>
            <h3 className="text-white text-3xl md:text-4xl font-black mb-2">Up to 50% Off</h3>
            <p className="text-white/70">On selected electronics, fashion and more</p>
          </div>
          <Link href="/products?featured=true">
            <button className="bg-primary text-primary-foreground font-bold px-10 py-4 rounded-xl hover:bg-primary/90 transition-all hover:scale-105 shadow-lg whitespace-nowrap" data-testid="button-promo-shop">
              Grab the Deals
            </button>
          </Link>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Link href="/products?featured=true" className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {featuredLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featured?.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">New Arrivals</h2>
          <Link href="/products?newArrival=true" className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {newLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {newArrivals?.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
