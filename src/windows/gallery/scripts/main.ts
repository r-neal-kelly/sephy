window.addEventListener("DOMContentLoaded", async function (): Promise<void> {
    console.log(process.platform);

    {
        const title: HTMLTitleElement = document.createElement("title");
        title.innerText = "Sephy!";
        document.head.appendChild(title);
    }

    {
        const header: HTMLHeadingElement = document.createElement("h1");
        header.innerText = "Welcome to the Gallery!";
        document.body.appendChild(header);
    }
});
