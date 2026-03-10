import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Product } from "@prisma/client";
import { toast } from "sonner";

interface WishlistStore {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product: Product) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.id === product.id);

        if (existingItem) {
          toast.info(`${product.name} is already in your wishlist!`);
          return;
        }

        set({ items: [...get().items, product] });
        toast.success(`${product.name} added to wishlist!`);
      },
      removeItem: (id: string) => {
        const product = get().items.find(item => item.id === id);
        set({ items: get().items.filter((item) => item.id !== id) });
        if (product) {
          toast.success(`${product.name} removed from wishlist.`);
        }
      },
      isInWishlist: (id: string) => {
        return get().items.some((item) => item.id === id);
      },
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "wishlist-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
