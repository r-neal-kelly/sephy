"use strict";

const path = require("path");
const fs = require("fs");
const child_process = require("child_process");

async function read_arguments() {
    const args = {
        in_folder: null,
        out_folder: null,
        pixels: null,
    };

    for (let idx = 2, end = process.argv.length; idx < end;) {
        const key = process.argv[idx];
        if (key === "-in_folder") {
            const val = process.argv[idx + 1];
            if (!val) {
                throw (`"${key}" argument is missing a value`);
            }
            args.in_folder = val;
            idx += 2;
        } else if (key === "-out_folder") {
            const val = process.argv[idx + 1];
            if (!val) {
                throw (`"${key}" argument is missing a value`);
            }
            args.out_folder = val;
            idx += 2;
        } else if (key === "-pixels") {
            const val = process.argv[idx + 1];
            if (!val) {
                throw (`"${key}" argument is missing a value`);
            }
            args.pixels = val;
            idx += 2;
        } else if (key === "-help") {
            console.log("*need to make a help message*");
            throw("");
        } else {
            throw (`"${key}" is not a valid argument.`);
        }
    }

    if (args.in_folder === null) {
        args.in_folder = "./";
    }
    args.in_folder = path.resolve(args.in_folder);

    if (args.out_folder === null) {
        args.out_folder = "./thumbs";
    }
    args.out_folder = path.resolve(args.out_folder);

    if (args.pixels === null) {
        args.pixels = 150;
    }

    return args;
}

async function create_thumbs(in_folder, out_folder, pixels) {
    const in_entries = fs.readdirSync(in_folder, { withFileTypes: true });

    // do not call this before caching the in_folder's entries, could lead to infinite recursion
    if (!fs.existsSync(out_folder)) {
        fs.mkdirSync(out_folder, { recursive: true });
    }

    for (const in_entry of in_entries) {
        if (in_entry.isDirectory()) {
            await create_thumbs(`${in_folder}/${in_entry.name}`, `${out_folder}/${in_entry.name}`, pixels);
        } else if (in_entry.isFile()) {
            await create_thumb(`${in_folder}/${in_entry.name}`, `${out_folder}/${in_entry.name}`, pixels);
        }
    }
}

async function create_thumb(source_path, destination_path, pixels) {
    // irfranview needs path to be absolute and to use forward slashes.
    source_path = path.resolve(source_path).replace(/\\/g, "/");
    destination_path = path.resolve(destination_path).replace(/\\/g, "/");

    child_process.spawnSync("i_view64.exe", [
        `"${source_path}"`,
        `/resize_short=${pixels}`,
        `/aspectratio`,
        `/resample`,
        `/convert="${destination_path}"`
    ], { shell: true });
};

async function app() {

    let args = null;
    try {
        args = await read_arguments();
        try {
            await create_thumbs(args.in_folder, args.out_folder, args.pixels);
        } catch (error) {
            console.log(error);
        }
    } catch (error) {
        console.log(error);
    }
};

app();
