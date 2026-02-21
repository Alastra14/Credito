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
  'src/components/ui/Select.tsx',
  'src/components/ui/Toast.tsx',
  'app/configuracion/index.tsx',
  'app/creditos/index.tsx',
  'app/creditos/[id]/editar.tsx',
  'app/creditos/[id]/index.tsx',
  'app/creditos/[id]/_documentos.tsx',
  'app/creditos/[id]/_pagos.tsx',
  'app/index.tsx',
  'app/pagos/index.tsx',
  'app/priorizacion/index.tsx',
  'app/proyecciones/index.tsx',
  'app/reportes/index.tsx'
];

filesToRefactor.forEach(relPath => {
  const filePath = path.join(__dirname, relPath.replace(/\\/g, '/'));
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace `const getStyles = (colors: any) => StyleSheet.create({` with `function getStyles(colors: any) { return StyleSheet.create({`
  // And find the matching `});` and replace with `}); }`
  
  const regexes = [
    /const getStyles = \(colors: any\) => StyleSheet\.create\(\{([\s\S]*?)\}\);/g,
    /const getDataStyles = \(colors: any\) => StyleSheet\.create\(\{([\s\S]*?)\}\);/g,
    /const getSummaryStyles = \(colors: any\) => StyleSheet\.create\(\{([\s\S]*?)\}\);/g,
    /const getFilaStyles = \(colors: any\) => StyleSheet\.create\(\{([\s\S]*?)\}\);/g,
    /const getVariantStyles = \(colors: any\): Record<BadgeVariant, \{ bg: string; text: string \}> => \(\{([\s\S]*?)\}\);/g,
    /const getVariantConfig = \(colors: any\): Record<ButtonVariant, \{ bg: string; text: string; border\?: string \}> => \(\{([\s\S]*?)\}\);/g
  ];
  
  regexes.forEach((regex, index) => {
    content = content.replace(regex, (match, p1) => {
      if (index === 0) return `function getStyles(colors: any) {\n  return StyleSheet.create({${p1}});\n}`;
      if (index === 1) return `function getDataStyles(colors: any) {\n  return StyleSheet.create({${p1}});\n}`;
      if (index === 2) return `function getSummaryStyles(colors: any) {\n  return StyleSheet.create({${p1}});\n}`;
      if (index === 3) return `function getFilaStyles(colors: any) {\n  return StyleSheet.create({${p1}});\n}`;
      if (index === 4) return `function getVariantStyles(colors: any): Record<BadgeVariant, { bg: string; text: string }> {\n  return {${p1}};\n}`;
      if (index === 5) return `function getVariantConfig(colors: any): Record<ButtonVariant, { bg: string; text: string; border?: string }> {\n  return {${p1}};\n}`;
      return match;
    });
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
});
