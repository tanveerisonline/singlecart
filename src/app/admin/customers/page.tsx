import { db } from "@/lib/db";
import CustomerClient from "@/components/admin/CustomerClient";

export default async function AdminCustomersPage() {
  const customers = await db.user.findMany({
    where: {
      role: "USER",
    },
    include: {
      orders: {
        where: {
          status: { notIn: ["CANCELLED", "REFUNDED"] }
        },
        select: {
          totalAmount: true
        }
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <CustomerClient initialCustomers={customers} />
    </div>
  );
}
