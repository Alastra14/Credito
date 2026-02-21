# Diseño UX/UI — Aplicativo de Gestión de Créditos Personales
**Versión:** 1.0  
**Fecha:** 20 de febrero de 2026  
**Plataforma:** Web (escritorio), uso personal

---

## 1. Dirección visual

El aplicativo prioriza la **claridad financiera** y la **confianza** sobre la expresividad de marca. Al ser de uso personal, el objetivo del diseño es que la información sea interpretable de un vistazo, sin ruido visual.

**Enfoque adoptado:** Fintech operativa (trust-first)
- Base limpia, fondos claros, tipografía legible
- Gradientes y color solo en elementos clave (CTA, card de saldo)
- Sin ilustraciones decorativas en pantallas críticas de pago o datos
- Dark/light: se implementa light mode base; dark mode como mejora futura

---

## 2. Paleta de colores

### Colores base (variables CSS en `globals.css`)

Los colores se definen como variables HSL y se usan a través de Tailwind y shadcn/ui.

| Variable | Valor HSL | Uso |
|---|---|---|
| `--background` | `0 0% 100%` | Fondo de página |
| `--foreground` | `222.2 84% 4.9%` | Texto principal |
| `--card` | `0 0% 100%` | Fondo de tarjetas |
| `--card-foreground` | `222.2 84% 4.9%` | Texto en tarjetas |
| `--primary` | `221.2 83.2% 53.3%` | Azul principal (botones, links) |
| `--primary-foreground` | `210 40% 98%` | Texto sobre primario |
| `--secondary` | `210 40% 96.1%` | Fondo secundario suave |
| `--muted` | `210 40% 96.1%` | Fondo apagado / labels |
| `--muted-foreground` | `215.4 16.3% 46.9%` | Texto secundario/gris |
| `--destructive` | `0 84.2% 60.2%` | Rojo para destructivo/error |
| `--border` | `214.3 31.8% 91.4%` | Bordes suaves |
| `--radius` | `0.5rem` | Border radius global |

### Colores semánticos de estado (Tailwind directo)

| Estado | Color Tailwind | Ejemplo de uso |
|---|---|---|
| Pagado / Éxito | `green-100` / `green-800` | Badge PAGADO |
| Pendiente / Warning | `yellow-100` / `yellow-800` | Badge PENDIENTE |
| Vencido / Error | `red-100` / `red-800` | Badge VENCIDO |
| Parcial / Info | `blue-100` / `blue-800` | Badge PARCIAL |

---

## 3. Tipografía

**Familia:** Inter (Google Fonts, cargada vía `next/font`)

| Nivel | Tamaño | Peso | Uso |
|---|---|---|---|
| H1 | 30px (`text-3xl`) | 700 | Títulos de página principales |
| H2 | 24px (`text-2xl`) | 600 | Títulos de sección / card titles |
| H3 | 20px (`text-xl`) | 600 | Sub-secciones |
| Body | 14–16px (`text-sm` / `text-base`) | 400 | Texto general, formularios |
| Caption | 12px (`text-xs`) | 400 | Labels, meta información |

**Configuración `font-feature-settings`:** `"rlig" 1, "calt" 1` (ligaduras tipográficas activas) — ya en `globals.css`.

---

## 4. Espaciado y layout

**Sistema:** Tailwind CSS (escala base 4px)

| Uso | Valor |
|---|---|
| Padding de cards | `p-6` (24px) |
| Gap entre elementos | `gap-4` (16px) / `gap-6` (24px) |
| Ancho del sidebar | `w-64` (256px) |
| Ancho máximo de contenido | `max-w-7xl` centrado |
| Border radius general | `rounded-lg` (var(--radius) = 0.5rem) |
| Altura de inputs y botones | `h-10` (40px) |

---

## 5. Componentes UI (catálogo)

Todos los componentes están en `src/components/ui/` y usan `class-variance-authority` + `cn()` para variantes.

### 5.1 Badge
Variantes disponibles: `default`, `secondary`, `destructive`, `outline`, `success`, `warning`

```tsx
<Badge variant="success">PAGADO</Badge>
<Badge variant="warning">PENDIENTE</Badge>
<Badge variant="destructive">VENCIDO</Badge>
```

### 5.2 Button
Variantes: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`  
Tamaños: `default` (h-10), `sm` (h-9), `lg` (h-11), `icon` (h-10 w-10)

```tsx
<Button variant="default">Guardar</Button>
<Button variant="outline">Cancelar</Button>
<Button variant="destructive">Eliminar</Button>
```

### 5.3 Card
Estructura: `Card > CardHeader > CardTitle + CardDescription` y `Card > CardContent`

```tsx
<Card>
  <CardHeader>
    <CardTitle>Total Deuda</CardTitle>
    <CardDescription>Saldo consolidado</CardDescription>
  </CardHeader>
  <CardContent>$45,000</CardContent>
