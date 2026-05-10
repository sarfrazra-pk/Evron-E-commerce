import { Link } from "wouter";
import { Star, ShoppingCart } from "lucide-react";
import { useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  categoryName?: string | null;
  colors: string[];
  images: string[];
  rating: number;
  reviewCount?: number;
  stock: number;
  isFeatured: boolean;
  isNewArrival: boolean;
}

export default function ProductCard({ product }: { product: Product }) {
  const addToCart = useAddToCart();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    addToCart.mutate(
      { data: { productId: product.id, quantity: 1, selectedColor: product.colors[0] ?? "" } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          toast({ title: "Added to cart", description: product.name });
        },
      }
    );
  }

  return (
    <Link href={`/products/${product.id}`}>
      <div
        className="product-card group bg-white rounded-2xl border border-border overflow-hidden cursor-pointer relative"
        data-testid={`card-product-${product.id}`}
      >
        {/* Image */}
        <div className="relative overflow-hidden bg-muted aspect-square">
          <img
            src={product.images[0] ?? "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount && (
              <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                -{discount}%
              </span>
            )}
            {product.isNewArrival && (
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                New
              </span>
            )}
          </div>
          {/* Quick add button */}
          <button
            onClick={handleAddToCart}
            disabled={addToCart.isPending}
            className="absolute bottom-3 right-3 bg-primary text-primary-foreground p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:scale-110"
            data-testid={`button-add-cart-${product.id}`}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>

        {/* Info */}
        <div className="p-3">
          {product.categoryName && (
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{product.categoryName}</p>
          )}
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-2">{product.name}</h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map(i => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${i <= Math.round(product.rating) ? "fill-primary text-primary" : "text-muted-foreground"}`}
                />
              ))}
            </div>
            {product.reviewCount != null && (
              <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
            )}
          </div>

          {/* Colors */}
          {product.colors.length > 0 && (
            <div className="flex gap-1 mb-2">
              {product.colors.slice(0, 4).map(color => (
                <div
                  key={color}
                  className="w-4 h-4 rounded-full border border-border"
                  style={{ backgroundColor: COLOR_MAP[color] ?? "#888" }}
                  title={color}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-xs text-muted-foreground">+{product.colors.length - 4}</span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">Rs. {product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">
                Rs. {product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

const COLOR_MAP: Record<string, string> = {
  "Black": "#1a1a1a",
  "White": "#f5f5f5",
  "Matte Black": "#2a2a2a",
  "Pearl White": "#f0f0f0",
  "Rose Gold": "#b76e79",
  "Space Gray": "#6e6e73",
  "Silver": "#c0c0c0",
  "Midnight Black": "#1c1c1e",
  "Phantom Black": "#1a1a2e",
  "Cream White": "#fff8e7",
  "Lavender": "#b39ddb",
  "Midnight": "#1c1c1e",
  "Starlight": "#e8e0d0",
  "Blue": "#007aff",
  "Gold": "#d4af37",
  "Brown": "#7b4f2e",
  "Dark Navy": "#1a2744",
  "Tan": "#d2a679",
  "Dark Brown": "#5c3317",
  "Gray": "#9e9e9e",
  "Sage Green": "#7c9a7e",
  "Sand Beige": "#d4b896",
  "Dusty Rose": "#c9a9a6",
  "Purple": "#7b2d8b",
  "Teal": "#009688",
  "Charcoal": "#444",
  "Pink": "#e91e8c",
  "Blue/White": "#1976d2",
  "Black/Red": "#b71c1c",
  "Gray/Neon": "#616161",
  "One Size": "#888",
};
