async function get_pics() {
    const request = new XMLHttpRequest();
    request.responseType = "json";
    request.open("GET", "./scripts/json/pics.json");
    request.send();

    return new Promise(async function (resolve, reject) {
        request.addEventListener("load", async function () {
            resolve(request.response);
        });
        request.addEventListener("abort", async function () {
            resolve({});
        });
        request.addEventListener("error", async function () {
            resolve({});
        });
    });
};

window.addEventListener("DOMContentLoaded", async function () {
    const pics = await get_pics();
    console.log(pics);

    let viewport_albums;
    let viewport_picture;
    let picture;

    {
        const title = document.createElement("title");
        document.head.appendChild(title);
        title.innerText = "Sephy";
    }
    {
        document.body.classList.add("Viewport");
        {
            viewport_albums = document.createElement("div");
            document.body.appendChild(viewport_albums);
            viewport_albums.classList.add("Viewport_Albums");
            for (let idx = 0; idx < 6; idx += 1) {
                const album = document.createElement("div");
                viewport_albums.appendChild(album);
                album.classList.add("Album");
                album.addEventListener("click", async function () {
                    viewport_albums.style["display"] = "none";
                    viewport_picture.style["display"] = "";
                    picture.setAttribute("src", "./pics/sephy.jpg");
                });
                {
                    const album_text = document.createElement("div");
                    album.appendChild(album_text);
                    album_text.classList.add("Album_Text");
                    album_text.innerText = "An Album";

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
                }
            }
        }
        {
            viewport_picture = document.createElement("div");
            document.body.appendChild(viewport_picture);
            viewport_picture.classList.add("Viewport_Picture");
            viewport_picture.style["display"] = "none";
            {
                picture = document.createElement("img");
                viewport_picture.appendChild(picture);
                picture.classList.add("Picture");
                picture.addEventListener("click", async function () {
                    viewport_albums.style["display"] = "";
                    viewport_picture.style["display"] = "none";
                });
            }
        }
    }
});
