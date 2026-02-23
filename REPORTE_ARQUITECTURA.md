# Reporte 1: Auditoría de Arquitectura

> **Proyecto:** Debtless (Expo / React Native)  
> **Fecha:** 22 de febrero de 2026  
> **Enfoque:** Estructura del código, patrones, separación de responsabilidades, escalabilidad

---

## 1. Visión General de la Arquitectura

| Capa | Tecnología | Estado |
|------|------------|--------|
| Framework | Expo SDK + expo-router | ✅ Correcto |
| Lenguaje | TypeScript | ⚠️ Uso parcial de `any` |
| Navegación | File-based routing (expo-router) | ✅ Correcto |
| Base de datos | expo-sqlite (local) | ⚠️ Sin migraciones |
| Estado global | React Context (Theme, Language, TabBar, Toast) | ✅ Suficiente |
| Notificaciones | expo-notifications | ⚠️ Duplicación |
| Gráficas | react-native-chart-kit | ✅ Funcional |
| Monitoreo | Sentry (@sentry/react-native) | ✅ Configurado |
| Autenticación | PIN + expo-secure-store | ⚠️ Débil |

---

## 2. Hallazgos Críticos

### 2.1 Base de Datos sin Sistema de Migraciones
**Archivo:** `src/lib/database.ts` (línea ~66-70)

```typescript
// Patrón actual (frágil):
try { await db.execAsync('ALTER TABLE creditos ADD COLUMN limiteCredito REAL'); } catch {}
```

**Problema:** Cada columna nueva requiere un `try/catch` adicional. No hay tabla de versiones ni control de esquema. Esto se romperá en cuanto haya 5+ migraciones acumuladas.

**Recomendación:** Implementar un sistema de migraciones basado en versión:
```typescript
const MIGRATIONS = [
  { version: 1, sql: 'CREATE TABLE creditos (...)' },
  { version: 2, sql: 'ALTER TABLE creditos ADD COLUMN limiteCredito REAL' },
];
```

---

### 2.2 Confusión de Tipos: `Credito` vs `CreditoConPagos`
**Archivos afectados:** `app/reportes/index.tsx`, `app/priorizacion/index.tsx`

```typescript
// ❌ getCreditos() retorna Credito[], NO tiene .pagos ni .documentos
const creditos = await getCreditos() as CreditoConPagos[];
// Luego se accede a:
creditos[0].pagos.filter(...)  // 💥 CRASH: pagos es undefined
```

**Problema:** El cast `as CreditoConPagos[]` oculta que los objetos no tienen las propiedades `pagos` ni `documentos`. Esto causa crashes en Reportes y Priorización.

**Recomendación:** Usar `getCreditosConPagos()` o crear un query específico que incluya los pagos.

---

### 2.3 Lógica de Negocio en Componentes de Pantalla
**Archivo:** `app/index.tsx`

El Dashboard contiene 80+ líneas de lógica para calcular:
- Fechas de corte y próximo pago
- Ventana de "mejor momento para comprar"
- Timeline de eventos por mes

**Problema:** Esta lógica debería estar en `src/lib/calculos/` o un servicio dedicado. Hace el componente difícil de testear y mantener.

---

### 2.4 Patrón N+1 en Consultas
**Archivo:** `app/index.tsx` (líneas 33-37)

```typescript
// ❌ Una consulta por cada crédito
const detalles = await Promise.all(
  creditos.map(c => getCreditoById(c.id))
);
```

**Recomendación:** Usar `getCreditosConPagos()` que hace un solo query.

---

### 2.5 Sin Transacciones en la Base de Datos
**Archivo:** `src/lib/database.ts`

`createCredito()` ejecuta: INSERT crédito → copiar archivos → INSERT documentos, todo sin `BEGIN TRANSACTION`. Si falla a mitad del camino, quedan datos huérfanos.

---

### 2.6 Archivos Huérfanos al Eliminar Créditos
**Archivo:** `src/lib/database.ts` (línea ~209)

`deleteCredito()` elimina registros via `CASCADE` en SQL, pero no borra los archivos físicos del sistema de archivos. Los documentos adjuntos quedan en disco indefinidamente.

---

## 3. Hallazgos de Severidad Media

### 3.1 `StyleSheet.create()` en Cada Render
Todas las pantallas usan el patrón:
```typescript
const styles = getStyles(colors); // Se ejecuta en CADA render
```

Debería memorizarse con `useMemo` o usar `StyleSheet.create` fuera del componente.

### 3.2 Defaults Inconsistentes para `plazoMeses`
| Archivo | Default |
|---------|---------|
| `app/creditos/nuevo.tsx` | 60 meses |
| `src/lib/calculos/proyeccion.ts` | 360 meses |

Un crédito sin plazo definido proyecta resultados radicalmente diferentes según dónde se calcule.

### 3.3 `Dimensions.get('window')` Capturado una Sola Vez
Múltiples archivos de gráficas capturan el ancho de pantalla al cargar el módulo. No se actualiza al rotar el dispositivo.

### 3.4 Internacionalización Incompleta (~5%)
Solo ~12 keys están traducidas en `LanguageContext.tsx`. El 95% del texto en la app está hardcodeado en español.

### 3.5 `formatCurrency` Hardcodeado a MXN
`src/lib/utils.ts` usa `currency: 'MXN'` fijo. No es configurable por el usuario.

---

## 4. Hallazgos Menores

| # | Hallazgo | Archivo |
|---|----------|---------|
| 1 | Imports no usados (`estadoPagoColor`, `useTheme` en utils, `Logo` en LoginScreen) | Varios |
| 2 | `fontWeight` importado pero no usado en `Card.tsx` | `src/components/ui/Card.tsx` |
| 3 | `TIPO_LABEL` duplicado en `DeudaPieChart.tsx` (ya existe en `utils.ts`) | `src/components/charts/DeudaPieChart.tsx` |
| 4 | Menu de configuración usa estado interno en vez de rutas anidadas → botón "atrás" de Android no funciona | `app/configuracion/index.tsx` |
| 5 | `colors: any` en todas las funciones `getStyles()` → pierde type-safety del tema | Todos los archivos |

---

## 5. Diagrama de Dependencias Problemáticas

```
app/reportes/index.tsx ──cast──→ CreditoConPagos[] ──accede──→ .pagos 💥
app/priorizacion/index.tsx ──cast──→ CreditoConPagos[] ──accede──→ .pagos 💥
                                        ↑
                              getCreditos() retorna Credito[] (SIN pagos)
```

---

## 6. Puntuación por Área

| Área | Nota | Comentario |
|------|------|------------|
| Estructura de carpetas | 8/10 | Bien organizada con separación clara |
| Tipado TypeScript | 5/10 | Demasiados `any` y casts inseguros |
| Manejo de errores | 3/10 | Casi inexistente, `try/finally` sin catch |
| Persistencia de datos | 4/10 | Funcional pero sin migraciones ni transacciones |
| Separación de responsabilidades | 5/10 | Lógica de negocio mezclada en pantallas |
| Escalabilidad | 4/10 | Problemas de rendimiento con datos grandes |
| **Promedio** | **4.8/10** | |

---

*Reporte generado automáticamente por auditoría de código.*
