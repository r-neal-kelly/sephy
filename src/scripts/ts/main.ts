import fs from "fs";
import path from "path";

import {
    app,
    BrowserWindow,
    shell,
} from "electron";

class Window_t {
    folder: string;
    window: BrowserWindow;

    constructor(folder: string) {
        const self: Window_t = this;

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

        this.window.once("ready-to-show", async function (): Promise<void> {
            self.window.show();
        });
    }
};

class Gallery_t extends Window_t {
    constructor() {
        super("gallery");

        class File_t {
            path: string;
            name: string;
            extension: string;

            constructor(file_name: string, file_path: string) {
                this.path = file_path;

                const path_info = path.parse(this.path);
                this.name = path_info.name;
                this.extension = path_info.ext;
            }
        };

        class Folder_t {
            path: string;
            name: string;
            contents: any;

            constructor(folder_name: string, folder_path: string) {
                this.path = folder_path;
                this.name = folder_name;
                this.contents = {};
                this.contents.folders = [];
                this.contents.files = [];

                if (fs.existsSync(this.path)) {
                    const contents: fs.Dirent[] = fs.readdirSync(this.path, { withFileTypes: true });
                    for (let content of contents) {
                        if (content.isDirectory()) {
                            this.contents.folders.push(new Folder_t(content.name, this.path + "/" + content.name));
                        } else if (content.isFile()) {
                            try {
                                const shortcut: Electron.ShortcutDetails = shell.readShortcutLink(this.path + "/" + content.name);
                                const shortcut_path: string = shortcut.target.replaceAll("\\", "/");
                                const shortcut_name: string = path.parse(shortcut_path).base;
                                const stats: fs.Stats = fs.statSync(shortcut_path);
                                if (stats.isDirectory()) {
                                    this.contents.folders.push(new Folder_t(shortcut_name, shortcut_path));
                                } else if (stats.isFile()) {
                                    this.contents.files.push(new File_t(shortcut_name, shortcut_path));
                                }
                            } catch (_) {
                                this.contents.files.push(new File_t(content.name, this.path + "/" + content.name));
                            }
                        } else if (content.isSymbolicLink()) {
                            const sym_path: string = fs.realpathSync(fs.readlinkSync(this.path + "/" + content.name));
                            const sym_name: string = path.parse(sym_path).base;
                            const stats: fs.Stats = fs.statSync(sym_path);
                            if (stats.isDirectory()) {
                                this.contents.folders.push(new Folder_t(sym_name, sym_path));
                            } else if (stats.isFile()) {
                                this.contents.files.push(new File_t(sym_name, sym_path));
                            }
                        }
                    }
                }
            }
        };

        const pics = new Folder_t("pics", this.folder + "/" + "pics");
        if (!fs.existsSync(this.folder + "/scripts/json")) {
            fs.mkdirSync(this.folder + "/scripts/json", { recursive: true });
        }
        fs.writeFileSync(this.folder + "/scripts/json/pics.json", JSON.stringify(pics, null, null), "utf8");
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
    if (process.platform !== "darwin") {
        app.quit();
    }
});
