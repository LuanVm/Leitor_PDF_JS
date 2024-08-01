const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: true
        }
    });

    win.loadFile('index.html');
}

app.on('ready', createWindow);

ipcMain.handle('upload-file', async (event) => {
    try {
        const result = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{ name: 'PDF files', extensions: ['pdf'] }]
        });

        if (result.canceled) return null;

        const filePath = result.filePaths[0];
        const fileData = fs.readFileSync(filePath);
        const formData = new FormData();
        formData.append('file', fileData, path.basename(filePath)); // 'file' é a chave ao qual o backend espera

        const response = await axios.post('http://127.0.0.1:3000/api/upload', formData, { // Atualize a porta aqui
            headers: {
                ...formData.getHeaders(),
            },
            responseType: 'arraybuffer' // Certifique-se de receber o arquivo como arraybuffer
        });

        const savePath = path.join(app.getPath('downloads'), 'ExtractedData.xlsx');
        fs.writeFileSync(savePath, response.data);
        return savePath;
    } catch (error) {
        console.error(error);
        throw error;
    }
});
