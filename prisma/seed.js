const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  // 1. Users & Staff
  const adminPassword = await bcrypt.hash("admin123", 10);
  const userPassword = await bcrypt.hash("user123", 10);

  await prisma.user.upsert({
    where: { email: "admin@shop.com" },
    update: {},
    create: {
      email: "admin@shop.com",
      name: "Super Admin",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "manager@shop.com" },
    update: {},
    create: {
      email: "manager@shop.com",
      name: "Store Manager",
      password: adminPassword,
      role: "STORE_MANAGER",
    },
  });

  await prisma.user.upsert({
    where: { email: "customer@gmail.com" },
    update: {},
    create: {
      email: "customer@gmail.com",
      name: "John Customer",
      password: userPassword,
      role: "USER",
    },
  });

  // 2. Categories
  const categories = [
    { name: "Electronics", slug: "electronics", description: "Gadgets and tech" },
    { name: "Clothing", slug: "clothing", description: "Fashion and apparel" },
    { name: "Home & Garden", slug: "home-garden", description: "Decor and tools" },
    { name: "Beauty", slug: "beauty", description: "Skincare and makeup" },
    { name: "Sports", slug: "sports", description: "Gear and fitness" },
  ];

  const createdCategories = {};
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    createdCategories[cat.slug] = created;
  }

  // 3. Slider Images
  const sliders = [
    {
      title: "Summer Collection 2026",
      imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop",
      link: "/category/clothing",
      order: 1,
      isActive: true,
    },
    {
      title: "Latest Tech Gadgets",
      imageUrl: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1600&auto=format&fit=crop",
      link: "/category/electronics",
      order: 2,
      isActive: true,
    },
    {
      title: "Transform Your Home",
      imageUrl: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?q=80&w=1600&auto=format&fit=crop",
      link: "/category/home-garden",
      order: 3,
      isActive: true,
    }
  ];

  for (const slider of sliders) {
    await prisma.sliderImage.create({ data: slider });
  }

  // 4. Products (20 products)
  const products = [
    // Electronics
    { name: "iPhone 15 Pro", price: 999.99, slug: "iphone-15-pro", sku: "IPHONE-15-PRO", category: "electronics", stock: 25 },
    { name: "MacBook Air M2", price: 1199.99, slug: "macbook-air-m2", sku: "MAC-AIR-M2", category: "electronics", stock: 15 },
    { name: "Sony WH-1000XM5", price: 349.99, slug: "sony-wh-1000xm5", sku: "SONY-WH5", category: "electronics", stock: 40 },
    { name: "Samsung S23 Ultra", price: 1199.99, slug: "samsung-s23-ultra", sku: "SAM-S23-U", category: "electronics", stock: 20 },
    { name: "Apple Watch Series 9", price: 399.99, slug: "apple-watch-9", sku: "AW-S9", category: "electronics", stock: 30 },
    
    // Clothing
    { name: "Premium Leather Jacket", price: 199.99, slug: "premium-leather-jacket", sku: "CLOTH-LJ", category: "clothing", stock: 10 },
    { name: "Cotton Slim Fit Shirt", price: 49.99, slug: "cotton-slim-fit-shirt", sku: "CLOTH-SFS", category: "clothing", stock: 50 },
    { name: "Denim Jeans", price: 79.99, slug: "denim-jeans", sku: "CLOTH-DJ", category: "clothing", stock: 45 },
    { name: "Woolen Sweater", price: 59.99, slug: "woolen-sweater", sku: "CLOTH-WS", category: "clothing", stock: 35 },
    { name: "Silk Scarf", price: 29.99, slug: "silk-scarf", sku: "CLOTH-SS", category: "clothing", stock: 100 },
    
    // Home Garden
    { name: "Modern Coffee Table", price: 149.99, slug: "modern-coffee-table", sku: "HOME-CT", category: "home-garden", stock: 12 },
    { name: "Outdoor Lounge Chair", price: 89.99, slug: "outdoor-lounge-chair", sku: "HOME-OLC", category: "home-garden", stock: 20 },
    { name: "Ceramic Vase Set", price: 34.99, slug: "ceramic-vase-set", sku: "HOME-CVS", category: "home-garden", stock: 50 },
    { name: "Smart LED Bulb", price: 19.99, slug: "smart-led-bulb", sku: "HOME-SLB", category: "home-garden", stock: 150 },
    
    // Beauty
    { name: "Luxury Face Cream", price: 89.99, slug: "luxury-face-cream", sku: "BEAUTY-FC", category: "beauty", stock: 60 },
    { name: "Organic Shampoo", price: 24.99, slug: "organic-shampoo", sku: "BEAUTY-OS", category: "beauty", stock: 80 },
    { name: "Matte Lipstick", price: 19.99, slug: "matte-lipstick", sku: "BEAUTY-ML", category: "beauty", stock: 120 },
    
    // Sports
    { name: "Yoga Mat High Grip", price: 44.99, slug: "yoga-mat-high-grip", sku: "SPORTS-YM", category: "sports", stock: 40 },
    { name: "Aluminum Water Bottle", price: 14.99, slug: "aluminum-water-bottle", sku: "SPORTS-WB", category: "sports", stock: 200 },
    { name: "Adjustable Dumbbells", price: 129.99, slug: "adjustable-dumbbells", sku: "SPORTS-DB", category: "sports", stock: 15 },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        price: p.price,
        stock: p.stock,
        description: `This is a high quality ${p.name} from our ${p.category} collection.`,
        categoryId: createdCategories[p.category].id,
        isActive: true,
        images: {
          create: [{ url: `https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop` }]
        }
      },
    });
  }

  // 5. Coupons
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minPurchase: 50,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isActive: true,
    },
  });

  // 6. Pages
  await prisma.page.upsert({
    where: { slug: "about-us" },
    update: {},
    create: {
      title: "About Us",
      slug: "about-us",
      content: "Welcome to our store. We provide the best products at the best prices.",
      isActive: true,
    },
  });

  // 7. Store Settings
  await prisma.storeSetting.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      storeName: "Modern Shop",
      storeEmail: "contact@modernshop.com",
      currency: "USD",
      shippingFee: 10.00,
      freeShippingThreshold: 150.00,
      homeLayout: "default",
    },
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
