# Reporte 3: Abogado del Diablo — Fallas, Errores y Rutas que Rompen la App

> **Proyecto:** Debtless (Expo / React Native)  
> **Fecha:** 22 de febrero de 2026  
> **Enfoque:** "¿Cómo puedo romper esta app?" — Edge cases, crashes, race conditions, rutas alternas

---

## 🔴 NIVEL CRÍTICO — Crashes Confirmados

### CRASH-01: Reportes y Priorización explotan al acceder a `.pagos`
**Archivo:** `app/reportes/index.tsx` (línea ~34), `app/priorizacion/index.tsx` (línea ~29)

**Cómo reproducir:**
1. Crear al menos 1 crédito
2. Ir a la pestaña "Reportes" o "Priorización"
3. 💥 La app crashea

**Causa raíz:**
```typescript
const creditos = await getCreditos() as CreditoConPagos[];
// getCreditos() retorna objetos SIN propiedad "pagos"
// ProgresoChart hace: c.pagos.filter(...)  → TypeError: Cannot read property 'filter' of undefined
```

**Impacto:** CRASH total. Toda la sección de Reportes y Priorización está potencialmente rota.

---

### CRASH-02: Loop de 600 meses cuando cuota < interés mensual
**Archivo:** `src/lib/calculos/amortizacion.ts` (línea ~30)

**Cómo reproducir:**
1. Crear un crédito con: saldo = $100,000, tasa = 50%, cuota mensual = $100
2. Ir a Proyecciones y seleccionar ese crédito
3. 💥 La app se congela durante ~30 segundos generando 600 filas

**Causa raíz:**
```typescript
while (saldoActual > 0.01 && mes <= 600) {
  // Si cuota < interes, el saldo CRECE cada mes
  // El loop solo termina al llegar a mes 600
}
```

**Impacto:** Congelamiento total de la UI. En dispositivos de gama baja podría triggerear un ANR (Application Not Responding).

---

### CRASH-03: Pantalla en blanco si crédito se elimina mientras se vé
**Archivo:** `app/creditos/[id]/index.tsx`

**Cómo reproducir:**
1. Abrir el detalle de un crédito
2. Desde otra instancia (ej: backup/restore), eliminar ese crédito
3. ← Regresar al detalle → `credito` es `null` → `return null` → pantalla en blanco sin recovery

---

## 🟠 NIVEL ALTO — Bugs Funcionales

### BUG-01: Pago se registra en el mes incorrecto (Off-by-one)
**Archivo:** `app/pagos/index.tsx` → `PagoForm.tsx`

**Cómo reproducir:**
1. Ir a la vista global de Pagos
2. Seleccionar un crédito en el mes de Marzo (mes 3)
3. El pago se registra en **Abril** (mes 4) porque `pagos/index.tsx` pasa `mes=3` (1-based) pero `PagoForm` lo trata como `mesIndex` (0-based) y calcula `mes: mesIndex + 1 = 4`

**Impacto:** Datos financieros incorrectos. El usuario ve "pagado" en un mes diferente al real.

---

### BUG-02: Eliminación de pago sin confirmación (inconsistente)
**Archivo:** `app/pagos/index.tsx`

**Cómo reproducir:**
1. Ir a Pagos → tocar el ícono de basura en un pago
2. El pago se elimina INMEDIATAMENTE sin preguntar
3. Contrastar con `app/creditos/[id]/_pagos.tsx` que SÍ muestra modal de confirmación

**Impacto:** Pérdida de datos accidental.

---

### BUG-03: Bordes de error de validación son invisibles
**Archivo:** `src/components/ui/Input.tsx`, `src/components/ui/Select.tsx`

**Cómo reproducir:**
1. Ir a crear un nuevo crédito
2. Dejar campos requeridos vacíos y enviar
3. El estilo `inputError` aplica `borderColor: colors.status.danger` pero NO aplica `borderWidth` → el borde rojo no se ve

