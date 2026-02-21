# Memoria del Proyecto (claude.md)

Este archivo sirve como memoria persistente para el asistente de IA, documentando la configuración de Model Context Protocol (MCP), reglas de activación y protocolos de verificación.

## 1. Auditoría del Stack Tecnológico

**Stack Actual:**
- Framework: Expo / React Native
- Lenguaje: TypeScript
- Navegación: expo-router
- Base de datos: expo-sqlite (local)
- Notificaciones: expo-notifications
- Gráficas: react-native-chart-kit

**Análisis de MCPs:**
- Svelte: No detectado.
- Figma: No detectado explícitamente en dependencias, pero hay menciones a diseño UI/UX en `documento_de_diseno_ux_ui_app_de_creditos_fintech.md`.
- Stripe: No detectado.
- Sentry: `@sentry/react-native` configurado en `app.json` y `app/_layout.tsx`.
- AWS/Vercel: No detectado (se usa EAS Build para la infraestructura de compilación).

*Nota: Como no se detectaron las tecnologías específicas mencionadas en el prompt (Svelte, Stripe, Sentry, AWS/Vercel), no se han instalado servidores MCP adicionales en este momento. Si se planea integrar Figma para los assets pendientes, se requerirá el token de acceso personal de Figma.*

## 2. Lista de MCPs Activos

Actualmente, el entorno tiene configurados los siguientes servidores MCP:

- **Figma MCP:** Configurado con Token de Acceso Personal.
- **GitHub MCP:** Configurado con Token de Acceso Personal (PAT).
- **Playwright MCP:** Configurado localmente (requiere `npx playwright install` para navegadores).
- **Svelte MCP:** Configurado localmente.
- **Notion MCP:** Configurado (pendiente de token de API).
- **Sentry MCP:** Configurado vía STDIO (pendiente de token de autenticación).

*(Espacio reservado para futuros MCPs como Sentry, etc.)*

## 2.1 Lista de MCPs Solicitados (Pendientes de Configuración)

La siguiente lista detalla los MCPs que se integrarán en el flujo de trabajo una vez se proporcionen las credenciales necesarias:

**Desarrollo y Documentación:**
- **Context 7 MCP:** Para acceso fácil a documentación de librerías de terceros o lenguajes específicos.

**Diseño y Frontend:**
- **Figma MCP:** (Configurado) Para implementar diseños automáticamente en HTML, CSS, React, Tailwind o iOS UI.

**Gestión de Proyectos y Colaboración:**
- **GitHub MCP:** (Configurado) Para extraer, resolver y cerrar tickets/incidentes automáticamente.
- **Atlassian MCP:** Para gestión de tareas y tickets de Jira.
- **Slack MCP:** Para interactuar con el equipo a través de canales de comunicación.
- **Notion MCP:** (Configurado) Para crear/poblar bases de datos y entender el contexto de ideas de proyectos.

**Infraestructura y Monitoreo:**
- **Sentry MCP:** Para consultar y corregir errores en tiempo real.
- **AWS MCP:** Para gestionar y provisionar recursos en la nube de Amazon.
- **Cloudflare MCP:** Para gestión de infraestructura y servicios de red.
- **Vercel MCP:** Para despliegue y gestión de aplicaciones web.

**Herramientas Especializadas:**
- **Stripe MCP:** Para acceso a documentación de la API y gestión de datos de pagos.
- **BigQuery MCP:** Para interactuar con bases de datos y análisis de datos.
- **iOS y Android Simulator MCPs:** Para verificar aplicaciones móviles directamente en simuladores.

## 3. Lógica de Activación (Cuándo usar qué)

- **Svelte MCP:** Usar cuando se trabaje con componentes Svelte o se necesite validar sintaxis de Svelte 5.
- **Context 7 MCP:** Usar SIEMPRE antes de implementar una nueva librería o API desconocida para obtener la documentación más reciente.
- **Playwright MCP:** Usar después de cambios significativos en la UI web para ejecutar pruebas E2E y verificaciones visuales.
- **Figma MCP:** Usar siempre que la tarea mencione "UI", "diseño", "assets", "iconos" o requiera traducir un diseño a código.
- **GitHub / Atlassian MCP:** Usar al inicio de una sesión para revisar tickets asignados, o al finalizar una tarea para actualizar el estado del ticket.
- **Slack MCP:** Usar para notificar al equipo sobre despliegues exitosos, bloqueos críticos o solicitar revisiones de código.
- **Notion MCP:** Usar para consultar PRDs (Product Requirements Documents), especificaciones de diseño o documentar nuevas decisiones arquitectónicas.
- **Sentry MCP:** Consultar antes de intentar arreglar un bug reportado en producción para obtener el stack trace exacto.
- **AWS / Cloudflare / Vercel MCP:** Usar para tareas de DevOps, configuración de dominios, variables de entorno o despliegues.
- **Stripe MCP:** Usar exclusivamente para tareas relacionadas con pasarelas de pago, suscripciones o webhooks financieros.
- **BigQuery MCP:** Usar para consultas analíticas complejas o generación de reportes de datos masivos.
- **iOS/Android Simulator MCP:** Usar para probar flujos nativos (como notificaciones push, cámara, SQLite local) en la app de Expo/React Native.

## 4. Protocolo de Verificación

1. **Generación de Código:** Después de usar un MCP o herramienta para generar código, revisar los cambios.
2. **Verificación Estática:** Ejecutar `npx tsc --noEmit` para verificar errores de TypeScript.
3. **Verificación Dinámica:** 
   - Para web: Usar **Playwright MCP** para ejecutar tests E2E.
   - Para móvil: Usar **iOS/Android Simulator MCP** para verificar el comportamiento en el dispositivo virtual.

## 5. Configuración de 'Skills' y Comandos Especiales

Los comandos personalizados se encuentran en la carpeta `.claude/commands`.

- `/check-types`: Ejecuta la verificación de TypeScript.
- `/docs-search [query]`: (Skill de Exploración de Docs) Busca documentación actualizada de librerías externas antes de escribir código para evitar alucinaciones.

## 6. Regla de Oro: Explícito sobre Implícito

Antes de cada tarea, el asistente revisará este archivo `claude.md`. Si una tarea puede beneficiarse de un MCP instalado, se mencionará en el Plan Mode inicial: *"Usaré el MCP [Nombre] para obtener el contexto de [X] antes de proceder"*.
