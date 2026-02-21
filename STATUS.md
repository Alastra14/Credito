# Estado del Proyecto — App de Créditos (Android APK)

> Última actualización: 20 febrero 2026

---

## ¿Qué es esto?

App móvil Android (Expo / React Native) para gestión personal de créditos. Permite llevar control de tarjetas, hipotecas, autos y préstamos personales: registrar pagos, subir documentos, ver proyecciones de amortización y comparar estrategias de pago (Avalancha vs Bola de nieve). Base de datos local SQLite, sin servidor, con notificaciones push nativas.

---

## Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | Expo SDK ~52 + expo-router ~4 |
| Lenguaje | TypeScript ~5.3 |
| Navegación | expo-router (Drawer + Stack) |
| Base de datos | expo-sqlite ~15 (local, sin servidor) |
| Notificaciones | expo-notifications ~0.29 |
| Archivos | expo-file-system + expo-document-picker |
| Gráficas | react-native-chart-kit + react-native-svg |
| Iconos | @expo/vector-icons (Ionicons) |
| Fechas | date-fns ^3.6 con locale `es` |
| Build | EAS Build (`eas build -p android --profile preview`) |

---

## ✅ Lo que está hecho

### Configuración
- `package.json` con todas las dependencias
- `app.json` (configuración Expo, splash, icono, permisos Android)
- `eas.json` (perfil `preview` para APK)
- `tsconfig.json` (alias `@/*` → `./src/*`)
- `babel.config.js`
- `.gitignore`

### Tipos (`src/types/index.ts`)
- `TipoCredito`, `EstadoCredito`, `TipoPago`, `EstadoPago` — todos en lowercase snake_case
- `Credito`, `CreditoConPagos`, `Pago`, `Documento`, `CreditoFormData`
- `AmortizacionRow`, `PagoMensualEstado`
- `EstrategiaDetalle`, `ResultadoEstrategias`
- Re-export de `ProyeccionMes`, `ProyeccionCredito` desde lib

### Librería (`src/lib/`)
- `theme.ts` — tokens de diseño con colores **anidados** (`colors.primary.default`, `colors.surface.card`, etc.)
- `constants.ts` — `TIPOS_CREDITO`, `ESTADOS_CREDITO`, `MESES`, `MAX_FILE_SIZE_BYTES`, etc.
- `utils.ts` — `generateId`, `formatCurrency` (MXN), `formatDate`, `formatFileSize`, helpers de color por estado, `parseOptionalInt/Float` (retornan `number | undefined`)
- `database.ts` — SQLite con WAL mode, FK, row mappers, CRUD completo para créditos/pagos/documentos
- `notifications.ts` — permisos, canal Android, scheduling (3 días antes, 1 día antes, día del vencimiento a 9am)
- `calculos/amortizacion.ts` — tabla de amortización francesa
- `calculos/proyeccion.ts` — proyección por crédito (`ProyeccionCredito`)
- `calculos/priorizacion.ts` — Avalancha y Bola de nieve → `ResultadoEstrategias`

### Componentes UI (`src/components/ui/`)
- `Badge.tsx` — default export + named export, acepta `children` y `estado: EstadoPago`
- `Button.tsx` — default export + named export, 5 variantes, 3 tamaños, acepta `children` o `title`
- `Card.tsx` — `Card`, `CardHeader`, `CardContent`
- `Input.tsx` — default export, acepta `label`, `error`, `hint`
- `Select.tsx` — default export, picker modal nativo
- `Modal.tsx` — default export (`AppModal`), bottom-sheet con `KeyboardAvoidingView`

### Componentes de negocio
- `CreditoCard.tsx` — card con barra de progreso y alerta de vencidos
- `CreditoForm.tsx` — formulario create/edit con campos condicionales por tipo
- `CreditoList.tsx` — lista con chips de filtro por tipo y estado
- `PagoForm.tsx` — registrar pago (monto, tipo, fecha, notas)
- `PagoTabla.tsx` — tabla mensual de pagos con badges de estado
- `UploadButton.tsx` — selector de documentos, valida ≤10MB, copia a directorio local
- `DocumentoList.tsx` — lista de documentos con abrir/eliminar
- `EstrategiaCard.tsx` — resumen de estrategia de pago
- `ComparacionTabla.tsx` — tabla comparativa Avalancha vs Bola de nieve

### Gráficas (`src/components/charts/`)
- `TasasChart.tsx` — BarChart ordenado por tasa desc
- `DeudaPieChart.tsx` — PieChart agrupado por tipo de crédito
- `ProgresoChart.tsx` — ProgressChart para créditos con plazo
- `ProyeccionChart.tsx` — LineChart de saldos proyectados

### Pantallas (`app/`)
- `_layout.tsx` — Drawer raíz (6 items), inicializa notificaciones al arrancar
- `index.tsx` — Dashboard: deuda total, stats, alertas de vencidos, acciones rápidas, pagos pendientes del mes
- `creditos/_layout.tsx` — Stack navigator de créditos
- `creditos/index.tsx` — Lista de créditos con FAB
- `creditos/nuevo.tsx` — Crear crédito + programar notificaciones
- `creditos/[id]/_layout.tsx` — Stack navigator para detalle
- `creditos/[id]/index.tsx` — Detalle: datos financieros, progreso, acciones
- `creditos/[id]/editar.tsx` — Editar crédito + reprogramar notificaciones
- `creditos/[id]/pagos.tsx` — Pagos por año con selector de año
- `creditos/[id]/documentos.tsx` — Documentos del crédito
- `pagos/index.tsx` — Vista mensual de todos los pagos con selector de mes
- `proyecciones/index.tsx` — Selector de créditos, pago extra, gráfica + tabla de amortización en acordeón
- `priorizacion/index.tsx` — Input de presupuesto, cálculo Avalancha/Bola de nieve, comparación
- `reportes/index.tsx` — Las 4 gráficas en scroll vertical

