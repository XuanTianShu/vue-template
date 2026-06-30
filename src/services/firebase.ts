import { initializeApp } from 'firebase/app'
import {
  addDoc,
  collection,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore'
import { getAuth, signInAnonymously } from 'firebase/auth'
import type { Post, Comment, FirebaseInitResult } from '../types'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
}

let app: ReturnType<typeof initializeApp> | null = null
let db: ReturnType<typeof getFirestore> | null = null
let auth: ReturnType<typeof getAuth> | null = null

/**
 * Check if Firebase is properly configured with environment variables
 */
function isConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  )
}

/**
 * Initialize Firebase app and auth
 */
export async function initFirebase(): Promise<FirebaseInitResult> {
  if (!isConfigured()) {
    console.warn('Firebase configuration incomplete, running in demo mode')
    return { ready: false, mode: 'demo' }
  }

  if (!app) {
    app = initializeApp(firebaseConfig)
    db = getFirestore(app)
    auth = getAuth(app)
  }

  try {
    await signInAnonymously(auth!)
    console.log('Firebase initialized successfully, running in cloud mode')
    return { ready: true, mode: 'cloud' }
  } catch (error) {
    console.error('Firebase anonymous login failed', error)
    return { ready: false, mode: 'demo' }
  }
}

/**
 * Create a new post in Firestore
 * @param content - Post content text
 */
export async function createPost(content: string): Promise<void> {
  if (!db) throw new Error('Firebase not initialized')
  
  const postsCol = collection(db, 'posts')
  await addDoc(postsCol, {
    content,
    createdAt: serverTimestamp(),
    likes: 0,
  })
}

/**
 * Subscribe to real-time updates of posts list
 * @param callback - Function to call when posts change
 * @returns Unsubscribe function
 */
export async function getPosts(
  callback: (posts: Post[]) => void
): Promise<(() => void) | null> {
  if (!db) {
    // Return demo data if Firebase not available
    const demoPosts: Post[] = getDemoPosts()
    callback(demoPosts)
    return null
  }

  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
  
  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const posts: Post[] = snapshot.docs.map(doc => ({
      id: doc.id,
      content: doc.data().content,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      likes: doc.data().likes || 0,
      commentCount: 0, // We'll calculate this client-side for now
      image: getRandomImage(), // Add random image for demo consistency
    }))
    callback(posts)
  })
}

/**
 * Add a comment to a specific post
 * @param postId - ID of the parent post
 * @param content - Comment content text
 */
export async function addComment(postId: string, content: string): Promise<void> {
  if (!db) throw new Error('Firebase not initialized')
  
  const commentsCol = collection(db, `posts/${postId}/comments`)
  await addDoc(commentsCol, {
    content,
    createdAt: serverTimestamp(),
  })
}

/**
 * Subscribe to real-time updates of comments for a specific post
 * @param postId - ID of the parent post
 * @param callback - Function to call when comments change
 * @returns Unsubscribe function
 */
export async function getComments(
  postId: string,
  callback: (comments: Comment[]) => void
): Promise<(() => void) | null> {
  if (!db) {
    // Return demo comments
    const demoComments: Comment[] = getDemoComments()
    callback(demoComments)
    return null
  }

  const q = query(
    collection(db, `posts/${postId}/comments`),
    orderBy('createdAt', 'asc')
  )
  
  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const comments: Comment[] = snapshot.docs.map(doc => ({
      id: doc.id,
      content: doc.data().content,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    }))
    callback(comments)
  })
}

// Demo data helpers for when Firebase is not configured
const randomImages = [
  'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
  'https://images.unsplash.com/photo-1581333100576-b73befd11439?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
  'https://images.unsplash.com/photo-1534723452862-4c874018d66d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
]

function getRandomImage(): string {
  return randomImages[Math.floor(Math.random() * randomImages.length)]
}

function getDemoPosts(): Post[] {
  return [
    {
      id: 'post-1',
      content: "Just discovered this place. It's pretty cool to have a space to just vent without anyone knowing who you are. Sometimes you just need to shout into the void, you know?",
      createdAt: new Date(Date.now() - 3600000),
      likes: 15,
      commentCount: 3,
      image: randomImages[0],
    },
    {
      id: 'post-2',
      content: "I've been working on a personal project for months, a retro-style pixel art game. It's so much harder than I thought, but seeing a character move for the first time was pure magic. Don't give up on your dreams, people!",
      createdAt: new Date(Date.now() - 7200000),
      likes: 42,
      commentCount: 8,
      image: randomImages[1],
    },
    {
      id: 'post-3',
      content: "Has anyone tried the new \"Journal\" theme? It feels so cozy and reminds me of writing in a real notebook. The lined textarea is a brilliant touch.",
      createdAt: new Date(Date.now() - 10800000),
      likes: 28,
      commentCount: 5,
      image: randomImages[2],
    },
    {
      id: 'post-4',
      content: "The cyberpunk theme is insane! The glowing text and neon borders make me feel like I'm hacking into the matrix. 10/10 design.",
      createdAt: new Date(Date.now() - 14400000),
      likes: 55,
      commentCount: 12,
      image: randomImages[3],
    },
    {
      id: 'post-5',
      content: "A question for the void: What's one small thing that made you happy this week?",
      createdAt: new Date(Date.now() - 18000000),
      likes: 99,
      commentCount: 37,
      image: randomImages[4],
    },
  ]
}

function getDemoComments(): Comment[] {
  return [
    {
      id: 'comment-1',
      content: "This is a great observation! Thanks for sharing.",
      createdAt: new Date(Date.now() - 7200000),
    },
    {
      id: 'comment-2',
      content: "I totally agree. It's something more people should think about.",
      createdAt: new Date(Date.now() - 3600000),
    },
  ]
}