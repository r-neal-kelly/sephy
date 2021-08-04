const fs = require("fs");

const {
    app,
    BrowserWindow,
} = require("electron");

const Folder_t = require("./folder_t.js");

class Window_t {
    folder;
    window;

    constructor(folder) {
        this.folder = "./src/windows/" + folder;

        this.window = new BrowserWindow({
            center: true,
            show: false,

            webPreferences: {
                contextIsolation: true,
                nodeIntegration: false,
            },
        });

        this.window.loadFile(this.folder + "/index.html");
        this.window.webContents.openDevTools();

        const self = this;
        this.window.once("ready-to-show", async function () {
            self.window.show();
        });
    }
};

class Gallery_t extends Window_t {
    constructor() {
        super("gallery");

        const pics = new Folder_t("pics", this.folder + "/" + "pics");
        if (!fs.existsSync(this.folder + "/scripts/json")) {
            fs.mkdirSync(this.folder + "/scripts/json", { recursive: true });
        }
        fs.writeFileSync(this.folder + "/scripts/json/pics.json", JSON.stringify(pics, null, null), "utf8");
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
