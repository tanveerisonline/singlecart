const fs = require('fs');
const path = require('path');

const files = [
  'src/app/admin/products/new/page.tsx',
  'src/app/admin/products/[productId]/page.tsx',
  'src/app/admin/categories/page.tsx',
  'src/app/admin/tags/page.tsx',
  'src/app/admin/orders/page.tsx',
  'src/app/admin/inventory/page.tsx',
  'src/app/admin/customers/page.tsx',
  'src/app/admin/coupons/page.tsx',
  'src/app/admin/coupons/new/page.tsx',
  'src/app/admin/brands/page.tsx',
  'src/app/admin/attributes/page.tsx',
  'src/app/admin/slider/page.tsx',
  'src/components/admin/ProductClient.tsx',
  'src/components/admin/CouponClient.tsx',
  'src/components/admin/ConfirmModal.tsx',
  'src/components/admin/MediaModal.tsx',
  'src/app/contact/page.tsx',
  'src/app/checkout/page.tsx',
  'src/app/cart/page.tsx'
];

const replacements = [
  // Specific complex ones first
  { pattern: /bg-indigo-600\/20/g, replacement: 'bg-primary/20' },
  { pattern: /bg-indigo-50\/30/g, replacement: 'bg-primary/5' },
  { pattern: /bg-indigo-50\/50/g, replacement: 'bg-primary/10' },
  { pattern: /focus:ring-indigo-500\/20/g, replacement: 'focus:ring-primary/20' },
  { pattern: /focus:ring-indigo-500\/10/g, replacement: 'focus:ring-primary/10' },
  { pattern: /border-indigo-100\/50/g, replacement: 'border-primary/10' },
  { pattern: /shadow-indigo-100/g, replacement: 'shadow-primary/20' },
  { pattern: /shadow-indigo-50/g, replacement: 'shadow-primary/10' },

  // Base colors
  { pattern: /bg-indigo-(600|700|800|900|500)/g, replacement: 'bg-primary' },
  { pattern: /text-indigo-(600|700|800|500)/g, replacement: 'text-primary' },
  { pattern: /border-indigo-(600|500|700)/g, replacement: 'border-primary' },
  { pattern: /hover:bg-indigo-(700|600)/g, replacement: 'hover:bg-primary' },
  { pattern: /hover:text-indigo-(600|700|500)/g, replacement: 'hover:text-primary' },
  { pattern: /focus:ring-indigo-(500|600)/g, replacement: 'focus:ring-primary' },
  { pattern: /focus:border-indigo-(500|600)/g, replacement: 'focus:border-primary' },
  { pattern: /bg-indigo-(50|100)/g, replacement: 'bg-primary/10' },
  { pattern: /border-indigo-(100|200|300|50)/g, replacement: 'border-primary/20' },
  { pattern: /text-indigo-400/g, replacement: 'text-primary/70' },
  { pattern: /text-indigo-300/g, replacement: 'text-primary/60' },
  { pattern: /text-indigo-200/g, replacement: 'text-primary/40' },
  { pattern: /text-indigo-100/g, replacement: 'text-primary/20' },
  { pattern: /prose-indigo/g, replacement: 'prose-primary' },
  { pattern: /ring-indigo-600/g, replacement: 'ring-primary' },
  { pattern: /decoration-indigo-200/g, replacement: 'decoration-primary/30' },
  { pattern: /disabled:bg-indigo-300/g, replacement: 'disabled:bg-primary/30' },
  { pattern: /group-focus-within:text-indigo-500/g, replacement: 'group-focus-within:text-primary' },
  { pattern: /group-hover:text-indigo-600/g, replacement: 'group-hover:text-primary' },
  { pattern: /group-hover:bg-indigo-50/g, replacement: 'group-hover:bg-primary/10' },
  { pattern: /hover:border-indigo-300/g, replacement: 'hover:border-primary/30' },
  { pattern: /hover:bg-indigo-50/g, replacement: 'hover:bg-primary/10' },
];

files.forEach(file => {
  const filePath = path.resolve(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    replacements.forEach(({ pattern, replacement }) => {
      content = content.replace(pattern, replacement);
    });

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${file}`);
    } else {
      console.log(`No changes needed: ${file}`);
    }
  } else {
    console.warn(`File not found: ${file}`);
  }
});
