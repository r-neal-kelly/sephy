"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
const file_t_1 = __importDefault(require("./file_t"));
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
        if (fs_1.default.existsSync(this.path)) {
            const contents = fs_1.default.readdirSync(this.path, { withFileTypes: true });
            for (let content of contents) {
                if (content.isDirectory()) {
                    this.contents.folders.push(new Folder_t(content.name, this.path + "/" + content.name));
                }
                else if (content.isFile()) {
                    try {
                        const shortcut = electron_1.shell.readShortcutLink(this.path + "/" + content.name);
                        const shortcut_path = shortcut.target.replaceAll("\\", "/");
                        const shortcut_name = path_1.default.parse(shortcut_path).base;
                        const stats = fs_1.default.statSync(shortcut_path);
                        if (stats.isDirectory()) {
                            this.contents.folders.push(new Folder_t(shortcut_name, shortcut_path));
                        }
                        else if (stats.isFile()) {
                            this.contents.files.push(new file_t_1.default(shortcut_name, shortcut_path));
                        }
                    }
                    catch {
                        this.contents.files.push(new file_t_1.default(content.name, this.path + "/" + content.name));
                    }
                }
                else if (content.isSymbolicLink()) {
                    const sym_path = fs_1.default.realpathSync(fs_1.default.readlinkSync(this.path + "/" + content.name));
                    const sym_name = path_1.default.parse(sym_path).base;
                    const stats = fs_1.default.statSync(sym_path);
                    if (stats.isDirectory()) {
                        this.contents.folders.push(new Folder_t(sym_name, sym_path));
                    }
                    else if (stats.isFile()) {
                        this.contents.files.push(new file_t_1.default(sym_name, sym_path));
                    }
                }
            }
        }
    }
}
exports.default = Folder_t;
;
