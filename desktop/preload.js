const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("relayedDesktop", {
  platform: process.platform,
  isDesktopApp: true,
});
