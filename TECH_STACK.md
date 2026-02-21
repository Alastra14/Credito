# Tech Stack — Aplicativo de Gestión de Créditos Personales (Móvil)
**Versión:** 2.0  
**Fecha:** 20 de febrero de 2026  
**Plataforma:** Android (APK) — React Native con Expo

---

## 1. Stack completo

| Capa | Tecnología | Versión | Propósito |
|---|---|---|---|
| Framework | Expo SDK | ~52.0 | Plataforma React Native con tooling integrado |
| Navegación / Routing | expo-router | ~4.0 | File-based routing (como Next.js, pero nativo) |
| Lenguaje | TypeScript | ~5.3 | Tipado estático |
| UI Nativa | React Native | 0.76.3 | Componentes nativos (View, Text, etc.) |
| Base de datos | expo-sqlite | ~15.0 | SQLite local en el dispositivo |
| Notificaciones | expo-notifications | ~0.29 | Push local / programar recordatorios |
| Archivos | expo-file-system | ~18.0 | Lectura, escritura y descarga local |
| Selector archivos | expo-document-picker | ~13.0 | Seleccionar PDF/imágenes del dispositivo |
| Gráficas | react-native-chart-kit | ^6.12 | Gráficas (barras, pie, líneas) con SVG |
| SVG | react-native-svg | ~15.8 | Renderizado SVG nativo (requerido por chart-kit) |
| Animaciones | react-native-reanimated | ~3.16 | Animaciones nativas (requerido por Drawer) |
| Gestos | react-native-gesture-handler | ~2.20 | Gestos nativos (swipe de Drawer) |
| Drawer | @react-navigation/drawer | ^7.0 | Menú lateral deslizable |
| Fechas | date-fns | ^3.6 | Formateo y cálculo de fechas |
| Íconos | @expo/vector-icons | ^14.0 | Ionicons, MaterialIcons, FontAwesome, etc. |
| Build APK | EAS Build | cloud | Compilación nativa sin Android Studio local |

---

## 2. Dependencias detalladas

### `package.json` — dependencies

```json
{
  "expo": "~52.0.0",
  "expo-router": "~4.0.0",
  "expo-sqlite": "~15.0.0",
  "expo-notifications": "~0.29.0",
  "expo-file-system": "~18.0.0",
  "expo-document-picker": "~13.0.0",
  "expo-status-bar": "~2.0.0",
  "expo-crypto": "~14.0.0",
  "expo-constants": "~17.0.0",
  "expo-device": "~7.0.0",
  "expo-linking": "~7.0.0",
  "react": "18.3.1",
  "react-native": "0.76.3",
  "react-native-gesture-handler": "~2.20.0",
  "react-native-reanimated": "~3.16.0",
  "react-native-safe-area-context": "4.12.0",
  "react-native-screens": "~4.1.0",
  "react-native-chart-kit": "^6.12.0",
  "react-native-svg": "~15.8.0",
  "@react-navigation/drawer": "^7.0.0",
  "@react-navigation/native": "^7.0.0",
  "date-fns": "^3.6.0",
  "@expo/vector-icons": "^14.0.0"
}
```

### `package.json` — devDependencies

```json
{
  "typescript": "~5.3.0",
  "@types/react": "~18.3.0",
  "@babel/core": "^7.25.0"
}
```

---

## 3. Configuración de Expo

**Modo:** Expo Router (file-based routing nativo)  
**Directorio fuente:** `app/` para rutas, `src/` para lógica y componentes  
**Entry point:** `"main": "expo-router/entry"` en package.json

### `app.json`

```json
{
  "expo": {
    "name": "Créditos",
    "slug": "credito",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "credito",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#3B82F6"
    },
    "android": {
      "package": "com.personal.credito",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#3B82F6"
      },
      "permissions": ["NOTIFICATIONS", "READ_EXTERNAL_STORAGE"]
    },
    "plugins": [
      "expo-router",
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#3B82F6"
        }
      ]
    ]
  }
}
```

### `eas.json` (para build de APK)

```json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

---

## 4. Base de datos — expo-sqlite

### Por qué expo-sqlite
- SQLite nativo integrado en el SDK de Expo
- No requiere servidor externo
- Datos persisten en el dispositivo entre reinicios de la app
- API síncrona/asíncrona disponible
- Funciona offline (100% local)

### Inicialización — `src/lib/database.ts`

```typescript
import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync("creditos.db");
    await initTables(db);
  }
  return db;
}

