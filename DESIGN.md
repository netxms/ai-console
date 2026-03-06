# NetXMS AI Console — Design Document

## Overview

A standalone Vue 3 web application — an AI-first monitoring console where the user interacts through natural language and the system responds with rich visualizations. No menus, no navigation tree — the AI is the interface.

The app is designed for **information consumption and decision making**, not system configuration. Primary users are NOC operators and IT managers/capacity planners.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    AI Console (Vue 3 SPA)                │
│                                                          │
│  ┌──────────────────────┐  ┌──────────────────────────┐  │
│  │     Chat Panel       │  │  Visualization Panel     │  │
│  │     (left ~45%)      │  │  (right ~55%, tabbed)    │  │
│  │                      │  │                          │  │
│  │  User messages       │  │  Charts (ECharts)        │  │
│  │  AI responses (md)   │  │  Tables (PrimeVue)       │  │
│  │  Inline previews     │  │  Gauges                  │  │
│  │  Pending questions   │  │  Bar/Pie charts          │  │
│  │                      │  │                          │  │
│  │  [Chat Input]        │  │  [Tab bar + toolbar]     │  │
│  └──────────────────────┘  └──────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
                WebAPI (REST/JSON)
                     │
              ┌──────┴───────┐
              │  NetXMS      │
              │  Server      │
              │  (AI Chat    │
              │   API +      │
              │   Tools)     │
              └──────────────┘
```

## Tech Stack

- **Frontend**: Vue 3, PrimeVue, vue-echarts, Pinia, vue-router, marked
- **Backend**: Existing NetXMS server AI chat API + existing tools
- **Auth**: Existing WebAPI session mechanism (Bearer token)
- **Build**: Vite
- **No new server dependencies** — uses existing AI chat infrastructure

## Layout

Two-column design:

- **Left panel (chat)** — ~45% width when visualizations are present, 100% otherwise. Conversational interface with markdown-rendered AI responses, inline visualization previews, and a text input.
- **Right panel (visualization)** — ~55% width. Tabbed area where rich visualizations appear. Each visualization opens as a new tab. Tabs can be closed. Panel is hidden when no visualizations are active.
- **Header** — minimal: app title, new chat button, current user, logout. No sidebar navigation, no object tree, no menu hierarchy.

## AI Interaction Model

The browser sends user messages to the existing AI chat API on the NetXMS server. The server-side AI assistant uses tools/skills to query objects, DCI data, alarms, events, etc.

### Current Response Model: Polling

1. `POST /v1/ai/chat` — create session
2. `POST /v1/ai/chat/:id/message` — send message, returns `202 Accepted`
3. `GET /v1/ai/chat/:id/status` — poll until `status: "completed"`
4. Response comes back as a single complete text payload

Streaming (SSE) is planned as a future enhancement.

### Pending Questions

During processing, the AI may ask the user for confirmation or a choice:

- **Confirmation** — approve/reject or yes/no
- **Multiple choice** — select from a list of options

The app polls for pending questions and renders them inline. The user's answer is sent back and polling resumes.

### Client Capability Negotiation

To support visualization output without affecting existing plain-text chat clients, the AI chat session accepts a **capabilities declaration**:

```json
{
  "capabilities": ["visualizations"],
  "supportedTypes": ["chart", "table", "gauge", "bar", "pie"]
}
```

When capabilities are declared, the AI's system prompt is augmented with instructions to emit structured visualization blocks alongside text. Plain chat clients that don't declare capabilities receive text/markdown as before.

### Data Flow

```
User message
    │
    ▼
AI Chat API (receives message + session capabilities)
    │
    ▼
LLM (system prompt includes visualization instructions IF client declared support)
    │
    ▼
LLM calls existing tools (unchanged) → gets raw data back
    │
    ▼
LLM composes response:
  - Text blocks as markdown
  - Visualization blocks as JSON (only if client supports it;
    otherwise the same data goes into markdown tables/text)
    │
    ▼
