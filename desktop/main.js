const {
  app,
  BrowserWindow,
  shell,
  Menu,
  globalShortcut,
  dialog,
  ipcMain,
} = require("electron");

const { autoUpdater } = require("electron-updater");
const path = require("path");
const dns = require("dns");

const RELAYED_URL = process.env.RELAYED_URL || "https://relayed.gg";
const isDev = !app.isPackaged;

let mainWindow;
let reconnectInterval;

function hasInternet() {
  return new Promise((resolve) => {
    dns.lookup("relayed.gg", (err) => {
      resolve(!err);
    });
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: "#050712",
    title: "Relayed",
    icon: path.join(__dirname, "../build/icon.ico"),
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  loadRelayed();

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(RELAYED_URL)) {
      shell.openExternal(url);
      return { action: "deny" };
    }

    return { action: "allow" };
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    const isRelayedUrl = url.startsWith(RELAYED_URL);
    const isOfflinePage = url.startsWith("data:text/html");

    if (!isRelayedUrl && !isOfflinePage) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  mainWindow.webContents.on("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => {
    if (validatedURL && validatedURL.startsWith(RELAYED_URL)) {
      console.error("Failed to load Relayed:", errorCode, errorDescription);
      showOfflinePage();
    }
  });
}

async function loadRelayed() {
  if (!mainWindow || mainWindow.isDestroyed()) return;

  const online = await hasInternet();

  if (!online) {
    showOfflinePage();
    return;
  }

  try {
    await mainWindow.loadURL(RELAYED_URL, {
      userAgent: "RelayedDesktop/1.0",
    });

    stopReconnectLoop();
  } catch (err) {
    console.error("Failed to load Relayed:", err);
    showOfflinePage();
  }
}

