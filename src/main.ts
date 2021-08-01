import path from "path";

import {
    app,
    BrowserWindow,
} from "electron";

class Window_t {
    folder: string;
    window: BrowserWindow;

    constructor (folder: string) {
        this.folder = folder;

        this.window = new BrowserWindow({
            webPreferences: {
                preload: path.join(__dirname, "windows/" + this.folder + "/preload.js"),
            },
        });
        this.window.loadFile("./src/windows/" + this.folder + "/index.html");
        this.window.webContents.openDevTools();
    }
};

app.on("ready", async function (): Promise<void> {
    new Window_t("gallery");
    
    // windows cannot be created before "ready" event
    app.on("activate", async function (): Promise<void> {
        if (BrowserWindow.getAllWindows().length === 0) {
            new Window_t("gallery");
        }
    });
});

app.on("window-all-closed", async function (): Promise<void> {
    if (process.platform !== "darwin"){
        app.quit();
    }
});
