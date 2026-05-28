// firebase-config.js — SantoPadre® Firebase Initializer & Mock Engine

// Reemplazar estas credenciales con las de tu proyecto de Firebase Console:
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Intentar leer credenciales guardadas en LocalStorage (para configuración dinámica desde el Admin sin tocar código)
const savedConfigStr = localStorage.getItem("santopadre_firebase_config");
if (savedConfigStr) {
  try {
    const savedConfig = JSON.parse(savedConfigStr);
    if (savedConfig && savedConfig.apiKey && !savedConfig.apiKey.includes("YOUR_")) {
      Object.assign(firebaseConfig, savedConfig);
      console.log("ℹ️ Firebase: Cargando configuración dinámica desde LocalStorage.");
    }
  } catch (e) {
    console.error("Error cargando configuración dinámica de Firebase:", e);
  }
}

// Bandera para controlar el modo de simulación
let mockActive = false;
let app = null;
let auth = null;
let db = null;
let googleProvider = null;

// Validar si las credenciales son las por defecto
if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes("YOUR_")) {
  console.warn("⚠️ Firebase: Usando MODO SIMULACIÓN. Para conectar con Firebase real, edita js/firebase-config.js con tus credenciales o configúralas en la sección Ajustes del Administrador.");
  mockActive = true;
  window.firebaseMockActive = true;
}

// Inicializar de forma dinámica o usar Mock
if (!mockActive) {
  try {
    // Importamos los SDKs desde CDN oficial
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
    const { getAuth, GoogleAuthProvider } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js");
    const { getFirestore } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");

    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.error("Error inicializando Firebase real, activando Modo Simulación:", error);
    mockActive = true;
    window.firebaseMockActive = true;
  }
}

// Motores de Simulación (LocalStorage) para pruebas en Localhost sin configuración
const MockAuth = {
  currentUser: null,
  onAuthStateChangedListeners: [],
  onAuthStateChanged(callback) {
    this.onAuthStateChangedListeners.push(callback);
    // Recuperar sesión guardada
    const savedUser = localStorage.getItem("santopadre_mock_user");
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
    } else {
      this.currentUser = null;
    }
    callback(this.currentUser);
    return () => {
      this.onAuthStateChangedListeners = this.onAuthStateChangedListeners.filter(l => l !== callback);
    };
  },
  async signInWithPopup() {
    // Simulamos un retraso de red
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser = {
          uid: "mock_uid_12345",
          displayName: "Cliente Parroquiano",
          email: "parroquiano@santopadre.ve",
          photoURL: "assets/logo-sm.webp"
        };
        this.currentUser = mockUser;
        localStorage.setItem("santopadre_mock_user", JSON.stringify(mockUser));
        this.onAuthStateChangedListeners.forEach(l => l(mockUser));
        resolve({ user: mockUser });
      }, 800);
    });
  },
  async signOut() {
    this.currentUser = null;
    localStorage.removeItem("santopadre_mock_user");
    this.onAuthStateChangedListeners.forEach(l => l(null));
  }
};

const MockFirestore = {
  async getDoc(docRef) {
    if (docRef.collection === "users") {
      const usersData = JSON.parse(localStorage.getItem("santopadre_mock_db_users") || "{}");
      return {
        exists: () => !!usersData[docRef.id],
        data: () => usersData[docRef.id] || null
      };
    }
    return { exists: () => false, data: () => null };
  },
  async setDoc(docRef, data, options = {}) {
    if (docRef.collection === "users") {
      const usersData = JSON.parse(localStorage.getItem("santopadre_mock_db_users") || "{}");
      if (options.merge) {
        usersData[docRef.id] = { ...usersData[docRef.id], ...data };
      } else {
        usersData[docRef.id] = data;
      }
      localStorage.setItem("santopadre_mock_db_users", JSON.stringify(usersData));
    }
  },
  async addDoc(collectionRef, data) {
    if (collectionRef.name === "orders") {
      const orders = JSON.parse(localStorage.getItem("santopadre_mock_db_orders") || "[]");
      const newOrder = { id: "order_" + Math.random().toString(36).substr(2, 9), ...data };
      orders.push(newOrder);
      localStorage.setItem("santopadre_mock_db_orders", JSON.stringify(orders));
      return { id: newOrder.id };
    }
  },
  async getOrdersByUser(userId) {
    const orders = JSON.parse(localStorage.getItem("santopadre_mock_db_orders") || "[]");
    return orders.filter(o => o.userId === userId).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
};

// Exportar servicios unificados
export const getActiveServices = () => {
  if (mockActive) {
    return {
      auth: MockAuth,
      db: MockFirestore,
      googleProvider: null,
      isMock: true
    };
  }
  return {
    auth,
    db,
    googleProvider,
    isMock: false
  };
};
