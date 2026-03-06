# CLAUDE.md — NetXMS AI Console

## Overview

A Vue 3 single-page application that provides an AI-powered chat interface for querying and visualizing NetXMS infrastructure data. The app communicates with the NetXMS server's WebAPI (`/v1/ai/chat/*` endpoints) using a polling-based message flow.

## Quick Start

```bash
yarn install
yarn dev          # dev server on http://localhost:5174
npx vite build    # production build to dist/
```

The dev server proxies `/api` requests to the NetXMS WebAPI server configured in `VITE_API_TARGET` (defaults to `https://netxms.office.radensolutions.com`). See `vite.config.js`.

## Tech Stack

- **Vue 3** (Composition API, `<script setup>`)
- **Pinia** — state management
- **PrimeVue 4** (Aura theme) — UI components
- **ECharts** via `vue-echarts` — charts, gauges, bar/pie
- **marked** — Markdown rendering
- **vue-router** — SPA routing

No TypeScript. No testing framework yet.

## Architecture

```
src/
  api/              # API client layer
    client.js       # fetch wrapper with auth, error handling
    authApi.js      # login/logout/validateSession
    aiChatApi.js    # AI chat CRUD + polling
  stores/           # Pinia stores
    authStore.js    # session, user, localStorage persistence
    aiChatStore.js  # messages, polling loop, send/answer flow
    visualizationStore.js  # tabbed visualization panel state
  components/
    chat/           # Chat UI
      ChatPanel.vue         # Composes MessageList + ChatInput + PendingQuestion
      MessageList.vue       # Scrollable message list with auto-scroll
      ChatInput.vue         # Textarea + send button (Enter to send, Shift+Enter newline)
      UserMessage.vue       # User bubble with timestamp
      AssistantMessage.vue  # AI response: text blocks + inline viz previews
      TextBlock.vue         # Markdown renderer with XSS sanitization
      ProcessingIndicator.vue  # Typing dots
      PendingQuestion.vue   # Server-initiated confirmation/multi-choice UI
    visualization/  # Visualization system
      VisualizationPanel.vue  # Tabbed side panel with toolbar
      VizToolbar.vue          # Fullscreen, PNG export, CSV copy
      ChartPreview.vue        # Inline line/area chart thumbnail
      ChartView.vue           # Full line/area chart with zoom, tooltips
      BarPiePreview.vue       # Inline bar/pie thumbnail
      BarPieView.vue          # Full bar/pie chart
      GaugePreview.vue        # Value + progress bar thumbnail
      GaugeView.vue           # Full gauge dial
      TablePreview.vue        # First 4 rows thumbnail
      TableView.vue           # Full DataTable with filter, pagination, sort
    layout/
      AppHeader.vue   # Title bar, New Chat (with confirmation), logout
  layouts/
    AssistantLayout.vue  # Header + main slot
  views/
    auth/LoginView.vue       # Login form
    assistant/AssistantView.vue  # Chat pane + viz panel (split view)
  utils/
    parseResponse.js  # Parses AI response into text + visualization blocks
  themes/
    index.js          # PrimeVue Aura preset with ocean primary palette
  assets/styles/
    main.css          # CSS custom properties, resets
  main.js             # App bootstrap, plugin registration, ECharts component imports
  router/index.js     # Routes with auth guard
```

## Key Patterns

### Message Flow
1. User sends text -> `aiChatStore.sendMessage()` -> `POST /v1/ai/chat/{id}/message`
2. Store polls `GET /v1/ai/chat/{id}/status` every 1s
3. Status `completed` -> response parsed by `parseResponse()` into blocks
4. Text blocks render as Markdown; visualization blocks render as inline previews
5. Clicking a preview opens a full view in the tabbed side panel

### Visualization Protocol
AI responses can embed visualizations using fenced code blocks:
````
```netxms-viz
{ "type": "chart", "title": "CPU", "series": [...] }
```
````
Supported types: `chart` (line/area), `bar`, `pie`, `gauge`, `table`.

Each visualization block gets an auto-generated `id` and can be opened as a tab. Preview components show a compact inline version; View components show the full interactive version.

### API Client
`src/api/client.js` wraps `fetch()` with:
- Auto-attaching `Authorization: Bearer <sessionGuid>` header
- 401 detection -> auto-logout + redirect to `/login`
- Network error catch -> `ApiError` with user-friendly message
- JSON parsing with graceful fallback

### XSS Protection
`TextBlock.vue` sanitizes Markdown HTML output by stripping `<script>`, `<iframe>`, `<object>`, `<embed>`, `<link>` tags, event handler attributes, and `javascript:` URIs.

### Error Boundaries
All visualization computed option builders are wrapped in try-catch. Malformed data shows an error message instead of crashing the component.

## Conventions

- **3-space indentation** (matches NetXMS project style)
- **Vue Composition API** with `<script setup>` — no Options API
- **Plain CSS** in `<style>` blocks (no scoped, no preprocessor) — class names are component-scoped by convention (`.chart-preview`, `.gauge-view`, etc.)
- **PrimeVue CSS variables** for theming (`--p-surface-card`, `--p-primary-color`, etc.)
- Components use PascalCase filenames; CSS classes use kebab-case
- No external state management beyond Pinia — no Vuex, no provide/inject for app state
- Minimize external dependencies — prefer built-in browser APIs

## ECharts Registration

ECharts components are registered globally in `main.js` via `use()`. When adding a new chart type, import both the chart and required components there. Currently registered: `LineChart`, `BarChart`, `PieChart`, `GaugeChart`, `GridComponent`, `TooltipComponent`, `LegendComponent`, `DataZoomComponent`, `MarkLineComponent`.

## Adding a New Visualization Type

1. Add the type name to `parseResponse.js` (it already handles any `type` with an `id`)
2. Create `FooPreview.vue` (compact inline, clickable to open tab) and `FooView.vue` (full interactive)
3. Register in `AssistantMessage.vue` → `vizComponents` map and `VisualizationPanel.vue` → `viewComponents` map
4. If chart-based, expose `chartRef` via `defineExpose` for PNG export toolbar support
5. If table-based, expose `getColumnsAsCsv()` for CSV copy toolbar support

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `/api` | API base path for fetch requests |
| `VITE_API_TARGET` | `https://netxms.office.radensolutions.com` | Dev proxy target |
