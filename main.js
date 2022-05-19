const {
  app,
  BrowserWindow,
  Menu,
  ipcMain
} = require("electron");
const path = require("path");
const {
  contextIsolated
} = require("process");
let mainWindow;
const unitRate = 0.20;
let standingCharge = 0.04;
let vat = 0.135;
let modal;

const loadMainWindow = () => {
 
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));
  

}

app.on("ready", loadMainWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    loadMainWindow();
  }
});

try {
  require('electron-reloader')(module)
} catch (_) {}

ipcMain.on("bill:calculate", (event, elements) => {

  const units = elements["units"];
  const days = elements["days"];
  let amountExVat = (units * unitRate) + (days * standingCharge);
  let amountInVat = amountExVat + (amountExVat * vat);

  let dataKeys = ["units", "days", "amountExVat", "amountInVat"];
  let dataValues = [units, days, amountExVat.toFixed(2), amountInVat.toFixed(2)];
  const data = {};
  for (let i = 0; i < dataKeys.length; i++) {
    data[dataKeys[i]] = dataValues[i];
  }

  modal = new BrowserWindow({
    parent: mainWindow,
    height: 600,
    width: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  modal.loadFile(path.join(__dirname, "modal.html")); 
  
  setTimeout(function() {
    modal.webContents.send("bill:view", data);
   }, 1000);
  
});

