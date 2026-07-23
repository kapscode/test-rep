# Whiteboard

A simple browser-based whiteboarding tool — like a basic Microsoft Paint in the browser.

## Features

- Freehand pen drawing on a full-window canvas
- 5 pen colors (black, red, green, blue, yellow)
- Adjustable brush size
- Undo / Redo (buttons and keyboard shortcuts: `Ctrl/Cmd+Z`, `Ctrl/Cmd+Y` or `Ctrl/Cmd+Shift+Z`)
- New (clears the canvas)

## Run locally

Requires Node.js (no dependencies to install).

```bash
npm run dev
```

Then open http://localhost:8000

The port can be overridden with the `PORT` environment variable.

## Project structure

- `index.html` — markup and toolbar
- `styles.css` — styling
- `script.js` — canvas drawing, color/brush, undo/redo/new logic
- `server.js` — zero-dependency static dev server
