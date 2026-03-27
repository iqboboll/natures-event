// =============================================================================
// FIREBASE CLIENT SDK CONFIGURATION
// =============================================================================
// This file initializes Firebase on the FRONTEND (client-side) for authentication.
// The BACKEND uses firebase-admin SDK separately (see backend/database.py).
//
// HOW TO SET UP:
// 1. Go to https://console.firebase.google.com/
// 2. Select your project (or create one)
// 3. Go to Project Settings > General > Your Apps > Web App
// 4. Copy the firebaseConfig object and paste the values below
// 5. Enable "Email/Password" sign-in in Authentication > Sign-in method
// =============================================================================

import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";

// TODO: Replace these placeholder values with your actual Firebase project config
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",               // <-- Paste your Firebase API key here
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",  // <-- e.g., "my-app-12345.firebaseapp.com"
  projectId: "YOUR_PROJECT_ID",                    // <-- e.g., "my-app-12345"
  storageBucket: "YOUR_PROJECT_ID.appspot.com",    // <-- e.g., "my-app-12345.appspot.com"
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",   // <-- Found in Project Settings > Cloud Messaging
  appId: "YOUR_APP_ID",                            // <-- Found in Project Settings > General
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// =============================================================================
// AUTH HELPER FUNCTIONS
// =============================================================================

/**
 * Login with email and password using Firebase Client SDK.
 * Returns the Firebase ID Token that should be sent to the backend as a Bearer token.
 */
export async function loginWithEmail(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  // Get the ID Token to send to the backend for verification
  const idToken = await userCredential.user.getIdToken();
  return { user: userCredential.user, idToken };
}

/**
 * Register a new user with Firebase Client SDK.
 * NOTE: The backend also has /api/auth/register which creates the user via firebase-admin.
 * You can choose to use either approach. Client-side registration is shown here.
 */
export async function registerWithEmail(email, password) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const idToken = await userCredential.user.getIdToken();
  return { user: userCredential.user, idToken };
}

/**
 * Sign out the current user.
 */
export async function logoutUser() {
  await signOut(auth);
}

export default app;
