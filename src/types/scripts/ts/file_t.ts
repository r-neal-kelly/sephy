import path from "path";

export default class File_t {
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
