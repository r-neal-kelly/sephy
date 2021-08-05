"use strict";

const path = require("path");

class File_t {
    path;
    name;
    extension;

    constructor(file_path) {
        this.path = file_path.replaceAll("\\", "/");

        const path_info = path.parse(this.path);
        this.name = path_info.name;
        this.extension = path_info.ext;
    }
};

module.exports = File_t;
