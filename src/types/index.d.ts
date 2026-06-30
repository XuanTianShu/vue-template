export interface Post {
  id: string;
  userId: number;
  title: string;
  content: string;
  imageUrl?: string; // 帖子图片，可选
  likes: number;
  commentsCount: number;
  author: string;
  avatar: string;
}

export interface Comment {
  id: number;
  postId: number;
  content: string;
  author: string;
  avatar: string;
  createdAt: string;
}

export type ThemeValue = 'modern' | 'cyberpunk_new' | 'neumorphism';