# Documento de Diseño UX/UI
## Aplicativo de Créditos (basado en referencias visuales compartidas)

### 1. Propósito del documento
Definir la dirección de diseño (UX + UI) para un **aplicativo móvil de créditos** inspirado en las referencias compartidas: interfaces fintech, UI kits móviles, estilos dark/light, gradientes, dashboards financieros y estética de marca disruptiva.

Este documento sirve como base para:
- Diseño de producto (UX/UI)
- Desarrollo front-end móvil
- Alineación con negocio/riesgo/compliance
- Prototipado y pruebas con usuarios

---

## 2. Lectura de las referencias (síntesis visual)
Las imágenes compartidas muestran una combinación muy útil para una app de créditos moderna:

### 2.1 Patrones detectados
1. **UI modular tipo fintech**
   - Tarjetas (cards) como elemento principal
   - Formularios limpios de login/onboarding
   - Listados de movimientos / datos financieros
   - Navegación inferior (bottom nav)

2. **Uso fuerte de gradientes y colores vibrantes**
   - Morado / azul / cian / rosa como base visual
   - Acentos cálidos (naranja/amarillo) para CTA o highlights
   - Combinación dark + light para distintos contextos

3. **Estética financiera moderna**
   - Dashboard con saldo, métricas, historial y acciones rápidas
   - Visualización de datos (gráficas simples, tendencias, barras)
   - Tarjeta virtual/física visible en home

4. **Branding disruptivo / joven (estilo “UGLYCASH”)**
   - Tono visual más atrevido, editorial y urbano
   - Espacios en blanco + contraste alto
   - Elementos promocionales tipo campaña (APY / rewards / promo badges)

5. **Ilustraciones 3D/isométricas para onboarding y educación**
   - Útiles para explicar créditos, pagos, riesgo, beneficios y uso responsable

### 2.2 Conclusión de dirección visual
Se recomienda un enfoque híbrido:
- **Base UX funcional fintech** (claridad, confianza, data-first)
- **Capa visual moderna/diferenciadora** (branding joven con gradientes y promos)
- **Soporte dark/light** según contexto (operación vs marketing)

---

## 3. Objetivo del producto
Crear una app móvil de créditos que permita al usuario:
- Registrarse y validar identidad
- Simular un crédito
- Solicitar crédito digitalmente
- Ver estado de solicitud
- Recibir desembolso
- Gestionar pagos, fechas y recordatorios
- Consultar saldo, historial y beneficios
- Recibir ofertas personalizadas

### Objetivos de negocio (ejemplo)
- Aumentar conversión de solicitud completada
- Reducir abandono en onboarding/KYC
- Mejorar pago puntual mediante recordatorios y experiencia clara
- Incrementar reutilización (repeat loans)

---

## 4. Público objetivo (personas)
### Persona A: Usuario primerizo
- 20–35 años
- Usa apps financieras pero no entiende términos complejos
- Necesita confianza, claridad y guía paso a paso

### Persona B: Usuario recurrente
- Ya ha usado créditos
- Busca rapidez: monto, plazo, aprobación y pago
- Valora dashboard, historial y acciones rápidas

### Persona C: Usuario con baja alfabetización financiera
- Necesita lenguaje simple
- Requiere visualización clara de cuotas, fechas y costo total
- Se beneficia de tutoriales cortos e ilustraciones

---

## 5. Principios de diseño
1. **Claridad antes que sofisticación**  
   La información financiera debe entenderse en segundos.

2. **Confianza visual**  
   Mostrar transparencia: monto, tasa, cuotas, fechas, costo total.

3. **Acción rápida**  
   CTA prominentes para solicitar, pagar, ver cronograma, soporte.

4. **Progresividad**  
   Onboarding y solicitud por pasos cortos, con avance visible.

5. **Inclusión y accesibilidad**  
   Contraste, tamaño de fuente, iconografía clara, microcopy simple.

6. **Marca memorable**  
   Estética fintech actual con personalidad (sin sacrificar legibilidad).

---

## 6. Arquitectura de información (IA)
### Navegación principal (Bottom Nav sugerido)
1. **Inicio**
2. **Créditos**
3. **Pagos**
4. **Historial**
5. **Perfil / Más**

### Estructura de módulos
- **Inicio (Dashboard)**
  - Saldo / crédito disponible
  - Estado del préstamo actual
  - Próxima cuota
  - CTA rápidos (Pagar, Simular, Solicitar)
  - Promociones / beneficios

- **Créditos**
  - Simulador
  - Nueva solicitud
  - Estado de solicitud
  - Ofertas preaprobadas

