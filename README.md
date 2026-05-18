# EduAdapt — Agente Pedagógico Inteligente

**EduAdapt** es un tutor cognitivo adaptativo impulsado por IA para estudiantes de **Grado 7°** (11-13 años) en el área de **Tecnología e Informática** del Colegio Los Sauces (Caucasia, Antioquia, Colombia).

Proyecto de la **Universidad de Córdoba** — Maestría en Innovación Educativa con Tecnología e IA.

## Demo

🔗 [https://robo-mind-mentor.lovable.app/](https://robo-mind-mentor.lovable.app/)

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Framework** | [TanStack Start](https://tanstack.com/start/latest) (SSR) + React 19 |
| **Lenguaje** | TypeScript 5.8 |
| **Runtime** | Bun (local) / Cloudflare Workers (producción) |
| **AI SDK** | [Vercel AI SDK](https://sdk.vercel.ai/) v6 + [Google Gemini 2.0 Flash](https://ai.google.dev/) |
| **UI** | Tailwind CSS v4 + shadcn/ui + Radix Primitives |
| **Iconos** | Lucide React |
| **Gráficos** | Recharts |
| **Forms** | React Hook Form + Zod |
| **Base de datos** | Supabase (cliente JS) + localStorage (caching) |
| **Despliegue** | Cloudflare Workers + Vite |
| **Paquete** | Bun |

## Arquitectura

### Multiagente

| Agente | Función |
|--------|---------|
| 🧠 Tutor Cognitivo Adaptativo | Acompaña, modela y consolida aprendizajes |
| 🧭 Diagnóstico Psicopedagógico | Detecta intereses, ritmos y preferencias |
| ✨ Diseñador de Rutas | Genera trayectorias únicas por estudiante |
| 🤔 Mediador Socrático | Pregunta, no responde. Fomenta el razonamiento |
| 📊 Evaluador Formativo | Pre y post test con feedback inmediato |
| 🛡️ Gobernador Ético | Mantiene límites curriculares y privacidad |

### Principios Pedagógicos

- **DUA** (Diseño Universal para el Aprendizaje)
- **Mediación Socrática**: preguntas guía, nunca respuestas directas
- **Hiperpersonalización**: ejemplos anclados al interés del estudiante
- **Andamiaje progresivo**: pistas concretas si falla, profundización si acierta
- **Agencia epistémica**: el estudiante justifica con sus propias palabras
- **Retroalimentación formativa**: celebra avances, reformula errores como oportunidad
- **Metacognición**: reflexión sobre el propio proceso de aprendizaje

## Funcionalidades

### Estudiante (`/estudiante`)

1. **Onboarding** (3 pasos): nombre, interés (videojuegos, deportes, música, arte, ciencia) y ritmo (rápido, medio, reflexivo)
2. **Hub** con lecciones, barra de progreso y badges de dificultad
3. **Flujo de aprendizaje**:
   - Pre-test diagnóstico
   - Tutor IA conversacional (mediación socrática)
   - Post-test evaluativo
   - Reflexión metacognitiva
   - Resumen adaptativo (avanzar / repetir / desafío)
4. **Chat con IA**: streaming en tiempo real con contexto del perfil del estudiante

### Docente (`/docente`)

1. **Dashboard**: KPIs, gauges de motivación/autonomía/dominio, rendimiento por lección
2. **Lecciones**: CRUD completo, activar/desactivar, restaurar predeterminadas
3. **Estudiantes**: vista por estudiante con scores, autonomía y motivación
4. **Trazabilidad**: log completo de interacciones (últimas 100)

## Lecciones Incluidas

| Lección | Dificultad | Estado |
|---------|-----------|--------|
| Hardware: CPU y memoria | Inicial | ✅ Activada |
| Pensamiento algorítmico | Intermedio | ✅ Activada |
| Redes e Internet | Intermedio | ✅ Activada |
| Seguridad digital | Inicial | ❌ Desactivada |

## Getting Started

```bash
# Instalar dependencias
bun install

# Configurar variables de entorno
cp .env.example .env  # o editar .env directamente

# Variables requeridas:
# GOOGLE_GENERATIVE_AI_API_KEY=<gemini-api-key>
# SUPABASE_URL=<url>
# SUPABASE_PUBLISHABLE_KEY=<key>

# Iniciar servidor de desarrollo
bun run dev
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `bun run dev` | Servidor de desarrollo |
| `bun run build` | Build producción |
| `bun run lint` | ESLint |
| `bun run format` | Prettier |

## Licencia

Proyecto académico — Universidad de Córdoba.