Response delivered to frontend via polling
    │
    ▼
Frontend parses blocks → text to chat, visualizations to tabs
```

No new tools are needed — the LLM uses existing tools and formats data as visualization JSON based on the system prompt. The formatting decision happens inside the LLM's response generation.

## Response Protocol

The AI returns content that may contain text and structured visualization blocks. Visualization blocks are JSON objects embedded in the response.

### Text

Markdown-formatted text, rendered inline in chat using `marked`.

### Chart Block

```json
{
  "type": "chart",
  "id": "viz-1748a3",
  "title": "CPU Usage — srv-web-01",
  "chartType": "line",
  "timeRange": { "from": 1709000000, "to": 1709086400 },
  "series": [
    {
      "name": "CPU Usage %",
      "unit": "%",
      "data": [[1709000000, 45.2], [1709003600, 67.8]]
    }
  ],
  "thresholds": [
    { "value": 80, "label": "Warning", "color": "#f59e0b" },
    { "value": 95, "label": "Critical", "color": "#ef4444" }
  ]
}
```

Rendered with vue-echarts. Supports multiple series, zooming (dataZoom), tooltips, and time range selection.

### Table Block

```json
{
  "type": "table",
  "id": "viz-2b91c0",
  "title": "Active Critical Alarms",
  "columns": [
    { "field": "severity", "header": "Severity", "type": "severity" },
    { "field": "source", "header": "Source", "type": "text" },
    { "field": "message", "header": "Message", "type": "text" },
    { "field": "timestamp", "header": "Time", "type": "datetime" }
  ],
  "rows": [
    { "severity": 4, "source": "srv-db-02", "message": "Disk space low", "timestamp": 1709085000 }
  ]
}
```

Rendered with PrimeVue DataTable. Supports sorting, filtering, pagination. Severity columns show colored status badges.

### Gauge Block

```json
{
  "type": "gauge",
  "id": "viz-3cf210",
  "title": "Current Memory — srv-web-01",
  "value": 78.4,
  "unit": "%",
  "min": 0,
  "max": 100,
  "thresholds": { "warning": 75, "critical": 90 }
}
```

Single-value display: radial gauge or large number with colored status bar.

### Bar/Pie Block

```json
{
  "type": "bar",
  "id": "viz-4de891",
  "title": "Alarms by Severity",
  "orientation": "horizontal",
  "categories": ["Normal", "Warning", "Minor", "Major", "Critical"],
  "values": [12, 34, 8, 5, 2],
  "colors": ["#22c55e", "#f59e0b", "#f97316", "#ef4444", "#dc2626"]
}
```

Rendered with vue-echarts. Bar charts support horizontal/vertical orientation. Pie charts include labels and percentages.

### Inline Previews

Visualization blocks render as **compact previews** inline in chat (small thumbnail or summary) and simultaneously open as a **full interactive version** in a new tab on the right panel. Clicking an inline preview switches to its tab.

### Tab Toolbar

All visualizations in the right panel have: **fullscreen toggle**, **export as PNG**, and **refresh** (re-fetches the same query with current data).

## Visualization Types

| Type | Library | Use Cases |
|------|---------|-----------|
| Line/Area charts | vue-echarts | Time-series DCI data, performance trends, capacity |
| Tables | PrimeVue DataTable | Alarm lists, top-N queries, object comparisons |
| Gauges | Custom / ECharts | Single current values, health scores |
| Bar/Pie charts | vue-echarts | Distribution breakdowns, comparative stats |

Topology/network maps are explicitly excluded from initial scope.

## State Management

### Pinia Stores (client-only state)

- **`authStore`** — session GUID, user info, login/logout
- **`aiChatStore`** — current conversation messages, polling state, pending questions
- **`visualizationStore`** — open tabs, active tab, visualization data per tab

### Chat Sessions

- Sessions are created on first message via the AI chat API
- **New chat** starts a fresh session
- Chat history / session persistence is Phase 4 scope

### URL Routing

- `/login` — authentication
- `/` — main assistant view (chat + visualizations)

## Component Architecture

```
App.vue
├── layouts/AssistantLayout.vue
│   ├── components/layout/AppHeader.vue
│   │   ├── New Chat button
│   │   ├── User name
│   │   └── Logout button
│   │
│   └── views/assistant/AssistantView.vue
│       ├── components/chat/ChatPanel.vue
│       │   ├── MessageList.vue
│       │   │   ├── UserMessage.vue              (right-aligned bubble)
│       │   │   └── AssistantMessage.vue          (markdown + inline previews)
│       │   │       ├── TextBlock.vue             (markdown via marked)
│       │   │       ├── ChartPreview.vue          (inline thumbnail, clickable)
│       │   │       ├── TablePreview.vue          (first few rows, clickable)
│       │   │       ├── GaugePreview.vue          (compact value)
│       │   │       └── BarPiePreview.vue         (small inline chart)
│       │   │
│       │   ├── ProcessingIndicator.vue           (animated dots)
│       │   ├── PendingQuestion.vue               (confirmation/choice)
│       │   └── ChatInput.vue                     (textarea + send, Enter to send)
│       │
│       └── components/visualization/VisualizationPanel.vue
│           ├── TabBar                            (tab titles, close buttons)
│           └── Visualization views (per active tab)
│               ├── ChartView.vue                 (full ECharts)
│               ├── TableView.vue                 (PrimeVue DataTable)
│               ├── GaugeView.vue                 (radial gauge / big number)
│               ├── BarPieView.vue                (full ECharts bar/pie)
│               └── VizToolbar.vue                (fullscreen, export, refresh)
```

Each `*Preview.vue` in chat is a compact read-only snapshot. Each `*View.vue` in the visualization panel is the full interactive version. They share the same data from the store.

## Server-Side Changes

Minimal changes required:

1. **Capability negotiation** — AI chat session accepts a `capabilities` field when created or on first message
2. **Conditional system prompt** — when client declares visualization support, augment the AI system prompt with instructions to emit structured JSON blocks for data
3. **No new tools** — existing tools return raw data; the LLM formats it as visualization blocks
4. **No new endpoints** — existing polling-based AI chat API is used as-is

## Implementation Phases

### Phase 1 — Skeleton ✅

App shell, routing, auth integration, two-panel layout, chat input/output with polling. Connects to existing AI chat API. No visualizations — just a working chat client.

- Vue 3 + Vite + PrimeVue setup
- Login/auth flow
- AI chat store with polling
- Chat UI: messages, input, processing indicator, pending questions
- Visualization panel placeholder with tab management

### Phase 2 — Visualization Protocol ✅

- Server-side: `enableVisualizationOutput()` on `Chat` class, called when client sends `capabilities: ["visualizations"]` on chat creation
- System prompt instructs LLM to emit `netxms-viz` fenced code blocks with JSON visualization payloads
- Frontend `parseResponse()` splits AI text into text blocks and typed visualization objects
- `AssistantMessage` renders mixed content: `TextBlock` for markdown, preview components for visualizations
- All 4 viz types implemented with inline previews + full interactive views:
  - `ChartPreview` / `ChartView` — line/area charts with ECharts (dataZoom, tooltips, thresholds)
  - `TablePreview` / `TableView` — PrimeVue DataTable (sorting, pagination, severity badges, datetime formatting)
  - `GaugePreview` / `GaugeView` — single-value gauge with threshold coloring
  - `BarPiePreview` / `BarPieView` — bar (horizontal/vertical) and pie charts
- Clicking inline preview opens full view in tabbed right panel
- Tab management: add, switch, close, clear on new session

### Phase 3 — Polish

### Phase 4 — Polish

- Chat history / session list
- Streaming upgrade (SSE endpoint)
- Responsive layout for smaller screens
- Error handling and reconnection logic
- Dark mode support
