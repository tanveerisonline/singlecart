const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting data flush...");

  // 1. Delete all data except Admin Users
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
  
  // Products and relations
  await prisma.productVariant.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.bundle.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.brand.deleteMany({});
  await prisma.category.deleteMany({});
  
  // Others
  await prisma.attributeValue.deleteMany({});
  await prisma.attribute.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.page.deleteMany({});
  await prisma.sliderImage.deleteMany({});
  await prisma.banner.deleteMany({});
  await prisma.dynamicSection.deleteMany({});
  await prisma.fAQ.deleteMany({});
  
  // Users (keep ADMIN and SUPER_ADMIN)
  await prisma.user.deleteMany({
    where: {
      NOT: {
        role: {
          in: ["ADMIN", "SUPER_ADMIN"]
        }
      }
    }
  });

  console.log("Data flushed. Keeping only Admin users.");

  // 2. Seed Settings
  console.log("Seeding settings...");
  await prisma.storeSetting.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      storeName: "SingleCart Premium",
      storeEmail: "support@singlecart.com",
      currency: "USD",
      shippingFee: 15.00,
      freeShippingThreshold: 200.00,
    },
  });

  await prisma.themeSetting.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      primaryColor: "#0f172a", // Dark mode aesthetic
    },
  });

  // 3. Seed Categories
  console.log("Seeding categories...");
  const categories = [
    { name: "Minimalist Furniture", slug: "furniture", description: "Modern and clean designs", imageUrl: "https://images.unsplash.com/photo-1505693314120-0d443867891c?q=80&w=1000&auto=format&fit=crop" },
    { name: "Tech Accessories", slug: "tech", description: "Premium gadgets", imageUrl: "https://images.unsplash.com/photo-1512054502232-10a0a035d672?q=80&w=1000&auto=format&fit=crop" },
    { name: "Apparel", slug: "apparel", description: "Everyday essentials", imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop" },
    { name: "Watches", slug: "watches", description: "Timeless pieces", imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop" },
  ];

  const catMap = {};
  for (const cat of categories) {
    catMap[cat.slug] = await prisma.category.create({ data: cat });
  }

  // 4. Seed Brands & Tags
  console.log("Seeding brands and tags...");
  const brands = await Promise.all([
    prisma.brand.create({ data: { name: "Aura", slug: "aura" } }),
    prisma.brand.create({ data: { name: "Zenith", slug: "zenith" } }),
  ]);

  const tags = await Promise.all([
    prisma.tag.create({ data: { name: "New Arrival", slug: "new-arrival" } }),
    prisma.tag.create({ data: { name: "Best Seller", slug: "best-seller" } }),
  ]);

  // 5. Seed Products
  console.log("Seeding products...");
  const products = [
    {
      name: "Aura Lounge Chair",
      slug: "aura-lounge-chair",
      sku: "FURN-001",
      description: "A comfortable and stylish minimalist lounge chair perfect for any modern living room.",
      shortDescription: "Premium velvet lounge chair.",
      price: 299.99,
      compareAtPrice: 399.99,
      discount: 25,
      stock: 45,
      categoryId: catMap["furniture"].id,
      brandId: brands[0].id,
      isFeatured: true,
      isTrending: true,
      isFreeShipping: true,
      images: [
        "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=1000&auto=format&fit=crop"
      ]
    },
    {
      name: "Zenith Wireless Earbuds",
      slug: "zenith-earbuds",
      sku: "TECH-001",
      description: "Noise-cancelling wireless earbuds with 40 hours of battery life and crystal-clear audio.",
      shortDescription: "High-fidelity wireless audio.",
      price: 149.99,
      stock: 120,
      categoryId: catMap["tech"].id,
      brandId: brands[1].id,
      isTrending: true,
      images: [
        "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1000&auto=format&fit=crop"
      ]
    },
    {
      name: "Classic Chronograph Watch",
      slug: "classic-watch",
      sku: "WATCH-001",
      description: "A timeless chronograph watch featuring a genuine leather strap and water-resistant casing.",
      shortDescription: "Elegant everyday timepiece.",
      price: 199.99,
      compareAtPrice: 249.99,
      discount: 20,
      stock: 30,
      categoryId: catMap["watches"].id,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop"
      ]
    },
    {
      name: "Minimalist Desk Lamp",
      slug: "desk-lamp",
      sku: "FURN-002",
      description: "Sleek and modern desk lamp with adjustable brightness and color temperature.",
      shortDescription: "Smart lighting for your workspace.",
      price: 89.99,
      stock: 65,
      categoryId: catMap["furniture"].id,
      images: [
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=1000&auto=format&fit=crop"
      ]
    },
    {
      name: "Organic Cotton T-Shirt",
      slug: "cotton-tshirt",
      sku: "APP-001",
      description: "100% organic cotton t-shirt. Breathable, durable, and ethically sourced.",
      shortDescription: "Everyday comfort.",
      price: 29.99,
      stock: 200,
      categoryId: catMap["apparel"].id,
      images: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop"
      ]
    }
  ];

  const createdProducts = [];
  for (const p of products) {
    const prod = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        description: p.description,
        shortDescription: p.shortDescription,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        discount: p.discount || 0,
        stock: p.stock,
        categoryId: p.categoryId,
        brandId: p.brandId,
        isFeatured: p.isFeatured || false,
        isTrending: p.isTrending || false,
        isFreeShipping: p.isFreeShipping || false,
        isActive: true,
        thumbnailUrl: p.images[0],
        images: {
          create: p.images.map((url, i) => ({ url, order: i }))
        },
        tags: {
          connect: tags.map(t => ({ id: t.id }))
        }
      }
    });
    createdProducts.push(prod);
  }

  // 6. Seed Bundles (using first two products)
  console.log("Seeding bundles...");
  await prisma.bundle.create({
    data: {
      name: "Work From Home Starter Kit",
      description: "Everything you need for a perfect home office.",
      price: 349.99,
      isActive: true,
      image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=1000&auto=format&fit=crop",
      products: {
        connect: [
          { id: createdProducts[3].id }, // Desk lamp
          { id: createdProducts[1].id }  // Earbuds
        ]
      }
    }
  });

  // 7. Seed Reviews
  console.log("Seeding reviews...");
  const dummyUser = await prisma.user.create({
    data: {
      email: "jane@example.com",
      name: "Jane Doe",
      password: await bcrypt.hash("password123", 10)
    }
  });

  await prisma.review.create({
    data: {
      rating: 5,
      title: "Absolutely love it!",
      comment: "The quality is amazing and it looks perfect in my living room.",
      isApproved: true,
      userId: dummyUser.id,
      productId: createdProducts[0].id // Lounge Chair
    }
  });

  // 8. Seed Slider Images
  console.log("Seeding slider...");
  await prisma.sliderImage.createMany({
    data: [
      {
        title: "Spring Collection 2026",
        imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop",
        link: "/search",
        order: 1,
        isActive: true,
      },
      {
        title: "Tech That Inspires",
        imageUrl: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1600&auto=format&fit=crop",
        link: `/collections/${categories[1].slug}`,
        order: 2,
        isActive: true,
      }
    ]
  });

  // 9. Seed FAQs
  console.log("Seeding FAQs...");
  await prisma.fAQ.createMany({
    data: [
      { question: "What is your return policy?", answer: "We offer a 30-day hassle-free return policy for all unused items.", category: "Returns", order: 1 },
      { question: "Do you ship internationally?", answer: "Yes, we ship to over 50 countries worldwide.", category: "Shipping", order: 2 },
      { question: "How can I track my order?", answer: "Once your order ships, you'll receive a tracking link via email.", category: "Shipping", order: 3 },
    ]
  });

  // 10. Seed Coupons
  console.log("Seeding coupons...");
  await prisma.coupon.create({
    data: {
      code: "WELCOME20",
      discountType: "PERCENTAGE",
      discountValue: 20,
      minPurchase: 100,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
    }
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