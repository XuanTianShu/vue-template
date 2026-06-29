import { initializeApp } from 'firebase/app'
import {
  addDoc,
  collection,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { getAuth, signInAnonymously } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
}

let app = null
let db = null
let auth = null

function isConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  )
}

export async function initFirebase() {
  if (!isConfigured()) {
    return { ready: false, mode: 'demo' }
  }

  if (!app) {
    app = initializeApp(firebaseConfig)
    db = getFirestore(app)
    auth = getAuth(app)
  }

  try {
    await signInAnonymously(auth)
    return { ready: true, mode: 'cloud' }
  } catch (error) {
    console.error('Firebase anonymous login failed', error)
    return { ready: false, mode: 'demo' }
  }
}

export function subscribeToPosts(callback) {
  if (!db) {
    return () => {}
  }

  const postsRef = collection(db, 'anonymous-posts')
  const q = query(postsRef, orderBy('createdAt', 'desc'))

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() ?? new Date(),
      }))
      callback(items)
    },
    (error) => {
      console.error('Unable to load posts', error)
    },
  )
}

export async function createPost(payload) {
  if (!db) {
    throw new Error('Firebase is not initialized')
  }

  const postsRef = collection(db, 'anonymous-posts')
  await addDoc(postsRef, {
    title: payload.title.trim(),
    content: payload.content.trim(),
    author: '匿名访客',
    createdAt: serverTimestamp(),
  })
}
