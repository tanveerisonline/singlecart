"use client";

import { useCart } from "@/hooks/use-cart";
import { Product, ProductVariant } from "@prisma/client";
import { ShoppingCart } from "lucide-react";

interface AddToCartButtonProps {
  product: Product;
  variant?: ProductVariant;
  disabled?: boolean;
}

export default function AddToCartButton({ product, variant, disabled }: AddToCartButtonProps) {
  const cart = useCart();

  return (
    <button
      onClick={() => cart.addItem(product, variant)}
      disabled={disabled}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-transparent bg-indigo-600 px-8 py-4 text-base font-bold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all active:scale-[0.98] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-lg shadow-indigo-100"
    >
      <ShoppingCart className="h-5 w-5" />
      Add to cart
    </button>
  );
}
