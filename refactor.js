const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

const srcDir = path.join(__dirname, 'src');
const appDir = path.join(__dirname, 'app');

function processFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if it imports colors from @/lib/theme
  if (!content.includes("import {") || !content.includes("@/lib/theme")) return;
  
  const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]@\/lib\/theme['"];/g;
  let match = importRegex.exec(content);
  if (!match) return;
  
  const imports = match[1].split(',').map(s => s.trim());
  if (!imports.includes('colors')) return;
  
  // Remove colors from import
  const newImports = imports.filter(i => i !== 'colors');
  let newImportStr = '';
  if (newImports.length > 0) {
    newImportStr = `import { ${newImports.join(', ')} } from '@/lib/theme';\n`;
  }
  
  // Add useTheme import
  newImportStr += `import { useTheme } from '@/lib/ThemeContext';`;
  
  content = content.replace(match[0], newImportStr);
  
  // Now we need to inject `const { colors } = useTheme();` into the component.
  // This is tricky because there might be multiple components or functions.
  // Let's just find the main exported component.
  // Or we can just replace `colors.` with `theme.colors.` and pass theme around? No.
  
  // Let's just log the files that need manual intervention or try a simple regex for the main component.
  console.log(filePath);
}

walk(srcDir, processFile);
walk(appDir, processFile);
