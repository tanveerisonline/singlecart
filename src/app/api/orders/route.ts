import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { sendOrderConfirmation } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 0. Stock Reservation Cleanup (Release expired holds)
    const expiredOrders = await db.order.findMany({
      where: {
        status: "PENDING",
        paymentStatus: "PENDING",
        createdAt: {
          lt: new Date(Date.now() - 15 * 60 * 1000) // 15 mins ago
        }
      },
      include: { items: true }
    });

    if (expiredOrders.length > 0) {
      for (const oldOrder of expiredOrders) {
        // Return stock
        for (const item of oldOrder.items) {
          await db.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } }
          }).catch(() => {});
        }
        // Mark as cancelled/expired
        await db.order.update({
          where: { id: oldOrder.id },
          data: { status: "CANCELLED" }
        }).catch(() => {});
      }
    }

    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user) return new NextResponse("User not found", { status: 404 });

    const body = await req.json();
    const { items, address, couponId, giftCardCode } = body;

    if (!items || items.length === 0) {
      return new NextResponse("Your cart is empty", { status: 400 });
    }

    // 1. Verify all products and calculate subtotal
    const productIds = items.map((item: any) => item.productId);
    const existingProducts = await db.product.findMany({
      where: {
        id: { in: productIds }
      }
    });

    if (existingProducts.length !== productIds.length) {
      return new NextResponse(`One or more products are no longer available.`, { status: 400 });
    }

    let subtotal = 0;
    const orderItemsCreate = items.map((item: any) => {
      const product = existingProducts.find(p => p.id === item.productId);
      const price = product?.salePrice && product.salePrice > 0 ? product.salePrice : (product?.price || 0);
      subtotal += price * item.quantity;
      return {
        productId: item.productId,
        quantity: parseInt(item.quantity),
        price: parseFloat(price.toString())
      };
    });

    // 2. Calculate Discount
    let discount = 0;
    if (couponId) {
      const coupon = await db.coupon.findUnique({ where: { id: couponId } });
      if (coupon && coupon.isActive && subtotal >= coupon.minPurchase) {
        if (coupon.discountType === "PERCENTAGE") {
          discount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
        } else {
          discount = Math.min(coupon.discountValue, subtotal);
        }
      }
    }

    // 2.5 Calculate Gift Card Deduction
    let giftCardDeduction = 0;
    let giftCardId = null;
    if (giftCardCode) {
      const giftCard = await db.giftCard.findUnique({ where: { code: giftCardCode.toUpperCase() } });
      if (giftCard && giftCard.isActive && giftCard.balance > 0) {
        const isExpired = giftCard.expiryDate && new Date(giftCard.expiryDate) < new Date();
        if (!isExpired) {
          const remainingAfterCoupon = subtotal - discount;
          giftCardDeduction = Math.min(giftCard.balance, remainingAfterCoupon);
          giftCardId = giftCard.id;
        }
      }
    }

    // 3. Advanced Shipping Logic
    const isUS = address.country?.toLowerCase() === 'us' || address.country?.toLowerCase() === 'united states';
    let calculatedShipping = subtotal > 100 ? 0 : (isUS ? 5 : 15);

    // 4. Tax Logic (e.g., 10% for CA or NY)
    const state = address.state?.toUpperCase();
    let tax = 0;
    if (state === 'CA' || state === 'NY') {
      tax = (subtotal - discount - giftCardDeduction) * 0.10;
    }

    const totalAmount = Math.max(0, subtotal - discount - giftCardDeduction + calculatedShipping + tax);

    // 5. Find or create address record
    let shippingAddress = await db.address.findFirst({
      where: {
        userId: session.user.id,
        fullName: address.fullName,
        phone: address.phone,
        street: address.street,
        city: address.city,
        postalCode: address.postalCode,
        country: address.country
      }
    });

    if (!shippingAddress) {
      shippingAddress = await db.address.create({
        data: {
          fullName: address.fullName,
          phone: address.phone,
          street: address.street,
          city: address.city,
          state: address.state || "",
          postalCode: address.postalCode,
          country: address.country,
          label: address.label || "Home",
          userId: session.user.id,
        }
      });
    }

    const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const order = await db.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        shippingCost: parseFloat(calculatedShipping.toFixed(2)),
        shippingAddressId: shippingAddress.id,
        couponId: couponId || null,
        status: "PENDING",
        paymentStatus: giftCardDeduction >= (subtotal - discount + calculatedShipping + tax) ? "PAID" : "PENDING",
        items: {
          create: orderItemsCreate
        }
      }
    });

    if (couponId) {
      await db.coupon.update({
        where: { id: couponId },
        data: { usageCount: { increment: 1 } }
      }).catch(err => console.error("Coupon update fail", err));
    }

    if (giftCardId) {
      await db.giftCard.update({
        where: { id: giftCardId },
        data: { balance: { decrement: giftCardDeduction } }
      }).catch(err => console.error("Gift card update fail", err));
    }

    for (const item of items) {
      await db.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: parseInt(item.quantity) } }
      }).catch(err => console.error("Stock update fail", err));
    }

    // Send confirmation email (don't block if it fails)
    try {
      await sendOrderConfirmation(user.email, orderNumber, totalAmount);
    } catch (emailError) {
      console.error("Failed to send order confirmation email:", emailError);
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("[ORDERS_POST_ERROR]", error);
    return new NextResponse(`Server error: ${error.message}`, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const orders = await db.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              include: { images: { take: 1 } }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(orders);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