function showOfflinePage() {
  if (!mainWindow || mainWindow.isDestroyed()) return;

  const offlineHtml = encodeURIComponent(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Relayed - Offline</title>
        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            min-height: 100vh;
            background:
              radial-gradient(circle at top left, rgba(124, 58, 237, 0.35), transparent 35%),
              radial-gradient(circle at bottom right, rgba(88, 101, 242, 0.28), transparent 35%),
              #050712;
            color: white;
            font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }

          body::before {
            content: "";
            position: absolute;
            inset: 0;
            opacity: 0.22;
            background-image:
              linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
            background-size: 64px 64px;
          }

          .orb {
            position: absolute;
            width: 360px;
            height: 360px;
            border-radius: 999px;
            background: rgba(88, 101, 242, 0.2);
            filter: blur(80px);
            animation: float 7s ease-in-out infinite;
          }

          .orb.one {
            top: 8%;
            left: 10%;
          }

          .orb.two {
            bottom: 8%;
            right: 10%;
            background: rgba(124, 58, 237, 0.22);
            animation-delay: 1.5s;
          }

          @keyframes float {
            0%, 100% {
              transform: translateY(0);
              opacity: 0.55;
            }
            50% {
              transform: translateY(24px);
              opacity: 0.9;
            }
          }

          .card {
            position: relative;
            width: min(92vw, 640px);
            border: 1px solid rgba(255,255,255,0.1);
            background: rgba(255,255,255,0.045);
            backdrop-filter: blur(24px);
            border-radius: 32px;
            padding: 44px;
            text-align: center;
            box-shadow: 0 0 100px rgba(124, 58, 237, 0.22);
          }

          .logo {
            width: 78px;
            height: 78px;
            margin: 0 auto 22px;
            border-radius: 24px;
            background: linear-gradient(135deg, #7c3aed, #5865f2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
            font-weight: 900;
            box-shadow: 0 0 45px rgba(88, 101, 242, 0.45);
          }

          .pill {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 18px;
            padding: 8px 14px;
            border-radius: 999px;
            border: 1px solid rgba(248, 113, 113, 0.25);
            background: rgba(248, 113, 113, 0.1);
            color: #fecaca;
            font-size: 13px;
            font-weight: 800;
          }

          .pulse {
            height: 8px;
            width: 8px;
            border-radius: 999px;
            background: #f87171;
            box-shadow: 0 0 18px rgba(248, 113, 113, 0.8);
          }

          h1 {
            margin: 0;
            font-size: 46px;
            line-height: 1.05;
            letter-spacing: -0.04em;
          }

          p {
            margin: 18px auto 0;
            max-width: 460px;
            color: #94a3b8;
            font-size: 16px;
            line-height: 1.7;
          }

          .actions {
            margin-top: 32px;
            display: flex;
            justify-content: center;
            gap: 12px;
            flex-wrap: wrap;
          }

          button {
            border: none;
            border-radius: 14px;
            padding: 14px 22px;
            font-weight: 900;
            cursor: pointer;
            color: white;
            background: #5865f2;
            box-shadow: 0 0 30px rgba(88, 101, 242, 0.35);
            transition: 0.2s ease;
          }

          button:hover {
            background: #4752c4;
            transform: translateY(-1px);
          }

          .secondary {
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.1);
            box-shadow: none;
          }

          .secondary:hover {
            background: rgba(255,255,255,0.1);
          }

          .status {
            margin-top: 24px;
            color: #64748b;
            font-size: 13px;
            font-weight: 700;
          }
        </style>
      </head>

      <body>
        <div class="orb one"></div>
        <div class="orb two"></div>

        <div class="card">
          <div class="logo">R</div>

          <div class="pill">
            <span class="pulse"></span>
            No internet connection
          </div>

          <h1>Relayed can't connect.</h1>

          <p>
            Check your internet connection and try again. Relayed will keep
            checking in the background and reconnect automatically once you're
            back online.
          </p>

          <div class="actions">
            <button onclick="window.relayedRetry && window.relayedRetry()">
              Retry Connection
            </button>

            <button class="secondary" onclick="window.relayedOpenDownload && window.relayedOpenDownload()">
              Open Download Page
            </button>
          </div>

          <div class="status">
            Auto-retrying every 5 seconds...
          </div>
        </div>

        <script>
          window.relayedRetry = function () {
            window.location.href = "relayed://retry";
          };

          window.relayedOpenDownload = function () {
            window.location.href = "relayed://download";
          };
        </script>
      </body>
    </html>
  `);

  mainWindow.loadURL(`data:text/html;charset=utf-8,${offlineHtml}`);
  startReconnectLoop();
}

function startReconnectLoop() {
  stopReconnectLoop();

  reconnectInterval = setInterval(async () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;

    const online = await hasInternet();

    if (online) {
      loadRelayed();
    }
  }, 5000);
}

function stopReconnectLoop() {
  if (reconnectInterval) {
    clearInterval(reconnectInterval);
    reconnectInterval = null;
  }
}

function setupNavigationHandlers() {
  app.on("web-contents-created", (_event, contents) => {
    contents.on("will-navigate", (event, url) => {
      if (url === "relayed://retry") {
        event.preventDefault();
        loadRelayed();
      }

      if (url === "relayed://download") {
        event.preventDefault();
        shell.openExternal(`${RELAYED_URL}/download`);
      }
    });
  });
}

function setupAutoUpdater() {
  if (isDev) return;

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("checking-for-update", () => {
    console.log("Checking for updates...");
  });

  autoUpdater.on("update-available", () => {
    console.log("Update available. Downloading...");
  });

  autoUpdater.on("update-not-available", () => {
    console.log("No update available.");
  });

  autoUpdater.on("download-progress", (progress) => {
    console.log(`Update download: ${Math.round(progress.percent)}%`);
  });

  autoUpdater.on("update-downloaded", async () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;

    const result = await dialog.showMessageBox(mainWindow, {
      type: "info",
      title: "Update Ready",
      message: "A new version of Relayed has been downloaded.",
      detail: "Restart Relayed now to finish installing the update.",
      buttons: ["Restart Now", "Later"],
      defaultId: 0,
      cancelId: 1,
    });

    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });

  autoUpdater.on("error", (err) => {
    console.error("Auto updater error:", err);
  });

  autoUpdater.checkForUpdatesAndNotify();
}

function registerShortcuts() {
  globalShortcut.register("CommandOrControl+R", () => {
    if (mainWindow) loadRelayed();
  });

  globalShortcut.register("CommandOrControl+Shift+R", () => {
    if (mainWindow) mainWindow.webContents.reloadIgnoringCache();
  });

  globalShortcut.register("F11", () => {
    if (mainWindow) {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }
  });

  globalShortcut.register("CommandOrControl+=", () => {
    if (!mainWindow) return;

    const zoom = mainWindow.webContents.getZoomFactor();
    mainWindow.webContents.setZoomFactor(Math.min(2, zoom + 0.1));
  });

  globalShortcut.register("CommandOrControl+-", () => {
    if (!mainWindow) return;

    const zoom = mainWindow.webContents.getZoomFactor();
    mainWindow.webContents.setZoomFactor(Math.max(0.5, zoom - 0.1));
  });

  globalShortcut.register("CommandOrControl+0", () => {
    if (mainWindow) {
      mainWindow.webContents.setZoomFactor(1);
    }
  });
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);

  setupNavigationHandlers();
  createWindow();
  registerShortcuts();
  setupAutoUpdater();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("will-quit", () => {
  stopReconnectLoop();
  globalShortcut.unregisterAll();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});