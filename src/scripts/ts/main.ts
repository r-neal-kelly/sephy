import path from "path";

import {
    app,
    BrowserWindow,
} from "electron";

class Window_t {
    folder: string;
    window: BrowserWindow;

    constructor (folder: string) {
        const self: Window_t = this;

        this.folder = folder;

        this.window = new BrowserWindow({
            center: true,
            show: false,

            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true,
            },
        });

        this.window.loadFile("./src/windows/" + this.folder + "/index.html");
        this.window.webContents.openDevTools();

        this.window.once("ready-to-show", async function (): Promise<void> {
            self.window.show();
        });
    }
};

app.on("ready", async function (): Promise<void> {
    let gallery: Window_t = new Window_t("gallery");

    // windows cannot be created before "ready" event
    app.on("activate", async function (): Promise<void> {
        if (BrowserWindow.getAllWindows().length === 0) {
            gallery = new Window_t("gallery");
        }
    });
});

app.on("window-all-closed", async function (): Promise<void> {
    if (process.platform !== "darwin"){
        app.quit();
    }
});