**Impacto:** El usuario no sabe qué campo tiene error.

---

### BUG-04: Login overlay teóricamente bypasseable
**Archivo:** `app/_layout.tsx` (líneas ~143-150)

**Cómo reproducir:**
1. La app renderiza las Tabs completamente DEBAJO del LoginScreen
2. Con herramientas de accesibilidad o manipulación de z-index, se podrían alcanzar los tabs sin autenticarse
3. En debug mode, React DevTools permite interactuar con componentes montados

**Impacto:** Bypass de autenticación (bajo riesgo en producción, alto en debug).

---

### BUG-05: Notificaciones duplicadas en cada launch
**Archivo:** `src/lib/notifications.ts`

**Cómo reproducir:**
1. Abrir la app → se programan notificaciones para todos los créditos
2. Cerrar y volver a abrir la app → se programan OTRA VEZ sin cancelar las anteriores
3. Repetir 5 veces → el usuario recibe 5x las notificaciones

**Causa raíz:** No se verifican/cancelan las notificaciones previas antes de crear nuevas.

---

### BUG-06: Import de DB corrupta puede destruir datos
**Archivo:** `app/configuracion/index.tsx`

**Cómo reproducir:**
1. Renombrar cualquier archivo a `datos.db`
2. Importarlo en la app
3. La validación solo verifica la extensión del archivo, no el contenido
4. La base de datos se corrompe

---

## 🟡 NIVEL MEDIO — Edge Cases Problemáticos

### EDGE-01: Créditos con saldo 0 desaparecen de pagos
**Archivo:** `app/creditos/[id]/_pagos.tsx`

Si `saldoActual === 0`, los meses pendientes se ocultan. Pero tarjetas de crédito pueden tener saldo 0 y aún necesitar tracking de pagos mensuales (ej: pagos recurrentes).

---

### EDGE-02: `plazoMeses` undefined causa resultados inconsistentes

| Contexto | Default usado | Resultado |
|----------|---------------|-----------|
| Crear crédito (`nuevo.tsx`) | 60 meses | Cuota para 5 años |
| Proyecciones (`proyeccion.ts`) | 360 meses | Cuota para **30 años** |
| Progreso chart | `plazoMeses ?? 1` | **100% completado** si no hay plazo |

Un mismo crédito sin plazo muestra resultados completamente diferentes en cada pantalla.

---

### EDGE-03: PIN brute-force sin protección
**Archivo:** `src/components/auth/LoginScreen.tsx`

- PIN de 4 dígitos = 10,000 combinaciones posibles
- Sin lockout tras intentos fallidos
- Sin delay incremental
- Un atacante con acceso físico puede probar ~1 PIN/segundo → acceso en ~3 horas

---

### EDGE-04: API keys expuestas en el cliente
**Archivo:** `src/components/creditos/CreditoForm.tsx`

Las API keys de OpenAI/Claude/Gemini se envían directamente desde el dispositivo del usuario. En WiFi público sin cert pinning, pueden ser interceptadas via MITM.

Además: `process.env.EXPO_PUBLIC_OPENAI_API_KEY` se bundle en la app — cualquiera puede extraerla del APK.

---

### EDGE-05: Fecha de pago cruza medianoche
**Archivo:** `app/creditos/[id]/editar.tsx`

```typescript
const now = new Date();
const hoy = new Date(now.getFullYear(), now.getMonth(), now.getDate());
// Si se ejecuta a las 23:59:59.999 y el insert ocurre a las 00:00:00.001
// "hoy" y "now" refieren a días diferentes
```

---

### EDGE-06: `Linking.openURL()` falla para archivos locales en Android
**Archivo:** `src/components/documentos/DocumentoList.tsx`

En Android 10+, `Linking.openURL(file:///...)` está bloqueado por FileProvider. El documento no se abre y el error se traga silenciosamente.

---

