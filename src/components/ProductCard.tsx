import Image from "next/image";
import Link from "next/link";
import { Product, ProductImage } from "@prisma/client";

interface ProductCardProps {
  product: Product & {
    images: ProductImage[];
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.slug}`} className="group">
      <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-h-8 xl:aspect-w-7">
        <Image
          src={product.images[0]?.url || "/placeholder-product.jpg"}
          alt={product.name}
          width={500}
          height={500}
          className="h-full w-full object-cover object-center group-hover:opacity-75"
        />
      </div>
      <h3 className="mt-4 text-sm text-gray-700">{product.name}</h3>
      <p className="mt-1 text-lg font-medium text-gray-900">
        ${product.price.toString()}
      </p>
    </Link>
  );
}
