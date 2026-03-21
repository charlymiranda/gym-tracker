# Gym Tracker Mobile App

App personal offline-first para registro de entrenamientos de gimnasio, construida con React Native (Expo), TypeScript y SQLite. No requiere backend, ni nube, ni login. Todo se almacena localmente.

## Requisitos previos

- Node.js (v18 o superior)
- npm
- Celular Android con Expo Go (para desarrollo) o emulador Android

## Cómo correr el proyecto

1. **Instalar dependencias:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Iniciar el servidor:**
   \`\`\`bash
   npm run start
   \`\`\`
   o
   \`\`\`bash
   npx expo start
   \`\`\`

3. **Ver en dispositivo:**
   - Escanea el código QR que aparece en la terminal usando la aplicación Expo Go en tu celular Android.
   - Alternativamente, presiona \`a\` en la terminal para abrirlo en el emulador de Android (si está instalado y corriendo).

## Estructura del Proyecto

El proyecto sigue una arquitectura orientada a dominio para separaciones claras:
- \`app/\`: Pantallas de la aplicación utilizando Expo Router.
- \`src/database/\`: Configuración de base de datos, esquema de tablas y seed inicial.
- \`src/repositories/\`: Capa de acceso a datos encapsulada para operaciones limpias en SQLite.
- \`src/features/\`: Agrupamiento de lógica específica.
- \`src/domain/\`: Reglas de negocio clave y validación.

## Base de Datos (SQLite)

La app utiliza \`expo-sqlite\`. Al ejecutarse por primera vez, el archivo \`app/_layout.tsx\` se encarga de ejecutar las migraciones (creación de tablas) e insertar el catálogo base ("seeder" desde \`src/database/seed.json\`).

## Cómo generar APK (Distribución)

El proyecto está diseñado para ser de uso personal y se instala manualmente mediante un archivo APK, sin necesidad de enviarlo a Play Store. Usamos EAS Build para generar este APK.

1. **Instalar EAS CLI:**
   \`\`\`bash
   npm install -g eas-cli
   \`\`\`

2. **Iniciar sesión en Expo:**
   \`\`\`bash
   eas login
   \`\`\`

3. **Configurar el proyecto en EAS (solo la primera vez):**
   \`\`\`bash
   eas build:configure
   \`\`\`
   Esto generará un archivo \`eas.json\`.

4. **Configurar el perfil Preview para APK local:**
   Asegúrate de que en \`eas.json\`, dentro del bloque \`build -> preview -> android\`, tengas configurado \`"buildType": "apk"\` en lugar del bundle por defecto:
   \`\`\`json
   {
     "build": {
       "preview": {
         "android": {
           "buildType": "apk"
         }
       }
     }
   }
   \`\`\`

5. **Construir el APK:**
   Ejecuta el siguiente comando para mandar el build a los servidores de Expo:
   \`\`\`bash
   eas build -p android --profile preview
   \`\`\`
   Una vez que el proceso finalice (puede tardar unos minutos), EAS CLI devolverá un enlace directo para que descargues el \`.apk\` en tu computadora o lo abras desde tu celular para instalar la aplicación de forma offline.
