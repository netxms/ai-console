# NetXMS AI Console

An AI-powered web console for [NetXMS](https://www.netxms.org/) infrastructure monitoring. Instead of navigating menus and dashboards, users interact through natural language — the AI queries objects, metrics, alarms, and events, then responds with rich inline visualizations.

## Screenshots

<img src="src/screenshots/ai-console-light.png" alt="AI Console — light theme" width="800">

<img src="src/screenshots/ai-console-dark.png" alt="AI Console — dark theme" width="800">

_Chat interface with inline chart previews on the left, full interactive visualization panel on the right._

## Features

- **Conversational interface** — ask questions about your infrastructure in plain English
- **Rich visualizations** — line/area charts, bar/pie charts, gauges, and tables rendered inline and in a tabbed side panel
- **Interactive charts** — zoom, tooltips, data zoom slider, threshold lines
- **Tables with filtering** — sortable, paginated, with global text filter and severity badges
- **Visualization toolbar** — fullscreen, PNG export, CSV copy
- **Pending questions** — the AI can ask for confirmation or offer multiple-choice options mid-conversation
- **XSS protection** — sanitized Markdown rendering

## Prerequisites

- **Node.js** 20.19+ or 22.12+
- **Yarn** package manager
- A running **NetXMS server** (5.1+) with AI chat API enabled

## Quick Start

```bash
# Install dependencies
yarn install

# Start dev server (proxies API to NetXMS server)
yarn dev
```

The app runs at `http://localhost:5174`. The dev server proxies `/api` requests to the NetXMS WebAPI server.

### Configuration

Create a `.env.local` file to override defaults:

```env
# NetXMS server URL for dev proxy
VITE_API_TARGET=https://your-netxms-server.example.com

# API base path (default: /api)
VITE_API_BASE_URL=/api
```

### Production Build

```bash
npx vite build
```

Output goes to `dist/`. Serve with any static file server. In production, configure your reverse proxy to forward `/api` requests to the NetXMS WebAPI.

## Tech Stack

- [Vue 3](https://vuejs.org/) — Composition API with `<script setup>`
- [PrimeVue 4](https://primevue.org/) — UI component library (Aura theme)
- [ECharts](https://echarts.apache.org/) via [vue-echarts](https://github.com/ecomfe/vue-echarts) — charts and gauges
- [Pinia](https://pinia.vuejs.org/) — state management
- [marked](https://marked.js.org/) — Markdown rendering
- [Vite](https://vite.dev/) — build tool

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                 AI Console (Vue 3 SPA)                │
│                                                       │
│  ┌─────────────────────┐  ┌────────────────────────┐  │
│  │    Chat Panel       │  │  Visualization Panel   │  │
│  │                     │  │  (tabbed)              │  │
│  │  Messages + inline  │  │  Full interactive      │  │
│  │  viz previews       │  │  charts/tables/gauges  │  │
│  │                     │  │                        │  │
│  │  [Chat Input]       │  │  [Toolbar]             │  │
│  └─────────────────────┘  └────────────────────────┘  │
└───────────────────┬──────────────────────────────────┘
                    │ REST/JSON (polling)
              ┌─────┴──────┐
              │  NetXMS    │
              │  Server    │
              │  WebAPI    │
              └────────────┘
```

The chat panel takes full width when no visualizations are open. When a visualization is created, the view splits into a 45/55 layout with the visualization panel appearing on the right.

## API Endpoints Used

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/v1/login` | Authenticate |
| `POST` | `/v1/logout` | End session |
| `GET` | `/v1/status` | Validate session |
| `POST` | `/v1/ai/chat` | Create AI chat session |
| `POST` | `/v1/ai/chat/:id/message` | Send message |
| `GET` | `/v1/ai/chat/:id/status` | Poll for response |
| `POST` | `/v1/ai/chat/:id/answer` | Answer pending question |
| `POST` | `/v1/ai/chat/:id/clear` | Clear chat history |
| `DELETE` | `/v1/ai/chat/:id` | Delete chat session |

## License

This project is part of [NetXMS](https://www.netxms.org/) and is licensed under the GNU General Public License v2.
