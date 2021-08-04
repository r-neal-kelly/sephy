const fs = require("fs");
const path = require("path");

const {
    shell,
} = require("electron");

const File_t = require("./file_t");

class Folder_t {
    path;
    name;
    contents;

    constructor(folder_name, folder_path) {
        this.path = folder_path;
        this.name = folder_name;
        this.contents = {};
        this.contents.folders = [];
        this.contents.files = [];

        if (fs.existsSync(this.path)) {
            const contents = fs.readdirSync(this.path, { withFileTypes: true });
            for (let content of contents) {
                if (content.isDirectory()) {
                    this.contents.folders.push(new Folder_t(content.name, this.path + "/" + content.name));
                } else if (content.isFile()) {
                    try {
                        const shortcut = shell.readShortcutLink(this.path + "/" + content.name);
                        const shortcut_path = shortcut.target.replaceAll("\\", "/");
                        const shortcut_name = path.parse(shortcut_path).base;
                        const stats = fs.statSync(shortcut_path);
                        if (stats.isDirectory()) {
                            this.contents.folders.push(new Folder_t(shortcut_name, shortcut_path));
                        } else if (stats.isFile()) {
                            this.contents.files.push(new File_t(shortcut_name, shortcut_path));
                        }
                    } catch {
                        this.contents.files.push(new File_t(content.name, this.path + "/" + content.name));
                    }
                } else if (content.isSymbolicLink()) {
                    const sym_path = fs.realpathSync(fs.readlinkSync(this.path + "/" + content.name));
                    const sym_name = path.parse(sym_path).base;
                    const stats = fs.statSync(sym_path);
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

module.exports = Folder_t;