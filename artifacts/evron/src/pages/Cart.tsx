import { Link } from "wouter";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import {
  useGetCart,
  useUpdateCartItem,
  useRemoveFromCart,
  getGetCartQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function Cart() {
  const { data: cart, isLoading } = useGetCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveFromCart();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  function handleUpdate(productId: number, quantity: number) {
    updateItem.mutate(
      { productId, data: { quantity } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }) }
    );
  }

  function handleRemove(productId: number, name: string) {
    removeItem.mutate(
      { productId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          toast({ title: "Removed from cart", description: name });
        },
      }
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-primary" /> Shopping Cart
          {cart && cart.itemCount > 0 && (
            <span className="text-sm font-normal text-muted-foreground ml-1">({cart.itemCount} items)</span>
          )}
        </h1>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
        ) : !cart || cart.items.length === 0 ? (
          <div className="py-24 text-center flex flex-col items-center">
            <ShoppingBag className="w-20 h-20 text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-8">Looks like you haven't added anything yet</p>
            <Button asChild size="lg" className="gap-2">
              <Link href="/products">Start Shopping <ArrowRight className="w-4 h-4" /></Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items list */}
            <div className="lg:col-span-2 space-y-3">
              {cart.items.map(item => (
                <div key={`${item.productId}-${item.selectedColor}`} className="bg-white rounded-2xl border border-border p-4 flex gap-4" data-testid={`cart-item-${item.productId}`}>
                  <Link href={`/products/${item.productId}`}>
                    <img
                      src={item.image || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200"}
                      alt={item.productName}
                      className="w-20 h-20 object-cover rounded-xl border border-border flex-shrink-0 hover:opacity-90 transition-opacity"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.productId}`}>
                      <h3 className="font-semibold text-sm hover:text-primary transition-colors truncate">{item.productName}</h3>
                    </Link>
                    {item.selectedColor && (
                      <p className="text-xs text-muted-foreground mt-0.5">Color: {item.selectedColor}</p>
                    )}
                    <p className="font-bold text-sm mt-1">Rs. {item.price.toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleUpdate(item.productId, item.quantity - 1)}
                        disabled={updateItem.isPending}
                        className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:border-primary transition-colors"
                        data-testid={`button-decrease-${item.productId}`}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-bold text-sm" data-testid={`text-qty-${item.productId}`}>{item.quantity}</span>
                      <button
                        onClick={() => handleUpdate(item.productId, item.quantity + 1)}
                        disabled={updateItem.isPending}
                        className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:border-primary transition-colors"
                        data-testid={`button-increase-${item.productId}`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <span className="ml-auto text-sm font-bold">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(item.productId, item.productName)}
                    disabled={removeItem.isPending}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors self-start"
                    data-testid={`button-remove-${item.productId}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Order summary */}
            <div className="bg-white rounded-2xl border border-border p-6 h-fit sticky top-24 space-y-4">
              <h2 className="font-bold text-lg">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({cart.itemCount} items)</span>
                  <span>Rs. {cart.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className={cart.total >= 2000 ? "text-green-600 font-medium" : ""}>
                    {cart.total >= 2000 ? "Free" : "Rs. 150"}
                  </span>
                </div>
              </div>
              <div className="border-t border-border pt-3 flex justify-between font-black text-lg">
                <span>Total</span>
                <span>Rs. {(cart.total + (cart.total >= 2000 ? 0 : 150)).toLocaleString()}</span>
              </div>
              {cart.total < 2000 && (
                <p className="text-xs text-muted-foreground bg-muted rounded-lg p-2">
                  Add Rs. {(2000 - cart.total).toLocaleString()} more for free delivery
                </p>
              )}
              <Button size="lg" className="w-full font-bold gap-2" data-testid="button-checkout">
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