- **Pagos**
  - Próximas cuotas
  - Cronograma
  - Métodos de pago
  - Pago parcial / total
  - Comprobante

- **Historial**
  - Créditos anteriores
  - Movimientos
  - Cargos / abonos
  - Estados y filtros

- **Perfil / Más**
  - Datos personales
  - Seguridad
  - Notificaciones
  - Soporte
  - Documentos / Términos

---

## 7. Flujos clave de usuario (UX)

### 7.1 Onboarding y registro
**Objetivo:** reducir fricción y generar confianza.

**Flujo recomendado:**
1. Pantalla de bienvenida (propuesta de valor)
2. Registro (teléfono/email)
3. Verificación OTP
4. Creación de PIN/contraseña
5. Aceptación de términos
6. Activación biometría (opcional)

**Buenas prácticas visuales (según referencias):**
- Formularios de 1 foco por pantalla
- Botón primario claro y sticky si es necesario
- Barra de progreso discreta

### 7.2 KYC / Validación de identidad
1. Captura de DUI/ID
2. Selfie / prueba de vida
3. Datos personales
4. Datos laborales / ingresos
5. Cuenta bancaria / método de desembolso
6. Confirmación

**UX note:** usar ilustraciones 3D/isométricas para explicar por qué se solicita cada dato.

### 7.3 Simulación de crédito
1. Selección de monto (slider/input)
2. Selección de plazo
3. Resumen: cuota estimada, tasa, comisión, costo total
4. CTA: “Continuar solicitud”

**Clave:** mostrar siempre datos transparentes antes de avanzar.

### 7.4 Solicitud de crédito
1. Confirmación de datos
2. Validaciones automáticas
3. Estado “en revisión”
4. Resultado: aprobado / pendiente / rechazado
5. Si aprobado: firma digital + desembolso

### 7.5 Gestión de pagos
1. Ver próxima cuota
2. Elegir método (wallet / tarjeta / banco)
3. Pagar
4. Confirmación + comprobante
5. Actualización de estado y saldo

### 7.6 Cobranza preventiva (no agresiva)
- Recordatorios amigables
- Estado de mora claro
- Opciones: refinanciar / promesa de pago / soporte

---

## 8. Pantallas principales (especificación funcional + visual)

### 8.1 Splash / Welcome
**Objetivo:** branding + inicio rápido.

**UI recomendada:**
- Fondo limpio (light) o gradiente suave
- Logo fuerte (estilo marca disruptiva)
- CTA primario: “Crear cuenta”
- CTA secundario: “Iniciar sesión”
- Mensaje corto de propuesta de valor

### 8.2 Login
Inspirado en los ejemplos de UI kit y fintech.

**Elementos:**
- Campo email/teléfono
- Campo contraseña/PIN
- Link “Olvidé mi contraseña”
- Botón login (gradiente o color de marca)
- Botón signup secundario
- Toggle de biometría (si aplica)

**Notas:**
- Mensajes de error claros bajo campo
- Estados focus/error/success

### 8.3 Home / Dashboard (pantalla más importante)
**Bloques recomendados:**
1. Header con saludo + notificaciones
2. Card principal de saldo / crédito disponible
3. Estado del préstamo actual
4. Próxima cuota (monto + fecha)
5. Acciones rápidas:
   - Solicitar crédito
   - Pagar cuota
   - Ver cronograma
   - Soporte
6. Sección promociones / loyalty
7. Resumen de movimientos recientes

**Patrón visual recomendado:**
- Tarjetas con esquinas redondeadas (12–20px)
- Gradiente en card principal
- Cards secundarias neutras para contraste

### 8.4 Simulador de crédito
**Elementos UX/UI:**
- Slider de monto + input manual
- Selector de plazo (chips o stepper)
- Card de resumen en tiempo real
- Desglose colapsable:
  - Capital
  - Interés
  - Comisión
  - Seguro (si aplica)
  - Costo total
- CTA “Continuar”

### 8.5 Estado de solicitud
**Estados:**
- Recibida
- En revisión
- Información adicional requerida
- Aprobada
- Rechazada

**Visual:**
- Stepper vertical con timestamps
- Etiquetas de estado (badges)
- CTA contextual (subir documento / firmar / contactar soporte)

### 8.6 Pantalla de préstamo activo
**Contenido:**
- Monto desembolsado
- Saldo pendiente
- Próxima cuota
- Progreso del crédito (barra)
- Cronograma de pagos
- Botón pagar ahora
- Botón liquidar anticipadamente

### 8.7 Cronograma de pagos
Inspirada en referencias con tablas/listas financieras.

**Formato recomendado:**
- Lista por cuota con:
  - # cuota
  - fecha
  - monto
  - estado (pagada / pendiente / vencida)
