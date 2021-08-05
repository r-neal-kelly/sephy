"use strict";

const fs = require("fs");
const path = require("path");

const {
    app,
    BrowserWindow,
} = require("electron");

const Folder_t = require("./folder_t.js");

class Window_t {
    folder;
    window;

    constructor(folder) {
        this.folder = path.join(__dirname, "../../windows/" + folder);

        this.window = new BrowserWindow({
            center: true,
            show: false,
            fullscreen: true,
            icon: `${this.folder}/pics/icon.png`,

            webPreferences: {
                contextIsolation: true,
                nodeIntegration: false,
            },
        });

        this.window.loadFile(this.folder + "/index.html");

        const self = this;
        this.window.once("ready-to-show", async function () {
            self.window.show();
        });
    }
};

class Gallery_t extends Window_t {
    constructor() {
        super("gallery");

        if (!fs.existsSync(this.folder + "/scripts/json")) {
            fs.mkdirSync(this.folder + "/scripts/json", { recursive: true });
        }

        fs.writeFileSync(
            this.folder + "/scripts/json/originals.json",
            JSON.stringify(new Folder_t(`${this.folder}/pics/originals`), null, null),
            "utf8"
        );
        fs.writeFileSync(
            this.folder + "/scripts/json/thumbs.json",
            JSON.stringify(new Folder_t(`${this.folder}/pics/thumbs`), null, null),
            "utf8"
        );
    }
};

app.on("ready", async function () {
    let gallery = new Gallery_t();

    // windows cannot be created before "ready" event
    app.on("activate", async function () {
        if (BrowserWindow.getAllWindows().length === 0) {
            gallery = new Gallery_t();
        }
    });
});

app.on("window-all-closed", async function () {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
