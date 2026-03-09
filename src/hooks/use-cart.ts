import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Product, ProductVariant } from "@prisma/client";
import { toast } from "sonner";

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, variant?: ProductVariant) => void;
  removeItem: (id: string, variantId?: string) => void;
  updateQuantity: (id: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
}

interface CartItem extends Product {
  quantity: number;
  selectedVariant?: ProductVariant;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product: Product, variant?: ProductVariant) => {
        const currentItems = get().items;
        
        // Find if item with same variant already exists
        const existingItem = currentItems.find((item) => 
          item.id === product.id && 
          ((!item.selectedVariant && !variant) || (item.selectedVariant?.id === variant?.id))
        );

        if (existingItem) {
          set({
            items: currentItems.map((item) =>
              item.id === product.id && 
              ((!item.selectedVariant && !variant) || (item.selectedVariant?.id === variant?.id))
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          // If product doesn't have a variant price, use product price
          const price = variant?.price || product.price;
          set({ items: [...get().items, { ...product, price: Number(price), quantity: 1, selectedVariant: variant }] });
        }
        
        const label = variant ? `${product.name} (${variant.name})` : product.name;
        toast.success(`${label} added to cart!`);
      },
      removeItem: (id: string, variantId?: string) => {
        set({ 
          items: get().items.filter((item) => 
            !(item.id === id && item.selectedVariant?.id === variantId)
          ) 
        });
      },
      updateQuantity: (id: string, quantity: number, variantId?: string) => {
        set({
          items: get().items.map((item) =>
            item.id === id && item.selectedVariant?.id === variantId 
              ? { ...item, quantity } 
              : item
          ),
        });
      },
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
