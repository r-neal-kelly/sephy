"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
class File_t {
    path;
    name;
    extension;
    constructor(file_name, file_path) {
        this.path = file_path;
        const path_info = path_1.default.parse(this.path);
        this.name = path_info.name;
        this.extension = path_info.ext;
    }
}
exports.default = File_t;
;
