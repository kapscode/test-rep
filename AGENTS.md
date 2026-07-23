# AGENTS.md

## Cursor Cloud specific instructions

This repo is a static browser-based whiteboard app (plain HTML/CSS/JS, no framework, no build step).

- Run the dev server with `npm run dev` (see `package.json`), which runs `node server.js` and serves the app at http://localhost:8000. Override the port with the `PORT` env var.
- There are no npm dependencies and no build step; editing `index.html`/`styles.css`/`script.js` is reflected on browser refresh (the dev server does not hot-reload).
- There is no test suite or linter configured.
- Core logic lives in `script.js`: drawing uses Pointer Events; undo/redo is implemented with `ImageData` snapshot stacks (`undoStack`/`redoStack`), where `undoStack[0]` is the initial blank canvas.
