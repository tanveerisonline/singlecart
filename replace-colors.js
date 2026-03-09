const fs = require('fs');
const path = require('path');

const patterns = [
  // Specific complex ones with slashes first!
  { pattern: /bg-indigo-600\/20/g, replacement: 'bg-primary/20' },
  { pattern: /bg-indigo-50\/30/g, replacement: 'bg-primary/5' },
  { pattern: /bg-indigo-50\/50/g, replacement: 'bg-primary/10' },
  { pattern: /bg-indigo-50\/20/g, replacement: 'bg-primary/5' },
  { pattern: /focus:ring-indigo-500\/20/g, replacement: 'focus:ring-primary/20' },
  { pattern: /focus:ring-indigo-500\/10/g, replacement: 'focus:ring-primary/10' },
  { pattern: /border-indigo-100\/50/g, replacement: 'border-primary/10' },
  { pattern: /shadow-indigo-100/g, replacement: 'shadow-primary/20' },
  { pattern: /shadow-indigo-50/g, replacement: 'shadow-primary/10' },

  // Hover colors
  { pattern: /hover:bg-indigo-(700|600|500)/g, replacement: 'hover:opacity-90' }, 
  { pattern: /hover:text-indigo-(600|700|500)/g, replacement: 'hover:text-primary' },
  { pattern: /hover:border-indigo-300/g, replacement: 'hover:border-primary/30' },
  { pattern: /hover:bg-indigo-50/g, replacement: 'hover:bg-primary/10' },

  // Outline and Ring
  { pattern: /focus-visible:outline-indigo-600/g, replacement: 'focus-visible:outline-primary' },
  { pattern: /ring-indigo-(500|600|50)/g, replacement: 'ring-primary/20' },
  { pattern: /focus:ring-indigo-(500|600)/g, replacement: 'focus:ring-primary' },
  { pattern: /focus:border-indigo-(500|600)/g, replacement: 'focus:border-primary' },

  // Base colors - use word boundaries or negative lookahead to avoid double slashes
  { pattern: /bg-indigo-(600|700|800|900|500)(?!\/)/g, replacement: 'bg-primary' },
  { pattern: /text-indigo-(600|700|800|500|400|900)(?!\/)/g, replacement: 'text-primary' },
  { pattern: /border-indigo-(600|500|700|100|200|300|50)(?!\/)/g, replacement: 'border-primary/20' }, 
  { pattern: /bg-indigo-(50|100)(?!\/)/g, replacement: 'bg-primary/10' },
  
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
  
  // Cleanup
  { pattern: /hover:bg-primary/g, replacement: 'hover:opacity-90' },
  { pattern: /bg-primary\/10\/20/g, replacement: 'bg-primary/5' },
  { pattern: /bg-primary\/10\/30/g, replacement: 'bg-primary/5' },
  { pattern: /bg-primary\/10\/50/g, replacement: 'bg-primary/10' },
];

const discardPattern = /className="([^"]*?border-gray-200[^"]*?text-gray-600[^"]*?hover:bg-gray-50[^"]*?)"/g;

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('src', (file) => {
  if (file.endsWith('.ts') || file.endsWith('.tsx')) {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    patterns.forEach(({ pattern, replacement }) => {
      content = content.replace(pattern, replacement);
    });

    content = content.replace(discardPattern, (match, p1) => {
      if (!p1.includes('hover:text-primary')) {
        return `className="${p1} hover:text-primary hover:border-primary/50 transition-all"`;
      }
      return match;
    });

    if (content !== originalContent) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Updated: ${file}`);
    }
  }
});
