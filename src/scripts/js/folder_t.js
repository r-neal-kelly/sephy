"use strict";

const fs = require("fs");
const path = require("path");

const {
    shell,
} = require("electron");

const File_t = require("./file_t");

class Folder_t {
    path;
    name;
    folders;
    files;

    constructor(folder_path) {
        this.path = folder_path.replaceAll("\\", "/");
        this.name = path.parse(folder_path).name;
        this.folders = [];
        this.files = [];

        if (fs.existsSync(this.path)) {
            const contents = fs.readdirSync(this.path, { withFileTypes: true });
            for (let content of contents) {
                if (content.isDirectory()) {
                    this.folders.push(new Folder_t(this.path + "/" + content.name));
                } else if (content.isFile()) {
                    try {
                        const shortcut = shell.readShortcutLink(this.path + "/" + content.name);
                        const shortcut_path = shortcut.target;
                        const stats = fs.statSync(shortcut_path);
                        if (stats.isDirectory()) {
                            this.folders.push(new Folder_t(shortcut_path));
                        } else if (stats.isFile()) {
                            this.files.push(new File_t(shortcut_path));
                        }
                    } catch {
                        this.files.push(new File_t(this.path + "/" + content.name));
                    }
                } else if (content.isSymbolicLink()) {
                    const sym_path = fs.realpathSync(fs.readlinkSync(this.path + "/" + content.name));
                    const stats = fs.statSync(sym_path);
                    if (stats.isDirectory()) {
                        this.folders.push(new Folder_t(sym_path));
                    } else if (stats.isFile()) {
                        this.files.push(new File_t(sym_path));
                    }
                }
            }
        }
    }
};

module.exports = Folder_t;
