const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting Absolute Comprehensive Data Reset & Seeding...");

  // 1. DELETE ALL DATA (except Admin Users)
  console.log("🧹 Flushing existing data...");
  const deleteModels = [
    "activityLog", "reviewImage", "review", "returnRequest", "payment", 
    "orderItem", "order", "cartItem", "wishlistItem", "address", 
    "giftCard", "newsletterSubscriber", "stockLog", "fAQ", "bundle", 
    "productVariant", "productImage", "product", "tag", "brand", 
    "category", "coupon", "page", "sliderImage", "banner", 
    "dynamicSection", "attributeValue", "attribute"
  ];

  for (const model of deleteModels) {
    await prisma[model].deleteMany({});
  }

  await prisma.user.deleteMany({
    where: { NOT: { role: { in: ["ADMIN", "SUPER_ADMIN"] } } }
  });

  console.log("✅ Flush complete.");

  // 2. SEED SETTINGS & THEME
  console.log("⚙️  Seeding configurations...");
  await prisma.storeSetting.upsert({
    where: { id: "default" },
    update: { storeName: "SingleCart Premium", currency: "USD" },
    create: { id: "default", storeName: "SingleCart Premium", storeEmail: "admin@singlecart.com", currency: "USD" },
  });

  await prisma.themeSetting.upsert({
    where: { id: "default" },
    update: { primaryColor: "#0f172a" },
    create: { id: "default", primaryColor: "#0f172a" },
  });

  // 3. SEED ATTRIBUTES (Size, Color)
  console.log("📏 Seeding attributes...");
  const sizeAttr = await prisma.attribute.create({
    data: {
      name: "Size",
      values: {
        create: [{ value: "Small" }, { value: "Medium" }, { value: "Large" }]
      }
    }
  });

  const colorAttr = await prisma.attribute.create({
    data: {
      name: "Color",
      values: {
        create: [{ value: "Midnight Black" }, { value: "Arctic White" }, { value: "Ocean Blue" }]
      }
    }
  });

  // 4. SEED CATEGORIES, BRANDS, TAGS
  console.log("📂 Seeding taxonomy...");
  const luxeLiving = await prisma.category.create({
    data: { name: "Luxe Living", slug: "luxe-living", imageUrl: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800" }
  });
  const tech = await prisma.category.create({
    data: { name: "Future Tech", slug: "future-tech", imageUrl: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800" }
  });

  const brandAura = await prisma.brand.create({ data: { name: "Aura", slug: "aura" } });
  const tagNew = await prisma.tag.create({ data: { name: "New", slug: "new" } });

  // 5. SEED SLIDER IMAGES
  console.log("🖼️  Seeding slider...");
  await prisma.sliderImage.createMany({
    data: [
      {
        title: "Modern Aesthetics 2026",
        imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600",
        link: "/search",
        order: 1,
        isActive: true
      },
      {
        title: "Smart Living, Better Life",
        imageUrl: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1600",
        link: "/collections/future-tech",
        order: 2,
        isActive: true
      }
    ]
  });

  // 6. SEED PRODUCTS with VARIANTS
  console.log("📦 Seeding products with variants...");
  const watch = await prisma.product.create({
    data: {
      name: "Vanguard Obsidian Watch",
      slug: "vanguard-obsidian",
      sku: "WAT-VANG-01",
      price: 499.00,
      stock: 50,
      categoryId: luxeLiving.id,
      brandId: brandAura.id,
      isFeatured: true,
      isActive: true,
      thumbnailUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
      description: "Premium surgical-grade steel timepiece.",
      images: { create: [{ url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800", order: 0 }] },
      tags: { connect: [{ id: tagNew.id }] },
      variants: {
        create: [
          { name: "Black / Large", sku: "WAT-BLK-LG", price: 499.00, stock: 25 },
          { name: "Black / Medium", sku: "WAT-BLK-MD", price: 499.00, stock: 25 }
        ]
      }
    }
  });

  // 7. SEED BANNERS & DYNAMIC SECTIONS
  console.log("⚡ Seeding layout components...");
  const promoSection = await prisma.dynamicSection.create({
    data: {
      name: "Promotional Banner Section",
      type: "BANNER",
      layout: "FULL_WIDTH",
      order: 0,
      isActive: true
    }
  });

  const promoBanner = await prisma.banner.create({
    data: {
      title: "Limited Flash Sale",
      subtitle: "Get up to 50% off on all luxe furniture.",
      imageUrl: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=1200",
      link: "/collections/luxe-living",
      buttonText: "Shop Sale",
      isActive: true,
      sectionId: promoSection.id
    }
  });

  await prisma.dynamicSection.create({
    data: {
      name: "Featured Deals Section",
      type: "PRODUCT_CAROUSEL",
      layout: "FULL_WIDTH",
      order: 1,
      isActive: true
    }
  });

  // 8. SEED PAGES (About, Privacy)
  console.log("📄 Seeding pages...");
  await prisma.page.createMany({
    data: [
      { title: "Our Story", slug: "about-us", content: "Built for those who appreciate fine detail.", isActive: true },
      { title: "Privacy Policy", slug: "privacy", content: "Your data is safe with us.", isActive: true }
    ]
  });

  // 9. SEED GIFT CARDS & NEWSLETTER
  console.log("🎁 Seeding marketing data...");
  await prisma.giftCard.create({
    data: {
      code: "WELCOME-100",
      initialAmount: 100.00,
      balance: 100.00,
      isActive: true
    }
  });

  await prisma.newsletterSubscriber.create({
    data: { email: "newsletter-demo@singlecart.com" }
  });

  console.log("\n✨ ABSOLUTE SEEDING COMPLETE! ✨");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
