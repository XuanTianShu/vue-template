// Post interface
export interface Post {
  id: string
  content: string
  createdAt: Date
  image?: string
  likes: number
  commentCount: number
}

// Comment interface
export interface Comment {
  id: string
  content: string
  createdAt: Date
}

// Firebase service response
export interface FirebaseInitResult {
  ready: boolean
  mode: 'demo' | 'cloud'
}

// Submit result type
export interface SubmitResult {
  success: boolean
  message: string
}