const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting Comprehensive Data Reset & Seeding...");

  // 1. DELETE ALL DATA (except Admin Users)
  // Order matters for relational databases (leaf nodes first)
  console.log("🧹 Flushing existing data...");
  await prisma.activityLog.deleteMany({});
  await prisma.reviewImage.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.returnRequest.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.giftCard.deleteMany({});
  await prisma.newsletterSubscriber.deleteMany({});
  await prisma.stockLog.deleteMany({});
  await prisma.fAQ.deleteMany({});
  await prisma.bundle.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.brand.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.page.deleteMany({});
  await prisma.sliderImage.deleteMany({});
  await prisma.banner.deleteMany({});
  await prisma.dynamicSection.deleteMany({});
  await prisma.attributeValue.deleteMany({});
  await prisma.attribute.deleteMany({});

  // Preserve Admin users, delete all regular users
  await prisma.user.deleteMany({
    where: {
      NOT: {
        role: { in: ["ADMIN", "SUPER_ADMIN"] }
      }
    }
  });

  console.log("✅ Flush complete. Only Admin credentials preserved.");

  // 2. SEED CORE SETTINGS
  console.log("⚙️  Seeding store settings...");
  await prisma.storeSetting.upsert({
    where: { id: "default" },
    update: {
      storeName: "SingleCart Premium",
      storeEmail: "contact@singlecart.com",
      shippingFee: 15.00,
      freeShippingThreshold: 150.00,
    },
    create: {
      id: "default",
      storeName: "SingleCart Premium",
      storeEmail: "contact@singlecart.com",
      currency: "USD",
      shippingFee: 15.00,
      freeShippingThreshold: 150.00,
    },
  });

  // 3. SEED CATEGORIES
  console.log("📂 Seeding categories...");
  const catData = [
    { name: "Luxe Living", slug: "luxe-living", description: "Premium home and furniture", imageUrl: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=1000&auto=format&fit=crop" },
    { name: "Smart Tech", slug: "smart-tech", description: "The future of gadgets", imageUrl: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=1000&auto=format&fit=crop" },
    { name: "Urban Apparel", slug: "urban-apparel", description: "Streetwear & high fashion", imageUrl: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1000&auto=format&fit=crop" },
    { name: "Timepieces", slug: "timepieces", description: "Elegance on your wrist", imageUrl: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1000&auto=format&fit=crop" },
  ];

  const categories = {};
  for (const item of catData) {
    categories[item.slug] = await prisma.category.create({ data: item });
  }

  // 4. SEED BRANDS & TAGS
  console.log("🏷️  Seeding brands and tags...");
  const brands = await Promise.all([
    prisma.brand.create({ data: { name: "Omni", slug: "omni", logoUrl: "https://logo.clearbit.com/stripe.com" } }),
    prisma.brand.create({ data: { name: "Vanguard", slug: "vanguard", logoUrl: "https://logo.clearbit.com/apple.com" } }),
  ]);

  const tags = await Promise.all([
    prisma.tag.create({ data: { name: "New", slug: "new" } }),
    prisma.tag.create({ data: { name: "Limited Edition", slug: "limited" } }),
    prisma.tag.create({ data: { name: "Trending", slug: "trending" } }),
  ]);

  // 5. SEED COMPREHENSIVE PRODUCTS
  console.log("📦 Seeding catalog...");
  const productsData = [
    {
      name: "Vanguard Obsidian Watch",
      slug: "vanguard-obsidian",
      sku: "WAT-VANG-01",
      price: 499.00,
      compareAtPrice: 650.00,
      stock: 25,
      categoryId: categories["timepieces"].id,
      brandId: brands[1].id,
      isFeatured: true,
      isTrending: true,
      description: "A sleek, all-black timepiece crafted from surgical-grade stainless steel. Water-resistant up to 100m.",
      images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000"]
    },
    {
      name: "Omni Ergonomic Desk",
      slug: "omni-desk-pro",
      sku: "FURN-OMNI-02",
      price: 899.00,
      stock: 15,
      categoryId: categories["luxe-living"].id,
      brandId: brands[0].id,
      isFeatured: true,
      isFreeShipping: true,
      description: "Height-adjustable standing desk with memory presets and built-in wireless charging.",
      images: ["https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=1000"]
    },
    {
      name: "Cyber-Link Headphones",
      slug: "cyber-link-h1",
      sku: "TECH-CYBER-03",
      price: 249.00,
      compareAtPrice: 299.00,
      stock: 100,
      categoryId: categories["smart-tech"].id,
      isTrending: true,
      description: "Over-ear noise cancelling headphones with spatial audio and 50-hour battery life.",
      images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000"]
    },
    {
      name: "Nomad Wool Overcoat",
      slug: "nomad-overcoat",
      sku: "CLO-NOMAD-04",
      price: 180.00,
      stock: 40,
      categoryId: categories["urban-apparel"].id,
      description: "100% Merino wool overcoat designed for the modern metropolitan traveler.",
      images: ["https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=1000"]
    }
  ];

  const products = [];
  for (const p of productsData) {
    const created = await prisma.product.create({
      data: {
        ...p,
        isActive: true,
        thumbnailUrl: p.images[0],
        images: {
          create: p.images.map((url, i) => ({ url, order: i }))
        },
        tags: { connect: [{ id: tags[0].id }, { id: tags[2].id }] }
      }
    });
    products.push(created);
  }

  // 6. SEED BUNDLES
  console.log("🎁 Seeding product bundles...");
  await prisma.bundle.create({
    data: {
      name: "Executive Tech Suite",
      description: "The complete setup for the modern professional.",
      price: 1499.00,
      isActive: true,
      image: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?q=80&w=1000",
      products: {
        connect: [{ id: products[0].id }, { id: products[1].id }, { id: products[2].id }]
      }
    }
  });

  // 7. SEED FAQS
  console.log("❓ Seeding FAQs...");
  await prisma.fAQ.createMany({
    data: [
      { question: "How long is shipping?", answer: "Domestic shipping takes 3-5 business days.", category: "Shipping" },
      { question: "Do you offer warranty?", answer: "Yes, all products come with a 1-year limited warranty.", category: "Support" },
    ]
  });

  // 8. SEED TEST REVIEWS
  console.log("⭐ Seeding reviews...");
  const reviewer = await prisma.user.create({
    data: {
      email: "reviewer@example.com",
      name: "Mark Johnson",
      password: await bcrypt.hash("password123", 10)
    }
  });

  await prisma.review.create({
    data: {
      rating: 5,
      title: "Best purchase ever!",
      comment: "Incredible quality and super fast delivery. Highly recommended.",
      isApproved: true,
      userId: reviewer.id,
      productId: products[0].id
    }
  });

  // 9. SEED COUPONS
  console.log("🎫 Seeding coupons...");
  await prisma.coupon.create({
    data: {
      code: "LAUNCH2026",
      discountType: "PERCENTAGE",
      discountValue: 15,
      minPurchase: 50,
      startDate: new Date(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      isActive: true,
    }
  });

  console.log("\n✨ SEEDING COMPLETE! ✨");
  console.log("Database is now populated with premium, comprehensive data.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