</Card>
```

### 5.4 Dialog
Para confirmaciones de eliminación y formularios de pago rápido.

```tsx
<Dialog>
  <DialogTrigger asChild><Button>Registrar Pago</Button></DialogTrigger>
  <DialogContent>
    <DialogHeader><DialogTitle>Nuevo Pago</DialogTitle></DialogHeader>
    {/* form */}
    <DialogFooter><Button>Confirmar</Button></DialogFooter>
  </DialogContent>
</Dialog>
```

### 5.5 Input / Textarea / Select / Label
Componentes nativos estilizados con clases Tailwind consistentes. Altura uniforme `h-10`, border `border-input`, focus ring `focus-visible:ring-ring`.

---

## 6. Arquitectura de pantallas

### 6.1 Layout raíz
```
┌────────────────────────────────────────────┐
│  Sidebar (w-64, fixed)  │  Main Content    │
│                         │                  │
│  Logo                   │  Header          │
│  ─────────────          │  (título página) │
│  Dashboard              │                  │
│  Créditos               │  <Page Content>  │
│  Pagos                  │                  │
│  Proyecciones           │                  │
│  Priorización           │                  │
│  Reportes               │                  │
└─────────────────────────┴──────────────────┘
```

### 6.2 Dashboard (`/`)

```
┌──────────────────────────────────────────────┐
│  Deuda Total         Próximos Pagos (mes)    │
│  $XX,XXX.XX          [tabla 5 créditos]      │
│                                              │
│  Distribución por Tipo   Accesos rápidos     │
│  [Pie chart mini]        [Btn Nuevo Crédito] │
│                          [Btn Registrar Pago]│
│  Alertas Vencidos                            │
│  [badge rojo] Visa Banco X  vence 15/02     │
└──────────────────────────────────────────────┘
```

### 6.3 Lista de Créditos (`/creditos`)

```
┌──────────────────────────────────────────────┐
│  Créditos              [+ Nuevo Crédito]     │
│  Filtro: [Tipo ▼]  [Estado ▼]               │
│  ────────────────────────────────────────    │
│  [CreditoCard] Visa Banco X  TARJETA         │
│    Saldo: $12,000  Tasa: 24%  [Ver] [Editar] │
│  [CreditoCard] Hipoteca Casa HIPOTECA        │
│    Saldo: $890,000  Tasa: 9%  [Ver] [Editar] │
└──────────────────────────────────────────────┘
```

### 6.4 Control Mensual de Pagos (`/pagos`)

```
┌──────────────────────────────────────────────┐
│  Pagos  [< Enero 2026 >]                     │
│  Total pagado: $X,XXX  Pendiente: $X,XXX     │
│  ────────────────────────────────────────    │
│  Crédito          Cuota    Estado   Acción   │
│  Visa Banco X     $3,000   PAGADO            │
│  Hipoteca Casa    $8,500   PENDIENTE [Pagar] │
│  Préstamo Auto    $2,200   VENCIDO  [Pagar]  │
└──────────────────────────────────────────────┘
```

Estados con código de color:
- 🟢 `PAGADO` → `Badge variant="success"`
- 🟡 `PENDIENTE` → `Badge variant="warning"`
- 🔴 `VENCIDO` → `Badge variant="destructive"`
- 🔵 `PARCIAL` → `Badge variant="default"`

### 6.5 Proyecciones (`/proyecciones`)

```
┌──────────────────────────────────────────────┐
│  Proyecciones  Pago extra: [$___/mes]        │
│                                              │
│  [Selector de crédito ▼]                    │
│  Finalización estimada: Marzo 2028           │
│                                              │
│  [Gráfica línea: saldo restante mes a mes]  │
│                                              │
│  Tabla de amortización                       │
│  Mes | Cuota | Interés | Capital | Saldo    │
│   1  | 8,500 |  6,675  |  1,825  | 888,175 │
│  ...                                         │
└──────────────────────────────────────────────┘
```

### 6.6 Priorización (`/priorizacion`)

```
┌──────────────────────────────────────────────┐
│  Priorización  Presupuesto: [$___/mes]       │
│                                              │
│  ┌─────────────────┐ ┌────────────────────┐  │
│  │ 🏆 AVALANCHA    │ │ ❄️ BOLA DE NIEVE   │  │
│  │ Menor interés   │ │ Más motivador      │  │
│  │ Meses: 48       │ │ Meses: 54          │  │
│  │ Interés: $X,XXX │ │ Interés: $X,XXX    │  │
│  │ [RECOMENDADO]   │ │                    │  │
│  └─────────────────┘ └────────────────────┘  │
│                                              │
│  Tabla comparativa detallada                 │
│  Crédito | Orden | Cuota | Saldo Final      │
└──────────────────────────────────────────────┘
```

### 6.7 Reportes (`/reportes`)

```
┌──────────────────────────────────────────────┐
│  Reportes                                    │
│                                              │
│  [Bar Chart: Tasas de interés por crédito]  │
│                                              │
│  [Pie Chart: Distribución de deuda]         │
│                                              │
│  [Progress bars: % pagado por crédito]      │
│                                              │
│  Tabla resumen completa                      │
└──────────────────────────────────────────────┘
```

---

## 7. Formulario de crédito (campos y condiciones)

### Campos siempre visibles

| Campo | Tipo input | Validación |
|---|---|---|
| Nombre | text | Requerido |
| Tipo | select | Requerido; afecta campos condicionales |
| Monto Total | number | Requerido, > 0 |
| Saldo Actual | number | Requerido, ≥ 0 |
| Tasa de Interés (% anual) | number | Requerido, > 0 |
| Fecha de Apertura | date | Requerido |
| Cuota Mensual | number | Requerido, > 0 |
| Estado | select | ACTIVO / PAGADO / CANCELADO |
| Notas | textarea | Opcional |

### Campos condicionales: solo `TARJETA_CREDITO`

| Campo | Tipo input |
|---|---|
| Fecha de Corte (día del mes) | number (1–31) |
| Fecha Límite de Pago (día del mes) | number (1–31) |
| Pago Mínimo | number |

### Campos condicionales: créditos con plazo fijo

| Campo | Tipo input | Tipos que lo muestran |
|---|---|---|
| Plazo (meses) | number | HIPOTECA, VEHICULO, PRESTAMO_PERSONAL, OTRO |

---

## 8. Estados de pago — lógica de cálculo

```
Para un crédito C en el mes M / año Y:
  pagos = pagos de C donde mes==M y anio==Y
  totalPagado = sum(pagos.monto)

  si totalPagado >= C.cuotaMensual  →  PAGADO
  si totalPagado > 0                →  PARCIAL
  si fecha_actual > fechaLimitePago 
     del mes M/Y y totalPagado == 0 →  VENCIDO
  en otro caso                      →  PENDIENTE
