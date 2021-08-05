"use strict";

let root_folder;
let viewport_thumbs;
let viewport_picture;
let picture;

async function create_root_folder() {
    const request = new XMLHttpRequest();
    request.responseType = "json";
    request.open("GET", "./scripts/json/thumbs.json");
    request.send();

    async function ready_child_folders(parent_folder) {
        for (let child_folder of parent_folder.folders) {
            child_folder["."] = child_folder;
            child_folder[".."] = parent_folder;
            ready_child_folders(child_folder);
        }
    }

    return new Promise(async function (resolve, reject) {
        request.addEventListener("load", async function () {
            root_folder = request.response;
            root_folder["."] = root_folder;
            root_folder[".."] = root_folder;
            await ready_child_folders(root_folder);
            resolve();
        });
        request.addEventListener("abort", async function () {
            root_folder = {};
            resolve();
        });
        request.addEventListener("error", async function () {
            root_folder = {};
            resolve();
        });
    });
}

async function create_viewports() {
    document.body.classList.add("Viewport");

    viewport_thumbs = document.createElement("div");
    document.body.appendChild(viewport_thumbs);
    viewport_thumbs.classList.add("Viewport_Thumbs");
    viewport_thumbs.style["display"] = "";

    viewport_picture = document.createElement("div");
    document.body.appendChild(viewport_picture);
    viewport_picture.classList.add("Viewport_Picture");
    viewport_picture.style["display"] = "none";

    picture = document.createElement("img");
    viewport_picture.appendChild(picture);
    picture.classList.add("Picture");
    picture.addEventListener("click", async function () {
        viewport_thumbs.style["display"] = "";
        viewport_picture.style["display"] = "none";
    });
}

async function create_folder(parent_folder) {
    while (viewport_thumbs.firstChild) {
        viewport_thumbs.firstChild.remove();
    }

    for (let [idx, child_folder] of parent_folder.folders.entries()) {
        const folder = document.createElement("div");
        viewport_thumbs.appendChild(folder);
        folder.classList.add("Folder");
        folder.addEventListener("click", async function () {
            create_folder(parent_folder.folders[idx]);
        });

        const folder_name = document.createElement("div");
        folder.appendChild(folder_name);
        folder_name.classList.add("Folder_Name");
        folder_name.innerText = child_folder.name;

        /*{
            const album_peek = document.createElement("div");
            album.appendChild(album_peek);
            album_peek.classList.add("Album_Peek");
            {
                const album_peek_thumb = document.createElement("div");
                album_peek.appendChild(album_peek_thumb);
                album_peek_thumb.classList.add("Thumb");
                album_peek_thumb.classList.add("Thumb_Tall");
                album_peek_thumb.style["border"] = "0";
                album_peek_thumb.style["background-image"] = "url('./pics/sephy.jpg')";
            }
        }*/
    }

    for (let child_file of parent_folder.files) {
        const file = document.createElement("div");
        viewport_thumbs.appendChild(file);
        file.classList.add("File");
        file.style["background-image"] = `url("${child_file.path}")`;
        file.addEventListener("click", async function () {
            viewport_thumbs.style["display"] = "none";
            viewport_picture.style["display"] = "";
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
    await create_folder(root_folder);
});
