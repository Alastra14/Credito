# PRD — Aplicativo de Gestión de Créditos Personales
**Versión:** 1.0  
**Fecha:** 20 de febrero de 2026  
**Tipo:** Uso personal, sin autenticación  
**Plataforma:** Web (escritorio)

---

## 1. Visión del producto

Aplicación web personal para gestionar de forma centralizada todos los créditos del usuario (tarjetas de crédito, hipotecas, vehículos, préstamos personales). El objetivo es tener visibilidad total sobre la deuda, controlar pagos mensuales, proyectar cuándo se termina de pagar cada crédito y recibir sugerencias inteligentes de priorización de pagos.

---

## 2. Problema que resuelve

| Problema | Impacto |
|---|---|
| Los créditos están dispersos en diferentes instituciones | No hay vista consolidada de la deuda total |
| No se sabe cuánto se pagará en intereses a lo largo del tiempo | Falta de claridad financiera para planificar |
| Sin sistema para saber si un pago fue registrado o está vencido | Riesgo de moras y cargos extra |
| No hay comparación entre estrategias de pago | Se paga más de lo necesario en intereses |
| Documentos de crédito dispersos o perdidos | Dificultad para hacer seguimiento de contratos |

---

## 3. Usuarios objetivo

**Usuario único:** propietario de la aplicación (uso personal, sin registro ni autenticación).

Perfil funcional:
- Tiene entre 2 y 8 créditos activos simultáneamente
- Conoce sus tasas de interés y fechas de pago
- Quiere planificar pagos adicionales para salir de deudas antes
- Necesita archivar contratos y estados de cuenta en un solo lugar

---

## 4. Alcance del MVP

### 4.1 Módulos incluidos

| Módulo | Descripción |
|---|---|
| **Dashboard** | Resumen de deuda total, próximos pagos, alertas de vencimientos |
| **CRUD Créditos** | Crear, editar, ver y eliminar créditos con todos los campos por tipo |
| **Control Mensual de Pagos** | Tabla mes a mes con estado de cada crédito (Pagado / Pendiente / Vencido) |
| **Proyección de Pagos** | Tabla de amortización por crédito, fecha estimada de finalización, simulador de pago extra |
| **Priorización Inteligente** | Comparación Método Avalancha vs Bola de Nieve con recomendación |
| **Documentos** | Subida, listado, descarga y eliminación de archivos por crédito (PDF/imagen, máx 10 MB) |
| **Reportes** | Gráficas comparativas de tasas, distribución de deuda, progreso por crédito |

### 4.2 Fuera de alcance (MVP)
- Autenticación y multi-usuario
- Notificaciones push o email
- Sincronización con bancos (open banking)
- App móvil nativa
- Multi-moneda
- Exportación a PDF/Excel

---

## 5. Tipos de crédito soportados

| Código | Etiqueta visible |
|---|---|
| `TARJETA_CREDITO` | Tarjeta de Crédito |
| `HIPOTECA` | Hipoteca |
| `VEHICULO` | Vehículo |
| `PRESTAMO_PERSONAL` | Préstamo Personal |
| `OTRO` | Otro |

Campos condicionales por tipo:
- **Tarjeta de crédito:** `fechaCorte`, `fechaLimitePago`, `pagoMinimo` (campos adicionales visibles solo para este tipo)
- **Cuotas fijas:** `plazoMeses` visible (Hipoteca, Vehículo, Préstamo Personal)

---

## 6. Requerimientos funcionales

### 6.1 Dashboard (`/`)
- **RF-01** Mostrar deuda total consolidada (suma de `saldoActual` de créditos ACTIVOS)
- **RF-02** Mostrar los próximos 5 pagos del mes en curso
- **RF-03** Resaltar créditos con pago vencido (estado VENCIDO)
- **RF-04** Mostrar mini gráfica de distribución de deuda por tipo (pie chart)
- **RF-05** Accesos directos: Nuevo Crédito, Registrar Pago, Ver Reportes

### 6.2 CRUD Créditos (`/creditos`)
- **RF-06** Listar todos los créditos con filtros por tipo y estado
- **RF-07** Formulario de creación con validación de campos requeridos
- **RF-08** Mostrar campos condicionales según el tipo de crédito seleccionado
- **RF-09** Página de detalle con resumen, pagos recientes (últimos 3) y documentos adjuntos
- **RF-10** Editar todos los campos de un crédito existente
- **RF-11** Eliminar crédito con confirmación (elimina en cascada pagos y documentos)

