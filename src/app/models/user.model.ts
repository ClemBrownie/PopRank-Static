export interface User {
  uid: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: Date;
}

export interface UserCreate {
  displayName: string;
  avatarUrl?: string;
  bio?: string;
}
