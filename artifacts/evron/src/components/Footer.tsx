import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="text-2xl font-black tracking-tighter mb-3">
            EV<span className="text-primary">R</span>ON
          </div>
          <p className="text-sm text-secondary-foreground/70 leading-relaxed">
            The trust we build. Pakistan's premium online marketplace delivering quality products nationwide.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Shop</h4>
          <ul className="space-y-2 text-sm text-secondary-foreground/70">
            <li><Link href="/products" className="hover:text-primary transition-colors">All Products</Link></li>
            <li><Link href="/products?featured=true" className="hover:text-primary transition-colors">Featured</Link></li>
            <li><Link href="/products?newArrival=true" className="hover:text-primary transition-colors">New Arrivals</Link></li>
            <li><Link href="/category/1" className="hover:text-primary transition-colors">Electronics</Link></li>
            <li><Link href="/category/2" className="hover:text-primary transition-colors">Fashion</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Customer Service</h4>
          <ul className="space-y-2 text-sm text-secondary-foreground/70">
            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">About Evron</h4>
          <ul className="space-y-2 text-sm text-secondary-foreground/70">
            <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-secondary-foreground/10 py-4 text-center text-xs text-secondary-foreground/50">
        &copy; {new Date().getFullYear()} Evron. All rights reserved. The trust we build.
      </div>
    </footer>
  );
}
