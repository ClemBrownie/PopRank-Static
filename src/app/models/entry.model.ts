export interface Entry {
  id: string;
  uid: string;
  movieId: number;
  title: string;
  posterPath?: string;
  rating: number; // 0-5
  review?: string;
  watchedAt: Date;
  createdAt: Date;
  // Informations utilisateur
  userDisplayName?: string;
  userAvatarUrl?: string;
}

export interface EntryCreate {
  movieId: number;
  title: string;
  posterPath?: string;
  rating: number;
  review?: string;
  watchedAt: Date;
}
