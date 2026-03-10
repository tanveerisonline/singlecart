import { db } from "@/lib/db";
import CouponForm from "@/components/admin/CouponForm";
import { notFound } from "next/navigation";

export default async function EditCouponPage({
  params
}: {
  params: Promise<{ couponId: string }>
}) {
  const { couponId } = await params;
  const coupon = await db.coupon.findUnique({
    where: {
      id: couponId,
    },
  });

  if (!coupon) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <CouponForm initialData={coupon} />
    </div>
  );
}
