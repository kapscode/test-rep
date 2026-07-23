(function () {
  "use strict";

  const COLORS = [
    { name: "Black", value: "#111827" },
    { name: "Red", value: "#dc2626" },
    { name: "Green", value: "#16a34a" },
    { name: "Light Green", value: "#4ade80" },
    { name: "Blue", value: "#2563eb" },
    { name: "Yellow", value: "#f59e0b" },
  ];

  const canvas = document.getElementById("board");
  const ctx = canvas.getContext("2d");
  const swatchesEl = document.getElementById("swatches");
  const brushSizeEl = document.getElementById("brushSize");
  const brushSizeValueEl = document.getElementById("brushSizeValue");
  const undoBtn = document.getElementById("undoBtn");
  const redoBtn = document.getElementById("redoBtn");
  const newBtn = document.getElementById("newBtn");

  let currentColor = COLORS[0].value;
  let brushSize = Number(brushSizeEl.value);
  let drawing = false;
  let lastPoint = null;

  // History as canvas snapshots (ImageData). undoStack holds committed states,
  // with the last entry being the current visible state. redoStack holds
  // states that were undone and can be reapplied.
  let undoStack = [];
  let redoStack = [];

  function cssSize() {
    const rect = canvas.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }

  // Resize backing store to match displayed size * devicePixelRatio, preserving
  // existing drawing by re-painting the current snapshot afterward.
  function resizeCanvas() {
    const { width, height } = cssSize();
    const dpr = window.devicePixelRatio || 1;
    const snapshot = undoStack.length
      ? undoStack[undoStack.length - 1]
      : null;

    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (snapshot) {
      // Restore raw pixels (independent of transform).
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.putImageData(snapshot, 0, 0);
      ctx.restore();
    }
  }

  function snapshot() {
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }

  function pushHistory() {
    undoStack.push(snapshot());
    redoStack = [];
    updateButtons();
  }

  function restore(imageData) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.putImageData(imageData, 0, 0);
    ctx.restore();
  }

  function updateButtons() {
    // undoStack always contains the initial blank state at index 0, so undo is
    // available only when there is at least one drawn state on top of it.
    undoBtn.disabled = undoStack.length <= 1;
    redoBtn.disabled = redoStack.length === 0;
  }

  function undo() {
    if (undoStack.length <= 1) return;
    const current = undoStack.pop();
    redoStack.push(current);
    restore(undoStack[undoStack.length - 1]);
    updateButtons();
  }

  function redo() {
    if (redoStack.length === 0) return;
    const state = redoStack.pop();
    undoStack.push(state);
    restore(state);
    updateButtons();
  }

  function clearBoard() {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    pushHistory();
  }

  function pointerPos(evt) {
    const rect = canvas.getBoundingClientRect();
    return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
  }

  function startDraw(evt) {
    drawing = true;
    lastPoint = pointerPos(evt);
    // Draw a dot so a single click leaves a mark.
    drawLine(lastPoint, lastPoint);
    canvas.setPointerCapture(evt.pointerId);
  }

  function moveDraw(evt) {
    if (!drawing) return;
    const point = pointerPos(evt);
    drawLine(lastPoint, point);
    lastPoint = point;
  }

  function endDraw() {
    if (!drawing) return;
    drawing = false;
    lastPoint = null;
    pushHistory();
  }

  function drawLine(from, to) {
    ctx.strokeStyle = currentColor;
    ctx.fillStyle = currentColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }

  function buildSwatches() {
    COLORS.forEach((color, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "swatch" + (index === 0 ? " is-active" : "");
      btn.style.background = color.value;
      btn.title = color.name;
      btn.setAttribute("aria-label", color.name);
      btn.addEventListener("click", () => {
        currentColor = color.value;
        document
          .querySelectorAll(".swatch")
          .forEach((s) => s.classList.remove("is-active"));
        btn.classList.add("is-active");
      });
      swatchesEl.appendChild(btn);
    });
  }

  // Event wiring
  brushSizeEl.addEventListener("input", () => {
    brushSize = Number(brushSizeEl.value);
    brushSizeValueEl.textContent = String(brushSize);
  });

  undoBtn.addEventListener("click", undo);
  redoBtn.addEventListener("click", redo);
  newBtn.addEventListener("click", clearBoard);

  canvas.addEventListener("pointerdown", startDraw);
  canvas.addEventListener("pointermove", moveDraw);
  canvas.addEventListener("pointerup", endDraw);
  canvas.addEventListener("pointercancel", endDraw);
  canvas.addEventListener("pointerleave", endDraw);

  document.addEventListener("keydown", (e) => {
    const mod = e.ctrlKey || e.metaKey;
    if (!mod) return;
    const key = e.key.toLowerCase();
    if (key === "z" && !e.shiftKey) {
      e.preventDefault();
      undo();
    } else if ((key === "z" && e.shiftKey) || key === "y") {
      e.preventDefault();
      redo();
    }
  });

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resizeCanvas, 100);
  });

  // Init
  buildSwatches();
  resizeCanvas();
  pushHistory(); // record initial blank state
})();
