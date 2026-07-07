# NetXMS AI Console

## Product Description

NetXMS AI Console is a web-based conversational interface for querying, analyzing, and visualizing infrastructure monitoring data managed by [NetXMS](https://www.netxms.org). It connects to a NetXMS server via its WebAPI and lets operators interact with their monitoring environment through natural language — asking questions, requesting reports, and exploring network data — all within a single chat-driven interface.

Rather than navigating dashboards and drill-down menus, users describe what they want to see. The AI interprets the request, queries the NetXMS backend, and returns answers as a mix of formatted text and rich, interactive visualizations embedded directly in the conversation.

---

## Core Capabilities

### Conversational Infrastructure Queries

Users interact through a chat interface. Messages are sent to the NetXMS server's AI subsystem, which has full access to the monitoring data — objects, alerts, performance metrics, topology, data collection items, and more.

The conversation supports:

- **Free-form questions** — "What are the top 10 nodes by CPU usage?", "Show me critical alerts from the last hour", "Which interfaces on this switch are down?"
- **Contextual follow-ups** — the AI maintains conversation history within a session, so users can refine or drill deeper without restating context.
- **Object-scoped context** — a chat session can be linked to a specific monitored object (node, subnet, etc.), so all queries are automatically scoped. The console can be launched with `?objectId=123&objectName=Switch-01` URL parameters to pre-set context.
- **Server-initiated questions** — when the AI needs clarification or user confirmation before proceeding, it presents interactive prompts directly in the chat. These can be multiple-choice selections or Yes/No and Approve/Reject confirmations.

### Rich Inline Visualizations

AI responses can contain structured visualization blocks alongside text explanations. These appear as compact, clickable previews inline in the conversation. Clicking a preview opens the full interactive visualization in a tabbed side panel.

**11 visualization types** are supported:

| Type | Description |
|------|-------------|
| **Line/Area Chart** | Time-series data with multiple series, dual-axis zoom (brush + slider), threshold markers, unit formatting, and auto-aggregation indicators |
| **Bar Chart** | Categorical comparisons with horizontal or vertical orientation and per-bar custom colors |
| **Pie/Donut Chart** | Proportional breakdowns rendered as donut charts with percentage labels and hover emphasis |
| **Gauge** | Single-value dial with min/max ranges and threshold-based color zones (normal → warning → critical → danger) |
| **Data Table** | Sortable, paginated table with global search, configurable page sizes (10/20/50/100), severity-aware column rendering with color-coded status tags, and datetime formatting |
| **Geographic Map** | Leaflet-based interactive map with status-colored markers, popups showing object details, auto-fit bounds, and configurable tile server |
| **Network Topology** | Interactive graph visualization of network topology with physics-based layout, status-colored nodes, typed links (normal, VPN, multilink, proxy, WiFi), edge labels showing port names, and automatic parallel edge fan-out |
| **DCI Chart** | Live data collection item chart that fetches historical values directly from the server, supporting configurable time ranges and aggregation |
| **Heatmap** | Grid-based heatmap with labeled rows and columns, customizable color gradients, and value overlay |
| **Network Route** | Vertical hop-by-hop route visualization with typed hops (ROUTE, VPN, PROXY, DESTINATION, L2_LINK), color coding, and path completeness indicators |
| **Sparkline Grid** | Ranked list of items, each showing a label, current value, mini sparkline chart, and proportional bar — with async data loading per row |

### Visualization Panel

Opened visualizations live in a tabbed side panel alongside the chat. Users can:

- **Open multiple tabs** — each visualization gets its own tab; clicking a preview that's already open reactivates its tab
- **Export as PNG** — charts and topology graphs can be exported as high-resolution (2x) PNG images
- **Copy as CSV** — tables, maps, routes, and sparkline grids support one-click CSV copy to clipboard
- **Toggle fullscreen** — any visualization can be expanded to fill the browser window
- **Reset map view** — maps have a dedicated button to restore the initial viewport

### Saved Prompts

Frequently used queries can be saved as named prompt templates and recalled from a menu in the chat input area. This allows teams to build a library of standard queries — for example, "Show critical alerts in last 24h" or "Top nodes by memory usage" — that any operator can use without composing the query from scratch.

### Processing Feedback

While the AI is working, the interface shows a real-time activity indicator that displays the current operation in human-readable form — for example, "Getting alerts...", "Analyzing performance data...", "Building topology map...". This gives users visibility into what the AI is doing behind the scenes.

---

## Interface Design

### Layout

The interface uses a responsive split-view design:

- **Default (no visualizations open):** the chat occupies the full width, centered with a maximum width of 900px for comfortable reading.
- **With visualizations:** the layout splits into a 45% chat panel on the left and a 55% visualization panel on the right, separated by a subtle border.
- **Mobile (< 768px):** both panels stack vertically in a 50/50 split.

### Header

A compact 48px header provides:

- Brand logo and "AI Console" title
- **New Chat** button — starts a fresh session (with confirmation if a conversation is in progress)
- **Theme toggle** — switches between light and dark modes
- Current username and **Logout** button

### Theming

The console supports **light and dark modes**, toggled via the header and persisted across sessions. The theme follows system preference on first visit.

The visual identity is driven by a brand configuration system. The default NetXMS brand uses a warm orange palette (#FD7D05), while alternate brands (e.g., FIS-PM) can define their own palette, logos, and color tokens. The brand is selected at build time via the `VITE_BRAND` environment variable.

Severity and status indicators use a consistent, theme-independent color scheme across all visualizations:

| Severity | Color |
|----------|-------|
| Normal | Green (#2DBD6E) |
| Warning | Yellow-green (#C8D400) |
| Minor | Gold (#F5C800) |
| Major | Orange-red (#E85000) |
| Critical | Red (#D42000) |

---

## Architecture Overview

### Technology

- **Vue 3** with Composition API (`<script setup>`)
- **Pinia** for state management
- **PrimeVue 4** (Aura theme) for UI components
- **ECharts 6** for charts and gauges
- **Leaflet** for geographic maps
- **vis-network** for topology graphs
- **marked** for Markdown rendering

### Communication Model

The console communicates with the NetXMS server through its WebAPI (`/v1/ai/chat/*` endpoints) using a polling-based flow:

1. User sends a message → `POST /v1/ai/chat/{id}/message`
2. Console polls `GET /v1/ai/chat/{id}/status` every second
3. Status transitions: `processing` → `completed` (with response) or `error`
4. During processing, the server may return a `pendingQuestion` requiring user input before continuing
5. Response text is parsed to extract Markdown content and embedded visualization blocks

This design requires no WebSocket infrastructure — the console works with any standard HTTP reverse proxy.

### Authentication

The console authenticates against the NetXMS server's login endpoint. A session token is stored in the browser's localStorage and attached as a Bearer token to all API requests. Sessions are validated on page load, and 401 responses trigger automatic logout with redirect preservation.

### Security

- Markdown output is sanitized to strip `<script>`, `<iframe>`, `<object>`, `<embed>`, `<link>` tags, event handler attributes, and `javascript:` URIs
- All visualization renderers are wrapped in error boundaries — malformed data shows an error message rather than crashing the interface
- No sensitive data is stored client-side beyond the session token

---

## Deployment

The console is a static single-page application built with Vite. Production builds output to a `dist/` directory suitable for serving from any static file host or embedding within the NetXMS web interface.

**Build:**

```bash
yarn install
npx vite build
```

**Configuration:**

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_API_BASE_URL` | `/api` | API base path for all fetch requests |
| `VITE_API_TARGET` | `https://netxms.office.radensolutions.com` | Dev proxy target |
| `VITE_BRAND` | `netxms` | Brand identity (logo, colors, name) |

**Development:**

```bash
yarn dev    # starts dev server on http://localhost:5174 with API proxy
```

---

## Integration Points

- **NetXMS WebAPI** — all data flows through the server's `/v1/` REST API. The console requires NetXMS server version with AI chat support enabled.
- **URL-based context** — external applications can launch the console with `?objectId=N&objectName=Name` to start a conversation pre-scoped to a specific monitored object.
- **Tile server** — the map visualization reads the tile server URL from the NetXMS server configuration (`/v1/server-info`), allowing centralized map tile management.
- **Topology API** — network topology visualizations fetch live graph data from the server, supporting multiple topology types and configurable radius.