### 6.3 Control Mensual de Pagos (`/pagos`)
- **RF-12** Selector de mes y año para navegar entre períodos
- **RF-13** Tabla con todos los créditos activos y el estado de pago del mes seleccionado
- **RF-14** Estados calculados automáticamente:
  - `PAGADO`: existe pago registrado para ese mes/año
  - `PARCIAL`: pago registrado pero menor a `cuotaMensual`
  - `VENCIDO`: no hay pago y la fecha actual supera el `fechaLimitePago` del mes
  - `PENDIENTE`: no hay pago y aún no vence
- **RF-15** Registrar pago rápido desde la tabla (modal inline)
- **RF-16** Resumen: total pagado vs total pendiente del mes

### 6.4 Proyección de Pagos (`/proyecciones`)
- **RF-17** Tabla de amortización para cada crédito: mes, cuota, interés, capital, saldo restante
- **RF-18** Fecha estimada de finalización por crédito
- **RF-19** Gráfica de saldo restante mes a mes (todas las deudas en una sola vista)
- **RF-20** Simulador: campo "pago extra mensual" que recalcula las proyecciones en tiempo real

### 6.5 Priorización Inteligente (`/priorizacion`)
- **RF-21** Input: presupuesto mensual disponible para pagos
- **RF-22** Calcular y mostrar **Método Avalancha**: mayor tasa primero
- **RF-23** Calcular y mostrar **Método Bola de Nieve**: menor saldo primero
- **RF-24** Tabla comparativa: orden de pago, meses totales, interés total, ahorro vs pago mínimo
- **RF-25** Destacar recomendación del método más eficiente (menor interés total)

### 6.6 Documentos (`/creditos/[id]/documentos`)
- **RF-26** Subir archivos PDF o imagen (JPG/PNG), máximo 10 MB por archivo
- **RF-27** Almacenar en `uploads/[creditoId]/` en el filesystem local
- **RF-28** Listar documentos con nombre, tipo, tamaño y fecha de subida
- **RF-29** Descargar documento por su ID
- **RF-30** Eliminar documento (borra del filesystem y de la BD)

### 6.7 Reportes (`/reportes`)
- **RF-31** Gráfica de barras: tasa de interés por crédito (ordenada descendente)
- **RF-32** Gráfica de pie: distribución del saldo por tipo de crédito
- **RF-33** Gráfica de progreso: % pagado vs pendiente por crédito
- **RF-34** Tabla resumen con todos los créditos: nombre, tipo, saldo, tasa, cuota, estado

---

## 7. Requerimientos no funcionales

| RNF | Descripción |
|---|---|
| **RNF-01 Rendimiento** | Las páginas deben cargar en < 2 segundos en desarrollo local |
| **RNF-02 Persistencia** | Datos almacenados en SQLite local vía Prisma; sobreviven reinicios del servidor |
| **RNF-03 Integridad** | Eliminación en cascada: al borrar un crédito, se borran sus pagos y documentos |
| **RNF-04 Archivos** | Los archivos subidos se almacenan fuera del bundle de Next.js (`/uploads` en raíz) |
| **RNF-05 Validación** | Validación de formularios en cliente y servidor (API routes) |
| **RNF-06 Errores** | Las API routes devuelven mensajes de error en JSON con status HTTP correcto |
| **RNF-07 Idioma** | Toda la interfaz de usuario en español (fechas, moneda, etiquetas) |

---

## 8. Modelo de datos

### Entidad: `Credito`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | String (cuid) | PK |
| `nombre` | String | Ej: "Visa Banco X" |
| `tipo` | String | `TARJETA_CREDITO`, `HIPOTECA`, `VEHICULO`, `PRESTAMO_PERSONAL`, `OTRO` |
| `montoTotal` | Float | Monto original del crédito |
| `saldoActual` | Float | Saldo pendiente actual |
| `tasaInteres` | Float | Tasa anual en % |
| `fechaApertura` | DateTime | Fecha de apertura |
| `fechaCorte` | Int? | Día del mes (1–31), solo tarjetas |
| `fechaLimitePago` | Int? | Día del mes (1–31), solo tarjetas |
| `pagoMinimo` | Float? | Pago mínimo mensual, solo tarjetas |
| `cuotaMensual` | Float | Cuota mensual fija (calculada o manual) |
| `plazoMeses` | Int? | Plazo total en meses |
| `estado` | String | `ACTIVO`, `PAGADO`, `CANCELADO` |
| `notas` | String? | Notas libres |
| `createdAt` | DateTime | Auto |
| `updatedAt` | DateTime | Auto |

