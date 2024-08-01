const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    uploadFile: () => ipcRenderer.invoke('upload-file')
});