### Assets
- `assets/icon.png` (1024×1024)
- `assets/adaptive-icon.png` (1024×1024)
- `assets/splash.png` (1284×2778)
- `assets/favicon.png` (48×48)
> Son rectángulos de color sólido (`#2563EB`). Hay que reemplazarlos con el diseño real antes del release.

### Build
- TypeScript compila sin errores (`tsc --noEmit` → exit 0)
- Bundle de Android generado con éxito (`expo export` → 2398 módulos)
- Código subido a GitHub: `https://github.com/Alastra14/Credito`

---

## ❌ Lo que falta

### Crítico para probar en dispositivo
1. **tsconfig.json no tiene `node_modules` en `node_modules`** — en otra computadora hay que correr `npm install` antes de todo.
2. **Assets reales** — los íconos actuales son rectángulos azules planos. Necesitan diseño real.
3. **Prueba en dispositivo** — nunca se ha corrido en un Android real. Puede haber errores en tiempo de ejecución que TypeScript no detecta (SQLite, permisos, notificaciones).

### Funcionalidad pendiente
4. **Pantalla de crédito [id] no tiene tabs** — los botones "Pagos" / "Docs" / "Editar" son simples `TouchableOpacity` que navegan por push. Podría mejorar con tab bar interno.
5. **Sin paginación** — `CreditoList` y `PagoTabla` cargan todos los registros. Con muchos datos puede ser lento.
6. **Sin búsqueda** — no hay campo de búsqueda en la lista de créditos.
7. **Sin exportar/compartir reportes** — no se pueden exportar las gráficas o tablas como PDF/imagen.
8. **Sin backup/restore** — la base de datos SQLite es local y se elimina si se desinstala la app.

### Bugs conocidos / por verificar
9. **`cancelNotificationsForPago` recibe 3 args** — en `app/creditos/[id]/pagos.tsx` se llama correctamente con `(pago.creditoId, pago.mes, pago.anio)`. Verificar que en `app/pagos/index.tsx` también sea correcto (✅ ya corregido, pero hay que probar).
10. **`calcularProyeccionMultiple`** (en `proyeccion.ts`) retorna filas de gráfica planas `{ mes, [creditoId]: number }`, **no** `ProyeccionCredito[]`. Las pantallas ahora usan `calcularProyeccion` por crédito individualmente. Verificar que la leyenda de `ProyeccionChart` funcione en runtime.
11. **`node_modules` no incluido en git** — en otra máquina hay que `npm install` antes de `npx expo start`.
12. **Push a GitHub dio exit code 1** aunque sí subió la rama `main` como `[new branch]`. Comprobar en `github.com/Alastra14/Credito` que el código esté visible.
13. **`base de otro doc`** — hay un archivo suelto en la raíz del proyecto que no es código. Limpiar antes de release.
14. **Drawer en Android** — el gesto de swipe para abrir el drawer puede interferir con scroll horizontal en gráficas. Por verificar.

---

## 🔧 Cómo correr en otra computadora

```bash
# 1. Clonar
git clone https://github.com/Alastra14/Credito.git
cd Credito

# 2. Instalar dependencias
npm install

# 3. Iniciar Expo (para Expo Go)
npx expo start

# 4. Para generar APK (requiere cuenta EAS configurada)
npx eas login
npx eas build -p android --profile preview
```

> Para abrir en dispositivo Android: instalar la app **Expo Go** desde Play Store y escanear el QR que muestra `npx expo start`.

---

## 📁 Estructura de carpetas

```
app/
  _layout.tsx              ← Drawer raíz
  index.tsx                ← Dashboard
  creditos/
    _layout.tsx
    index.tsx
    nuevo.tsx
    [id]/
      _layout.tsx
      index.tsx
      editar.tsx
      pagos.tsx
      documentos.tsx
  pagos/index.tsx
  proyecciones/index.tsx
  priorizacion/index.tsx
  reportes/index.tsx
assets/                    ← íconos placeholder (reemplazar)
src/
  types/index.ts           ← todos los tipos TypeScript
  lib/
    theme.ts               ← colores anidados, espaciado, bordes
    constants.ts
    utils.ts
    database.ts            ← SQLite CRUD
    notifications.ts
    calculos/
      amortizacion.ts
      proyeccion.ts
      priorizacion.ts
  components/
    ui/                    ← Badge, Button, Card, Input, Select, Modal
    creditos/              ← CreditoCard, CreditoForm, CreditoList
    pagos/                 ← PagoForm, PagoTabla
    documentos/            ← UploadButton, DocumentoList
    priorizacion/          ← EstrategiaCard, ComparacionTabla
    charts/                ← TasasChart, DeudaPieChart, ProgresoChart, ProyeccionChart
```
