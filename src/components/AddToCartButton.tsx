"use client";

import { useCart } from "@/hooks/use-cart";
import { Product } from "@prisma/client";

interface AddToCartButtonProps {
  product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const cart = useCart();

  return (
    <button
      onClick={() => cart.addItem(product)}
      className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      Add to cart
    </button>
  );
}
