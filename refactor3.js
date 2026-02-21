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
  
  content = content.replace(/const getStyles = \(colors: any\) => StyleSheet\.create\(\{/g, 'function getStyles(colors: any) {\n  return StyleSheet.create({');
  content = content.replace(/const getDataStyles = \(colors: any\) => StyleSheet\.create\(\{/g, 'function getDataStyles(colors: any) {\n  return StyleSheet.create({');
  content = content.replace(/const getSummaryStyles = \(colors: any\) => StyleSheet\.create\(\{/g, 'function getSummaryStyles(colors: any) {\n  return StyleSheet.create({');
  content = content.replace(/const getFilaStyles = \(colors: any\) => StyleSheet\.create\(\{/g, 'function getFilaStyles(colors: any) {\n  return StyleSheet.create({');
  
  // We need to add a closing brace for the function
  // This is tricky because we don't know where the StyleSheet.create ends.
  // But wait, `StyleSheet.create({ ... });` ends with `});`
  // We can replace `});` with `});\n}` but only for the ones we changed.
  // Actually, it's easier to just use regex to find `});` at the end of the file or block.
  // Let's just do it manually or with a smarter regex.
});
