import fs from "fs";

import {
    app,
    BrowserWindow,
} from "electron";

class Window_t {
    folder: string;
    window: BrowserWindow;

    constructor (folder: string) {
        const self: Window_t = this;

        this.folder = "./src/windows/" + folder;

        this.window = new BrowserWindow({
            center: true,
            show: false,

            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true,
            },
        });

        this.window.loadFile(this.folder + "/index.html");
        this.window.webContents.openDevTools();

        this.window.once("ready-to-show", async function (): Promise<void> {
            self.window.show();
        });
    }
};

class Gallery_t extends Window_t {
    constructor () {
        super("gallery");

        let pics = Object.create(null);

        if (!fs.existsSync(this.folder + "/scripts/json")) {
            fs.mkdirSync(this.folder + "/scripts/json", { recursive: true });
        }
        fs.writeFileSync(this.folder + "/scripts/json/pics.json", JSON.stringify(pics, null, 4), "utf8");
    }
};

app.on("ready", async function (): Promise<void> {
    let gallery: Gallery_t = new Gallery_t();

    // windows cannot be created before "ready" event
    app.on("activate", async function (): Promise<void> {
        if (BrowserWindow.getAllWindows().length === 0) {
            gallery = new Gallery_t();
        }
    });
});

app.on("window-all-closed", async function (): Promise<void> {
    if (process.platform !== "darwin"){
        app.quit();
    }
});