### Entidad: `Pago`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | String (cuid) | PK |
| `creditoId` | String | FK → Credito |
| `monto` | Float | Monto pagado |
| `fecha` | DateTime | Fecha real del pago |
| `mes` | Int | Mes al que corresponde (1–12) |
| `anio` | Int | Año al que corresponde |
| `tipo` | String | `MENSUAL`, `EXTRA`, `ADELANTO` |
| `notas` | String? | Notas libres |
| `createdAt` | DateTime | Auto |

### Entidad: `Documento`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | String (cuid) | PK |
| `creditoId` | String | FK → Credito |
| `nombre` | String | Nombre original del archivo |
| `tipo` | String | `PDF`, `IMAGEN`, `OTRO` |
| `ruta` | String | Path relativo en filesystem |
| `tamanio` | Int | Tamaño en bytes |
| `createdAt` | DateTime | Auto |

---

## 9. Algoritmos clave

### 9.1 Cuota mensual (Francés / amortización estándar)

$$M = P \cdot \frac{r(1+r)^n}{(1+r)^n - 1}$$

Donde:
- $M$ = cuota mensual
- $P$ = saldo actual
- $r$ = tasa mensual (`tasaInteres / 12 / 100`)
- $n$ = meses restantes

### 9.2 Método Avalancha
1. Ordenar créditos por `tasaInteres` descendente
2. Aplicar `pagoMinimo` (o `cuotaMensual`) a todos
3. Dirigir todo el excedente al crédito con mayor tasa
4. Cuando un crédito se paga, redirigir su cuota + excedente al siguiente
5. Simular mes a mes hasta balance cero

### 9.3 Método Bola de Nieve
Igual que Avalancha, pero ordenando por `saldoActual` ascendente.

---

## 10. API Routes

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/creditos` | Listar todos los créditos |
| POST | `/api/creditos` | Crear crédito |
| GET | `/api/creditos/[id]` | Obtener un crédito con pagos y documentos |
| PUT | `/api/creditos/[id]` | Actualizar crédito |
| DELETE | `/api/creditos/[id]` | Eliminar crédito (cascade) |
| GET | `/api/pagos` | Listar pagos (filtrable por `creditoId`, `mes`, `anio`) |
| POST | `/api/pagos` | Registrar pago |
| DELETE | `/api/pagos/[id]` | Eliminar pago |
| POST | `/api/documentos` | Subir documento (multipart/form-data) |
| GET | `/api/documentos/[id]` | Descargar documento |
| DELETE | `/api/documentos/[id]` | Eliminar documento |
| GET | `/api/proyecciones` | Calcular proyecciones (query: `creditoId?`, `pagoExtra?`) |

---

## 11. Criterios de aceptación del MVP

- [ ] `npm run build` completa sin errores TypeScript
- [ ] `npx prisma db push` crea la BD correctamente
- [ ] Se puede crear un crédito de cada tipo y el formulario muestra/oculta campos condicionales correctamente
- [ ] Se puede registrar un pago y el estado del mes cambia a PAGADO
- [ ] La tabla de amortización calcula correctamente usando la fórmula francesa
- [ ] La priorización Avalancha muestra un interés total menor que la Bola de Nieve para deudas de alta tasa
- [ ] Se puede subir un archivo PDF, aparece en la lista y se puede descargar
- [ ] Las gráficas en `/reportes` renderizan sin errores con datos reales
- [ ] Navegación lateral funciona en todas las rutas

---

## 12. Orden de implementación recomendado

1. Config y estructura del proyecto (package.json, Prisma, Tailwind, archivos base)
2. Layout y navegación (sidebar, header, root layout)
3. CRUD Créditos (API + formularios + lista + detalle)
4. Registro de Pagos (API + formulario + tabla mensual)
5. Control Mensual de Pagos (lógica de estados)
6. Proyecciones (algoritmo amortización + tabla + gráfica)
7. Priorización (algoritmos avalancha/bola de nieve + comparación)
8. Documentos (subida + listado + descarga)
9. Dashboard (widgets resumen + mini gráfica)
10. Reportes (todas las gráficas Recharts)
