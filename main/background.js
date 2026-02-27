import path from 'path';
import { app, ipcMain } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import Database from 'better-sqlite3';

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

// --- DATABASE & IPC SETUP ---
const db = new Database('database.db');
db.exec('CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)');

ipcMain.handle('get-items', () => {
  return db.prepare('SELECT * FROM items').all();
});

ipcMain.handle('add-item', (event, name) => {
  const stmt = db.prepare('INSERT INTO items (name) VALUES (?)');
  stmt.run(name);
  return { success: true };
});

ipcMain.handle('delete-item', (event, id) => {
  const stmt = db.prepare('DELETE FROM items WHERE id = ?');
  stmt.run(id);
  return { success: true };
});
// ----------------------------

// --- WINDOW CREATION SETUP ---
(async () => {
  await app.whenReady();

  const mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isProd) {
    await mainWindow.loadURL('app://./home');
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    // Opens the developer console so you can see errors if they happen!
    mainWindow.webContents.openDevTools(); 
  }
})();

app.on('window-all-closed', () => {
  app.quit();
});
