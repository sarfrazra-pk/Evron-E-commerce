import { useParams, Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useGetCategory, useListProducts, getGetCategoryQueryKey } from "@workspace/api-client-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function Category() {
  const { id } = useParams<{ id: string }>();
  const categoryId = Number(id);
  const { data: category, isLoading: catLoading } = useGetCategory(categoryId, {
    query: { enabled: !!categoryId, queryKey: getGetCategoryQueryKey(categoryId) },
  });
  const { data: products, isLoading: productsLoading } = useListProducts(
    { categoryId, limit: 50 },
    { query: { enabled: !!categoryId } }
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8 w-full flex-1">
        <Link href="/products">
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors" data-testid="button-back">
            <ArrowLeft className="w-4 h-4" /> Back to Products
          </button>
        </Link>

        {/* Category header */}
        {catLoading ? (
          <Skeleton className="h-40 rounded-2xl mb-8" />
        ) : category ? (
          <div className="relative rounded-2xl overflow-hidden mb-10 h-48">
            <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/80 to-transparent flex items-center px-10">
              <div>
                <h1 className="text-4xl font-black text-white">{category.name}</h1>
                <p className="text-white/70 mt-1">{category.description}</p>
                <p className="text-primary text-sm font-semibold mt-1">{category.productCount} products</p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Products grid */}
        {productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
          </div>
        ) : products?.length === 0 ? (
          <div className="py-24 text-center">
            <h3 className="text-xl font-semibold mb-2">No products in this category yet</h3>
            <p className="text-muted-foreground mb-6">Check back soon for new additions</p>
            <Button asChild><Link href="/products">Browse All Products</Link></Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products?.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
