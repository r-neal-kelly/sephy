"use strict";

const fs = require("fs");
const path = require("path");

const {
    app,
    BrowserWindow,
    shell,
} = require("electron");

class File_t {
    path;
    name;
    extension;

    constructor(root_folder_path, relative_file_path) {
        root_folder_path = path.resolve(root_folder_path);
        const absolute_file_path = path.resolve(path.join(root_folder_path, relative_file_path));
        const path_info = path.parse(absolute_file_path);

        this.path = relative_file_path.replaceAll("\\", "/");
        this.name = path_info.name;
        this.extension = path_info.ext;
    }
};

class Folder_t {
    path;
    name;
    folders;
    files;

    constructor(root_folder_path, relative_folder_path) {
        root_folder_path = path.resolve(root_folder_path);
        const absolute_folder_path = path.resolve(path.join(root_folder_path, relative_folder_path));

        this.path = relative_folder_path.replaceAll("\\", "/");
        this.name = path.parse(absolute_folder_path).name;
        this.folders = [];
        this.files = [];

        if (fs.existsSync(absolute_folder_path)) {
            const contents = fs.readdirSync(absolute_folder_path, { withFileTypes: true });
            for (let content of contents) {
                if (content.isDirectory()) {
                    this.folders.push(new Folder_t(root_folder_path, `${relative_folder_path}/${content.name}`));
                } else if (content.isFile()) {
                    try {
                        const absolute_shortcut_path = path.resolve(
                            shell.readShortcutLink(`${absolute_folder_path}/${content.name}`).target
                        );
                        const stats = fs.statSync(absolute_shortcut_path);
                        if (stats.isDirectory()) {
                            this.folders.push(
                                new Folder_t(root_folder_path, path.relative(root_folder_path, absolute_shortcut_path))
                            );
                        } else if (stats.isFile()) {
                            this.files.push(
                                new File_t(root_folder_path, path.relative(root_folder_path, absolute_shortcut_path))
                            );
                        }
                    } catch {
                        this.files.push(
                            new File_t(root_folder_path, `${relative_folder_path}/${content.name}`)
                        );
                    }
                } else if (content.isSymbolicLink()) {
                    const absolute_symbolic_path = path.resolve(
                        fs.realpathSync(fs.readlinkSync(`${absolute_folder_path}/${content.name}`))
                    );
                    const stats = fs.statSync(absolute_symbolic_path);
                    if (stats.isDirectory()) {
                        this.folders.push(
                            new Folder_t(root_folder_path, path.relative(root_folder_path, absolute_symbolic_path))
                        );
                    } else if (stats.isFile()) {
                        this.files.push(
                            new File_t(root_folder_path, path.relative(root_folder_path, absolute_symbolic_path))
                        );
                    }
                }
            }
        }
    }
};

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
            JSON.stringify(new Folder_t(this.folder, `pics/originals`), null, null),
            "utf8"
        );
        fs.writeFileSync(
            this.folder + "/scripts/json/thumbs.json",
            JSON.stringify(new Folder_t(this.folder, `pics/thumbs`), null, null),
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
