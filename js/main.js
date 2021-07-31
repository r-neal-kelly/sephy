"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
async function create_window() {
    const win = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
        },
    });
    win.loadFile('index.html');
    win.webContents.openDevTools();
}
electron_1.app.on('ready', async function () {
    create_window();
    // windows cannot be created before 'ready' event
    electron_1.app.on('activate', async function () {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            create_window();
        }
    });
});
electron_1.app.on('window-all-closed', async function () {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
