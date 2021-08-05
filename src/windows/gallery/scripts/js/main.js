"use strict";

let originals_folder;
let thumbs_folder;
let current_folder;

let thumbs_viewport;
let picture_viewport;

let picture;

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
        folder_thumb.classList.add("File");
        folder_thumb.classList.add("File_Tall");
        folder_thumb.style["border"] = "0";
        folder_thumb.style["background-image"] = "url('./pics/sephy.jpg')";
    }

    for (let [idx, child_file] of parent_folder.files.entries()) {
        const file = document.createElement("div");
        thumbs_viewport.appendChild(file);
        file.classList.add("File");
        file.style["background-image"] = `url("${parent_folder.thumbs.files[idx].path}")`;
        file.addEventListener("click", async function () {
            thumbs_viewport.style["display"] = "none";
            picture_viewport.style["display"] = "";
            picture.setAttribute("src", child_file.path);
        });

        const thumb_image = new Image();
        new Promise(function (resolve, reject) {
            thumb_image.onload = () => resolve();
            thumb_image.onerror = () => reject();
        }).then(function () {
            if (thumb_image.width >= thumb_image.height) {
                file.classList.add("File_Wide");
            } else {
                file.classList.add("File_Tall");
            }
        });
        thumb_image.src = child_file.path;
    }
}

window.addEventListener("DOMContentLoaded", async function () {
    const title = document.createElement("title");
    document.head.appendChild(title);
    title.innerText = "Sephy";

    await create_root_folder();
    await create_viewports();
    await create_folder(originals_folder);
});
