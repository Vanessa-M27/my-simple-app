import { contextBridge, ipcRenderer } from 'electron';

// Exposes a safe 'api' object to your Next.js frontend
contextBridge.exposeInMainWorld('api', {
  getItems: () => ipcRenderer.invoke('get-items'),
  addItem: (name) => ipcRenderer.invoke('add-item', name), // Removed ": string"
  deleteItem: (id) => ipcRenderer.invoke('delete-item', id), // Removed ": number"
});