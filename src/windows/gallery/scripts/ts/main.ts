async function get_pics(): Promise<any> {
    const request: XMLHttpRequest = new XMLHttpRequest();
    request.responseType = "json";
    request.open("GET", "./scripts/json/pics.json");
    request.send();

    return new Promise(async function (resolve, reject): Promise<void> {
        request.addEventListener("load", async function (): Promise<void> {
            resolve(request.response);
        });
        request.addEventListener("abort", async function (): Promise<void> {
            resolve({});
        });
        request.addEventListener("error", async function (): Promise<void> {
            resolve({});
        });
    });
};

window.addEventListener("DOMContentLoaded", async function (): Promise<void> {
    const pics = await get_pics();
    console.log(pics.test);

    let viewport_albums: HTMLDivElement;
    let viewport_picture: HTMLDivElement;
    let picture: HTMLImageElement;

    {
        const title: HTMLTitleElement = document.createElement("title");
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
                const album: HTMLDivElement = document.createElement("div");
                viewport_albums.appendChild(album);
                album.classList.add("Album");
                album.addEventListener("click", async function (): Promise<void> {
                    viewport_albums.style["display"] = "none";
                    viewport_picture.style["display"] = "";
                    picture.setAttribute("src", "./pics/sephy.jpg");
                });
                {
                    const album_text: HTMLDivElement = document.createElement("div");
                    album.appendChild(album_text);
                    album_text.classList.add("Album_Text");
                    album_text.innerText = "An Album";
    
                    const album_peek: HTMLDivElement = document.createElement("div");
                    album.appendChild(album_peek);
                    album_peek.classList.add("Album_Peek");
                    {
                        const album_peek_thumb: HTMLDivElement = document.createElement("div");
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
                picture.addEventListener("click", async function (): Promise<void> {
                    viewport_albums.style["display"] = "";
                    viewport_picture.style["display"] = "none";
                });
            }
        }
    }
});
