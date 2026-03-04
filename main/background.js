import path from 'path';
import { app, ipcMain } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

const firebaseConfig = {
  apiKey: "AIzaSyDZyh8IxfACBxQ7BxYGM2eIJq_UpH_gly4",
  authDomain: "simpleapp-7383.firebaseapp.com",
  projectId: "simpleapp-7383",
  storageBucket: "simpleapp-7383.firebasestorage.app",
  messagingSenderId: "28875272707",
  appId: "1:28875272707:web:1196660870139a098d1436",
  measurementId: "G-FKTZ1MC5YH"
};

// Initialize Firebase with a unique name to avoid conflict with Electron's 'app'
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// --- FIREBASE IPC HANDLERS ---

// This fixes the 'get-items' error by providing a handler for the frontend
ipcMain.handle('get-items', async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "items"));
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
  } catch (error) {
    console.error("Firebase Fetch Error:", error);
    return [];
  }
});

ipcMain.handle('add-item', async (event, name) => {
  try {
    await addDoc(collection(db, "items"), { name });
    return { success: true };
  } catch (error) {
    console.error("Firebase Add Error:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-item', async (event, id) => {
  try {
    const itemRef = doc(db, "items", id);
    await deleteDoc(itemRef);
    return { success: true };
  } catch (error) {
    console.error("Firebase Delete Error:", error);
    return { success: false, error: error.message };
  }
});

// Extra sync handler if you are using it specifically in your UI
ipcMain.handle('sync-to-firebase', async (event, item) => {
  try {
    const docRef = await addDoc(collection(db, "items"), item);
    return { success: true, id: docRef.id };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

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
    mainWindow.webContents.openDevTools(); 
  }
})();

app.on('window-all-closed', () => {
  app.quit();
});