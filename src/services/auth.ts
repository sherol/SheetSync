import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User,
  signOut 
} from 'firebase/auth';

// Fallback configuration if file is unavailable
const defaultFirebaseConfig = {
  projectId: "gen-lang-client-0263183169",
  appId: "1:138495577806:web:56ded045b4b2ca73878a9f",
  apiKey: "AIzaSyBifkz664y64TkdVgSvsRsVEuzEyZm19d4",
  authDomain: "gen-lang-client-0263183169.firebaseapp.com",
  storageBucket: "gen-lang-client-0263183169.firebasestorage.app",
  messagingSenderId: "138495577806",
  measurementId: "",
  oAuthClientId: "138495577806-5hvpqu6t7ei7g0n5q6fcodat1t0slpjv.apps.googleusercontent.com"
};

export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

// Initialize Firebase safely
let appInstance: any = null;
let authInstance: any = null;
let providerInstance: GoogleAuthProvider | null = null;

try {
  appInstance = getApps().length === 0 ? initializeApp(defaultFirebaseConfig) : getApp();
  authInstance = getAuth(appInstance);
  providerInstance = new GoogleAuthProvider();
  WORKSPACE_SCOPES.forEach(scope => providerInstance?.addScope(scope));
} catch (e) {
  console.warn('Firebase initialization error:', e);
}

export const auth = authInstance;

// In-memory token cache (never stored in localStorage as per security policy)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  if (!authInstance) {
    if (onAuthFailure) onAuthFailure();
    return () => {};
  }

  return onAuthStateChanged(authInstance, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  if (!authInstance || !providerInstance) {
    throw new Error('Authentication is not initialized');
  }

  try {
    isSigningIn = true;
    const result = await signInWithPopup(authInstance, providerInstance);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve access token from Google sign in');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-in failed:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setAccessTokenManually = (token: string | null) => {
  cachedAccessToken = token;
};

export const logout = async () => {
  if (authInstance) {
    await signOut(authInstance);
  }
  cachedAccessToken = null;
};
