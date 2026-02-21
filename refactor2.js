const fs = require('fs');
const path = require('path');

const filesToRefactor = [
  'src/components/charts/DeudaPieChart.tsx',
  'src/components/charts/ProgresoChart.tsx',
  'src/components/charts/ProyeccionChart.tsx',
  'src/components/charts/TasasChart.tsx',
  'src/components/creditos/CreditoCard.tsx',
  'src/components/creditos/CreditoForm.tsx',
  'src/components/creditos/CreditoList.tsx',
  'src/components/documentos/DocumentoList.tsx',
  'src/components/pagos/PagoForm.tsx',
  'src/components/pagos/PagoTabla.tsx',
  'src/components/priorizacion/ComparacionTabla.tsx',
  'src/components/priorizacion/EstrategiaCard.tsx',
  'src/components/ui/Button.tsx',
  'src/components/ui/Card.tsx',
  'src/components/ui/CustomTabBar.tsx',
  'src/components/ui/Input.tsx',
  'src/components/ui/Modal.tsx',
  'src/components/ui\Select.tsx',
  'src/components/ui/Toast.tsx',
  'src/lib/utils.ts',
  'app/configuracion/index.tsx',
  'app/creditos/index.tsx',
  'app/creditos/[id]/editar.tsx',
  'app/creditos/[id]/index.tsx',
  'app/creditos/[id]/_documentos.tsx',
  'app/creditos/[id]/_layout.tsx',
  'app/creditos/[id]/_pagos.tsx',
  'app/creditos/_layout.tsx',
  'app/index.tsx',
  'app/pagos/index.tsx',
  'app/priorizacion/index.tsx',
  'app/proyecciones/index.tsx',
  'app/reportes/index.tsx',
  'app/_layout.tsx'
];

filesToRefactor.forEach(relPath => {
  const filePath = path.join(__dirname, relPath.replace(/\\/g, '/'));
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Replace import
  const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]@\/lib\/theme['"];/g;
  let match = importRegex.exec(content);
  if (match) {
    const imports = match[1].split(',').map(s => s.trim());
    if (imports.includes('colors')) {
      const newImports = imports.filter(i => i !== 'colors');
      let newImportStr = '';
      if (newImports.length > 0) {
        newImportStr = `import { ${newImports.join(', ')} } from '@/lib/theme';\n`;
      }
      newImportStr += `import { useTheme } from '@/lib/ThemeContext';`;
      content = content.replace(match[0], newImportStr);
    }
  }
  
  // 2. Replace StyleSheet.create
  let hasStyles = false;
  if (content.includes('const styles = StyleSheet.create({')) {
    content = content.replace('const styles = StyleSheet.create({', 'const getStyles = (colors: any) => StyleSheet.create({');
    hasStyles = true;
  }
  
  let hasDataStyles = false;
  if (content.includes('const dataStyles = StyleSheet.create({')) {
    content = content.replace('const dataStyles = StyleSheet.create({', 'const getDataStyles = (colors: any) => StyleSheet.create({');
    hasDataStyles = true;
  }

  // 3. Insert hooks into component
  // Find export default function or export function
  const compRegex = /export\s+(default\s+)?function\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)\s*\{/g;
  let compMatch = compRegex.exec(content);
  if (compMatch) {
    const insertPos = compMatch.index + compMatch[0].length;
    let hooks = `\n  const { colors } = useTheme();`;
    if (hasStyles) hooks += `\n  const styles = getStyles(colors);`;
    if (hasDataStyles) hooks += `\n  const dataStyles = getDataStyles(colors);`;
    content = content.slice(0, insertPos) + hooks + content.slice(insertPos);
  } else {
    // Try arrow function
    const arrowRegex = /const\s+([A-Za-z0-9_]+)\s*=\s*\(([^)]*)\)\s*=>\s*\{/g;
    let arrowMatch = arrowRegex.exec(content);
    if (arrowMatch) {
      const insertPos = arrowMatch.index + arrowMatch[0].length;
      let hooks = `\n  const { colors } = useTheme();`;
      if (hasStyles) hooks += `\n  const styles = getStyles(colors);`;
      if (hasDataStyles) hooks += `\n  const dataStyles = getDataStyles(colors);`;
      content = content.slice(0, insertPos) + hooks + content.slice(insertPos);
    }
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
});
