# Reporte 2: Auditoría de UX (Experiencia de Usuario)

> **Proyecto:** Debtless (Expo / React Native)  
> **Fecha:** 22 de febrero de 2026  
> **Enfoque:** Flujos de usuario, estados de carga, accesibilidad, consistencia visual, fricción

---

## 1. Flujo de Primer Uso (Onboarding)

### ✅ Lo que funciona
- Onboarding de 3 pasos (Bienvenida → Notificaciones → Privacidad) es claro y conciso.
- Creación de PIN obligatoria antes de acceder a la app.

### ⚠️ Problemas detectados

| # | Problema | Severidad | Archivo |
|---|---------|-----------|---------|
| 1 | **No hay botón "Saltar"** en el onboarding — el usuario debe pasar las 3 pantallas obligatoriamente | Media | `OnboardingScreen.tsx` |
| 2 | **Sin transición animada** entre pasos — cambio abrupto de contenido | Baja | `OnboardingScreen.tsx` |
| 3 | **Texto no traducido** — Todo está en español hardcodeado, a pesar de tener sistema i18n | Media | `OnboardingScreen.tsx` |
| 4 | **Sin opción biométrica** — Solo PIN de 4 dígitos, sin FaceID/TouchID | Alta | `LoginScreen.tsx` |
| 5 | **Sin feedback al fallar el PIN** más allá de un toast — no hay vibración, shake, ni contador de intentos | Media | `LoginScreen.tsx` |

---

## 2. Dashboard (Pantalla Principal)

### ✅ Lo que funciona
- Vista resumida de deuda total con porcentaje de progreso
- Timeline de próximos eventos (fechas de corte, pagos)
- Acceso rápido a pagos pendientes con botón "Pagar"

### ⚠️ Problemas detectados

| # | Problema | Severidad |
|---|---------|-----------|
| 1 | **Estado vacío no amigable** — Si el usuario no tiene créditos, ve "No hay créditos registrados" sin call-to-action para crear uno | Alta |
| 2 | **12 animaciones flotantes** de monedas simultáneas — posible lag en dispositivos de gama baja | Media |
| 3 | **Lógica de "mejor momento para comprar"** podría confundir — falta tooltip/explicación de qué significa | Media |
| 4 | **Los eventos se limitan a 5** sin opción de "Ver todos" | Baja |
| 5 | **Si la función de carga falla, no hay indicador de error** — silencioso, el usuario ve datos vacíos sin saber por qué | Alta |

---

## 3. Gestión de Créditos (CRUD)

### ✅ Lo que funciona
- Formulario completo con todos los campos financieros relevantes
- Extracción AI de estados de cuenta (OpenAI, Claude, Gemini)
- Filtros y búsqueda en la lista de créditos
- Vista de detalle con tabs (Detalle, Pagos, Documentos)

### ⚠️ Problemas detectados

| # | Problema | Severidad |
|---|---------|-----------|
| 1 | **Sin confirmación al salir del formulario** — el usuario pierde datos si navega accidentalmente | Alta |
| 2 | **No hay validación cruzada** — Puede ingresar saldoActual > limiteCredito para tarjetas | Media |
| 3 | **Pantalla de detalle muestra blank** mientras carga — `if (!credito) return null` sin skeleton/spinner | Alta |
| 4 | **Las 3 tabs del detalle se montan simultáneamente** — carga innecesaria de pagos + documentos | Media |
| 5 | **Sin feedback de éxito al editar** — `router.back()` directo sin toast de confirmación | Media |
| 6 | **El prompt de AI es genérico** y no explica qué formato de imagen funciona mejor | Baja |
| 7 | **Sin debounce en el botón de AI** — múltiples taps = múltiples llamadas API simultáneas | Alta |

---

## 4. Registro de Pagos

### ✅ Lo que funciona
- Keypad personalizado estilo ATM — atractivo visualmente
- Soporte para "Nuevo Saldo" en tarjetas de crédito
- Vista mensual con badges de estado (pagado, pendiente, vencido)

### ⚠️ Problemas detectados

| # | Problema | Severidad |
|---|---------|-----------|
| 1 | **Bug de off-by-one en el mes** — `pagos/index.tsx` pasa mes 1-based pero `PagoForm` espera 0-based. Posible registro en mes incorrecto | 🔴 Crítico |
| 2 | **Eliminación sin confirmación** en la vista global de pagos — contrasta con la vista de crédito que SÍ confirma | Alta |
| 3 | **Sin límite de decimales en el teclado** — puede ingresar $123.456789 | Media |
| 4 | **"Nuevo Saldo" opcional para tarjetas** — si se omite, el saldo no se actualiza y el usuario queda confundido | Alta |
| 5 | **Sin accesibilidad** — el teclado personalizado no es compatible con lectores de pantalla | Alta |
| 6 | **Mes por defecto salta al siguiente** si es pasado el día 15 — podría confundir al usuario que quiere ver el mes actual | Media |

