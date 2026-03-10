import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, CreditCard, ShieldCheck, Truck, ShoppingBag } from "lucide-react";
import { ThemeSetting } from "@prisma/client";

interface FooterProps {
  theme?: ThemeSetting | null;
}

export default function Footer({ theme }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Company Info */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center group">
              {theme?.logoUrl ? (
                <div 
                  className="relative transition-transform group-hover:scale-105"
                  style={{ width: `${(theme.logoWidth || 128) * 0.8}px`, height: `${(theme.logoHeight || 40) * 0.8}px` }}
                >
                  <Image
                    src={theme.logoUrl}
                    alt="Store Logo"
                    fill
                    className="object-contain object-left"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                   <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
                      <ShoppingBag className="h-5 w-5" />
                   </div>
                   <span className="text-xl font-black text-gray-900 tracking-tighter uppercase">
                      SHOP<span className="text-primary">.</span>
                   </span>
                </div>
              )}
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Experience the best in curated fashion and lifestyle products. Quality and style delivered to your doorstep.
            </p>
            <div className="flex gap-4">
              {theme?.facebookUrl && (
                <Link href={theme.facebookUrl} target="_blank" className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/10 transition-all">
                  <Facebook className="h-5 w-5" />
                </Link>
              )}
              {theme?.instagramUrl && (
                <Link href={theme.instagramUrl} target="_blank" className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/10 transition-all">
                  <Instagram className="h-5 w-5" />
                </Link>
              )}
              {theme?.twitterUrl && (
                <Link href={theme.twitterUrl} target="_blank" className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/10 transition-all">
                  <Twitter className="h-5 w-5" />
                </Link>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6">Shopping</h3>
            <ul className="space-y-4">
              <li><Link href="/collections/new-arrivals" className="text-gray-500 hover:text-primary text-sm transition-colors">New Arrivals</Link></li>
              <li><Link href="/collections/best-sellers" className="text-gray-500 hover:text-primary text-sm transition-colors">Best Sellers</Link></li>
              <li><Link href="/collections/on-sale" className="text-gray-500 hover:text-primary text-sm transition-colors">On Sale</Link></li>
              <li><Link href="/search" className="text-gray-500 hover:text-primary text-sm transition-colors">Collections</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6">Customer Care</h3>
            <ul className="space-y-4">
              <li><Link href="/contact" className="text-gray-500 hover:text-primary text-sm transition-colors">Contact Us</Link></li>
              <li><Link href="/p/shipping-policy" className="text-gray-500 hover:text-primary text-sm transition-colors">Shipping Policy</Link></li>
              <li><Link href="/p/returns-and-exchanges" className="text-gray-500 hover:text-primary text-sm transition-colors">Returns & Exchanges</Link></li>
              <li><Link href="/p/faq" className="text-gray-500 hover:text-primary text-sm transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6">Get in Touch</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <span className="text-gray-500 text-sm">
                  {theme?.address || "123 Commerce Way, Digital City, 90210"}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <span className="text-gray-500 text-sm">
                  {theme?.contactPhone || "+1 (234) 567-890"}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <span className="text-gray-500 text-sm">
                  {theme?.contactEmail || "support@shop.com"}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-400 text-xs font-medium">
            © {currentYear} SHOP Ecommerce. All rights reserved.
          </p>
          <div className="flex items-center gap-6 opacity-50 grayscale hover:grayscale-0 transition-all">
             <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Secure Payment</span>
             </div>
             <div className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Global Shipping</span>
             </div>
             <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Buyer Protection</span>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