- Filtros por estado
- Exportar comprobante (si aplica)

### 8.8 Historial / Movimientos
**Patrón visual:** listas con icono + monto + fecha + estado.

**Tipos de movimiento:**
- Desembolso
- Pago recibido
- Comisión
- Penalidad (si aplica)
- Cashback / reward

### 8.9 Perfil y configuración
- Datos personales
- Métodos de pago
- Seguridad (PIN, biometría, dispositivos)
- Notificaciones
- Soporte/FAQ
- Términos y privacidad

---

## 9. Sistema visual (Design System)

### 9.1 Estilo general recomendado
**Fintech moderna + branding expresivo**
- Base limpia y legible
- Componentes simples y repetibles
- Gradientes en elementos clave (CTA/card principal)
- Ilustración 3D para onboarding/campañas

### 9.2 Paleta de color sugerida (basada en referencias)
> Ajustable a marca final. Valores sugeridos iniciales.

#### Neutros
- **Ink 900**: #17182A (fondos dark)
- **Ink 700**: #2A2C40 (cards dark)
- **Slate 300**: #C9CEDA (bordes suaves)
- **Cloud 100**: #F5F7FB (fondos light)
- **White**: #FFFFFF

#### Primarios (fintech)
- **Blue**: #5AA8FF
- **Purple**: #8E6BFF
- **Cyan**: #22D3EE

#### Acentos (CTA/promos)
- **Orange**: #FF9F2E
- **Yellow**: #FFC400
- **Pink**: #FF4FA3

#### Estados
- **Success**: #22C55E
- **Warning**: #F59E0B
- **Error**: #EF4444
- **Info**: #3B82F6

### 9.3 Gradientes recomendados
- **Primary Gradient:** Blue → Purple
- **Campaign Gradient:** Pink → Purple → Cyan
- **CTA Warm:** Orange → Yellow (para flujos promocionales)

### 9.4 Tipografía sugerida
- **UI / App:** Inter / SF Pro / Manrope
- **Brand headlines (campaña):** Sans bold con personalidad (ej. Space Grotesk / Sora)

**Escala sugerida:**
- H1: 28–32
- H2: 22–24
- H3: 18–20
- Body: 14–16
- Caption: 12–13
- Micro: 10–11 (evitar en datos críticos)

### 9.5 Iconografía
- Iconos lineales, simples, consistentes (24px base)
- Estilo outline para navegación / filled para estados críticos
- Iconografía financiera clara: pago, calendario, tarjeta, alerta, soporte

### 9.6 Ilustraciones
- Isométricas/3D para:
  - onboarding
  - educación financiera
  - estados vacíos
  - campañas/promos

**No usar** ilustración decorativa en pantallas críticas de pago si afecta legibilidad.

---

## 10. Componentes UI (catálogo mínimo)

### 10.1 Botones
- **Primary** (relleno / gradiente)
- **Secondary** (outline)
- **Tertiary** (texto)
- **Destructive** (error)
- **Loading state**
- **Disabled state**

### 10.2 Inputs / Forms
- Text input
- Phone input con prefijo
- Amount input (moneda)
- Password/PIN input
- OTP input
- Select/dropdown
- Date picker
- Toggle/switch
- Checkbox/consentimiento

### 10.3 Cards
- Saldo/resumen
- Oferta de crédito
- Próxima cuota
- Método de pago
- Promo/reward
- Estado de solicitud

### 10.4 Navegación
- Bottom nav (5 tabs)
- Top app bar
- Tabs segmentados (ej. pendientes / pagadas)
- Breadcrumbs ligeros para flujos largos (opcional)

### 10.5 Feedback y estados
- Toasts
- Banners informativos
- Modales de confirmación
- Empty states
- Error states con acción de recuperación

### 10.6 Data visualization
- Mini gráfica de pagos / tendencia
- Barras de progreso (avance del crédito)
- Timeline de solicitud

---

## 11. Tono y microcopy (UX Writing)
### Principios
- Claro
- Humano
- Transparente
- Sin jerga financiera innecesaria

### Ejemplos de tono
- ✅ “Tu próxima cuota vence el 15 de marzo”
- ✅ “Paga hoy para evitar recargos”
- ✅ “Te falta 1 documento para completar tu solicitud”
- ❌ “Pendiente de regularización por mora acumulada” (demasiado técnico si no se explica)

### Recomendación
Incluir glosario o tooltips para términos como:
- Tasa efectiva
- Costo total
- Mora
- Refinanciamiento

---

