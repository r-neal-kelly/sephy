"use strict";

let originals_folder;
let thumbs_folder;
let current_folder;

let thumbs_viewport;
let picture_viewport;

let picture;

function get_random_int(from = 0, to_inclusive = Number.MAX_SAFE_INTEGER) {
    return Math.floor(Math.random() * (to_inclusive - from + 1) + from);
}

async function get_image_size(image_path) {
    const image = new Image();
    image.src = image_path;

    return new Promise(function (resolve, reject) {
        image.onload = function () {
            resolve({ width: image.width, height: image.height });
        };
        image.onerror = function () {
            resolve({ width: 0, height: 0 });
        };
    });
}

async function is_image_wide(image_path) {
    const image_size = await get_image_size(image_path);
    return image_size.width > image_size.height;
}

async function is_image_tall(image_path) {
    return !is_image_wide(image_path);
}

async function create_root_folder() {
    const originals_request = new XMLHttpRequest();
    originals_request.responseType = "json";
    originals_request.open("GET", "./scripts/json/originals.json");
    originals_request.send();

    const thumbs_request = new XMLHttpRequest();
    thumbs_request.responseType = "json";
    thumbs_request.open("GET", "./scripts/json/thumbs.json");
    thumbs_request.send();

    const originals_promise = new Promise(async function (resolve, reject) {
        originals_request.addEventListener("load", async function () {
            originals_folder = originals_request.response;
            resolve();
        });
        originals_request.addEventListener("abort", async function () {
            originals_folder = {};
            resolve();
        });
        originals_request.addEventListener("error", async function () {
            originals_folder = {};
            resolve();
        });
    });
    const thumbs_promise = new Promise(async function (resolve, reject) {
        thumbs_request.addEventListener("load", async function () {
            thumbs_folder = thumbs_request.response;
            resolve();
        });
        thumbs_request.addEventListener("abort", async function () {
            thumbs_folder = {};
            resolve();
        });
        thumbs_request.addEventListener("error", async function () {
            thumbs_folder = {};
            resolve();
        });
    });
    await Promise.all([originals_promise, thumbs_promise]);

    async function ready_child_folders(parent_folder, parent_thumbs_folder) {
        parent_folder.thumbs = parent_thumbs_folder;
        for (let [idx, child_folder] of parent_folder.folders.entries()) {
            child_folder["."] = child_folder;
            child_folder[".."] = parent_folder;
            ready_child_folders(child_folder, parent_thumbs_folder.folders[idx]);
        }
    }
    originals_folder["."] = originals_folder;
    originals_folder[".."] = originals_folder;
    await ready_child_folders(originals_folder, thumbs_folder);
}

async function create_viewports() {
    document.body.classList.add("Viewport");

    thumbs_viewport = document.createElement("div");
    document.body.appendChild(thumbs_viewport);
    thumbs_viewport.classList.add("Viewport_Thumbs");
    thumbs_viewport.style["display"] = "";

    picture_viewport = document.createElement("div");
    document.body.appendChild(picture_viewport);
    picture_viewport.classList.add("Viewport_Picture");
    picture_viewport.style["display"] = "none";

    picture = document.createElement("img");
    picture_viewport.appendChild(picture);
    picture.classList.add("Picture");
    picture.addEventListener("click", async function () {
        thumbs_viewport.style["display"] = "";
        picture_viewport.style["display"] = "none";
    });
}

async function create_folder(parent_folder) {
    current_folder = parent_folder;

    while (thumbs_viewport.firstChild) {
        thumbs_viewport.firstChild.remove();
    }

    if (parent_folder[".."] != parent_folder) {
        const back_folder = document.createElement("div");
        thumbs_viewport.appendChild(back_folder);
        back_folder.classList.add("Back_Folder");
        back_folder.addEventListener("click", async function() {
            create_folder(parent_folder[".."]);
        });

        const back_folder_name = document.createElement("div");
        back_folder.appendChild(back_folder_name);
        back_folder_name.classList.add("Back_Folder_Name");
        back_folder_name.innerText = "Back";
    }

    for (let [idx, child_folder] of parent_folder.folders.entries()) {
        const folder = document.createElement("div");
        thumbs_viewport.appendChild(folder);
        folder.classList.add("Folder");
        folder.addEventListener("click", async function () {
            create_folder(parent_folder.folders[idx]);
        });

        const folder_name = document.createElement("div");
        folder.appendChild(folder_name);
        folder_name.classList.add("Folder_Name");
        folder_name.innerText = child_folder.name;

        const folder_thumb = document.createElement("div");
        folder.appendChild(folder_thumb);
        folder_thumb.classList.add("Folder_Thumb");
        folder_thumb.style["border"] = "0";
    }
    update_child_folder_thumbs(parent_folder);

    for (let [idx, child_file] of parent_folder.files.entries()) {
        const original_path = child_file.path;
        const thumb_path = parent_folder.thumbs.files[idx].path;

        const file = document.createElement("div");
        thumbs_viewport.appendChild(file);
        file.classList.add("File");
        file.style["background-image"] = `url("${thumb_path}")`;
        file.addEventListener("click", async function () {
            thumbs_viewport.style["display"] = "none";
            picture_viewport.style["display"] = "";
            picture.setAttribute("src", original_path);
        });

        if (await is_image_wide(thumb_path)) {
            file.classList.add("File_Wide");
        } else {
            file.classList.add("File_Tall");
        }
    }
}

async function update_child_folder_thumbs(parent_folder) {
    const child_folder_thumbs = document.querySelectorAll(".Folder_Thumb");
    for (let [idx, child_folder_thumb] of child_folder_thumbs.entries()) {
        child_folder_thumb.classList.remove("Folder_Thumb_Wide");
        child_folder_thumb.classList.remove("Folder_Thumb_Tall");

        const child_folder = parent_folder.folders[idx];
        if (child_folder.thumbs.files.length > 0) {
            const folder_thumb_path = child_folder.thumbs.files[get_random_int(0, child_folder.thumbs.files.length - 1)].path;
            child_folder_thumb.style["background-image"] = `url("${folder_thumb_path}")`;
            if (await is_image_wide(folder_thumb_path)) {
                child_folder_thumb.classList.add("Folder_Thumb_Wide");
            } else {
                child_folder_thumb.classList.add("Folder_Thumb_Tall");
            }
        } else {
            child_folder_thumb.style["background-image"] = "";
        }
    }
}

window.addEventListener("DOMContentLoaded", async function () {
    const title = document.createElement("title");
    document.head.appendChild(title);
    title.innerText = "Sephy";

    await create_root_folder();
    await create_viewports();
    await create_folder(originals_folder);

    window.setInterval(async function () {
        if (document.visibilityState === "visible") {
            await update_child_folder_thumbs(current_folder);
        }
    }, 3000);
});
