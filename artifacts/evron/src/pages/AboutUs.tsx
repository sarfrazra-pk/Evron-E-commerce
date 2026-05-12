import { useGetEditorConfig } from "@workspace/api-client-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";

export default function AboutUs() {
  const { data: config, isLoading } = useGetEditorConfig();
  const section = config?.sections.find(s => s.type === "page-about");
  const d = (section?.data ?? {}) as Record<string, string>;

  const heading    = d.heading    || "About Evron";
  const tagline    = d.tagline    || "The trust we build";
  const mission    = d.mission    || "Our mission is to deliver quality products to every corner of Pakistan at prices that everyone can afford — backed by a shopping experience built on trust, transparency and care.";
  const story      = d.story      || "Evron was founded with a simple belief: online shopping in Pakistan should be easy, honest and reliable. We started as a small team passionate about connecting people with great products, and we have grown into a marketplace that thousands of customers trust every day.";
  const values     = d.values     || "We believe in honest pricing, real product images, fast delivery and genuine customer support. No hidden fees, no fake reviews — just straightforward shopping.";
  const team       = d.team       || "Our team is made up of people who love what they do — from our customer support agents who go the extra mile, to our warehouse staff who pack every order with care.";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero */}
      <section className="bg-secondary text-white py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          {isLoading ? (
            <><Skeleton className="h-12 w-64 mx-auto mb-4 bg-white/10" /><Skeleton className="h-6 w-80 mx-auto bg-white/10" /></>
          ) : (
            <>
              <h1 className="text-5xl font-black mb-3">{heading}</h1>
              <p className="text-primary text-xl italic font-light">{tagline}</p>
            </>
          )}
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-16 flex-1 w-full space-y-12">

        {/* Mission */}
        <section className="bg-white rounded-2xl border border-border p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-xl">🎯</div>
            <h2 className="text-2xl font-bold">Our Mission</h2>
          </div>
          {isLoading ? <Skeleton className="h-20 w-full" /> : (
            <p className="text-muted-foreground leading-relaxed text-base">{mission}</p>
          )}
        </section>

        {/* Story */}
        <section className="bg-white rounded-2xl border border-border p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-xl">📖</div>
            <h2 className="text-2xl font-bold">Our Story</h2>
          </div>
          {isLoading ? <Skeleton className="h-20 w-full" /> : (
            <p className="text-muted-foreground leading-relaxed text-base">{story}</p>
          )}
        </section>

        {/* Values */}
        <section className="bg-white rounded-2xl border border-border p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-xl">💎</div>
            <h2 className="text-2xl font-bold">Our Values</h2>
          </div>
          {isLoading ? <Skeleton className="h-16 w-full" /> : (
            <p className="text-muted-foreground leading-relaxed text-base">{values}</p>
          )}
        </section>

        {/* Team */}
        <section className="bg-white rounded-2xl border border-border p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-xl">👥</div>
            <h2 className="text-2xl font-bold">Our Team</h2>
          </div>
          {isLoading ? <Skeleton className="h-16 w-full" /> : (
            <p className="text-muted-foreground leading-relaxed text-base">{team}</p>
          )}
        </section>

        {/* CTA */}
        <section className="bg-secondary rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-black mb-2">Ready to shop?</h3>
          <p className="text-white/70 mb-6">Discover thousands of products at great prices</p>
          <a href="/products" className="inline-block bg-primary text-primary-foreground font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity">
            Browse Products →
          </a>
        </section>

      </div>

      <Footer />
    </div>
  );
}
