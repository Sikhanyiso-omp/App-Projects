import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User, Auth } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, onSnapshot, query, where, orderBy, limit, Timestamp, addDoc, updateDoc, deleteDoc, getDocs, Firestore } from 'firebase/firestore';

// Placeholder config
const placeholderConfig = {
  apiKey: "placeholder-key",
  authDomain: "placeholder-auth-domain",
  projectId: "placeholder-project-id",
  storageBucket: "placeholder-storage-bucket",
  messagingSenderId: "placeholder-sender-id",
  appId: "placeholder-app-id"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let isFirebaseEnabled = false;

// Mock user for demo mode
const mockUser = {
  uid: 'demo-user-123',
  displayName: 'Demo Enforcer',
  email: 'demo@mindlock.ai',
  photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MindLock',
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  refreshToken: '',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => 'mock-token',
  getIdTokenResult: async () => ({}) as any,
  reload: async () => {},
  toJSON: () => ({}),
  phoneNumber: null,
  providerId: 'google.com'
} as unknown as User;

try {
  // @ts-ignore
  const config = require('../../firebase-applet-config.json');
  if (config && config.apiKey && config.apiKey !== "TODO_KEYHERE" && config.apiKey !== "placeholder" && !config.apiKey.includes("placeholder")) {
    app = initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
    isFirebaseEnabled = true;
    console.log("Firebase initialized successfully");
  } else {
    throw new Error("Invalid config");
  }
} catch (e) {
  console.warn("Firebase config not found or invalid. Falling back to demo mode.");
  // Initialize with placeholder but mark as disabled
  app = initializeApp(placeholderConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  isFirebaseEnabled = false;
}

export { auth, db, isFirebaseEnabled, mockUser };
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup, onAuthStateChanged, type User };
export { collection, doc, setDoc, getDoc, onSnapshot, query, where, orderBy, limit, Timestamp, addDoc, updateDoc, deleteDoc, getDocs };

// Error handling helper
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  console.error(`Firestore Error [${operationType}] on path [${path}]:`, error);
  // We don't throw here to avoid crashing the app in demo mode
}
