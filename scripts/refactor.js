const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('import { theme } from')) return;

  // 1. Reemplazar imports
  // Ejemplo: import { theme } from '../../src/themes/colors';
  content = content.replace(/import\s+\{\s*theme\s*\}\s+from\s+['"]([^'"]+)['"];?/g, (match, p1) => {
    // Si la ruta original iba a src/themes/colors, ahora va a src/themes/ThemeContext
    const newPath = p1.replace('themes/colors', 'themes/ThemeContext');
    return `import { useTheme } from '${newPath}';`;
  });

  // 2. Reemplazar definición de estilos
  content = content.replace(/const\s+styles\s*=\s*StyleSheet\.create\(\{/g, 'const getStyles = (theme: any) => StyleSheet.create({');

  // 3. Inyectar hooks en las funciones React
  content = content.replace(/(export (?:default )?function \w+\([^)]*\)(?:\s*:\s*[^{]+)?\s*\{)(?![\s\S]*?(?:const \{ theme \} = useTheme\(\);))/g, `$1\n  const { theme } = useTheme();\n  const styles = React.useMemo(() => getStyles(theme), [theme]);`);

  // Asegurarse de que React esté importado o agregar import de React si vamos a usar useMemo
  // No importa, podemos llamar a getStyles directo sin useMemo o extraer de useTheme
  // Wait, no useMemo requires React.useMemo or importing useMemo. Let's just do getStyles(theme)
  content = content.replace(/React\.useMemo\(\(\) => getStyles\(theme\), \[theme\]\)/g, 'getStyles(theme)');

  fs.writeFileSync(filePath, content);
  console.log('Refactorizado', filePath);
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (full.endsWith('.tsx')) {
        processFile(full);
    }
  });
}

const rootDir = path.resolve(__dirname, '..');
walk(path.join(rootDir, 'app'));
walk(path.join(rootDir, 'src', 'components'));