## 12. Accesibilidad (obligatorio)
- Contraste mínimo AA (texto/CTA)
- Texto escalable (Dynamic Type si aplica)
- Objetivos táctiles >= 44x44 px
- No depender solo del color para estados
- Iconos + texto en alertas
- Soporte lector de pantalla (labels)

---

## 13. Seguridad y confianza en la experiencia (UX de compliance)
El diseño debe comunicar seguridad sin generar fricción excesiva.

### Elementos visuales de confianza
- Indicadores de sesión segura
- Explicación breve de por qué se piden datos
- Confirmación de transacciones con comprobante
- Historial auditado de movimientos
- Autenticación biométrica/PIN

### Puntos críticos a diseñar con detalle
- Consentimiento de tratamiento de datos
- Firma digital
- Autorización de débito/pago
- Manejo de errores en pago
- Reintentos seguros

---

## 14. Estados críticos del negocio (deben existir en UI)
### Solicitud
- Draft / incompleta
- En revisión
- Requiere documentos
- Aprobada
- Rechazada
- Expirada

### Crédito
- Activo
- Próxima cuota próxima
- Vencimiento hoy
- Vencido / mora
- Refinanciado
- Liquidado

### Pago
- Procesando
- Exitoso
- Fallido
- Reversado

---

## 15. Estrategia visual recomendada (2 modos)
### Modo A: Operativo (trust-first)
- Fondos claros
- Más espacio en blanco
- Gradientes solo en CTA/card principal
- Ideal para login, pagos, contratos, estados

### Modo B: Marketing / adquisición (brand-first)
- Visual fuerte, headlines grandes, promos
- Uso de gradientes, badges, campañas
- Ideal para splash, landing in-app, rewards, referidos

> Recomendación: combinar ambos. La app core debe priorizar **trust-first** y usar la estética más disruptiva en campañas y home modules.

---

## 16. MVP propuesto (pantallas mínimas)
1. Splash / Bienvenida
2. Registro / Login
3. OTP
4. Home Dashboard
5. Simulador de crédito
6. Solicitud (multi-step)
7. Estado de solicitud
8. Crédito activo
9. Cronograma de pagos
10. Pago (checkout)
11. Confirmación de pago
12. Historial
13. Perfil / Seguridad
14. Soporte / FAQ

---

## 17. Métricas UX/Product sugeridas
### Conversión
- % registro completado
- % KYC completado
- % solicitud enviada
- % aprobación

### Fricción
- Drop-off por paso del onboarding
- Tiempo promedio para solicitud
- Errores por campo/formulario

### Uso y retención
- DAU/WAU
- Retorno a app antes de fecha de pago
- % usuarios que usan recordatorios

### Cobranza / salud
- % pago puntual
- % mora temprana
- % uso de refinanciación

---

## 18. Roadmap de diseño (recomendado)
### Fase 1: Discovery (1–2 semanas)
- Benchmark fintech local/regional
- Definición de usuarios y journeys
- Requisitos legales/compliance

### Fase 2: UX base (2–3 semanas)
- Flujos detallados
- Arquitectura de información
- Wireframes low/mid fidelity

### Fase 3: UI system + prototipo (2–4 semanas)
- Design system v1
- Pantallas clave high fidelity
- Prototipo navegable

### Fase 4: Validación (1–2 semanas)
- Pruebas con usuarios
- Ajustes de copy y fricción
- Iteración para desarrollo

---

## 19. Entregables esperados del equipo de diseño
- User flows (Figma)
- Wireframes MVP
- UI Kit / Design System v1 (tokens + componentes)
- Prototipo clickable
- Especificaciones de interacción (microanimaciones, estados)
- Hand-off a desarrollo (spacing, typography, colors, assets)

---

## 20. Recomendaciones finales (basadas en tus referencias)
1. **Tomar la estructura fintech limpia** de los UI kits como base del producto.
2. **Usar gradientes y branding disruptivo** de forma estratégica (home/campañas), no en exceso en pantallas críticas.
3. **Incorporar ilustraciones 3D/isométricas** en onboarding y educación financiera para mejorar comprensión.
4. **Diseñar primero el flujo de crédito y pago** (core value), luego rewards/loyalty/promos.
5. **Mantener transparencia financiera total** (cuotas, tasas, costo total) para confianza y conversión.

---

## 21. Próximo paso sugerido
Convertir este documento en:
- **Wireframes MVP**
- **Mapa de pantallas**
- **Design System inicial (tokens + componentes)**
- **Prototipo Figma de 10–14 pantallas**

Si quieres, en el siguiente paso te lo puedo aterrizar en formato **Figma-ready** con:
- nombres de frames,
- estructura de componentes,
- tokens de color/tipografía,
- y flujo completo de onboarding → solicitud → pago.