---

## 5. Priorización de Deudas

### ✅ Lo que funciona
- Comparación visual Avalancha vs Bola de Nieve
- Input de presupuesto mensual para simular
- Tabla comparativa clara

### ⚠️ Problemas detectados

| # | Problema | Severidad |
|---|---------|-----------|
| 1 | **Sin indicador de carga** mientras calcula las estrategias | Media |
| 2 | **Sin validación de presupuesto mínimo** — si es menor que la suma de pagos mínimos, resultados engañosos | Alta |
| 3 | **Crash potencial** — usa `Credito` casteado a `CreditoConPagos` (ver Reporte Arquitectura §2.2) | 🔴 Crítico |

---

## 6. Proyecciones y Reportes

### ✅ Lo que funciona
- Gráficas claras con react-native-chart-kit
- Tablas de amortización detalladas
- Compartir reporte como imagen

### ⚠️ Problemas detectados

| # | Problema | Severidad |
|---|---------|-----------|
| 1 | **Máximo 5 créditos seleccionables** sin feedback visual al intentar agregar un 6to | Media |
| 2 | **Tablas largas sin virtualización** — 360 filas de amortización se renderizan todas, posible lag | Alta |
| 3 | **Fila seleccionada con fondo primario** — texto puede ser ilegible | Media |
| 4 | **Proyecciones capped a 120 meses** — hipotecas de 30 años quedan truncadas | Alta |
| 5 | **Tasa promedio es aritmética** en vez de ponderada — métrica financieramente incorrecta | Media |
| 6 | **Crash potencial en Reportes** — misma confusión `Credito` vs `CreditoConPagos` | 🔴 Crítico |

---

## 7. Configuración

### ✅ Lo que funciona
- Cambio de tema (Claro/Oscuro/Sistema)
- Selector de idioma
- Backup y restauración de datos

### ⚠️ Problemas detectados

| # | Problema | Severidad |
|---|---------|-----------|
| 1 | **Botón "Atrás" de Android no funciona** en sub-menús (usa estado interno, no rutas) | Alta |
| 2 | **Datos de perfil falsos** — "Mi Perfil" y "usuario@credito.app" — confuso | Media |
| 3 | **Importar DB corrupta** solo valida extensión, no contenido — puede romper la app | Alta |
| 4 | **Sin reinicio automático** después de importar base de datos | Media |
| 5 | **Campo de API key sin "mostrar"** — no puede verificar lo que ingresó | Baja |
| 6 | **Logos de AI providers** cargados desde URLs de Wikipedia — podrían dejar de funcionar | Baja |

---

## 8. Sistema de Diseño y Consistencia Visual

| Área | Estado | Nota |
|------|--------|------|
| Paleta de colores | ⚠️ | Colores neón (#CCFF00, #FF00FF) podrían no pasar WCAG para contraste |
| Tipografía | ✅ | Space Grotesk + sistema consistente de tamaños |
| Espaciado | ✅ | Sistema de spacing tokens bien definido |
| Bordes de error | ❌ | `borderColor` sin `borderWidth` → errores de validación invisibles en Input y Select |
| Sombras | ✅ | Elevación consistente en cards |
| Tab bar personalizado | ⚠️ | Botón central rotado 45° — el ícono parece diagonal, posible confusión |
| Toasts | ⚠️ | Solo uno a la vez, posición hardcodeada que puede solaparse con tab bar |

---

## 9. Accesibilidad

| Criterio | Estado | Detalle |
|----------|--------|---------|
| Lectores de pantalla | ❌ | Keypad de pagos sin `accessibilityLabel` |
| Contraste de color | ⚠️ | Colores neón sobre fondos oscuros — revisar ratio |
| Tamaño de targets | ✅ | Botones de 56px+ de altura |
| Navegación por teclado | N/A | App móvil |
| Texto escalable | ⚠️ | Muchos tamaños fijos en `fontSize`, no respetan settings del sistema |

---

## 10. Puntuación UX por Área

| Área | Nota | Comentario |
|------|------|------------|
| Primer uso / Onboarding | 6/10 | Funcional pero rígido y sin skip |
| Dashboard | 7/10 | Buena información, falta empty state |
| Crear/Editar crédito | 6/10 | Formulario completo pero sin guard de salida |
| Registro de pagos | 5/10 | Bug de mes + sin accesibilidad |
| Priorización | 5/10 | Funcional pero crash potencial + sin loading |
| Proyecciones | 6/10 | Buenos gráficos, problemas de performance |
| Configuración | 5/10 | Back button roto en Android |
| Consistencia visual | 7/10 | Bueno en general, errores de validación invisibles |
| Accesibilidad | 3/10 | Mínima |
| **Promedio** | **5.6/10** | |

---

*Reporte generado automáticamente por auditoría de UX.*