async function initTables(database: SQLite.SQLiteDatabase) {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS creditos (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      tipo TEXT NOT NULL,
      montoTotal REAL NOT NULL,
      saldoActual REAL NOT NULL,
      tasaInteres REAL NOT NULL,
      fechaApertura TEXT NOT NULL,
      fechaCorte INTEGER,
      fechaLimitePago INTEGER,
      pagoMinimo REAL,
      cuotaMensual REAL NOT NULL,
      plazoMeses INTEGER,
      estado TEXT NOT NULL DEFAULT 'ACTIVO',
      notas TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS pagos (
      id TEXT PRIMARY KEY,
      creditoId TEXT NOT NULL,
      monto REAL NOT NULL,
      fecha TEXT NOT NULL,
      mes INTEGER NOT NULL,
      anio INTEGER NOT NULL,
      tipo TEXT NOT NULL DEFAULT 'MENSUAL',
      notas TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (creditoId) REFERENCES creditos(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS documentos (
      id TEXT PRIMARY KEY,
      creditoId TEXT NOT NULL,
      nombre TEXT NOT NULL,
      tipo TEXT NOT NULL,
      ruta TEXT NOT NULL,
      tamanio INTEGER NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (creditoId) REFERENCES creditos(id) ON DELETE CASCADE
    );
  `);
}
```

### Generación de IDs

Se usa `expo-crypto` para generar IDs únicos:
```typescript
import * as Crypto from "expo-crypto";
export const generateId = () => Crypto.randomUUID();
```

### Ubicación de la BD en el dispositivo
La base de datos se crea automáticamente en el sandbox de la app Android. No requiere path manual. Se pierde al desinstalar la app.

---

## 5. Notificaciones locales — expo-notifications

### Propósito
Enviar recordatorios al usuario cuando se acerquen las fechas de pago de sus créditos.

### Flujo

1. Al crear/editar un crédito, se programan notificaciones para:
   - **3 días antes** de la fecha límite de pago → "Tu pago de {nombre} vence en 3 días"
   - **1 día antes** → "Mañana vence el pago de {nombre}"
   - **El día del pago** → "Hoy vence tu pago de {nombre} (${cuota})"

2. Al registrar un pago para un mes, se cancelan las notificaciones restantes de ese crédito para ese mes.

3. Al eliminar un crédito, se cancelan todas sus notificaciones programadas.

### Implementación — `src/lib/notifications.ts`

```typescript
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

// Configurar handler (foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Pedir permisos
export async function requestPermissions(): Promise<boolean> {
  if (!Device.isDevice) return false;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

// Programar notificación
export async function schedulePaymentReminder(
  creditoId: string,
  creditoNombre: string,
  monto: number,
  fechaPago: Date,
  diasAntes: number
): Promise<string> {
  const trigger = new Date(fechaPago);
  trigger.setDate(trigger.getDate() - diasAntes);
  trigger.setHours(9, 0, 0); // 9:00 AM

  if (trigger <= new Date()) return ""; // ya pasó

  return await Notifications.scheduleNotificationAsync({
    content: {
      title: diasAntes === 0
        ? `💰 Hoy vence tu pago`
        : `⏰ Pago próximo (${diasAntes} día${diasAntes > 1 ? "s" : ""})`,
      body: `${creditoNombre}: $${monto.toLocaleString()}`,
      data: { creditoId },
    },
    trigger: { date: trigger },
  });
}

// Cancelar por crédito
export async function cancelNotificationsForCredito(creditoId: string) {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of all) {
    if (notif.content.data?.creditoId === creditoId) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }
}
```

---

## 6. Estilizado — StyleSheet nativo + Theme

### Approach
React Native no usa CSS. Se usa `StyleSheet.create()` para objetos de estilo nativos.

### Theme centralizado — `src/lib/theme.ts`

```typescript
export const colors = {
  primary: "#3B82F6",
  primaryLight: "#DBEAFE",
  primaryDark: "#1D4ED8",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  text: "#0F172A",
  textSecondary: "#64748B",
  border: "#E2E8F0",
  success: "#22C55E",
  successLight: "#DCFCE7",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  destructive: "#EF4444",
  destructiveLight: "#FEE2E2",
  info: "#3B82F6",
  infoLight: "#DBEAFE",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  full: 999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 30,
};
```

---

## 7. Gráficas — react-native-chart-kit

### Por qué react-native-chart-kit
- Funciona con React Native (SVG nativo vía react-native-svg)
- Barras, líneas, pie, progreso — todo en un paquete
- Sin canvas ni WebView

### Ejemplo de uso

```tsx
import { BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;

<BarChart
  data={{
    labels: ["Visa", "Hipoteca", "Auto"],
    datasets: [{ data: [24, 9, 15] }],
  }}
  width={screenWidth - 32}
  height={220}
  yAxisSuffix="%"
  chartConfig={{
    backgroundColor: "#FFF",
    backgroundGradientFrom: "#FFF",
    backgroundGradientTo: "#FFF",
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: () => "#64748B",
  }}
  style={{ borderRadius: 10 }}
/>
```

### Gráficas implementadas

| Componente | Tipo | Archivo |
|---|---|---|
| `TasasChart` | `BarChart` | `src/components/charts/TasasChart.tsx` |
| `DeudaPieChart` | `PieChart` | `src/components/charts/DeudaPieChart.tsx` |
| `ProgresoChart` | `ProgressChart` | `src/components/charts/ProgresoChart.tsx` |
| `ProyeccionChart` | `LineChart` | `src/components/charts/ProyeccionChart.tsx` |

---

## 8. Almacenamiento de documentos — expo-file-system + expo-document-picker

### Flujo de subida

1. Usuario toca "Subir documento"
2. `expo-document-picker` abre el selector nativo de archivos
3. Se copia el archivo seleccionado al directorio de la app vía `expo-file-system`
4. Se registra en SQLite (nombre, tipo, ruta local, tamaño)

### Estructura de almacenamiento

```
{FileSystem.documentDirectory}/
  documentos/
    {creditoId}/
      {uuid}-contrato.pdf
      {uuid}-estado-cuenta.jpg
```

### Límites

- **Tamaño máximo:** 10 MB por archivo
- **Tipos permitidos:** PDF, JPG, PNG
- **Validación:** verificar `mimeType` y `size` del resultado de `DocumentPicker`

---

## 9. Algoritmos numéricos

Idénticos a la versión web, en TypeScript puro sin dependencias.

Ubicación: `src/lib/calculos/`

### `amortizacion.ts`

```typescript
export function calcularTablaAmortizacion(
  saldo: number,
  tasaAnual: number,
  mesesRestantes: number
): AmortizacionRow[]
```

### `proyeccion.ts`

```typescript
export function calcularProyeccion(
  credito: CreditoConPagos,
  pagoExtra?: number
): ProyeccionRow[]
```

### `priorizacion.ts`

```typescript
export function calcularEstrategias(
  creditos: CreditoConPagos[],
  presupuesto: number
): { avalancha: EstrategiaPago; bolaNieve: EstrategiaPago }
```

---

## 10. Navegación — Expo Router + Drawer

### Expo Router
Usa el sistema de archivos como rutas (igual que Next.js App Router), pero genera navegación React Navigation nativa.

### Estructura de rutas

```
app/
├── _layout.tsx               ← Drawer layout raíz
├── index.tsx                 ← Dashboard (pantalla principal)
├── creditos/
│   ├── _layout.tsx           ← Stack layout para créditos
│   ├── index.tsx             ← Lista de créditos
│   ├── nuevo.tsx             ← Nuevo crédito
│   └── [id]/
│       ├── _layout.tsx       ← Stack para detalle
│       ├── index.tsx         ← Detalle
│       ├── editar.tsx        ← Editar
│       ├── pagos.tsx         ← Historial pagos
│       └── documentos.tsx    ← Documentos
├── pagos/
│   └── index.tsx             ← Control mensual
├── proyecciones/
│   └── index.tsx             ← Proyecciones
├── priorizacion/
│   └── index.tsx             ← Priorización
└── reportes/
    └── index.tsx             ← Reportes
```

### Drawer (menú lateral)

```
┌──────────────┐
│  🏠 Dashboard │
│  💳 Créditos  │
│  📅 Pagos     │
│  📉 Proyecc.  │
│  🏆 Prioriz.  │
│  📊 Reportes  │
└──────────────┘
```

Se implementa en `app/_layout.tsx` usando `@react-navigation/drawer`.

---

## 11. Estructura de directorios completa

```
c:\Versionador\Credito\Credito-1\
├── app/                          ← Rutas (Expo Router)
│   ├── _layout.tsx               ← Drawer layout raíz
│   ├── index.tsx                 ← Dashboard
│   ├── creditos/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── nuevo.tsx
│   │   └── [id]/
│   │       ├── _layout.tsx
│   │       ├── index.tsx
│   │       ├── editar.tsx
│   │       ├── pagos.tsx
│   │       └── documentos.tsx
│   ├── pagos/
│   │   └── index.tsx
│   ├── proyecciones/
│   │   └── index.tsx
│   ├── priorizacion/
│   │   └── index.tsx
│   └── reportes/
│       └── index.tsx
├── src/
│   ├── components/
│   │   ├── ui/                   ← Componentes base reutilizables
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   └── Modal.tsx
│   │   ├── creditos/
│   │   │   ├── CreditoForm.tsx
│   │   │   ├── CreditoCard.tsx
│   │   │   └── CreditoList.tsx
│   │   ├── pagos/
│   │   │   ├── PagoForm.tsx
│   │   │   └── PagoTabla.tsx
│   │   ├── charts/
│   │   │   ├── TasasChart.tsx
│   │   │   ├── DeudaPieChart.tsx
│   │   │   ├── ProgresoChart.tsx
│   │   │   └── ProyeccionChart.tsx
│   │   ├── documentos/
│   │   │   ├── UploadButton.tsx
│   │   │   └── DocumentoList.tsx
│   │   └── priorizacion/
│   │       ├── EstrategiaCard.tsx
│   │       └── ComparacionTabla.tsx
│   ├── lib/
│   │   ├── database.ts           ← SQLite init + helpers
│   │   ├── notifications.ts      ← Notificaciones locales
│   │   ├── theme.ts              ← Colores, spacing, tipografía
│   │   ├── utils.ts              ← Formateo moneda, fechas, IDs
│   │   ├── constants.ts          ← Tipos crédito, estados
│   │   └── calculos/
│   │       ├── amortizacion.ts
│   │       ├── proyeccion.ts
│   │       └── priorizacion.ts
│   └── types/
│       └── index.ts
├── assets/
│   ├── icon.png                  ← Ícono de la app (1024×1024)
│   ├── splash.png                ← Pantalla de carga
│   ├── adaptive-icon.png         ← Ícono adaptativo Android
│   └── notification-icon.png     ← Ícono de notificaciones
├── app.json                      ← Configuración Expo
├── eas.json                      ← Configuración de build EAS
├── tsconfig.json
├── babel.config.js
├── package.json
├── .gitignore
├── PRD.md
├── DISEÑO.md
└── TECH_STACK.md
```

---

## 12. Configuración TypeScript

### `tsconfig.json`

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

### Path aliases

| Alias | Resuelve a |
|---|---|
| `@/lib/*` | `src/lib/*` |
| `@/components/*` | `src/components/*` |
| `@/types/*` | `src/types/*` |

> Expo Router soporta `paths` en tsconfig nativamente. No se necesita config extra de Babel para aliases.

---

## 13. Build del APK

### Requisitos previos (una sola vez)

```bash
# Instalar EAS CLI globalmente
npm install -g eas-cli

# Login con cuenta Expo (gratis)
eas login

# Configurar el proyecto
eas build:configure
```

### Generar APK

```bash
# Build APK para instalar directamente
eas build -p android --profile preview
```

Esto sube el código a los servidores de Expo, compila el APK en la nube y te da un link de descarga. **No necesitas tener Android Studio instalado.**

### Instalar en el celular

1. Descargar el APK desde el link que da EAS Build
2. Transferir al celular o abrir el link desde Chrome en el celular
3. Instalar (habilitar "Orígenes desconocidos" si es necesario)
4. Abrir la app "Créditos"

---

## 14. Comandos de desarrollo

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo (con Expo Go en el celular)
npx expo start

# Desarrollo con build nativo local (si tienes Android Studio)
npx expo run:android

# Build APK en la nube
eas build -p android --profile preview

# Verificar tipos TypeScript
npx tsc --noEmit
```

### Desarrollo con Expo Go
1. Instalar "Expo Go" desde Play Store en el celular
2. Ejecutar `npx expo start` en la PC
3. Escanear el QR con Expo Go
4. La app se recarga en vivo conforme editas código

---

## 15. `.gitignore` recomendado

```
node_modules/
.expo/
dist/
*.apk
*.aab
.env
.env.local
*.log
```

---

## 16. Diferencias clave vs la arquitectura web anterior

| Aspecto | Antes (Next.js Web) | Ahora (Expo Mobile) |
|---|---|---|
| Plataforma | Navegador desktop | Android nativo (APK) |
| BD | Prisma + SQLite (archivo en server) | expo-sqlite (en el dispositivo) |
| UI | HTML + Tailwind CSS + shadcn/ui | React Native (View, Text, StyleSheet) |
| Navegación | Next.js App Router (URLs) | Expo Router + React Navigation Drawer |
| Gráficas | Recharts (SVG en DOM) | react-native-chart-kit (SVG nativo) |
| Archivos | fs.writeFile en server | expo-file-system en sandbox de app |
| Notificaciones | No soportadas | expo-notifications (nativas Android) |
| Build | `npm run build` (bundle web) | `eas build` (APK en la nube) |
| Hosting | Necesita servidor web | No necesita nada, corre en el celular |
