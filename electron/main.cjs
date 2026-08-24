// Electron main process for Grimoire.
//
// The app is a client-only SPA served by the bundled Nitro server. We start
// that server on a FIXED localhost port and load it — a fixed port keeps the
// page origin stable across launches so localStorage/IndexedDB (where all the
// character data lives) persists. Binding to 127.0.0.1 keeps it off the network.

const { app, BrowserWindow, shell, dialog } = require("electron");
const path = require("path");
const { pathToFileURL } = require("url");

const HOST = "127.0.0.1";
const PORT = 43117;
const APP_URL = `http://${HOST}:${PORT}/`;

// The Nitro node-server preset reads these at import time.
process.env.HOST = HOST;
process.env.PORT = String(PORT);
process.env.NITRO_HOST = HOST;
process.env.NITRO_PORT = String(PORT);

// In a packaged app the server output is copied under resources/output;
// in dev it sits at the project root under .output.
function serverEntryPath() {
  return app.isPackaged
    ? path.join(process.resourcesPath, "output", "server", "index.mjs")
    : path.join(__dirname, "..", ".output", "server", "index.mjs");
}

function startServer() {
  return import(pathToFileURL(serverEntryPath()).href);
}

async function waitForServer(timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(APP_URL, { method: "HEAD" });
      if (res.status < 500) return true;
    } catch {
      // server not up yet
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  return false;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 860,
    minWidth: 820,
    minHeight: 600,
    title: "Grimoire",
    backgroundColor: "#0b0b0f",
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // On Windows/Linux drop the default menu bar; macOS keeps its app menu.
  if (process.platform !== "darwin") win.removeMenu();

  win.once("ready-to-show", () => win.show());
  win.loadURL(APP_URL);

  // Open target=_blank / external links in the system browser, not a new window.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http")) shell.openExternal(url);
    return { action: "deny" };
  });
}

app.whenReady().then(async () => {
  try {
    await startServer();
  } catch (err) {
    dialog.showErrorBox(
      "Grimoire",
      "Failed to start the app server:\n\n" + (err?.stack || err),
    );
    app.quit();
    return;
  }

  if (!(await waitForServer())) {
    dialog.showErrorBox(
      "Grimoire",
      "The app server did not become ready in time.",
    );
    app.quit();
    return;
  }

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
