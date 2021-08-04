import fs from "fs";
import path from "path";

import {
    shell,
} from "electron";

import File_t from "./file_t"

export default class Folder_t {
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
                    } catch {
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
