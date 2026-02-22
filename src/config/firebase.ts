import admin from 'firebase-admin';

let isInitialized = false;

export const initializeFirebase = () => {
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

    if (!projectId || !privateKey || !clientEmail) {
      throw new Error('Firebase credentials not configured');
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        privateKey: privateKey.replace(/\\n/g, '\n'),
        clientEmail,
      }),
    });
    isInitialized = true;
  }
};

// Lazy getters for Firebase services
export const getDb = () => {
  if (!isInitialized) {
    throw new Error('Firebase not initialized');
  }
  return admin.firestore();
};

export const getAuth = () => {
  if (!isInitialized) {
    throw new Error('Firebase not initialized');
  }
  return admin.auth();
};

export const getStorage = () => {
  if (!isInitialized) {
    throw new Error('Firebase not initialized');
  }
  return admin.storage();
};

export default admin;