```

---

## 9. Gráficas (especificación Recharts)

| Gráfica | Tipo Recharts | Datos | Ubicación |
|---|---|---|---|
| Distribución de deuda | `PieChart` + `Pie` | `{ name: tipo, value: saldoActual }` | Dashboard (mini), Reportes |
| Tasas de interés | `BarChart` + `Bar` | `{ name: nombre, tasa: tasaInteres }` | Reportes |
| Progreso pagado | `BarChart` stacked | `{ name: nombre, pagado: %, pendiente: % }` | Reportes |
| Proyección de saldo | `LineChart` + `Line` | `{ mes: N, [creditoId]: saldo }` | Proyecciones |

Todos los componentes de gráficas deben declarar `"use client"` y envolver el `ResponsiveContainer` dentro de un `div` con altura fija para evitar errores de SSR.

---

## 10. Patrones de interacción

### Eliminar (confirmación obligatoria)
Siempre mostrar un `Dialog` de confirmación antes de cualquier DELETE. Mensaje español claro.

```
¿Eliminar "Visa Banco X"?
Esta acción eliminará todos los pagos y documentos asociados.
[Cancelar] [Eliminar]
```

### Registro de pago rápido
Desde la tabla de pagos mensuales, el botón "Pagar" abre un `Dialog` con:
- Monto (pre-rellenado con `cuotaMensual`)
- Fecha (hoy por defecto)
- Tipo (MENSUAL por defecto)
- Notas (opcional)

### Formularios — feedback visual
- Errores de validación: texto rojo debajo del campo con descripción
- Submit en proceso: botón con estado `disabled` + texto "Guardando..."
- Éxito: redirect o toast de confirmación

---

## 11. Navegación lateral (Sidebar)

| Ícono (lucide-react) | Etiqueta | Ruta |
|---|---|---|
| `LayoutDashboard` | Dashboard | `/` |
| `CreditCard` | Créditos | `/creditos` |
| `CalendarCheck` | Pagos | `/pagos` |
| `TrendingDown` | Proyecciones | `/proyecciones` |
| `Trophy` | Priorización | `/priorizacion` |
| `BarChart2` | Reportes | `/reportes` |

El link activo se resalta con `bg-primary/10 text-primary font-medium`.

---

## 12. Accesibilidad

- Contraste mínimo AA en texto/fondo (verificar con variables HSL definidas)
- Targets táctiles mínimos `h-10` (40px) en todos los botones e inputs
- Labels asociados a inputs via `htmlFor` / `id`
- Iconos decorativos con `aria-hidden="true"`
- Mensajes de error vinculados a inputs via `aria-describedby`
- Texto de status no depende solo del color (también usa texto explícito + ícono)
