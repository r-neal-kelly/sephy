import path from 'path';

import {
    app,
    BrowserWindow,
} from 'electron';

async function create_window(): Promise<void> {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    win.loadFile('index.html');
    win.webContents.openDevTools();
}

app.on('ready', async function (): Promise<void> {
    create_window();

    // windows cannot be created before 'ready' event
    app.on('activate', async function (): Promise<void> {
        if (BrowserWindow.getAllWindows().length === 0) {
            create_window();
        }
    });
});

app.on('window-all-closed', async function (): Promise<void> {
    if (process.platform !== 'darwin'){
        app.quit();
    }
});
