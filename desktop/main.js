const { app, BrowserWindow, shell, Menu } = require("electron");
const path = require("path");

const RELAYED_URL = process.env.RELAYED_URL

let mainWindow;

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
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  mainWindow.loadURL(RELAYED_URL, {
  userAgent: "RelayedDesktop/1.0"
});

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(RELAYED_URL)) {
      shell.openExternal(url);
      return { action: "deny" };
    }

    return { action: "allow" };
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith(RELAYED_URL)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