### EDGE-07: Presupuesto menor que pagos mínimos en priorización
**Archivo:** `app/priorizacion/index.tsx`

Si el usuario ingresa un presupuesto de $500 pero la suma de pagos mínimos es $800, el algoritmo corre 600 iteraciones con deuda creciente antes de parar.

---

## 🔵 NIVEL BAJO — Molestias y Deuda Técnica

| # | Escenario | Impacto |
|---|-----------|---------|
| 1 | Rotar el dispositivo no actualiza gráficas (Dimensions capturado una vez) | Gráficas cortadas |
| 2 | Teclado personalizado sin accesibilidad (VoiceOver/TalkBack) | Inutilizable para usuarios con discapacidad |
| 3 | Toast se solapa con tab bar cuando está visible | Visual |
| 4 | `new Date()` llamado 2 veces puede dar días diferentes en midnight edge | Datos inconsistentes |
| 5 | Modal de pago se cierra al tocar overlay accidentalmente | Pérdida de input |
| 6 | Centro del tab bar rotado 45° — ícono parece diagonal | Confusión visual |
| 7 | Fonts que no cargan dejan la app en splash infinito (sin timeout) | App inutilizable |
| 8 | Tab de documentos con `scrollEnabled={false}` pierde virtualización | Performance |
| 9 | `UploadButton` acepta `type: '*/*'` — usuario puede adjuntar .exe, .mp4, etc. | Datos basura |
| 10 | Sentry DSN hardcodeado en el código fuente | Seguridad/buenas prácticas |

---

## Resumen: Escenarios de "Hazlo Explotar"

| # | Escenario | Resultado |
|---|-----------|-----------|
| 🔴 1 | Abrir Reportes teniendo créditos | CRASH (`.pagos` undefined) |
| 🔴 2 | Crear crédito con tasa 50% y cuota baja, luego ver proyección | FREEZE 30+ segundos |
| 🔴 3 | Eliminar crédito mientras se ve su detalle | Pantalla en blanco |
| 🟠 4 | Registrar pago desde vista global de Pagos | Mes incorrecto |
| 🟠 5 | Abrir app 5 veces seguidas con créditos activos | 5x notificaciones |
| 🟠 6 | Importar archivo .txt renombrado a .db | Datos corrompidos |
| 🟠 7 | Toca error en formulario → no ve cuál campo falló | Errores invisibles |
| 🟡 8 | Crear crédito sin plazo y verlo en 3 pantallas distintas | 3 resultados diferentes |
| 🟡 9 | Intentar PINs 0000-9999 sin parar | Acceso en ~3 horas |
| 🟡 10 | Abrir documento adjunto en Android 10+ | No abre, sin error visible |

---

## Prioridad de Corrección Sugerida

### Sprint 1 (Urgente — Crashers)
1. ~~CRASH-01~~: Cambiar `getCreditos()` a `getCreditosConPagos()` en reportes y priorización
2. ~~CRASH-02~~: Detectar `cuota <= interés` y romper el loop con advertencia
3. ~~BUG-01~~: Corregir off-by-one en paso de mes a PagoForm

### Sprint 2 (Alto — Integridad de Datos)
4. BUG-03: Agregar `borderWidth: 1.5` al estilo base de Input y Select
5. BUG-05: Cancelar notificaciones existentes antes de crear nuevas
6. BUG-06: Validar SQLite magic bytes en importación

### Sprint 3 (Medio — Robustez)
7. EDGE-03: Implementar lockout tras 5 intentos fallidos
8. EDGE-02: Unificar default de `plazoMeses` en toda la app
9. EDGE-01: Permitir tracking de pagos en créditos con saldo 0

### Sprint 4 (Mejoras)
10. EDGE-04: Advertir al usuario sobre seguridad de API keys
11. BUG-02: Agregar confirmación a todas las eliminaciones
12. Loading states y error boundaries

---

*Reporte generado automáticamente por pruebas de abogado del diablo.*
