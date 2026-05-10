import { useState } from "react";
import { useParams, Link } from "wouter";
import { Star, ShoppingCart, ArrowLeft, Package, Shield, RefreshCw, Truck } from "lucide-react";
import { useGetProduct, useAddToCart, useListProducts, getGetCartQueryKey, getGetProductQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const COLOR_MAP: Record<string, string> = {
  "Black": "#1a1a1a", "White": "#f5f5f5", "Matte Black": "#2a2a2a", "Pearl White": "#f0f0f0",
  "Rose Gold": "#b76e79", "Space Gray": "#6e6e73", "Silver": "#c0c0c0", "Midnight Black": "#1c1c1e",
  "Phantom Black": "#1a1a2e", "Cream White": "#fff8e7", "Lavender": "#b39ddb", "Midnight": "#1c1c1e",
  "Starlight": "#e8e0d0", "Blue": "#007aff", "Gold": "#d4af37", "Brown": "#7b4f2e",
  "Dark Navy": "#1a2744", "Tan": "#d2a679", "Dark Brown": "#5c3317", "Gray": "#9e9e9e",
  "Sage Green": "#7c9a7e", "Sand Beige": "#d4b896", "Dusty Rose": "#c9a9a6",
  "Purple": "#7b2d8b", "Teal": "#009688", "Charcoal": "#444", "Pink": "#e91e8c",
  "Blue/White": "#1976d2", "Black/Red": "#b71c1c", "Gray/Neon": "#616161", "One Size": "#888",
};

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const { data: product, isLoading } = useGetProduct(productId, {
    query: { enabled: !!productId, queryKey: getGetProductQueryKey(productId) },
  });
  const { data: related } = useListProducts(
    { categoryId: product?.categoryId, limit: 4 },
    { query: { enabled: !!product } }
  );
  const addToCart = useAddToCart();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  if (isLoading) return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex items-center justify-center flex-col gap-4 py-24">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <Link href="/products"><Button>Browse Products</Button></Link>
      </div>
      <Footer />
    </div>
  );

  const color = selectedColor || product.colors[0] || "";
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  function handleAddToCart() {
    addToCart.mutate(
      { data: { productId: product!.id, quantity, selectedColor: color } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          toast({ title: "Added to cart!", description: `${product!.name} — ${color}` });
        },
      }
    );
  }

  const relatedFiltered = related?.filter(r => r.id !== product.id).slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8 w-full flex-1">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
          {product.categoryName && <>
            <span>/</span>
            <Link href={`/category/${product.categoryId}`} className="hover:text-primary transition-colors">{product.categoryName}</Link>
          </>}
          <span>/</span>
          <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
          {/* Images */}
          <div className="space-y-3">
            <div className="aspect-square bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
              <img
                src={product.images[activeImage] ?? "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-16 rounded-lg border-2 overflow-hidden transition-all ${activeImage === i ? "border-primary" : "border-border"}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-5">
            {product.categoryName && (
              <Link href={`/category/${product.categoryId}`}>
                <span className="text-xs font-semibold uppercase tracking-widest text-primary hover:underline">
                  {product.categoryName}
                </span>
              </Link>
            )}
            <h1 className="text-3xl font-black leading-tight">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className={`w-4 h-4 ${i <= Math.round(product.rating) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                ))}
              </div>
              <span className="text-sm font-semibold">{product.rating.toFixed(1)}</span>
              {product.reviewCount != null && (
                <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black">Rs. {product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">Rs. {product.originalPrice.toLocaleString()}</span>
                  <span className="bg-destructive/10 text-destructive text-sm font-bold px-2 py-0.5 rounded-full">-{discount}%</span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            {/* Color selector */}
            {product.colors.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2">
                  Color: <span className="font-normal text-muted-foreground">{color}</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map(c => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      title={c}
                      className={`w-9 h-9 rounded-full border-2 transition-all hover:scale-110 ${c === color ? "border-primary ring-2 ring-primary ring-offset-2" : "border-border"}`}
                      style={{ backgroundColor: COLOR_MAP[c] ?? "#888" }}
                      data-testid={`button-color-${c.replace(/\s+/g, "-").toLowerCase()}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="text-sm font-semibold mb-2">Quantity</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:border-primary transition-colors font-bold" data-testid="button-qty-minus">-</button>
                <span className="w-10 text-center font-bold text-lg" data-testid="text-qty">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product!.stock, q + 1))} className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:border-primary transition-colors font-bold" data-testid="button-qty-plus">+</button>
                <span className="text-sm text-muted-foreground ml-2">{product.stock} in stock</span>
              </div>
            </div>

            {/* Add to cart */}
            <Button
              size="lg"
              className="w-full text-base font-bold rounded-xl gap-2"
              onClick={handleAddToCart}
              disabled={addToCart.isPending || product.stock === 0}
              data-testid="button-add-to-cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {product.stock === 0 ? "Out of Stock" : addToCart.isPending ? "Adding..." : "Add to Cart"}
            </Button>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { icon: Truck, text: "Free Delivery over Rs. 2,000" },
                { icon: Shield, text: "Secure Payment" },
                { icon: RefreshCw, text: "30-day Easy Returns" },
                { icon: Package, text: "Quality Guaranteed" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related products */}
        {relatedFiltered && relatedFiltered.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedFiltered.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
      <Footer />
    </div>
  );
}
