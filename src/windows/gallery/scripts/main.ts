window.addEventListener("DOMContentLoaded", async function (): Promise<void> {
    console.log(process.platform);

    {
        const title: HTMLTitleElement = document.createElement("title");
        document.head.appendChild(title);
        title.innerText = "Sephy!";
    }
    {
        const viewport_albums: HTMLDivElement = document.createElement("div");
        document.body.appendChild(viewport_albums);
        viewport_albums.classList.add("Viewport_Albums");
        for (let idx = 0; idx < 6; idx += 1) {
            const album: HTMLDivElement = document.createElement("div");
            viewport_albums.appendChild(album);
            album.classList.add("Album");
            album.addEventListener("click", async function (): Promise<void> {
                console.log("clicked " + idx);
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
                    album_peek_thumb.style["background-image"] = "url('../../../pics/sephy.jpg')";
                }
            }
        }
    }
});
